const container = document.getElementById("container");
let shouldStopAnalyzing = false;
let scrollTimeoutId = null;

function applyFilter() {
  if (container) {
    container.style.cssText = "filter: blur(5px)";
  }
}

function removeFilter() {
  if (container) {
    container.style.cssText = "filter: blur(0px)";
  }
}

function analyzeContent() {
  shouldStopAnalyzing = false;
  let endButton = "";
  const totalDeliveredValue = 4;
  const cancelledOrder = 1;
  const returnedOrder = 3;
  const deliveredOrder = 2;
  const totalOrder = 0;
  const orderDetails = [0, 0, 0, 0, 0];

  function startAnalyzing() {
    if (shouldStopAnalyzing) {
      removeFilter();
      chrome.storage.local.set({ isAnalyzing: false });
      return;
    }

    const elementsStatusArray = Array.from(
      document.getElementsByClassName("sNKed5"),
    );
    const elementsPriceArray = Array.from(
      document.getElementsByClassName("QF9IHY"),
    );

    for (let i = 0; i < elementsStatusArray.length; i += 1) {
      const priceText = elementsPriceArray[i]?.innerText || "";
      const refundStatus = elementsStatusArray[i].innerText;
      const orderStatus = refundStatus.split(" ")[0];

      if (refundStatus === "Refund Completed") {
        orderDetails[returnedOrder] += 1;
      } else if (orderStatus === "Cancelled") {
        orderDetails[cancelledOrder] += 1;
      } else if (
        orderStatus === "Delivered" ||
        refundStatus === "Refund Rejected"
      ) {
        const digits = priceText.replace(/[^0-9]/g, "");
        const price = Number.parseInt(digits, 10);

        if (!Number.isNaN(price)) {
          orderDetails[deliveredOrder] += 1;
          orderDetails[totalDeliveredValue] += price;
        }
      }
    }

    orderDetails[totalOrder] =
      orderDetails[returnedOrder] +
      orderDetails[cancelledOrder] +
      orderDetails[deliveredOrder];
    chrome.storage.local.set({ orderDetails });
    chrome.storage.local.set({ isAnalyzing: false });
    removeFilter();
  }

  function checkNextScroll() {
    if (shouldStopAnalyzing) {
      removeFilter();
      chrome.storage.local.set({ isAnalyzing: false });
      return;
    }

    const endButtonElement = document.querySelector(".dDeuVV");
    if (endButtonElement) {
      endButton = endButtonElement.innerText;
    }

    if (endButton !== "No More Results To Display") {
      const showMoreButton = document.querySelector(".dDeuVV");
      if (showMoreButton && showMoreButton.innerText === "Show More Orders") {
        showMoreButton.click();
      }

      window.scrollTo(0, document.body.scrollHeight);
      scrollTimeoutId = setTimeout(checkNextScroll, 1000);
    } else {
      startAnalyzing();
    }
  }

  checkNextScroll();
}

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
