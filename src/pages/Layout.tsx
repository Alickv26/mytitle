import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, initialized, makeAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      navigate("/login");
    }
  }, [user, initialized, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleMakeAdmin = async () => {
    await makeAdmin();
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/cv-builder", icon: FileText, label: "CV Builder" },
    { to: "/profile", icon: User, label: "My Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-50">
        <span className="font-bold text-xl">MyDocuments</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-xl">MyDocuments</span>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}

          {user?.role !== "admin" && (
            <button
              onClick={() => {
                handleMakeAdmin();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
            >
              <Shield size={20} />
              Become Admin
            </button>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Settings size={20} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          {user?.tier === "premium" && (
            <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-amber-50 text-amber-700 rounded-lg">
              <Crown size={16} className="fill-amber-500" />
              <span className="text-sm font-medium">Premium</span>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
