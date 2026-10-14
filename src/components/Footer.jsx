import { Link, useLocation, useNavigate } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
const navigate = useNavigate();

function handleBrandClick(event) {
  event.preventDefault();

  if (location.pathname === "/") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    return;
  }

 void navigate("/", { state: { scrollHomeToTop: true } });
}

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Brand and Quick Links */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

          {/* Brand */}
          <Link
            to="/"
            onClick={handleBrandClick}
            aria-label="Just Recipes home"
            className="flex items-center gap-3 self-start group"
          >
            <img
              src="/pwa-192x192.png"
              alt=""
              aria-hidden="true"
              className="w-14 h-14 object-contain transition-transform duration-200 group-hover:scale-105"
            />

            <div>
              <span className="block text-xl font-bold text-green-600">
                Just Recipes
              </span>

              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Cook. Share. Enjoy.
              </span>
            </div>
          </Link>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-lg">
              <li>
                <Link
                  to="/"
                  onClick={handleBrandClick}
                  className="transition-colors hover:text-green-600"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/favorites"
                  className="transition-colors hover:text-green-600"
                >
                  Favorites
                </Link>
              </li>

              <li>
                <Link
                  to="/my-recipes"
                  className="transition-colors hover:text-green-600">
                  My <span className="text-green-600">Recipes</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-5 text-sm dark:border-gray-700">
          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>
              &copy; {currentYear} Just{""} 
              <span className="font-medium text-green-600">Recipes</span>. 
              All rights reserved.
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              Made for food lovers.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
