import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function AdminSettings() {
  const { user, updateUser } = useAuth();
  // Fallback if context is briefly out of sync (same source as AdminSidebar)
  const account = user || readStoredUser();
  const displayName = account?.fullName || account?.name || "";
  const [loadingMe, setLoadingMe] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data?.user) updateUser(data.user);
      } catch {
        /* keep cached user */
      } finally {
        setLoadingMe(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const isGoogleOnly = account?.authProvider === "google" || !!account?.googleId;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: "", text: "" });
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwdMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setPwdSubmitting(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPwdMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPwdMessage({
        type: "error",
        text: err.response?.data?.message || "Could not update password.",
      });
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Settings" subtitle="Your admin account and security">
      <div className="max-w-2xl space-y-6">
        {/* Account info */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Admin account</h2>
            <p className="text-sm text-gray-500 mt-0.5">Signed-in administrator details</p>
          </div>
          <div className="p-6">
            {loadingMe && !account ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
                  {(displayName || account?.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                    <p className="text-gray-900 font-medium">{displayName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-gray-900 break-all">{account?.email || "—"}</p>
                    {account?.email?.toLowerCase().endsWith("@gmail.com") && (
                      <p className="text-xs text-gray-400 mt-0.5">Gmail address</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                    <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      {account?.role === "admin" ? "Admin" : account?.role || "—"}
                    </span>
                  </div>
                  {isGoogleOnly && (
                    <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      You use Google sign-in. Email is managed in your Google account.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update the password for this admin account</p>
          </div>
          <div className="p-6">
            {isGoogleOnly ? (
              <p className="text-gray-600 text-sm">
                Password changes are not available for Google accounts. Use{" "}
                <span className="font-medium">Google Account security</span> to change your password.
              </p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm new password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {pwdMessage.text && (
                  <p
                    className={`text-sm ${
                      pwdMessage.type === "success" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pwdMessage.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-medium rounded-lg transition"
                >
                  {pwdSubmitting ? "Updating…" : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;
