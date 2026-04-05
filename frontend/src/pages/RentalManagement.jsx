import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const API = "http://localhost:5001/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const daysOverdue = (dueDate) =>
  Math.max(0, Math.ceil((Date.now() - new Date(dueDate)) / 86_400_000));

const daysLeft = (dueDate) =>
  Math.ceil((new Date(dueDate) - Date.now()) / 86_400_000);

/* ── Status badge ──────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    returned: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const labels = { active: "Active", overdue: "Overdue", returned: "Returned" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        map[status] || "bg-yellow-100 text-yellow-800 border-yellow-200"
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

/* ── Fine badge ────────────────────────────────────────────────────────── */
const FineBadge = ({ fineStatus, fineAmount }) => {
  if (!fineAmount || fineStatus === "none") return <span className="text-gray-400 text-xs">—</span>;
  const map = {
    pending: "bg-red-100 text-red-700 border-red-200",
    paid: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        map[fineStatus] || ""
      }`}
    >
      ₹{fineAmount} · {fineStatus}
    </span>
  );
};

/* ── Toast ─────────────────────────────────────────────────────────────── */
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const colours =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-white text-sm shadow-lg ${colours}`}
    >
      {msg}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════════════════ */
export default function RentalManagement() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("active"); // active | overdue | returned | all
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // rental detail modal

  const [toast, setToast] = useState({ msg: "", type: "" });
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  };

  /* ── fetch ─────────────────────────────────────────────────────────── */
  const fetchRentals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/rentals/all`, {
        headers: authHeader(),
      });
      setRentals(data.rentals || []);
    } catch (err) {
      console.error("Fetch rentals error:", err);
      setError(
        err.response?.data?.message || "Failed to load rentals. Check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  /* ── mark as returned ──────────────────────────────────────────────── */
  const handleReturn = async (rentalId) => {
    if (!window.confirm("Mark this rental as returned?")) return;
    try {
      await axios.patch(`${API}/rentals/${rentalId}/return`, {}, { headers: authHeader() });
      showToast("Book marked as returned ✅");
      setSelected(null);
      fetchRentals();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to mark as returned", "error");
    }
  };

  /* ── mark fine as paid ─────────────────────────────────────────────── */
  const handlePayFine = async (rentalId) => {
    if (!window.confirm("Mark fine as paid?")) return;
    try {
      await axios.post(
        `${API}/rentals/${rentalId}/pay-fine`,
        { paymentMethod: "cash_on_delivery" },
        { headers: authHeader() }
      );
      showToast("Fine marked as paid ✅");
      setSelected(null);
      fetchRentals();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to mark fine as paid", "error");
    }
  };

  /* ── derived data ──────────────────────────────────────────────────── */
  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.user?.fullName?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q) ||
      r.book?.title?.toLowerCase().includes(q) ||
      r.rentalNumber?.toLowerCase().includes(q);

    const matchTab =
      activeTab === "all" ||
      (activeTab === "active" && r.status === "active") ||
      (activeTab === "overdue" && r.status === "overdue") ||
      (activeTab === "returned" && r.status === "returned");

    return matchSearch && matchTab;
  });

  const counts = {
    all: rentals.length,
    active: rentals.filter((r) => r.status === "active").length,
    overdue: rentals.filter((r) => r.status === "overdue").length,
    returned: rentals.filter((r) => r.status === "returned").length,
  };

  const totalFinesPending = rentals
    .filter((r) => r.fineStatus === "pending")
    .reduce((s, r) => s + (r.fineAmount || 0), 0);

  /* ── UI ────────────────────────────────────────────────────────────── */
  const tabs = [
    { key: "active", label: "Active", colour: "text-green-600" },
    { key: "overdue", label: "Overdue", colour: "text-red-600" },
    { key: "returned", label: "Returned", colour: "text-gray-600" },
    { key: "all", label: "All", colour: "text-blue-600" },
  ];

  return (
    <AdminLayout>
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rental Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all book rentals, overdue returns, and fines.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Rentals" value={counts.all} colour="blue" />
        <SummaryCard label="Active" value={counts.active} colour="green" />
        <SummaryCard label="Overdue" value={counts.overdue} colour="red" />
        <SummaryCard
          label="Pending Fines"
          value={`₹${totalFinesPending.toLocaleString()}`}
          colour="yellow"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 text-xs font-bold ${
                    activeTab === t.key ? t.colour : "text-gray-400"
                  }`}
                >
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by user, book, or rental #…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3" />
            Loading rentals…
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchRentals}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No rentals found{search ? ` matching "${search}"` : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Rental #",
                    "User",
                    "Book",
                    "Rent Date",
                    "Due Date",
                    "Status",
                    "Fine",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {r.rentalNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 leading-tight">
                        {r.user?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400">{r.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="font-medium text-gray-900 truncate">
                        {r.book?.title || "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.rentalDuration} day{r.rentalDuration !== 1 ? "s" : ""} · ₹
                        {r.totalRentalAmount}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fmtDate(r.startDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{fmtDate(r.dueDate)}</div>
                      {r.status === "active" && (
                        <div
                          className={`text-xs ${
                            daysLeft(r.dueDate) <= 1
                              ? "text-red-500 font-semibold"
                              : "text-gray-400"
                          }`}
                        >
                          {daysLeft(r.dueDate) <= 0
                            ? "Due today!"
                            : `${daysLeft(r.dueDate)}d left`}
                        </div>
                      )}
                      {r.status === "overdue" && (
                        <div className="text-xs text-red-500 font-semibold">
                          {daysOverdue(r.dueDate)}d overdue
                        </div>
                      )}
                      {r.status === "returned" && r.returnDate && (
                        <div className="text-xs text-gray-400">
                          Returned {fmtDate(r.returnDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <FineBadge fineStatus={r.fineStatus} fineAmount={r.fineAmount} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="px-3 py-1.5 text-xs bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 font-medium transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <RentalDetailModal
          rental={selected}
          onClose={() => setSelected(null)}
          onReturn={handleReturn}
          onPayFine={handlePayFine}
        />
      )}
    </AdminLayout>
  );
}

/* ── Summary Card ──────────────────────────────────────────────────────── */
function SummaryCard({ label, value, colour }) {
  const colours = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700",
    red: "bg-red-50 border-red-100 text-red-700",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colours[colour]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

/* ── Rental Detail Modal ───────────────────────────────────────────────── */
function RentalDetailModal({ rental: r, onClose, onReturn, onPayFine }) {
  const overdue = r.status === "overdue";
  const canReturn = r.status !== "returned";
  const canPayFine = r.fineStatus === "pending" && r.fineAmount > 0;

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-NP", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Rental Details</h2>
            <p className="text-xs text-gray-400 font-mono">{r.rentalNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Overdue alert */}
          {overdue && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              🚨 This rental is <strong>overdue by {r.overdueDays || "?"} day(s)</strong>.
              Fine of <strong>₹{r.fineAmount || 100}</strong> has been applied (₹{r.finePerDay || 100}/day × {r.overdueDays || 1} day(s)).
            </div>
          )}

          {/* User */}
          <Section title="User">
            <Row label="Name" value={r.user?.fullName || "—"} />
            <Row label="Email" value={r.user?.email || "—"} />
          </Section>

          {/* Book */}
          <Section title="Book">
            <Row label="Title" value={r.book?.title || "—"} />
            <Row label="Duration" value={`${r.rentalDuration} day(s)`} />
            <Row label="Rental Fee" value={`₹${r.totalRentalAmount}`} />
          </Section>

          {/* Dates */}
          <Section title="Dates">
            <Row label="Start Date" value={fmtDate(r.startDate)} />
            <Row label="Due Date" value={fmtDate(r.dueDate)} highlight={overdue} />
            {r.returnDate && <Row label="Returned On" value={fmtDate(r.returnDate)} />}
          </Section>

          {/* Status */}
          <Section title="Status">
            <Row
              label="Rental Status"
              value={<StatusBadge status={r.status} />}
            />
            <Row
              label="Fine Status"
              value={
                r.fineAmount > 0 ? (
                  <span
                    className={`font-semibold ${
                      r.fineStatus === "paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{r.fineAmount} — {r.fineStatus}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">No fine</span>
                )
              }
            />
            {r.reminderSent && (
              <Row label="Reminder Sent" value={`Yes — ${fmtDate(r.reminderSentAt)}`} />
            )}
          </Section>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
          {canPayFine && (
            <button
              onClick={() => onPayFine(r._id)}
              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
            >
              Mark Fine Paid
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => onReturn(r._id)}
              className="px-4 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium"
            >
              Mark as Returned
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-right ${highlight ? "text-red-600" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}
