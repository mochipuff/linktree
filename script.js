(function() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('copy', e => e.preventDefault());
  document.addEventListener('cut', e => e.preventDefault());

  document.addEventListener('wheel', e => {
    if (e.ctrlKey) { e.preventDefault(); }
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (e.touches.length > 1) { e.preventDefault(); }
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key.toLowerCase() === 's')) {
      e.preventDefault();
    }
  });

  function checkRateLimit() {
    const limit = 5; 
    const timeWindow = 10000;
    const now = Date.now();
    
    let history =[];
    try {
      history = JSON.parse(localStorage.getItem('fikk_req_history') || '[]');
    } catch(e) {
      history =[];
    }

    history = history.filter(time => now - time < timeWindow);

    if (history.length >= limit) {
      return false;
    }

    history.push(now);
    localStorage.setItem('fikk_req_history', JSON.stringify(history));
    return true;
  }

  const redirectMap = {
    'linkA': 'https://link.a',
    'linkB': 'https://b.link'
  };

  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function showAlert(contentHtml) {
    const alertDiv = document.getElementById('invalidParamAlert');
    if (!alertDiv) return;

    alertDiv.innerHTML = `
      <div class="alert-banner bg-amber-50 border-l-4 border-amber-400 rounded-xl p-3 flex items-start gap-3 shadow-sm">
        <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
        <div class="flex-1 text-sm text-amber-800">
          ${contentHtml}
        </div>
        <button id="closeAlertBtn" class="text-amber-600 hover:text-amber-800 transition">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    alertDiv.classList.remove('hidden');

    const closeBtn = document.getElementById('closeAlertBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        alertDiv.classList.add('hidden');
      });
    }
  }

  function showInvalidParamWarning(invalidValue) {
    const content = `
      <span class="font-medium">Parameter not found, maybe you made a typo?</span> 
    `;
    showAlert(content);
  }

  function showRateLimitWarning() {
    const content = `
      <span class="font-medium">Too many requests!</span> 
      <span class="block text-amber-700/80 text-xs mt-1">Please slow down and wait a moment to prevent abuse.</span>
    `;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => showAlert(content));
    } else {
      showAlert(content);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
      return c;
    });
  }

  if (!checkRateLimit()) {
    showRateLimitWarning();
    return;
  }

  const tValue = getUrlParameter('t');

  if (tValue) {
    const targetUrl = redirectMap[tValue.toLowerCase()];
    if (targetUrl) {
      window.location.replace(targetUrl);
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => showInvalidParamWarning(tValue));
      } else {
        showInvalidParamWarning(tValue);
      }
    }
  }

})();
