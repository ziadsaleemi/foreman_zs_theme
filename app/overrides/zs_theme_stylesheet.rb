# frozen_string_literal: true

Deface::Override.new(
  virtual_path: 'layouts/base',
  name: 'foreman_zs_theme_stylesheet',
  insert_after: 'erb[loud]:contains("stylesheet_link_tag \'application\'")',
  text: <<~'ERB'
    <link rel="stylesheet" href="/assets/foreman_zs_theme/theme.css?v=0.1.61">
    <script>
      window.ZsForemanTheme = {
        logoUrl: <%= (Setting[:zs_theme_header_logo_url].presence || '/assets/foreman_zs_theme/redhat-satellite-logo.svg').to_json.html_safe %>,
        hideForemanHeaderText: <%= Setting[:zs_theme_hide_foreman_header_text] ? 'true' : 'false' %>
      };
    </script>
    <script src="/assets/foreman_zs_theme/theme.js?v=0.1.61"></script>
  ERB
)
