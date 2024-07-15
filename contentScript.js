const container = document.getElementById('container');

function analyzeContent() {
    var endButton = "";
    var statusOfPage = "";
    var totalDeliveredValue = 4;
    var cancelledOrder = 1;
    var returnedOrder = 3;
    var DeliveredOrder = 2;
    var totalOrder = 0;
    var orderDetails = [0, 0, 0, 0, 0]

    function scrollToBottom() {

        function scrollHandler() {
            const scrollableHeight = document.body.scrollHeight;
            const showMoreButton = document.querySelector(".QqFHMw.v0q-qo");

            if (showMoreButton) {
                statusOfPage = showMoreButton.innerText;
                if (statusOfPage === "Show More Orders") {
                    showMoreButton.click();
                }
            }

            window.scrollTo(0, scrollableHeight);

            if (endButton !== "No More Results To Display") {
                setTimeout(checkNextScroll, 1000);
            }
        }

        function checkNextScroll() {
            applyFilter();
            const endButtonElement = document.querySelector(".v0q-qo");
            if (endButtonElement) {
                endButton = endButtonElement.innerText;
            }

            if (endButton !== "No More Results To Display") {
                scrollHandler();
            } else {
                console.log("Finished scrolling");
                startAnalyzing();
            }
        }


        window.onload = checkNextScroll();
    }

    function startAnalyzing() {
        console.log("Start Analyzing")
        var elementsStatusArray = Array.from(document.getElementsByClassName("g1SRZp"));
        var elementsPriceArray = Array.from(document.getElementsByClassName("col-2-12 mcVLQq"));
        var lenStatusArray = elementsStatusArray.length;

        for (var i = 0; i < lenStatusArray; i++) {
            priceArray = elementsPriceArray[i].innerText;
            orderStatus = elementsStatusArray[i].innerText.split(" ")[0];
            refundStatus = elementsStatusArray[i].innerText;

            if (refundStatus == "Refund Completed") {
                orderDetails[returnedOrder]++;
            } else if (orderStatus == "Cancelled") {
                orderDetails[cancelledOrder]++;
            } else if (orderStatus == "Delivered" || refundStatus == "Refund Rejected") {
                var price = "";
                for (var j = 0; j < priceArray.length; j++) {
                    var elem = priceArray[j];
                    if (elem === "+") {
                        break;
                    }
                    if (!isNaN(parseInt(elem))) {
                        price += elem;
                    }
                }
                price = parseInt(price);
                if (!isNaN(price)) {
                    orderDetails[DeliveredOrder]++;
                    orderDetails[totalDeliveredValue] += price;
                }
            }
        }
        orderDetails[totalOrder] = orderDetails[returnedOrder] + orderDetails[cancelledOrder] + orderDetails[DeliveredOrder];
        chrome.storage.local.set({
            "orderDetails": orderDetails
        })



    }
    scrollToBottom();

}

function applyFilter(){
    container.style.cssText = "filter: blur(5px)";
}

(() => {

    chrome.runtime.onMessage.addListener((message, sender) => {
        const { from, query } = message;
        if (from === "popup" && query === "clicked") {
            applyFilter();
            analyzeContent();
        }
    })

})();



