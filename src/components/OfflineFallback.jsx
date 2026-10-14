function OfflineFallback({
  title = "You're offline",
  message = "Some features may be unavailable until you're back online.",
}) {
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
      <p className="text-lg font-semibold text-green-800">
        {title}
      </p>

      <p className="text-sm text-green-700 mt-2">
        {message}
      </p>
    </div>
  );
}

export default OfflineFallback;