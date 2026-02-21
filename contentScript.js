const container = document.getElementById("container");
let shouldStopAnalyzing = false;
let scrollTimeoutId = null;

// ── Blur Helpers ──────────────────────────────────────────────────────────────
function applyFilter() {
  if (container) container.style.filter = "blur(5px)";
}

function removeFilter() {
  if (container) container.style.filter = "";
}

// ── Main Analysis ─────────────────────────────────────────────────────────────
function analyzeContent() {
  shouldStopAnalyzing = false;

  const INDEX = { total: 0, cancelled: 1, delivered: 2, returned: 3, totalSpent: 4 };
  const orderDetails = [0, 0, 0, 0, 0];

  function startAnalyzing() {
    if (shouldStopAnalyzing) {
      removeFilter();
      chrome.storage.local.set({ isAnalyzing: false });
      return;
    }

    const statusElements = Array.from(document.getElementsByClassName("sNKed5"));
    const priceElements = Array.from(document.getElementsByClassName("QF9IHY"));

    for (let i = 0; i < statusElements.length; i++) {
      const refundStatus = statusElements[i].innerText.trim();
      const orderStatus = refundStatus.split(" ")[0];
      const priceText = priceElements[i]?.innerText || "";

      if (refundStatus === "Refund Completed") {
        orderDetails[INDEX.returned]++;
      } else if (orderStatus === "Cancelled") {
        orderDetails[INDEX.cancelled]++;
      } else if (orderStatus === "Delivered" || refundStatus === "Refund Rejected") {
        const digits = priceText.replace(/[^0-9]/g, "");
        const price = parseInt(digits, 10);
        if (!isNaN(price)) {
          orderDetails[INDEX.delivered]++;
          orderDetails[INDEX.totalSpent] += price;
        }
      }
    }

    orderDetails[INDEX.total] =
      orderDetails[INDEX.returned] +
      orderDetails[INDEX.cancelled] +
      orderDetails[INDEX.delivered];

    chrome.storage.local.set({ orderDetails, isAnalyzing: false });
    removeFilter();
  }

  function checkNextScroll() {
    if (shouldStopAnalyzing) {
      removeFilter();
      chrome.storage.local.set({ isAnalyzing: false });
      return;
    }

    const endButtonEl = document.querySelector(".dDeuVV");
    const endButtonText = endButtonEl?.innerText?.trim() || "";

    if (endButtonText === "No More Results To Display") {
      startAnalyzing();
      return;
    }

    if (endButtonText === "Show More Orders") {
      endButtonEl.click();
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    scrollTimeoutId = setTimeout(checkNextScroll, 1200);
  }

  checkNextScroll();
}

// ── Message Listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  const { from, query } = message;

  if (from === "popup" && query === "clicked") {
    applyFilter();
    analyzeContent();
  }

  if (from === "popup" && query === "stop") {
    shouldStopAnalyzing = true;
    if (scrollTimeoutId) {
      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = null;
    }
    chrome.storage.local.set({ isAnalyzing: false });
    removeFilter();
  }
});