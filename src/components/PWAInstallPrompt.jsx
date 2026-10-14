import { useEffect, useState } from "react";
import { MdInstallDesktop } from "react-icons/md";

function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);

  const [isInstalled, setIsInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    const promptEvent = installPrompt;

    setInstallPrompt(null);

    await promptEvent.prompt();

    const { outcome } = await promptEvent.userChoice;

    if (outcome === "accepted") {
      console.log("Just Recipes installation accepted.");
    } else {
      console.log("Just Recipes installation dismissed.");
    }
  }

  if (!installPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50">
      <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-700 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              Install Just Recipes
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Install the app for a faster, app-like experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
          >
            <MdInstallDesktop className="text-lg" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;