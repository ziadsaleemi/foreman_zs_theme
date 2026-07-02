# frozen_string_literal: true

require 'foreman_zs_theme/version'

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
        description: N_('Header and login logo URL used by the ZS theme. Use an absolute URL or a Foreman asset path.'),
        full_name: N_('ZS theme header logo URL'))

      setting(:zs_theme_hide_foreman_header_text,
        type: :boolean,
        default: true,
        description: N_('Hide the FOREMAN wordmark text in the header while keeping the configured logo visible.'),
        full_name: N_('Hide FOREMAN header text'))
    end
  end
end
