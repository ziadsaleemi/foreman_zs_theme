(function () {
  'use strict';

  var config = window.ZsForemanTheme || {};
  var logoUrl = typeof config.logoUrl === 'string' ? config.logoUrl.trim() : '';
  var faviconUrl = typeof config.faviconUrl === 'string' ? config.faviconUrl.trim() : '';
  var faviconType = typeof config.faviconType === 'string' ? config.faviconType.trim() : '';
  var loginInfoText = typeof config.loginInfoText === 'string' ? config.loginInfoText.trim() : '';
  var hideForemanText = config.hideForemanHeaderText === true;
  var sidebarStateKey = 'zsForemanTheme.sidebarState';
  var restoreSidebarTimer = null;
  var sidebarToggleInFlight = false;
  var sidebarSyncTimer = null;
  var lastRestoreUrl = null;
  var sidebarDescriptionByLabel = {
    Monitor: 'Status, facts, jobs, reports',
    Reports: 'Reports and templates',
    'Foreman Tasks': 'Tasks and recurring work',
    Content: 'Subscriptions and repositories',
    Lifecycle: 'Environments and content views',
    'Content Types': 'Packages, errata, collections',
    Hosts: 'Inventory and provisioning',
    'Provisioning Setup': 'OS, media, and provisioning',
    Templates: 'Provisioning, jobs, and partitions',
    Configure: 'Host groups and parameters',
    Ansible: 'Roles and variables',
    Infrastructure: 'Proxies, compute, networks',
    'ZS Theme': 'Branding and theme assets',
    Organizations: 'Business units and resources',
    Locations: 'Sites and scoped resources',
    Administer: 'Users, settings, and access'
  };
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

  function isLoginPage() {
    return !!document.querySelector(
      'foreman-react-component[name="LoginPage"], .login-pf-page, .login-page, .login-pf, form[action*="/users/login"]'
    );
  }

  function findLoginLogo() {
    var logos = Array.prototype.slice.call(
      document.querySelectorAll('img.zs-theme-logo, img[src*="login_logo"], img[alt*="Foreman"], img[alt*="foreman"]')
    );

    return logos.find(function (img) {
      return !img.closest('.navbar, .navbar-pf, .pf-v5-c-masthead, .pf-v6-c-masthead, #vertical-nav');
    });
  }

  function applyLoginInfo() {
    if (!bodyIsReady() || !isLoginPage()) return;

    document.body.classList.toggle('zs-theme-has-login-info', !!loginInfoText);

    var existing = document.querySelector('.zs-theme-login-info');
    if (!loginInfoText) {
      if (existing) existing.parentNode.removeChild(existing);
      return;
    }

    var logo = findLoginLogo();
    if (!logo) return;

    if (!existing) {
      existing = document.createElement('div');
      existing.className = 'zs-theme-login-info';
      logo.insertAdjacentElement('afterend', existing);
    }

    if (existing.previousElementSibling !== logo) {
      logo.insertAdjacentElement('afterend', existing);
    }

    if (existing.textContent !== loginInfoText) {
      existing.textContent = loginInfoText;
    }
  }

  function resolvedAssetUrl(url) {
    try {
      return new URL(url, window.location.href).href;
    } catch (error) {
      return url;
    }
  }

  function faviconTypeFromUrl(url) {
    var cleanUrl = url.split('?')[0].toLowerCase();

    if (cleanUrl.endsWith('.png')) return 'image/png';
    if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'image/jpeg';
    if (cleanUrl.endsWith('.gif')) return 'image/gif';
    if (cleanUrl.endsWith('.webp')) return 'image/webp';
    if (cleanUrl.endsWith('.ico')) return 'image/x-icon';

    return '';
  }

  function appendFaviconLink(rel, url, type) {
    var link = document.createElement('link');

    link.rel = rel;
    link.href = url;
    link.setAttribute('data-zs-theme-favicon', 'true');
    if (type) link.type = type;

    document.head.appendChild(link);
  }

  function managedFaviconMatches(link, rel, href, type) {
    if (link.getAttribute('data-zs-theme-favicon') !== 'true') return false;
    if (link.rel !== rel) return false;
    if (link.href !== href) return false;

    return !type || link.type === type;
  }

  function applyFavicon() {
    if (!faviconUrl || !document.head) return;

    var resolvedUrl = resolvedAssetUrl(faviconUrl);
    var type = faviconType || faviconTypeFromUrl(faviconUrl);
    var links = Array.prototype.slice.call(
      document.head.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
    );
    var expectedIcon = links.some(function (link) {
      return managedFaviconMatches(link, 'icon', resolvedUrl, type);
    });
    var expectedShortcut = links.some(function (link) {
      return managedFaviconMatches(link, 'shortcut icon', resolvedUrl, type);
    });
    var unmanagedLinks = links.some(function (link) {
      return link.getAttribute('data-zs-theme-favicon') !== 'true';
    });

    if (expectedIcon && expectedShortcut && !unmanagedLinks && links.length === 2) return;

    links.forEach(function (link) {
      link.parentNode.removeChild(link);
    });

    appendFaviconLink('icon', faviconUrl, type);
    appendFaviconLink('shortcut icon', faviconUrl, type);
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

    applyFavicon();
    applyLogo();
    applyLoginInfo();
    hideWordmarkText();
    markTopbarPresence();
    markCancelActions();
    applySidebarDescriptions();
    scheduleSidebarSync();
    restoreSidebarState();
  }

  function markTopbarPresence() {
    if (!bodyIsReady()) return;

    var hasTopbar = !!document.querySelector(
      '.pf-v5-c-page__header, .pf-v6-c-page__header, .pf-v5-c-masthead, .pf-v6-c-masthead, .navbar-pf, .navbar-pf-vertical, .navbar'
    );

    document.body.classList.toggle('zs-theme-has-topbar', hasTopbar);
  }

  function buttonText(button) {
    return (button.value || button.textContent || button.getAttribute('aria-label') || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function markCancelActions() {
    if (!bodyIsReady()) return;

    var selector = [
      'form .form-actions a',
      'form .form-actions button',
      'form .form-actions input[type="button"]',
      'form .form-actions input[type="reset"]',
      '.pf-v5-c-form a',
      '.pf-v5-c-form button',
      '.pf-v5-c-form input[type="button"]',
      '.pf-v5-c-form input[type="reset"]',
      '.pf-v6-c-form a',
      '.pf-v6-c-form button',
      '.pf-v6-c-form input[type="button"]',
      '.pf-v6-c-form input[type="reset"]',
      '.modal-footer a',
      '.modal-footer button',
      '.modal-footer input[type="button"]',
      '.modal-footer input[type="reset"]'
    ].join(', ');

    document.querySelectorAll(selector).forEach(function (button) {
      if (buttonText(button).toLowerCase() === 'cancel') {
        button.classList.add('zs-theme-cancel-action');
      }
    });
  }

  function compactText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function directNavLabel(link) {
    var clone = link.cloneNode(true);

    clone.querySelectorAll('.pf-v5-c-nav__toggle, .pf-v6-c-nav__toggle, .zs-theme-nav-description').forEach(function (node) {
      node.parentNode.removeChild(node);
    });

    return compactText(clone.textContent);
  }

  function findNavTextContainer(link) {
    var linkText = link.querySelector(':scope > .pf-v5-c-nav__link-text, :scope > .pf-v6-c-nav__link-text');
    if (linkText) return linkText;

    var wrapper = link.querySelector(':scope > .zs-theme-nav-label-wrap');
    if (wrapper) return wrapper;

    var toggle = link.querySelector(':scope > .pf-v5-c-nav__toggle, :scope > .pf-v6-c-nav__toggle');
    wrapper = document.createElement('span');
    wrapper.className = 'zs-theme-nav-label-wrap';

    while (link.firstChild && link.firstChild !== toggle) {
      wrapper.appendChild(link.firstChild);
    }

    link.insertBefore(wrapper, toggle || link.firstChild);
    return wrapper;
  }

  function clearNavDescription(link) {
    link.classList.remove('zs-theme-nav-annotated');
    var description = link.querySelector(':scope .zs-theme-nav-description');
    if (description) description.parentNode.removeChild(description);
  }

  function applySidebarDescriptions() {
    if (!bodyIsReady()) return;

    var sidebar = findSidebar();
    if (!sidebar) return;

    var selector = [
      '.pf-v5-c-nav__item.pf-m-expandable > .pf-v5-c-nav__link',
      '.pf-v6-c-nav__item.pf-m-expandable > .pf-v6-c-nav__link'
    ].join(', ');

    sidebar.querySelectorAll(selector).forEach(function (link) {
      var label = directNavLabel(link);
      var descriptionText = sidebarDescriptionByLabel[label];

      if (!descriptionText) {
        clearNavDescription(link);
        return;
      }

      var container = findNavTextContainer(link);
      var description = container.querySelector(':scope > .zs-theme-nav-description');

      link.classList.add('zs-theme-nav-annotated');

      if (!description) {
        description = document.createElement('span');
        description.className = 'zs-theme-nav-description';
        container.appendChild(description);
      }

      if (description.textContent !== descriptionText) {
        description.textContent = descriptionText;
      }
    });
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
      sidebar.getAttribute('aria-hidden') === 'true' ||
      document.body.classList.contains('collapsed-nav') ||
      document.body.classList.contains('zs-sidebar-collapsed') ||
      document.body.classList.contains('pf-m-collapsed')
    ) {
      return true;
    }

    if (
      sidebar.classList.contains('pf-m-expanded') ||
      sidebar.getAttribute('aria-hidden') === 'false' ||
      document.body.classList.contains('zs-sidebar-expanded') ||
      document.body.classList.contains('pf-m-expanded')
    ) {
      return false;
    }

    var sidebarWidth = sidebar.getBoundingClientRect().width;

    if (sidebarWidth <= 2) return true;
    if (sidebarWidth > 40) return false;

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

      applySidebarStateFallback('collapsed');
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
        [0, 150, 450, 900].forEach(function (delay) {
          window.setTimeout(function () {
            if (delay < 900) {
              applySidebarStateFallback(targetState);
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
