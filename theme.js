(function () {
  'use strict';

  var config = window.ZsForemanTheme || {};
  var logoUrl = typeof config.logoUrl === 'string' ? config.logoUrl.trim() : '';
  var hideForemanText = config.hideForemanHeaderText === true;

  function applyLogo() {
    if (!logoUrl) return;

    document.body.classList.add('zs-custom-logo');
    document
      .querySelectorAll('img[src*="header_logo"], img[src*="login_logo"], img[alt*="Foreman"], img[alt*="foreman"]')
      .forEach(function (img) {
        img.src = logoUrl;
        img.classList.add('zs-theme-logo');
      });
  }

  function hideWordmarkText() {
    if (!hideForemanText) return;

    var brandSelectors = [
      '.navbar-brand',
      '.pf-v5-c-masthead__brand',
      '.pf-v6-c-masthead__brand',
      '.pf-v5-c-brand',
      '.pf-v6-c-brand',
      'a[href="/"]'
    ];

    document.querySelectorAll(brandSelectors.join(',')).forEach(function (brand) {
      Array.prototype.slice.call(brand.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().toUpperCase() === 'FOREMAN') {
          var span = document.createElement('span');
          span.className = 'zs-theme-hidden-wordmark';
          span.textContent = node.textContent;
          node.parentNode.replaceChild(span, node);
        }
      });

      Array.prototype.slice.call(brand.children).forEach(function (child) {
        if (child.textContent.trim().toUpperCase() === 'FOREMAN' && !child.querySelector('img, svg')) {
          child.classList.add('zs-theme-hidden-wordmark');
        }
      });
    });
  }

  function applyThemeSettings() {
    applyLogo();
    hideWordmarkText();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyThemeSettings, { once: true });
  } else {
    applyThemeSettings();
  }

  new MutationObserver(applyThemeSettings).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
