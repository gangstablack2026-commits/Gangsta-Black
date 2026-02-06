// Remote sync configuration (optional)
//
// ✅ Goal: when you edit products/settings in admin, everyone sees it.
//
// This project originally stores everything in localStorage (per-device).
// To make it shared for all visitors, we need a small backend endpoint.
//
// Put your endpoint URL below. If you leave it empty, the site will keep using
// localStorage only (no breaking changes).
//
// Suggested no-server option: Google Apps Script Web App.
// You'll deploy it as "Anyone" can access, then paste the Web App URL here.

// 1) Paste your endpoint URL here (leave empty to disable sync)
window.REMOTE_STORE_URL = "https://script.google.com/macros/s/AKfycbyzhIUv0tlz2oo2YfLWpYYgji1fIBBqKfQkH476YxRrUG3M9JoF3Ka3hGQTxu9fSQyS/exec";

// 2) Optional: if you set a password/token in your backend, put it here
window.REMOTE_STORE_TOKEN = "";

// 3) How often storefront/admin should auto-refresh from remote (ms)
window.REMOTE_STORE_POLL_MS = 5000;
