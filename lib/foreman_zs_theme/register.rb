# frozen_string_literal: true

require 'foreman_zs_theme/version'
require 'foreman_zs_theme/font_size'

Foreman::Plugin.register :foreman_zs_theme do
  requires_foreman '>= 3.19.0'
  name 'ZS Foreman Theme'
  author 'ZS Operations'
  description 'AWX-inspired dark theme and Red Hat Satellite branding for Foreman.'
  version ForemanZsTheme::VERSION

  automatic_assets false

  settings do
    category(:dark_theme, N_('Dark Theme')) do
      setting(:zs_theme_header_logo_url,
        type: :string,
        default: '/assets/foreman_zs_theme/redhat-satellite-logo.svg',
        description: N_('Header and login logo URL used by the ZS theme. This can be set by uploading a logo from the Dark Theme settings tab.'),
        full_name: N_('ZS theme header logo URL'))

      setting(:zs_theme_favicon_url,
        type: :string,
        default: ForemanZsTheme::UploadedAsset.default_url('favicon'),
        description: N_('Optional favicon URL used by the ZS theme. This can be set by uploading an icon from the Dark Theme settings tab.'),
        full_name: N_('ZS theme favicon URL'))

      setting(:zs_theme_hide_foreman_header_text,
        type: :boolean,
        default: true,
        description: N_('Hide the FOREMAN wordmark text in the header while keeping the configured logo visible.'),
        full_name: N_('Hide FOREMAN header text'))

      setting(:zs_theme_login_info_text,
        type: :string,
        default: '',
        description: N_('Optional plain text shown under the logo on the login page.'),
        full_name: N_('ZS theme login page info'))

      setting(:zs_theme_site_font_size,
        type: :integer,
        default: ForemanZsTheme::FontSize::DEFAULT_SITE,
        description: N_('Base ZS theme font size in pixels for Foreman page content and controls.'),
        full_name: N_('ZS theme site font size'))

      setting(:zs_theme_sidebar_font_size,
        type: :integer,
        default: ForemanZsTheme::FontSize::DEFAULT_SIDEBAR,
        description: N_('ZS theme sidebar menu font size in pixels. Sidebar description text is derived from this value.'),
        full_name: N_('ZS theme sidebar font size'))
    end
  end

  edit_settings_permission = Foreman::AccessControl.permission(:edit_settings)
  if edit_settings_permission
    %w[
      foreman_zs_theme/settings/redirect_to_settings_page
      foreman_zs_theme/settings/upload
      foreman_zs_theme/settings/reset
      foreman_zs_theme/settings/update_login_info
      foreman_zs_theme/settings/reset_login_info
      foreman_zs_theme/settings/update_font_sizes
      foreman_zs_theme/settings/reset_font_sizes
    ].each do |action|
      edit_settings_permission.actions << action unless edit_settings_permission.actions.include?(action)
    end
  end
end
