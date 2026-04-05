import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Avatar + dropdown: account info, update password, logout.
 * Replaces inline "Hello, user" + Logout button.
 */
export default function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const displayName = user?.fullName || user?.name || "User";
  const email = user?.email || "";
  const initial = (displayName || email || "?").charAt(0).toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const passwordPath = user?.role === "admin" ? "/admin/settings" : "/account";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-gray-200 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {initial}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-[120px] truncate">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[60]">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Signed in as</p>
            <p className="font-semibold text-gray-900 mt-0.5 truncate">{displayName}</p>
            {email && <p className="text-sm text-gray-600 break-all mt-1">{email}</p>}
            {user?.role && (
              <p className="text-xs text-gray-400 mt-2 capitalize">Role: {user.role}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              to={passwordPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Update password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
