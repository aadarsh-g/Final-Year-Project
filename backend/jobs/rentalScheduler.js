/**
 * Rental Scheduler — runs two cron jobs daily:
 *
 *  1. REMINDER JOB  — runs at 8:00 AM every day
 *     Finds active rentals whose dueDate is TOMORROW and reminderSent = false.
 *     Sends a reminder email + in-app notification, then marks reminderSent = true.
 *
 *  2. FINE JOB      — runs at 12:00 AM (midnight) every day
 *     Finds active/overdue rentals past their dueDate (fineStatus != 'paid').
 *     Fine = Rs. 100 × overdue days, growing each day.
 *     First-day fine triggers an email + notification; subsequent days update silently.
 */

const cron = require('node-cron');
const Rental = require('../models/Rental');
const emailService = require('../services/emailService');
const NotificationService = require('../services/notificationService');

/* ─── helpers ─────────────────────────────────────────────────────────── */

/**
 * Nepal is UTC+05:45.  Due dates stored from early-morning Nepal sessions are
 * saved as late-night UTC on the *previous* calendar day (e.g. 27 Mar 00:00
 * Nepal = 26 Mar 18:15 UTC).  To avoid missing those rentals, we build a
 * "Nepal-aware tomorrow" window that starts 6 hours before UTC tomorrow-midnight
 * and ends 6 hours after UTC day-after-tomorrow-midnight.
 *
 * The 36-hour window still only sends each reminder once because of the
 * `reminderSent: false` guard on every rental.
 */

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000; // +05:45 in ms

/** Nepal "today" as a UTC midnight Date */
const nepalTodayUTC = () => {
  const nowNepal = new Date(Date.now() + NEPAL_OFFSET_MS);
  nowNepal.setUTCHours(0, 0, 0, 0);           // midnight in Nepal-shifted UTC
  return new Date(nowNepal.getTime() - NEPAL_OFFSET_MS); // convert back to real UTC
};

/** Start of Nepal "tomorrow" minus a 6-hour safety buffer (catches early-morning Nepal times) */
const reminderWindowStart = () =>
  new Date(nepalTodayUTC().getTime() + 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000);

/** End of Nepal "tomorrow" plus a 6-hour safety buffer */
const reminderWindowEnd = () =>
  new Date(nepalTodayUTC().getTime() + 48 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000);

/** Returns a Date representing today at 00:00:00 UTC */
const startOfToday = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/* ─── 1. REMINDER JOB ─────────────────────────────────────────────────── */

const sendReminders = async () => {
  console.log('\n📧 [CRON] Running rental reminder job…');
  try {
    const winStart = reminderWindowStart();
    const winEnd   = reminderWindowEnd();

    console.log(`   Reminder window: ${winStart.toISOString()} → ${winEnd.toISOString()}`);

    // Find active rentals due TOMORROW (Nepal time) that haven't had a reminder sent yet.
    // The window is ±6 h around Nepal tomorrow midnight to handle timezone storage differences.
    const rentals = await Rental.find({
      status: 'active',
      reminderSent: false,
      dueDate: { $gte: winStart, $lt: winEnd },
    }).populate('user', 'fullName email').populate('book', 'title');

    console.log(`   Found ${rentals.length} rental(s) due tomorrow.`);

    for (const rental of rentals) {
      const user = rental.user;
      const book = rental.book;

      if (!user || !user.email) {
        console.warn(`   ⚠️  Rental ${rental.rentalNumber} has no user email — skipping.`);
        continue;
      }

      // Send reminder email
      await emailService.sendRentalReminderEmail(
        user.email,
        user.fullName || 'Valued Customer',
        book?.title || 'Your rented book',
        rental.rentalNumber,
        rental.dueDate
      );

      // Send in-app notification
      try {
        await NotificationService.notifyRentalExpiring(user._id, {
          bookTitle: book?.title || 'Your rented book',
          rentalId: rental._id,
          bookId: book?._id,
          daysLeft: 1,
          dueDate: rental.dueDate,
        });
      } catch (notifErr) {
        console.error(`   ⚠️  Notification failed for rental ${rental.rentalNumber}:`, notifErr.message);
      }

      // Mark reminder as sent
      rental.reminderSent = true;
      rental.reminderSentAt = new Date();
      await rental.save();

      console.log(`   ✅ Reminder sent for rental ${rental.rentalNumber} → ${user.email}`);
    }
  } catch (err) {
    console.error('❌ [CRON] Reminder job error:', err.message);
  }
};

/* ─── 2. FINE JOB ─────────────────────────────────────────────────────── */

const applyFines = async () => {
  console.log('\n💰 [CRON] Running overdue fine job…');
  try {
    const today = startOfToday();

    // All active/overdue rentals past their due date that haven't been paid
    const rentals = await Rental.find({
      status: { $in: ['active', 'overdue'] },
      dueDate: { $lt: today },
      fineStatus: { $ne: 'paid' },
    }).populate('user', 'fullName email').populate('book', 'title');

    console.log(`   Found ${rentals.length} overdue rental(s) to process.`);

    for (const rental of rentals) {
      const user = rental.user;
      const book = rental.book;

      const overdueDays = Math.ceil((Date.now() - new Date(rental.dueDate)) / 86_400_000);
      const finePerDay = rental.finePerDay || 100;
      const newFine = finePerDay * overdueDays;
      const isFirstDay = rental.fineAmount === 0;

      rental.fineAmount = newFine;
      rental.fineStatus = 'pending';
      rental.status = 'overdue';
      rental.overdueDays = overdueDays;
      await rental.save();

      console.log(`   ⚠️  Fine ₹${newFine} (₹${finePerDay}/day × ${overdueDays} day(s)) → rental ${rental.rentalNumber}.`);

      // Email + notification only on the first day fine is applied
      if (isFirstDay) {
        if (user?.email) {
          await emailService.sendOverdueFineEmail(
            user.email,
            user.fullName || 'Valued Customer',
            book?.title || 'Your rented book',
            rental.rentalNumber,
            rental.dueDate,
            overdueDays,
            newFine,
            finePerDay
          );
        }

        try {
          await NotificationService.notifyRentalOverdue(user._id, {
            bookTitle: book?.title || 'Your rented book',
            rentalId: rental._id,
            bookId: book?._id,
            daysOverdue: overdueDays,
            dueDate: rental.dueDate,
          });
        } catch (notifErr) {
          console.error(`   ⚠️  Notification failed for rental ${rental.rentalNumber}:`, notifErr.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ [CRON] Fine job error:', err.message);
  }
};

/* ─── register cron schedules ─────────────────────────────────────────── */

const startScheduler = () => {
  // Reminder: every day at 08:00 AM
  cron.schedule('0 8 * * *', sendReminders, {
    scheduled: true,
    timezone: 'Asia/Kathmandu',
  });

  // Fine application: every day at midnight 00:00
  cron.schedule('0 0 * * *', applyFines, {
    scheduled: true,
    timezone: 'Asia/Kathmandu',
  });

  console.log('✅ Rental scheduler started:');
  console.log('   • Reminder emails — daily at 08:00 AM (Asia/Kathmandu)');
  console.log('   • Overdue fines   — daily at 12:00 AM (Asia/Kathmandu)');
};

module.exports = { startScheduler, sendReminders, applyFines };
