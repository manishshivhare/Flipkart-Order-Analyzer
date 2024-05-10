
window.addEventListener('DOMContentLoaded', () => {
    const mainCont = document.getElementById("mainCont");
    const clearButton = document.getElementById("clearButton");
    const buttonCont = document.getElementById("analyze_btn_cont");
    const resultList = document.getElementsByClassName("result");
    
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]

        
        if(tab.url.includes('flipkart') && tab.url.includes('orders') ){
            const button = document.createElement("button")
            button.setAttribute("class", "analyze_btn")

            button.innerText = "Analyze"


            button.addEventListener("click", () => {
                

                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { from: "popup", query: "clicked" }
                );
                document.getElementById("requistie").style.display = "block";
                window.close()
               
            })
            
            buttonCont.appendChild(button)
            

            
        }
        else{
            const errorMsg = document.createElement("h1")
            errorMsg.innerText = 'First please Open flipkart orders section'
            errorMsg.setAttribute("id", "errorMsg")
            buttonCont.appendChild(errorMsg) 
            document.getElementById("subCont").style.display = "none";
            
        }
    });




    chrome.storage.local.get("orderDetails", (resp) => {

        if (resp.orderDetails && resp.orderDetails.length > 0) {
            i=0
            resp.orderDetails.forEach(data => {
                resultList[i].innerText+=data
                i++
            })

            const ClearButton = document.createElement("button")
            ClearButton.innerText = "Clear Data"
            ClearButton.setAttribute("id", "clearBtn")
            ClearButton.addEventListener("click", () => {
                chrome.storage.local.remove("orderDetails")
                window.close()
            })
            clearButton.appendChild(ClearButton)
            document.getElementById("subCont").style.display = "block";
            document.getElementById("requistie").style.display = "none";
            
            
        }
        

    })
    

})
