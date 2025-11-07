import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Bell,
  User as UserIcon,
  Search as SearchIcon,
  LogOut,
  UserCircle2,
  PackageSearch,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import urbanTalesLogo from "../assets/UrbanTales.png";


const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Fashion",
    href: "/category?cat=fashion",
    links: ["Men", "Women", "Kids", "Accessories", "Luggages"],
  },
  {
    label: "Electronics",
    href: "/category?cat=electronic",
    links: ["Laptops", "Tablets", "Cameras", "Headphones", "Smartwatches"],
  },
  {
    label: "Home & Furniture",
    href: "/category?cat=furniture",
    links: ["Living Room", "Bedroom", "Kitchen", "Office", "Outdoor"],
  },
  { label: "Appliances", href: "/category?cat=kitchen" },
  {
    label: "Toys",
    href: "/category?cat=toys",
    links: ["Action Figures", "Dolls", "Puzzles", "Board Games"],
  },
  { label: "Cosmetics", href: "/category?cat=cosmetic" },
  { label: "Kilos", href: "/category?cat=food" },
  { label: "Sports", href: "/category?cat=sports" },
];

const getCatFromHref = (href = "") => {
  const m = href.match(/cat=([^&#]+)/i);
  return m ? decodeURIComponent(m[1]) : undefined;
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ---- ProfileMenu ----
function ProfileMenu({ user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      {user && user.name && (
        <span className="text-gray-800 font-medium hidden sm:inline">
          Hi, {user.name}
        </span>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#070A52] hover:scale-105 transition overflow-hidden"
      >
        {user && user.profileImage ? (
          <img
            src={user.profileImage}
            alt="User avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <UserIcon className="w-5 h-5 text-white" strokeWidth={2} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl p-1 text-sm text-gray-700 z-50 border border-gray-100">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition"
                onClick={() => setOpen(false)}
              >
                <UserCircle2 className="w-4 h-4" /> Profile
              </Link>
              <Link
                to="/trackorder"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition"
                onClick={() => setOpen(false)}
              >
                <PackageSearch className="w-4 h-4" /> Orders
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition text-left text-red-600"
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition text-left"
              onClick={() => {
                setOpen(false);
                onLogin?.();
              }}
            >
              <UserCircle2 className="w-4 h-4" /> Login / Sign Up
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- DesktopCategory ----
function DesktopCategory({ item }) {
  const hasSubs = Array.isArray(item.links) && item.links.length > 0;
  const baseCat = getCatFromHref(item.href);

  return (
    <li className="relative group">
      <NavLink
        to={item.href || "#"}
        className={({ isActive }) =>
          cn(
            "px-1 py-0.5 transition-colors duration-150 flex items-center gap-1",
            isActive ? "text-yellow-300" : "text-white hover:text-yellow-300"
          )
        }
      >
        {item.label}
        {hasSubs && <span aria-hidden="true">▾</span>}
      </NavLink>
      {hasSubs && (
        <ul className="absolute left-0 mt-2 bg-white text-gray-800 rounded-md shadow-lg z-50 py-2 px-3 min-w-[12rem] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {item.links.map((sub, subIdx) => (
            <li key={subIdx} className="py-1 px-1 rounded">
              <Link
                to={`/category?cat=${encodeURIComponent(
                  baseCat ?? ""
                )}&sub=${encodeURIComponent(sub)}`}
                className="block w-full rounded px-2 py-1 hover:bg-[#070A52] hover:text-white transition"
              >
                {sub}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// ---- MobileSidebarCategory ----
function MobileSidebarCategory({ item, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = Array.isArray(item.links) && item.links.length > 0;
  const baseCat = getCatFromHref(item.href);

  return (
    <div className="border-b border-gray-200">
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          if (hasSubs) {
            setExpanded(!expanded);
          } else {
            onNavigate(item.href);
          }
        }}
      >
        <span className="text-gray-800 font-medium">{item.label}</span>
        {hasSubs && (
          <ChevronRight
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        )}
      </div>

      <AnimatePresence>
        {hasSubs && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50"
          >
            {item.links.map((sub, idx) => (
              <div
                key={idx}
                className="px-8 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                onClick={() =>
                  onNavigate(
                    `/category?cat=${encodeURIComponent(
                      baseCat ?? ""
                    )}&sub=${encodeURIComponent(sub)}`
                  )
                }
              >
                {sub}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- SearchBar ----
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    else navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products..."
        className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#070A52] focus:border-[#070A52] text-sm"
      />
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white bg-[#070A52] hover:bg-[#0A0F6D] px-4 py-1.5 rounded-full transition"
      >
        Go
      </button>
    </form>
  );
}

// ---- Badge ----
function Badge({ count }) {
  if (!count || count <= 0) return null;
  const display = count > 99 ? "99+" : String(count);
  return (
    <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white text-center font-bold">
      {display}
    </span>
  );
}

// ---- Navbar ----
const Navbar = ({ cartCount, onSearch }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentNotificationCount, setCurrentNotificationCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (storedUser && token) setUser(storedUser);

    const checkNotifications = () => {
      const storedCount = Number(localStorage.getItem("notificationCount") || 0);
      if (storedCount !== currentNotificationCount) {
        setCurrentNotificationCount(storedCount);
      }
    };

    checkNotifications();
    const intervalId = setInterval(checkNotifications, 1000);
    return () => clearInterval(intervalId);
  }, [currentNotificationCount]);

  const cartQty = cartCount || Number(localStorage.getItem("cartCount") || 0);
  const notifQty = currentNotificationCount;

  const handleLogin = () => navigate("/login");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleSidebarNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md font-inter">
        {/* Top Row */}
        <div className="px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-3 md:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <img
            src={urbanTalesLogo}
            alt="UrbanTales logo"
            className="h-12 md:h-16 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Search - Hidden on small screens */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block">
              <ProfileMenu user={user} onLogin={handleLogin} onLogout={handleLogout} />
            </div>

            {/* Cart */}
            <Link
              to="/cartpage"
              className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-white bg-[#070A52] hover:scale-105 transition"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              <Badge count={cartQty} />
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-white bg-[#070A52] hover:scale-105 transition"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <Badge count={notifQty} />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* Desktop Category Bar */}
        <div className="hidden lg:block pb-3 px-6">
          <div className="bg-[#070A52] text-white text-center py-2 px-4 rounded-full font-semibold shadow-md">
            <ul className="flex flex-wrap justify-center items-center gap-10">
              {NAV_ITEMS.map((item) => (
                <DesktopCategory key={item.label} item={item} />
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto lg:hidden"
            >
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-[#070A52] to-[#0d1170] p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={urbanTalesLogo}
                    alt="UrbanTales"
                    className="h-10 w-auto object-contain"
                  />
                  <span className="text-white font-bold text-xl">Menu</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="border-b border-gray-200 p-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#070A52] flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    <UserCircle2 className="w-5 h-5" />
                    Login / Sign Up
                  </button>
                )}
              </div>

              {/* Quick Links */}
              {user && (
                <div className="border-b border-gray-200 p-4 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <UserCircle2 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">My Profile</span>
                  </Link>
                  <Link
                    to="/trackorder"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <PackageSearch className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">My Orders</span>
                  </Link>
                  <Link
                    to="/cartpage"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">My Cart</span>
                    {cartQty > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {cartQty}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Notifications</span>
                    {notifQty > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {notifQty}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Categories */}
              <div className="py-4">
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </h3>
                {NAV_ITEMS.map((item) => (
                  <MobileSidebarCategory
                    key={item.label}
                    item={item}
                    onNavigate={handleSidebarNavigate}
                  />
                ))}
              </div>

              {/* Logout Button */}
              {user && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}

              {/* Footer Info */}
              <div className="p-4 text-center text-sm text-gray-500">
                <p>© 2025 UrbanTales</p>
                <p className="text-xs mt-1">Shop with confidence</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

