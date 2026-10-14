function OfflineBanner() {
  return (
    <output
  className="sticky top-0 z-50 w-full border-b border-green-200 bg-green-50 px-4 py-2 text-center"
>
  <p className="text-sm font-medium text-green-800">
    You're offline. Some features may be unavailable.
  </p>
  </output>
  );
}

export default OfflineBanner;