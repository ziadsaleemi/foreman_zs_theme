(function () {
  'use strict';

  var config = window.ZsForemanTheme || {};
  var logoUrl = typeof config.logoUrl === 'string' ? config.logoUrl.trim() : '';
  var hideForemanText = config.hideForemanHeaderText === true;
  var sidebarStateKey = 'zsForemanTheme.sidebarState';
  var restoreSidebarTimer = null;
  var sidebarToggleInFlight = false;
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
    restoreSidebarState();
  }

  function findSidebar() {
    return document.querySelector(
      '.pf-v5-c-page__sidebar, .pf-v6-c-page__sidebar, #vertical-nav, .sidebar-pf, nav[aria-label="Global"]'
    );
  }

  function findSidebarToggle() {
    return document.querySelector(
      '.pf-v5-c-masthead__toggle button, .pf-v6-c-masthead__toggle button, .navbar-toggle'
    );
  }

  function getSavedSidebarState() {
    try {
      return window.localStorage.getItem(sidebarStateKey);
    } catch (error) {
      return null;
    }
  }

  function saveSidebarState(state) {
    try {
      window.localStorage.setItem(sidebarStateKey, state);
    } catch (error) {
      // localStorage can be unavailable in hardened browser contexts.
    }
  }

  function sidebarIsCollapsed(sidebar) {
    if (!sidebar) return false;

    if (
      document.body.classList.contains('pf-m-collapsed') ||
      sidebar.classList.contains('pf-m-collapsed') ||
      sidebar.getAttribute('aria-hidden') === 'true'
    ) {
      return true;
    }

    if (
      document.body.classList.contains('pf-m-expanded') ||
      sidebar.classList.contains('pf-m-expanded') ||
      sidebar.getAttribute('aria-hidden') === 'false'
    ) {
      return false;
    }

    return (
      document.body.classList.contains('collapsed-nav') ||
      sidebar.getBoundingClientRect().width <= 2
    );
  }

  function syncSidebarBodyClass(persist) {
    var sidebar = findSidebar();

    if (!sidebar) return null;

    var collapsed = sidebarIsCollapsed(sidebar);

    document.body.classList.toggle('zs-sidebar-collapsed', collapsed);
    document.body.classList.toggle('zs-sidebar-expanded', !collapsed);

    if (collapsed) {
      document.body.classList.add('collapsed-nav');
    } else {
      document.body.classList.remove('collapsed-nav');
    }

    if (persist) {
      saveSidebarState(collapsed ? 'collapsed' : 'expanded');
    }

    return collapsed;
  }

  function persistCurrentSidebarState() {
    syncSidebarBodyClass(true);
  }

  function scheduleSidebarSync(persist) {
    window.clearTimeout(sidebarSyncTimer);
    sidebarSyncTimer = window.setTimeout(function () {
      syncSidebarBodyClass(persist);
    }, 0);
  }

  function restoreSidebarState() {
    if (sidebarToggleInFlight) return;

    var savedState = getSavedSidebarState();
    if (savedState === 'expanded') {
      syncSidebarBodyClass(false);
      return;
    }

    if (savedState !== 'collapsed') return;

    window.clearTimeout(restoreSidebarTimer);
    restoreSidebarTimer = window.setTimeout(function () {
      var sidebar = findSidebar();
      if (!sidebar) return;

      if (sidebarIsCollapsed(sidebar)) {
        syncSidebarBodyClass(false);
        return;
      }

      var toggle = findSidebarToggle();
      if (toggle) {
        sidebarToggleInFlight = true;
        toggle.click();
        window.setTimeout(function () {
          syncSidebarBodyClass(false);
          sidebarToggleInFlight = false;
        }, 250);
      } else {
        document.body.classList.add('collapsed-nav', 'zs-sidebar-collapsed');
        document.body.classList.remove('zs-sidebar-expanded');
        syncSidebarBodyClass(false);
      }
    }, 0);
  }

  function bindSidebarPersistence() {
    document.addEventListener(
      'click',
      function (event) {
        if (!event.target || !event.target.closest) return;

        var toggle = event.target.closest(
          '.pf-v5-c-masthead__toggle button, .pf-v6-c-masthead__toggle button, .navbar-toggle'
        );

        if (!toggle) return;

        sidebarToggleInFlight = true;
        window.setTimeout(function () {
          syncSidebarBodyClass(false);
        }, 50);
        window.setTimeout(function () {
          persistCurrentSidebarState();
          sidebarToggleInFlight = false;
        }, 250);
        window.setTimeout(function () {
          persistCurrentSidebarState();
        }, 650);
      },
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        bindSidebarPersistence();
        applyThemeSettings();
      },
      { once: true }
    );
  } else {
    bindSidebarPersistence();
    scheduleSidebarSync(false);
    applyThemeSettings();
  }

  new MutationObserver(applyThemeSettings).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
