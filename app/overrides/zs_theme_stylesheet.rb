# frozen_string_literal: true

Deface::Override.new(
  virtual_path: 'layouts/base',
  name: 'foreman_zs_theme_stylesheet',
  insert_after: 'erb[loud]:contains("stylesheet_link_tag \'application\'")',
  text: <<~'ERB'
    <% zs_theme_favicon_url = Setting[:zs_theme_favicon_url].presence %>
    <% zs_theme_favicon_type = zs_theme_favicon_url.present? ? ForemanZsTheme::UploadedAsset.mime_for('favicon') : '' %>
    <% zs_theme_login_info_text = Setting[:zs_theme_login_info_text].to_s %>
    <% zs_theme_site_font_size = ForemanZsTheme::FontSize.normalize(Setting[:zs_theme_site_font_size], ForemanZsTheme::FontSize::DEFAULT_SITE) %>
    <% zs_theme_sidebar_font_size = ForemanZsTheme::FontSize.normalize(Setting[:zs_theme_sidebar_font_size], ForemanZsTheme::FontSize::DEFAULT_SIDEBAR) %>
    <% if zs_theme_favicon_url.present? %>
      <link rel="icon" href="<%= zs_theme_favicon_url %>"<%= zs_theme_favicon_type.present? ? " type=\"#{zs_theme_favicon_type}\"".html_safe : '' %>>
      <link rel="shortcut icon" href="<%= zs_theme_favicon_url %>"<%= zs_theme_favicon_type.present? ? " type=\"#{zs_theme_favicon_type}\"".html_safe : '' %>>
    <% end %>
    <link rel="stylesheet" href="/assets/foreman_zs_theme/theme.css?v=0.1.116">
    <script>
      window.ZsForemanTheme = {
        logoUrl: <%= (Setting[:zs_theme_header_logo_url].presence || '/assets/foreman_zs_theme/redhat-satellite-logo.svg').to_json.html_safe %>,
        hideForemanHeaderText: <%= Setting[:zs_theme_hide_foreman_header_text] ? 'true' : 'false' %>,
        faviconUrl: <%= zs_theme_favicon_url.to_json.html_safe %>,
        faviconType: <%= zs_theme_favicon_type.to_json.html_safe %>,
        loginInfoText: <%= zs_theme_login_info_text.to_json.html_safe %>,
        siteFontSize: <%= zs_theme_site_font_size.to_json.html_safe %>,
        sidebarFontSize: <%= zs_theme_sidebar_font_size.to_json.html_safe %>
      };
    </script>
    <script src="/assets/foreman_zs_theme/theme.js?v=0.1.116"></script>
  ERB
)
