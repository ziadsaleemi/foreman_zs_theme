(function () {
  'use strict';

  var config = window.ZsForemanTheme || {};
  var logoUrl = typeof config.logoUrl === 'string' ? config.logoUrl.trim() : '';
  var hideForemanText = config.hideForemanHeaderText === true;
  var sidebarSyncTimer = null;

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
    scheduleSidebarSync();
  }

  function findSidebar() {
    return document.querySelector(
      '.pf-v5-c-page__sidebar, .pf-v6-c-page__sidebar, #vertical-nav, .sidebar-pf, nav[aria-label="Global"]'
    );
  }

  function sidebarIsCollapsed(sidebar) {
    if (!sidebar) return false;

    if (
      sidebar.classList.contains('pf-m-expanded') ||
      sidebar.getAttribute('aria-hidden') === 'false' ||
      document.body.classList.contains('pf-m-expanded')
    ) {
      return false;
    }

    if (
      sidebar.classList.contains('pf-m-collapsed') ||
      sidebar.getAttribute('aria-hidden') === 'true' ||
      document.body.classList.contains('pf-m-collapsed')
    ) {
      return true;
    }

    if (sidebar.getBoundingClientRect().width <= 2) return true;

    // Legacy PatternFly navigation exposes collapse through body state.
    return (
      sidebar.matches('#vertical-nav, .sidebar-pf, .nav-pf-vertical, .nav-pf-vertical-alt') &&
      document.body.classList.contains('collapsed-nav')
    );
  }

  function syncSidebarBodyClass() {
    var sidebar = findSidebar();

    if (!sidebar) {
      document.body.classList.remove('zs-sidebar-collapsed', 'zs-sidebar-expanded');
      return null;
    }

    var collapsed = sidebarIsCollapsed(sidebar);

    document.body.classList.toggle('zs-sidebar-collapsed', collapsed);
    document.body.classList.toggle('zs-sidebar-expanded', !collapsed);

    return collapsed;
  }

  function scheduleSidebarSync(delay) {
    window.clearTimeout(sidebarSyncTimer);
    sidebarSyncTimer = window.setTimeout(function () {
      syncSidebarBodyClass();
    }, delay || 0);
  }

  function bindSidebarStateSync() {
    document.addEventListener(
      'click',
      function (event) {
        if (!event.target || !event.target.closest) return;

        var toggle = event.target.closest(
          '.pf-v5-c-masthead__toggle button, .pf-v6-c-masthead__toggle button, .navbar-toggle'
        );

        if (!toggle) return;

        [0, 50, 250, 650].forEach(function (delay) {
          window.setTimeout(syncSidebarBodyClass, delay);
        });
      },
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        bindSidebarStateSync();
        applyThemeSettings();
      },
      { once: true }
    );
  } else {
    bindSidebarStateSync();
    scheduleSidebarSync();
    applyThemeSettings();
  }

  new MutationObserver(applyThemeSettings).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
