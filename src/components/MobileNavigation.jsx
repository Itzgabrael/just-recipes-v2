import { NavLink } from "react-router-dom";
import {
  FaHeart,
  FaPlus,
  FaUtensils,
  FaSignOutAlt,
  FaTachometerAlt,
  FaSearch,
  FaUser,
} from "react-icons/fa";

import { logoutUser } from "../services/auth.js";
import NavbarThemeToggle from "./NavbarThemeToggle";

function MobileNavigation({
  isMobileMenuOpen,
  closeMobileMenu,
  currentUser,
}) {
  const handleMobileLogout = async () => {
    closeMobileMenu();

    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    }
  };

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? "bg-green-50 text-green-600"
        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
    }`;

  return (
    <div
      id="mobile-navigation-menu"
      className={`absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-sm max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] origin-top-right transition-all duration-300 ease-out ${
        isMobileMenuOpen
          ? "opacity-100 translate-y-0 scale-100 visible"
          : "opacity-0 -translate-y-2 scale-95 invisible pointer-events-none"
      }`}
    >
      {/* Main Navigation Links */}
      <div className="p-3">
        <NavLink
          to="/"
          onClick={closeMobileMenu}
          className={mobileLinkClass}
        >
          <FaUtensils />
          Home
        </NavLink>

        <NavLink
          to="/favorites"
          onClick={closeMobileMenu}
          className={mobileLinkClass}
        >
          <FaHeart />
          Favorites
        </NavLink>

        <NavLink
          to="/cook-with-what-you-have"
          onClick={closeMobileMenu}
          className={mobileLinkClass}
        >
          <FaSearch />
          Cook With What You Have
        </NavLink>

        <NavLink
          to="/add-recipe"
          onClick={closeMobileMenu}
          className={mobileLinkClass}
        >
          <FaPlus />
          Add Recipe
        </NavLink>

        <NavLink
            to="/my-recipes"
            onClick={closeMobileMenu}
            className={mobileLinkClass}
          >
            <FaUtensils />
            My Recipes
          </NavLink>
      </div>

      {/* Theme Toggle */}
      <NavbarThemeToggle mobile />

      {currentUser ? (
        <>
          {/* User Info */}
          <div className="border-t border-gray-100">
            <div className="p-4 bg-gray-50 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-green-600">
  {currentUser.photoURL ? (
    <img
      src={currentUser.photoURL}
      alt={currentUser.displayName || "User"}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
      {(currentUser.displayName || currentUser.email || "U")
        .charAt(0)
        .toUpperCase()}
    </div>
  )}
</div>

              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {currentUser.displayName}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Account Links */}
<div className="p-3">
  <NavLink
    to="/profile"
    onClick={closeMobileMenu}
    className={mobileLinkClass}
  >
    <FaUser />
    Profile
  </NavLink>

  <NavLink
    to="/dashboard"
    onClick={closeMobileMenu}
    className={mobileLinkClass}
  >
    <FaTachometerAlt />
    Dashboard
  </NavLink>
</div>

            {/* Logout */}
            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={handleMobileLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Guest Authentication */
        <div className="border-t border-gray-100 p-3 flex gap-2">
          <NavLink
            to="/login"
            onClick={closeMobileMenu}
            className="flex-1 text-center bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            onClick={closeMobileMenu}
            className="flex-1 text-center border border-green-600 text-green-600 px-4 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            Sign Up
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default MobileNavigation;