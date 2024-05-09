console.log("content script injected")


chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.from === "popup" && message.query === "clicked") {

        setTimeout(() => {



            var totalDeliveredVlaue = 0;
            var countDeliveredOrder = 0;
            var elementsStatusArray = Array.from(
                document.getElementsByClassName("g1SRZp")
            );
            var elementsPriceArray = Array.from(
                document.getElementsByClassName("col-2-12 mcVLQq")
            );

            var lenStatusArray = elementsStatusArray.length;

            for (var i = 0; i < lenStatusArray; i++) {
                priceArray = elementsPriceArray[i].innerText;
                orderStatus = elementsStatusArray[i].innerText.slice(0, 9);

                if (orderStatus == "Delivered") {
                    countDeliveredOrder++;
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
            chrome.storage.local.get("orderDetails", (resp) => {
                chrome.storage.local.set({ "orderDetails": [lenStatusArray, countDeliveredOrder, totalDeliveredVlaue] })
                
            })
        }, 500);
    }
})