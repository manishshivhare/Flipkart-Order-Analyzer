window.addEventListener('DOMContentLoaded', () => {
  const flipkartOrderButton = document.getElementById('flikart-button-Id');
  const resultList = document.getElementsByClassName('result');
  const switchButton = document.getElementById('switch__checkbox');
  const analyzeBtn = document.getElementById('analyze_btn');
  const analyzeLabel = document.getElementById('analyze_label');
  const clearBtn = document.getElementById('clear_btn');
  const loadingCard = document.getElementById('requistie');
  const ordersCard = document.getElementById('orders-data');
  const notOnOrdersCard = document.getElementById('flipkart-order-button');

  const setTheme = (isDark = false) => {
    const theme = isDark ? 'styleSheets/dark-style.css' : 'styleSheets/style.css';
    document.getElementById('pagestyle').setAttribute('href', `./${theme}`);
    switchButton.checked = isDark;
  };

  const onOrdersTab = (url = '') => url.includes('flipkart.com') && url.includes('orders');

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(Number(value || 0));

  const showOrdersDetail = (orderDetails) => {
    if (!orderDetails || orderDetails.length < 5) return;

    resultList[0].innerText = orderDetails[0] ?? 0;
    resultList[1].innerText = orderDetails[1] ?? 0;
    resultList[2].innerText = orderDetails[2] ?? 0;
    resultList[3].innerText = orderDetails[3] ?? 0;
    document.getElementById('amount-spent').innerText = formatCurrency(orderDetails[4]);

    ordersCard.style.display = 'block';
    loadingCard.style.display = 'none';
    clearBtn.style.display = 'block';
  };

  const updateOrdersDetails = () => {
    const intervalId = setInterval(() => {
      chrome.storage.local.get('orderDetails', (resp) => {
        const orderDetails = resp.orderDetails;
        if (Array.isArray(orderDetails) && orderDetails.length > 0) {
          showOrdersDetail(orderDetails);
          clearInterval(intervalId);
        }
      });
    }, 200);
  };

  chrome.storage.local.get('isDark', (resp) => {
    setTheme(Boolean(resp.isDark));
  });

  switchButton.addEventListener('change', () => {
    const isDark = switchButton.checked;
    chrome.storage.local.set({ isDark });
    setTheme(isDark);
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.remove('orderDetails');
    chrome.storage.local.set({ isAnalyzed: false });
    window.close();
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab || !tab.url) {
      notOnOrdersCard.style.display = 'block';
      return;
    }

    if (onOrdersTab(tab.url)) {
      analyzeBtn.style.display = 'inline-flex';

      chrome.storage.local.get('isAnalyzed', (resp) => {
        analyzeLabel.textContent = resp.isAnalyzed ? 'Re-analyze' : 'Analyze';
      });

      chrome.storage.local.get('orderDetails', (resp) => {
        showOrdersDetail(resp.orderDetails);
      });

      analyzeBtn.addEventListener('click', () => {
        loadingCard.style.display = 'block';
        analyzeBtn.style.display = 'none';
        chrome.storage.local.set({ isAnalyzed: true });
        chrome.storage.local.remove('orderDetails');

        chrome.tabs.sendMessage(tab.id, { from: 'popup', query: 'clicked' });
        updateOrdersDetails();
      });
    } else {
      notOnOrdersCard.style.display = 'block';
      ordersCard.style.display = 'none';

      flipkartOrderButton.addEventListener('click', () => {
        window.open('https://www.flipkart.com/account/login?ret=%2Faccount%2Forders%3Flink%3Dhome_orders&fromMyOrdersPage=true');
      });
    }
  });
});
