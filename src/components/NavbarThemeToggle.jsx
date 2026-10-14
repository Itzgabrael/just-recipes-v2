import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function NavbarThemeToggle({ mobile = false }) {
  const { darkMode, toggleDarkMode } = useTheme();

  const handleThemeToggle = () => {
    toggleDarkMode();
  };

  return mobile ? (
    <MobileThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
  ) : (
    <DesktopThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
  );
}

function MobileThemeToggle({ darkMode, onToggle }) {
  const icon = darkMode ? <FaMoon /> : <FaSun />;
  const mode = darkMode ? "dark" : "light";

  return (
    <div className="px-3 pb-3">
      <button
        type="button"
        onClick={onToggle}
        className={`theme-toggle-mobile w-full theme-toggle-${mode}`}
        aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
        aria-pressed={darkMode}
      >
        <span className="flex items-center gap-3">
          <span className="theme-toggle-mobile-icon">{icon}</span>
          <span className="font-semibold">
            {darkMode ? "Dark Mode" : "Light Mode"}
          </span>
        </span>
        <span className="theme-toggle-switch">
          <span className={`theme-toggle-knob ${darkMode ? "theme-toggle-knob-dark" : ""}`}>
            {icon}
          </span>
        </span>
      </button>
    </div>
  );
}

function DesktopThemeToggle({ darkMode, onToggle }) {
  const icon = darkMode ? <FaMoon /> : <FaSun />;
  const mode = darkMode ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle-desktop theme-toggle-${mode}`}
      aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      aria-pressed={darkMode}
    >
      <span className="theme-toggle-desktop-icon"><FaSun /></span>
      <span className="theme-toggle-track">
        <span className={`theme-toggle-knob ${darkMode ? "theme-toggle-knob-dark" : ""}`}>
          {icon}
        </span>
      </span>
      <span className="theme-toggle-desktop-icon"><FaMoon /></span>
    </button>
  );
}

export default NavbarThemeToggle;