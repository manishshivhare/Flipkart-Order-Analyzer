console.log("content script injected")


chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.from === "popup" && message.query === "clicked") {

        setTimeout(() => {


            var endButton = "";
            var statusOfPage = "";
            var totalDeliveredVlaue = 0;
            var cancelledOrder = 0;
            var returnedOrder = 0;
            var DeliveredOrder = 0;
            var totalOrder;

            function scrollToBottom() {


                function scrollHandler() {

                    var scrollableHeight = document.body.scrollHeight;
                    if (document.getElementsByClassName("QqFHMw v0q-qo").length > 0) {
                        statusOfPage = document.getElementsByClassName("QqFHMw v0q-qo")[0].innerText;
                    }

                    if (statusOfPage === "Show More Orders") {
                        document.getElementsByClassName("QqFHMw v0q-qo")[0].click();
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

                var elementsStatusArray = Array.from(
                    document.getElementsByClassName("g1SRZp")
                );
                var elementsPriceArray = Array.from(
                    document.getElementsByClassName("col-2-12 mcVLQq")
                );

                var lenStatusArray = elementsStatusArray.length;

                for (var i = 0; i < lenStatusArray; i++) {
                    priceArray = elementsPriceArray[i].innerText;
                    orderStatus = elementsStatusArray[i].innerText.split(" ")[0];

                    if (orderStatus == "Refund") {
                        returnedOrder++;
                    }
                    else if (orderStatus == "Cancelled") {
                        cancelledOrder++;
                    }
                    else if (orderStatus == "Delivered") {
                        DeliveredOrder++;
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
                            totalDeliveredVlaue += price;
                        }
                    }
                }
                totalOrder = returnedOrder + cancelledOrder + DeliveredOrder;
                chrome.storage.local.get("orderDetails", (resp) => {
                    chrome.storage.local.set({ "orderDetails": [totalOrder, cancelledOrder, DeliveredOrder, returnedOrder, totalDeliveredVlaue] })

                })
            }
            scrollToBottom();
            
        }, 500);
    }
})
            











