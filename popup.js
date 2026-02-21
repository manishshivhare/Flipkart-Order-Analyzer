window.addEventListener('DOMContentLoaded', () => {
  const flipkartOrderButton = document.getElementById('flikart-button-Id');
  const resultList = document.getElementsByClassName('result');
  const switchButton = document.getElementById('switch__checkbox');
  const analyzeBtn = document.getElementById('analyze_btn');
  const analyzeLabel = document.getElementById('analyze_label');
  const stopBtn = document.getElementById('stop_btn');
  const clearBtn = document.getElementById('clear_btn');
  const loadingCard = document.getElementById('requistie');
  const ordersCard = document.getElementById('orders-data');
  const notOnOrdersCard = document.getElementById('flipkart-order-button');

  // ── Theme ──────────────────────────────────────────────────────────────────
  const setTheme = (isDark = false) => {
    const theme = isDark ? 'styleSheets/dark-style.css' : 'styleSheets/style.css';
    document.getElementById('pagestyle').setAttribute('href', `./${theme}`);
    switchButton.checked = isDark;
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const onOrdersTab = (url = '') =>
    url.includes('flipkart.com') && url.includes('orders');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const show = (el, displayType = 'block') => { if (el) el.style.display = displayType; };
  const hide = (el) => { if (el) el.style.display = 'none'; };

  // ── Display Results ────────────────────────────────────────────────────────
  const showOrdersDetail = (orderDetails) => {
    if (!orderDetails || orderDetails.length < 5) return;

    // Animate count-up for numbers
    const animateValue = (el, end) => {
      if (!el) return;
      let start = 0;
      const duration = 600;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(eased * end);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = end;
      };
      requestAnimationFrame(step);
    };

    animateValue(resultList[0], orderDetails[0] ?? 0);
    animateValue(resultList[1], orderDetails[1] ?? 0);
    animateValue(resultList[2], orderDetails[2] ?? 0);
    animateValue(resultList[3], orderDetails[3] ?? 0);

    const amountEl = document.getElementById('amount-spent');
    if (amountEl) amountEl.textContent = formatCurrency(orderDetails[4]);

    show(ordersCard, 'block');
    hide(loadingCard);
    show(clearBtn, 'inline-flex');
    hide(stopBtn);
    show(analyzeBtn, 'inline-flex');
  };

  // ── Analyzing State ────────────────────────────────────────────────────────
  const setAnalyzingState = (isAnalyzing) => {
    loadingCard.style.display = isAnalyzing ? 'flex' : 'none';
    analyzeBtn.style.display = isAnalyzing ? 'none' : 'inline-flex';
    stopBtn.style.display = isAnalyzing ? 'inline-flex' : 'none';
  };

  // ── Poll for Results ───────────────────────────────────────────────────────
  const updateOrdersDetails = () => {
    const intervalId = setInterval(() => {
      chrome.storage.local.get('orderDetails', (resp) => {
        const { orderDetails } = resp;
        if (Array.isArray(orderDetails) && orderDetails.length > 0) {
          showOrdersDetail(orderDetails);
          chrome.storage.local.set({ isAnalyzing: false });
          clearInterval(intervalId);
        }
      });
    }, 300);

    // Safety timeout: stop polling after 10 min
    setTimeout(() => clearInterval(intervalId), 600_000);
  };

  // ── Init Theme ─────────────────────────────────────────────────────────────
  chrome.storage.local.get('isDark', (resp) => {
    setTheme(Boolean(resp.isDark));
  });

  switchButton.addEventListener('change', () => {
    const isDark = switchButton.checked;
    chrome.storage.local.set({ isDark });
    setTheme(isDark);
  });

  // ── Clear / Reset ──────────────────────────────────────────────────────────
  clearBtn.addEventListener('click', () => {
    chrome.storage.local.remove('orderDetails');
    chrome.storage.local.set({ isAnalyzed: false, isAnalyzing: false });
    window.close();
  });

  // ── Main Tab Check ─────────────────────────────────────────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];

    if (!tab?.url) {
      show(notOnOrdersCard, 'flex');
      return;
    }

    if (onOrdersTab(tab.url)) {
      show(analyzeBtn, 'inline-flex');

      chrome.storage.local.get('isAnalyzed', (resp) => {
        analyzeLabel.textContent = resp.isAnalyzed ? 'Re-analyze' : 'Analyze';
      });

      chrome.storage.local.get('isAnalyzing', (resp) => {
        setAnalyzingState(Boolean(resp.isAnalyzing));
      });

      chrome.storage.local.get('orderDetails', (resp) => {
        if (resp.orderDetails) showOrdersDetail(resp.orderDetails);
      });

      analyzeBtn.addEventListener('click', () => {
        analyzeLabel.textContent = 'Analyzing…';
        setAnalyzingState(true);
        chrome.storage.local.set({ isAnalyzed: true, isAnalyzing: true });
        chrome.storage.local.remove('orderDetails');
        chrome.tabs.sendMessage(tab.id, { from: 'popup', query: 'clicked' });
        updateOrdersDetails();
      });

      stopBtn.addEventListener('click', () => {
        chrome.tabs.sendMessage(tab.id, { from: 'popup', query: 'stop' });
        chrome.storage.local.set({ isAnalyzing: false });
        setAnalyzingState(false);
      });
    } else {
      show(notOnOrdersCard, 'flex');
      hide(ordersCard);

      flipkartOrderButton.addEventListener('click', () => {
        window.open('https://www.flipkart.com/account/login?ret=%2Faccount%2Forders%3Flink%3Dhome_orders&fromMyOrdersPage=true');
      });
    }
  });
});