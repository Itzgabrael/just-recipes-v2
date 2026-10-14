import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "justRecipesTheme";

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme =
        localStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme === "dark") {
        return true;
      }

      if (savedTheme === "light") {
        return false;
      }

      return false;
    } catch (error) {
      console.error(
        "Error loading theme:",
        error
      );

      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem(
        THEME_STORAGE_KEY,
        "dark"
      );
    } else {
      root.classList.remove("dark");
      localStorage.setItem(
        THEME_STORAGE_KEY,
        "light"
      );
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

  const value = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
      setDarkMode,
    }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}