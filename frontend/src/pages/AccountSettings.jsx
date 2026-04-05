import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

/**
 * User account (non-admin layout): profile info + change password.
 */
export default function AccountSettings() {
  const { user, updateUser } = useAuth();
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
        /* keep cached */
      } finally {
        setLoadingMe(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/catalog" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to catalog
          </Link>
          <span className="text-lg font-semibold text-gray-900">My account</span>
          <span className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h1 className="text-lg font-semibold text-gray-900">Your profile</h1>
          </div>
          <div className="p-6 space-y-3">
            {loadingMe && !account ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                  <p className="text-gray-900 font-medium">{displayName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                  <p className="text-gray-900 break-all">{account?.email || "—"}</p>
                </div>
                {isGoogleOnly && (
                  <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    You use Google sign-in. Change your password in Google Account settings.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
          </div>
          <div className="p-6">
            {isGoogleOnly ? (
              <p className="text-gray-600 text-sm">Not available for Google sign-in accounts.</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="cur" className="block text-sm font-medium text-gray-700 mb-1">
                    Current password
                  </label>
                  <input
                    id="cur"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="nw" className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <input
                    id="nw"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="cf" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm new password
                  </label>
                  <input
                    id="cf"
                    type="password"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {pwdMessage.text && (
                  <p className={pwdMessage.type === "success" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                    {pwdMessage.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg"
                >
                  {pwdSubmitting ? "Updating…" : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
