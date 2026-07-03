(function () {
  'use strict';

  var config = window.ZsForemanTheme || {};
  var logoUrl = typeof config.logoUrl === 'string' ? config.logoUrl.trim() : '';
  var hideForemanText = config.hideForemanHeaderText === true;
  var sidebarStateKey = 'zsForemanTheme.sidebarState';
  var restoreSidebarTimer = null;
  var sidebarToggleInFlight = false;
  var sidebarSyncTimer = null;
  var lastRestoreUrl = null;
  var sidebarToggleSelector = [
    '.pf-v5-c-masthead__toggle button:not([disabled])',
    '.pf-v6-c-masthead__toggle button:not([disabled])',
    '.pf-v5-c-masthead__toggle .pf-v5-c-button:not([disabled])',
    '.pf-v6-c-masthead__toggle .pf-v6-c-button:not([disabled])',
    '.navbar-toggle:not([disabled])'
  ].join(', ');

  function bodyIsReady() {
    return !!document.body;
  }

  function applyLogo() {
    if (!bodyIsReady() || !logoUrl) return;

    document.body.classList.add('zs-custom-logo');
    document
      .querySelectorAll('img[src*="header_logo"], img[src*="login_logo"], img[alt*="Foreman"], img[alt*="foreman"]')
      .forEach(function (img) {
        img.src = logoUrl;
        img.classList.add('zs-theme-logo');
      });
  }

  function hideWordmarkText() {
    if (!bodyIsReady() || !hideForemanText) return;

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
    if (!bodyIsReady()) return;

    applyLogo();
    hideWordmarkText();
    scheduleSidebarSync();
    restoreSidebarState();
  }

  function findSidebar() {
    return document.querySelector(
      '.pf-v5-c-page__sidebar, .pf-v6-c-page__sidebar, #vertical-nav, .sidebar-pf, nav[aria-label="Global"]'
    );
  }

  function findSidebarToggle() {
    return document.querySelector(sidebarToggleSelector);
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
    if (!bodyIsReady()) return false;
    if (!sidebar) return false;

    if (
      sidebar.classList.contains('pf-m-collapsed') ||
      sidebar.getAttribute('aria-hidden') === 'true'
    ) {
      return true;
    }

    var sidebarWidth = sidebar.getBoundingClientRect().width;

    if (sidebarWidth <= 2) return true;

    if (
      sidebar.classList.contains('pf-m-expanded') ||
      sidebar.getAttribute('aria-hidden') === 'false'
    ) {
      return false;
    }

    if (sidebarWidth > 40) return false;

    if (
      document.body.classList.contains('collapsed-nav') ||
      document.body.classList.contains('zs-sidebar-collapsed') ||
      document.body.classList.contains('pf-m-collapsed')
    ) {
      return true;
    }

    if (
      document.body.classList.contains('zs-sidebar-expanded') ||
      document.body.classList.contains('pf-m-expanded')
    ) {
      return false;
    }

    // Legacy PatternFly navigation exposes collapse through body state.
    return (
      sidebar.matches('#vertical-nav, .sidebar-pf, .nav-pf-vertical, .nav-pf-vertical-alt') &&
      document.body.classList.contains('collapsed-nav')
    );
  }

  function syncSidebarBodyClass() {
    if (!bodyIsReady()) return null;

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

  function applySidebarStateFallback(state) {
    if (!bodyIsReady()) return;

    var sidebar = findSidebar();
    var collapsed = state === 'collapsed';

    document.body.classList.toggle('collapsed-nav', collapsed);
    document.body.classList.remove(collapsed ? 'pf-m-expanded' : 'pf-m-collapsed');
    document.body.classList.toggle('zs-sidebar-collapsed', collapsed);
    document.body.classList.toggle('zs-sidebar-expanded', !collapsed);

    if (sidebar) {
      sidebar.classList.toggle('pf-m-collapsed', collapsed);
      sidebar.classList.toggle('pf-m-expanded', !collapsed);
      sidebar.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
    }

    saveSidebarState(state);
  }

  function finishSidebarToggle(targetState) {
    var collapsed = syncSidebarBodyClass();
    var expectedCollapsed = targetState === 'collapsed';

    if (collapsed === null) return;

    if (collapsed !== expectedCollapsed) {
      applySidebarStateFallback(targetState);
      return;
    }

    saveSidebarState(targetState);
  }

  function forceSidebarStateIfNeeded(targetState) {
    var collapsed = syncSidebarBodyClass();
    var expectedCollapsed = targetState === 'collapsed';

    if (collapsed === null) return;
    if (collapsed !== expectedCollapsed) {
      applySidebarStateFallback(targetState);
    }
  }

  function scheduleSidebarSync(delay) {
    window.clearTimeout(sidebarSyncTimer);
    sidebarSyncTimer = window.setTimeout(function () {
      syncSidebarBodyClass();
    }, delay || 0);
  }

  function restoreSidebarState() {
    if (sidebarToggleInFlight) return;

    var savedState = getSavedSidebarState();
    if (savedState !== 'collapsed') return;

    var currentUrl = window.location.href;
    if (lastRestoreUrl === currentUrl) return;
    lastRestoreUrl = currentUrl;

    window.clearTimeout(restoreSidebarTimer);
    restoreSidebarTimer = window.setTimeout(function () {
      var sidebar = findSidebar();

      if (!sidebar) {
        lastRestoreUrl = null;
        return;
      }

      if (sidebarIsCollapsed(sidebar)) {
        syncSidebarBodyClass();
        return;
      }

      var toggle = findSidebarToggle();

      if (toggle) {
        sidebarToggleInFlight = true;
        toggle.click();
        [50, 250, 650, 1000].forEach(function (delay) {
          window.setTimeout(function () {
            if (delay === 1000) {
              finishSidebarToggle('collapsed');
              sidebarToggleInFlight = false;
              return;
            }

            syncSidebarBodyClass();
          }, delay);
        });
      } else {
        applySidebarStateFallback('collapsed');
      }
    }, 0);
  }

  function bindSidebarStateSync() {
    document.addEventListener(
      'click',
      function (event) {
        if (!event.target || !event.target.closest) return;

        var toggle = event.target.closest(sidebarToggleSelector);

        if (!toggle) return;

        var sidebar = findSidebar();
        var targetState = sidebarIsCollapsed(sidebar) ? 'expanded' : 'collapsed';

        sidebarToggleInFlight = true;
        [0, 50, 250, 450, 1000].forEach(function (delay) {
          window.setTimeout(function () {
            if (delay === 450) {
              forceSidebarStateIfNeeded(targetState);
              return;
            }

            if (delay < 1000) {
              syncSidebarBodyClass();
              return;
            }

            finishSidebarToggle(targetState);
            sidebarToggleInFlight = false;
          }, delay);
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
