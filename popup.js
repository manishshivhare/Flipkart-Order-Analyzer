window.addEventListener('DOMContentLoaded', () => {
    const mainCont = document.getElementById("mainCont");
    const clearButton = document.getElementById("clearButton");
    const buttonCont = document.getElementById("analyze_btn_cont");
    const resultList = document.getElementsByClassName("result");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab.url.includes('flipkart') && tab.url.includes('orders')) {
            const button = document.createElement("button");
            button.setAttribute("class", "analyze_btn " + "button-17");
            button.innerText = "Analyze";
            buttonCont.appendChild(button);
            button.addEventListener("click", () => {
                document.getElementById("requistie").style.display = "block";
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { from: "popup", query: "clicked" }, showOrdersDetail
                );


            });
        }
        else {
            const errorMsg = document.createElement("h1");
            errorMsg.innerText = 'First please Open flipkart orders section';
            errorMsg.setAttribute("id", "errorMsg");
            buttonCont.appendChild(errorMsg);
            document.getElementById("subCont").style.display = "none";
        }
    });


    function showOrdersDetail(orderDetails) {

        if (orderDetails.length > 0) {
            let i = 0;
            orderDetails.forEach(data => {
                resultList[i].innerText = data;
                i++;
            });
            if (!document.getElementById("clearBtn")) {
                const ClearButton = document.createElement("button");
                ClearButton.innerText = "Clear Data";
                ClearButton.setAttribute("id", "clearBtn");
                ClearButton.setAttribute("class", "button-17");
                ClearButton.addEventListener("click", () => {
                    chrome.storage.local.remove("orderDetails");
                    window.close();
                });
                clearButton.appendChild(ClearButton);
            }
            document.getElementById("subCont").style.display = "block";
            document.getElementById("requistie").style.display = "none";
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

});
