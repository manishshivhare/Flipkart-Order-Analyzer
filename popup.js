window.addEventListener('DOMContentLoaded', () => {

    
    const flikartOderButton = document.getElementById("flikart-button-Id");
    const resultList = document.getElementsByClassName("result");
    const switchButton = document.getElementById("switch__checkbox");
    
    chrome.storage.local.get("isDark", (resp)=>{
        if(resp.isDark){
            document.getElementById("pagestyle").setAttribute("href", "./dark-style.css");
            document.getElementById("switch__checkbox").checked = true;
            
        }else{
            document.getElementById("pagestyle").setAttribute("href", "./style.css");
        }

        
    })
    switchButton.addEventListener("change", ()=>{
        chrome.storage.local.set({isDark: switchButton.checked})
        
        if(switchButton.checked){
            document.getElementById("pagestyle").setAttribute("href", "./dark-style.css")
        }else{
            document.getElementById("pagestyle").setAttribute("href", "./style.css")
        }
    })
    
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab.url.includes('flipkart') && tab.url.includes('orders')) {
            const button = document.getElementById("analyze_btn");
            button.style.display = "block";
            
            button.addEventListener("click", () => {
                document.getElementById("requistie").style.display = "block";
                chrome.tabs.sendMessage(
                    tab.id,
                    { from: "popup", query: "clicked" }, showOrdersDetail
                );


            });
        }
        else if(tab.url.includes('chrome:')){
            const errorMsg = document.getElementById("flipkart-order-button");
            errorMsg.innerHTML = "<div>Can't acess chrome pages</div>"
            errorMsg.style.display = "block";
        }
        else{
            const errorMsg = document.getElementById("flipkart-order-button");
            errorMsg.style.display = "block";
            document.getElementById("subCont").style.display = "none";
            flikartOderButton.addEventListener("click" ,()=>{
                chrome.tabs.sendMessage(
                    tab.id,
                    { from: "flipkartButton" },()=>{
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
