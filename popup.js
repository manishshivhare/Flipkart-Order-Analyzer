
window.addEventListener('DOMContentLoaded', () => {
    const mainCont = document.getElementById("mainCont");
    const clearButton = document.getElementById("clearButton");
    const buttonCont = document.getElementById("analyze_btn_cont");
    const resultList = document.getElementsByClassName("result");
    
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]

        if (tab.url === undefined || tab.url.indexOf('chrome') == 0) {
            buttonCont.innerHTML = 'can\'t access <i>Chrome pages</i>'
        }
        
        else if (tab.url.indexOf('file') === 0) {
            buttonCont.innerHTML = '<span style="font-family: lobster, sans-serif">Eye Dropper</span> can\'t access <i>local pages</i>'

        } 
        else if(tab.url.includes('flipkart') && tab.url.includes('orders') ){
            const button = document.createElement("button")
            button.setAttribute("class", "analyze_btn")

            button.innerText = "Analyze"


            button.addEventListener("click", () => {
                

                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { from: "popup", query: "clicked" }
                );
                window.close()
               
            })

            buttonCont.appendChild(button)
            

            
        }
        else{
            buttonCont.innerHTML = 'Open flipkart order section'
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
            
            
        }
        

    })
    

})
