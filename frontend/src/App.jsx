import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import GoogleCallback from './pages/GoogleCallback';
import BookCatalog from './pages/BookCatalog';
import BookDetails from './pages/BookDetails';
import UserOrders from './pages/UserOrders';
import NotificationsPage from './pages/NotificationsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import FinePaymentPage from './pages/FinePaymentPage';
import WishlistPage from './pages/WishlistPage';
import RewardsPage from './pages/RewardsPage';
import KhaltiVerifyPage from './pages/KhaltiVerifyPage';
import AccountSettings from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBookManagement from './pages/AdminBookManagement';
import AdminOrders from './pages/AdminOrders';
import RentalManagement from './pages/RentalManagement';
import AdminFineManagement from './pages/AdminFineManagement';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import AdminAnnouncements from './pages/AdminAnnouncements';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        {/* Protected Routes - Require Login */}
        <Route path="/catalog" element={
          <ProtectedRoute>
            <BookCatalog />
          </ProtectedRoute>
        } />
        <Route path="/book/:id" element={
          <ProtectedRoute>
            <BookDetails />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <UserOrders />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/fines" element={
          <ProtectedRoute>
            <FinePaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        <Route path="/rewards" element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } />
        <Route path="/khalti/verify" element={
          <ProtectedRoute>
            <KhaltiVerifyPage paymentType="checkout" />
          </ProtectedRoute>
        } />
        <Route path="/khalti/verify-fine" element={
          <ProtectedRoute>
            <KhaltiVerifyPage paymentType="fine" />
          </ProtectedRoute>
        } />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/books" element={
          <ProtectedRoute>
            <AdminBookManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/rentals" element={
          <ProtectedRoute>
            <RentalManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/fines" element={
          <ProtectedRoute>
            <AdminFineManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute>
            <AdminAnnouncements />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
