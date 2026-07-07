# frozen_string_literal: true

Deface::Override.new(
  virtual_path: 'layouts/base',
  name: 'foreman_zs_theme_stylesheet',
  insert_after: 'erb[loud]:contains("stylesheet_link_tag \'application\'")',
  text: <<~'ERB'
    <% zs_theme_favicon_url = Setting[:zs_theme_favicon_url].presence %>
    <% zs_theme_favicon_type = zs_theme_favicon_url.present? ? ForemanZsTheme::UploadedAsset.mime_for('favicon') : '' %>
    <% zs_theme_logo_url = Setting[:zs_theme_header_logo_url].presence || '/assets/foreman_zs_theme/redhat-satellite-logo.svg' %>
    <% zs_theme_logo_css_url = zs_theme_logo_url.to_s.gsub('\\', '\\\\').gsub('"', '\"').gsub("\n", '').gsub("\r", '').gsub('<', '\3c ').gsub('>', '\3e ') %>
    <% zs_theme_login_info_text = Setting[:zs_theme_login_info_text].to_s %>
    <% zs_theme_site_font_size = ForemanZsTheme::FontSize.normalize(Setting[:zs_theme_site_font_size], ForemanZsTheme::FontSize::DEFAULT_SITE) %>
    <% zs_theme_sidebar_font_size = ForemanZsTheme::FontSize.normalize(Setting[:zs_theme_sidebar_font_size], ForemanZsTheme::FontSize::DEFAULT_SIDEBAR) %>
    <% if zs_theme_favicon_url.present? %>
      <link rel="icon" href="<%= zs_theme_favicon_url %>" data-zs-theme-favicon="true"<%= zs_theme_favicon_type.present? ? " type=\"#{zs_theme_favicon_type}\"".html_safe : '' %>>
      <link rel="shortcut icon" href="<%= zs_theme_favicon_url %>" data-zs-theme-favicon="true"<%= zs_theme_favicon_type.present? ? " type=\"#{zs_theme_favicon_type}\"".html_safe : '' %>>
    <% end %>
    <link rel="preload" as="image" href="<%= zs_theme_logo_url %>">
    <style id="zs-theme-logo-prepaint">
      html.zs-theme-logo-prepaint img[src*="header_logo"],
      html.zs-theme-logo-prepaint img[src*="login_logo"],
      html.zs-theme-logo-prepaint img[alt*="Foreman"],
      html.zs-theme-logo-prepaint img[alt*="foreman"] {
        content: url("<%= zs_theme_logo_css_url.html_safe %>");
        height: 64px !important;
        object-fit: contain !important;
        background: transparent !important;
        border-radius: 0 !important;
        box-sizing: content-box !important;
        padding: 0 !important;
      }
    </style>
    <script>
      (function () {
        var mode = 'dark';

        try {
          if (window.localStorage.getItem('zsForemanTheme.colorMode') === 'light') mode = 'light';
        } catch (error) {
          mode = 'dark';
        }

        document.documentElement.classList.toggle('zs-theme-light-mode', mode === 'light');
        document.documentElement.classList.toggle('zs-theme-dark-mode', mode !== 'light');
        document.documentElement.classList.toggle('pf-v5-theme-dark', mode !== 'light');
        document.documentElement.classList.toggle('pf-v6-theme-dark', mode !== 'light');
        document.documentElement.classList.toggle('pf-v5-theme-light', mode === 'light');
        document.documentElement.classList.toggle('pf-v6-theme-light', mode === 'light');
        document.documentElement.setAttribute('data-zs-theme-mode', mode);
      })();
    </script>
    <link rel="stylesheet" href="/assets/foreman_zs_theme/theme.css?v=<%= ForemanZsTheme::VERSION %>">
    <script>
      (function () {
        var logoUrl = <%= zs_theme_logo_url.to_json.html_safe %>;
        if (!logoUrl) return;

        document.documentElement.classList.add('zs-theme-logo-prepaint');

        function eachMatch(root, selector, callback) {
          if (!root || !root.querySelectorAll) return;

          if (root.matches && root.matches(selector)) callback(root);
          root.querySelectorAll(selector).forEach(callback);
        }

        function applyImageLogo(root) {
          eachMatch(root, 'img[src*="header_logo"], img[src*="login_logo"], img[alt*="Foreman"], img[alt*="foreman"]', function (img) {
            if (img.getAttribute('src') !== logoUrl) img.setAttribute('src', logoUrl);
            img.classList.add('zs-theme-logo');
          });
        }

        function applyLoginProps(root) {
          eachMatch(root, 'foreman-react-component[name="LoginPage"][data-props]', function (node) {
            var props;

            try {
              props = JSON.parse(node.getAttribute('data-props') || '{}');
            } catch (error) {
              return;
            }

            if (props.logoSrc === logoUrl) return;
            props.logoSrc = logoUrl;
            node.setAttribute('data-props', JSON.stringify(props));
          });
        }

        function applyLogoPrepaint(root) {
          applyLoginProps(root);
          applyImageLogo(root);
        }

        applyLogoPrepaint(document);

        if (window.MutationObserver) {
          new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              mutation.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;
                applyLogoPrepaint(node);
              });
            });
          }).observe(document.documentElement, { childList: true, subtree: true });
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function () {
            applyLogoPrepaint(document);
          }, { once: true });
        }
      })();

      window.ZsForemanTheme = {
        logoUrl: <%= zs_theme_logo_url.to_json.html_safe %>,
        hideForemanHeaderText: <%= Setting[:zs_theme_hide_foreman_header_text] ? 'true' : 'false' %>,
        faviconUrl: <%= zs_theme_favicon_url.to_json.html_safe %>,
        faviconType: <%= zs_theme_favicon_type.to_json.html_safe %>,
        loginInfoText: <%= zs_theme_login_info_text.to_json.html_safe %>,
        siteFontSize: <%= zs_theme_site_font_size.to_json.html_safe %>,
        sidebarFontSize: <%= zs_theme_sidebar_font_size.to_json.html_safe %>
      };
    </script>
    <script src="/assets/foreman_zs_theme/theme.js?v=<%= ForemanZsTheme::VERSION %>"></script>
  ERB
)
