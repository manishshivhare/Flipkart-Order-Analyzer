
(()=>{
chrome.runtime.onMessage.addListener((message, sender, response) => {
    const {from, query} = message;
    if (from === "popup" && query === "clicked") {

        var endButton = "";
        var statusOfPage = "";
        var totalDeliveredValue = 4;
        var cancelledOrder = 1;
        var returnedOrder = 2;
        var DeliveredOrder = 3;
        var totalOrder = 0;
        var orderDetails = [0, 0, 0, 0, 0]

        function scrollToBottom() {

            function scrollHandler() {
                var scrollableHeight = document.body.scrollHeight;
                if (document.getElementsByClassName("QqFHMw v0q-qo").length > 0) {
                    statusOfPage = document.getElementsByClassName("QqFHMw v0q-qo")[0].innerText;
                }
                if (statusOfPage === "Show More Orders") {
                    document.getElementsByClassName("QqFHMw v0q-qo")[0].click()
                    window.scrollTo(0, scrollableHeight);
                } else {
                    window.scrollTo(0, scrollableHeight);
                }
                if (endButton != "No More Results To Display") {
                    setTimeout(checkNextScroll, 1000);
                }
            }

            function checkNextScroll() {
                if (document.getElementsByClassName("v0q-qo").length > 0) {
                    endButton = document.getElementsByClassName("v0q-qo")[0].innerText;
                }
                if (endButton != "No More Results To Display") {
                    window.onload = scrollHandler();
                }
                if (endButton == "No More Results To Display") {
                    console.log("Finished scrolling")
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
            response(orderDetails);
            chrome.storage.local.set({
                "orderDetails": orderDetails
            })


        }
        scrollToBottom();

        
    }else if (from === "flipkartButton") {
        window.location.href = 'https://www.flipkart.com/account/login?ret=%2Faccount%2Forders%3Flink%3Dhome_orders&fromMyOrdersPage=true';
        
    }
})

})();
