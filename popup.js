window.addEventListener('DOMContentLoaded', () => {


    const flikartOderButton = document.getElementById("flikart-button-Id");
    const resultList = document.getElementsByClassName("result");
    const switchButton = document.getElementById("switch__checkbox");

    function setTheme(isDark) {
        const theme = isDark ? "styleSheets/dark-style.css" : "styleSheets/style.css";
        document.getElementById("pagestyle").setAttribute("href", `./${theme}`);
        switchButton.checked = isDark;
    }

    chrome.storage.local.get("isDark", (resp) => {
        setTheme(resp.isDark);
    });

    switchButton.addEventListener("change", () => {
        const isDark = switchButton.checked;
        chrome.storage.local.set({ isDark });
        setTheme(isDark);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab.url.includes('flipkart') && tab.url.includes('orders')) {
            const button = document.getElementById("analyze_btn");
            button.style.display = "block";

            button.addEventListener("click", () => {
                document.getElementById("requistie").style.display = "block";
                chrome.tabs.sendMessage(
                    tab.id,
                    { from: "popup", query: "clicked" }
                );
                chrome.storage.local.remove("orderDetails");
                updateOrdersDetails()


            });
        }
        else if (tab.url.includes('chrome:')) {
            const errorMsg = document.getElementById("flipkart-order-button");
            errorMsg.innerHTML = "<div>Can't acess chrome pages</div>"
            errorMsg.style.display = "block";
        }
        else {
            const errorMsg = document.getElementById("flipkart-order-button");
            errorMsg.style.display = "block";
            document.getElementById("orders-data").style.display = "none";
            flikartOderButton.addEventListener("click", () => {
                chrome.tabs.sendMessage(
                    tab.id,
                    { from: "flipkartButton" }, () => {
                        window.close();
                    }
                );
            })
        }

    });


    function showOrdersDetail(orderDetails) {
        if (orderDetails) {

            if (orderDetails.length > 0) {
                let i = 0;
                orderDetails.forEach(data => {
                    resultList[i].innerText = data;
                    i++;
                });
                if (!document.getElementById("clearBtn")) {
                    const ClearButton = document.getElementById("clear_btn");
                    ClearButton.style.display = "block"

                    ClearButton.addEventListener("click", () => {
                        chrome.storage.local.remove("orderDetails");
                        window.close();
                    });

                }
                document.getElementById("orders-data").style.display = "block";
                document.getElementById("requistie").style.display = "none";
            }
            const amount_spent = document.getElementById("amount-spent");
            let format = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
            });
            amount_spent.innerText = (format.format(amount_spent.innerText));
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab.url.includes('flipkart') && tab.url.includes('orders')) {

            chrome.storage.local.get("orderDetails", (resp) => {
                const orderDetails = resp.orderDetails;
                showOrdersDetail(orderDetails);
            });
        }
    })
    function updateOrdersDetails() {
        var intervalId = setInterval(() => {
            chrome.storage.local.get("orderDetails", (resp) => {
                const orderDetails = resp.orderDetails;
                if (orderDetails) {
                    if (orderDetails.length > 0) {
                        showOrdersDetail(orderDetails);
                        clearInterval(intervalId);
                    }
                }
            });

        }, 100)
    }


    document.querySelectorAll('input[type=radio]').forEach(function (radio) {
        radio.addEventListener('change', function () {

            if (this.value > 2) {

                window.open("https://chromewebstore.google.com/detail/flipkart-order-analyzer/mcpflafdobpbfojllbpbciphhgknnjje?authuser=0&hl=en-GB/reviews",)
            }
        });
    });


});
