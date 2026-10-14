import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/auth.js";
import NavbarThemeToggle from "./NavbarThemeToggle";
import MobileNavigation from "./MobileNavigation";

import {
  FaHeart,
  FaPlus,
  FaUtensils,
  FaSignOutAlt,
  FaTachometerAlt,
  FaChevronDown,
  FaSearch,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";

function Navbar() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [isClosing, setIsClosing] =
    useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const closeProfileMenu = () => {
    setIsClosing(true);

    setTimeout(() => {
      setShowProfileMenu(false);
      setIsClosing(false);
    }, 180);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      closeProfileMenu();
      await logoutUser();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showProfileMenu &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        closeProfileMenu();
      }

      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [showProfileMenu, isMobileMenuOpen]);

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setShowProfileMenu(false);
        setIsClosing(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscapeKey
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );
    };
  }, []);

  const desktopNavLinkClass = ({ isActive }) =>
    `relative pb-1 whitespace-nowrap transition-all duration-300 ${
      isActive
        ? "text-green-600 font-medium after:absolute after:left-0 after:-bottom-1 after:h-[3px] after:w-full after:bg-green-600 after:rounded-full"
        : "text-gray-700 hover:text-green-600"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">


{/* =================================================
    LOGO
================================================= */}

<Link
  to="/"
  aria-label="Just Recipes home"
  className="flex items-center gap-2 sm:gap-3 shrink-0 group"
>
  <img
    src="/pwa-192x192.png"
    alt=""
    aria-hidden="true"
    className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-lg transition-transform duration-200 group-hover:scale-105"
  />

  <span className="text-lg sm:text-2xl font-bold tracking-tight text-green-600 whitespace-nowrap">
    Just Recipes
  </span>
</Link>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div
          ref={mobileMenuRef}
          className="relative md:hidden"
        >
          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen(
                (previous) => !previous
              )
            }
            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-all duration-200"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            <span className="text-2xl flex items-center justify-center">
              {isMobileMenuOpen ? (
                <FaTimes className="text-green-600" />
              ) : (
                <FaBars className="text-green-600" />
              )}
            </span>
          </button>

          <MobileNavigation
            isMobileMenuOpen={isMobileMenuOpen}
            closeMobileMenu={closeMobileMenu}
            currentUser={currentUser}
          />
        </div>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <div className="hidden md:flex items-center gap-5 lg:gap-7">

          {/* Theme Toggle */}

          <NavbarThemeToggle />

          {/* Home */}

          <NavLink
            to="/"
            className={desktopNavLinkClass}
          >
            Home
          </NavLink>

          {/* Favorites */}

          <NavLink
            to="/favorites"
            className={desktopNavLinkClass}
          >
            Favorites
          </NavLink>

          {/* Cook With What You Have */}

          <NavLink
            to="/cook-with-what-you-have"
            className={desktopNavLinkClass}
          >
            <span className="flex items-center gap-2">
              <FaSearch />
              <span>
                Cook With What You Have
              </span>
            </span>
          </NavLink>

          {/* My Recipes */}

          <NavLink
            to="/my-recipes"
            className={desktopNavLinkClass}
          >
            My Recipes
          </NavLink>

          {/* Add Recipe */}

          <NavLink
            to="/add-recipe"
            className={desktopNavLinkClass}
          >
            Add Recipe
          </NavLink>

          {/* =================================================
              AUTHENTICATED USER
          ================================================= */}

          {currentUser ? (
            <div
              className="relative"
              ref={profileMenuRef}
            >
              {/* Profile Button */}

              <button
                type="button"
                onClick={() =>
                  setShowProfileMenu(
                    (previous) => !previous
                  )
                }
                className={`flex items-center gap-2 px-2 py-1 rounded-xl whitespace-nowrap transition-all duration-200 ${
                  location.pathname === "/dashboard"
                    ? "bg-green-50 text-green-600"
                    : "hover:bg-green-50 text-gray-700"
                }`}
              >
                {currentUser.photoURL ? (
  <img
    src={currentUser.photoURL}
    alt={currentUser.displayName || "User"}
    className="w-8 h-8 rounded-full object-cover border-2 border-green-600"
  />
) : (
  <div className="w-8 h-8 rounded-full border-2 border-green-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
    {(currentUser.displayName || currentUser.email || "U")
      .charAt(0)
      .toUpperCase()}
  </div>
)}

                <div className="flex items-center gap-1">
                  <span className="font-semibold max-w-32.5 truncate">
                    {currentUser.displayName}
                  </span>

                  <FaChevronDown
                    className={`text-gray-500 transition-transform duration-200 ${
                      showProfileMenu
                        ? "rotate-180"
                        : "rotate-0"
                    }`}
                  />
                </div>
              </button>

              {/* Profile Dropdown */}

              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-green-500 z-50 overflow-visible origin-top-right ${
                    isClosing
                      ? "animate-[fadeOut_.18s_ease-in]"
                      : "animate-[fadeIn_.18s_ease-out]"
                  }`}
                >
                  {/* Dropdown Arrow */}

                  <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />

                  {/* User Info */}

                  <div className="p-4 flex gap-3 items-center border-b border-gray-200">
                    {currentUser.photoURL ? (
  <img
    src={currentUser.photoURL}
    alt={currentUser.displayName || "User"}
    className="w-14 h-14 rounded-full border-2 border-green-600 object-cover"
  />
) : (
  <div className="w-14 h-14 rounded-full border-2 border-green-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
    {(currentUser.displayName || currentUser.email || "U")
      .charAt(0)
      .toUpperCase()}
  </div>
)}

                    <div className="min-w-0">
                      <p className="font-bold truncate">
                        {currentUser.displayName}
                      </p>

                      <p className="text-sm text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Account Links */}

                  <NavLink
                  to="/profile"
                  onClick={closeProfileMenu}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition">
                    <FaUser />
                    Profile
                    </NavLink>

                  <NavLink
                    to="/dashboard"
                    onClick={closeProfileMenu}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <FaTachometerAlt />
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/favorites"
                    onClick={closeProfileMenu}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <FaHeart />

                    <span className="text-red-500">
                      Favorites
                    </span>
                  </NavLink>

                  <NavLink
                    to="/my-recipes"
                    onClick={closeProfileMenu}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <FaUtensils />

                    My
                    <span className="text-green-600">
                      Recipes
                    </span>
                  </NavLink>

                  <NavLink
                    to="/add-recipe"
                    onClick={closeProfileMenu}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <FaPlus />

                    <span className="text-blue-500">
                      Add
                    </span>
                    {""}Recipe
                  </NavLink>

                  {/* Logout */}

                  <div className="border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 transition"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =================================================
               GUEST AUTH BUTTONS
            ================================================= */

            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="whitespace-nowrap border border-green-600 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="whitespace-nowrap bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;