window.addEventListener('DOMContentLoaded', () => {

    
    const buttonCont = document.getElementById("analyze_btn_cont");
    const resultList = document.getElementsByClassName("result");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab.url.includes('flipkart') && tab.url.includes('orders')) {
            const button = document.getElementById("analyze_btn");
            button.style.display = "block";
            
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
                document.getElementById("subCont").style.display = "block";
                document.getElementById("requistie").style.display = "none";
            }
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
