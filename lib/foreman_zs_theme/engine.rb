# frozen_string_literal: true

require 'deface'

module ForemanZsTheme
  class Engine < ::Rails::Engine
    engine_name 'foreman_zs_theme'

    initializer 'foreman_zs_theme.register_plugin', before: :finisher_hook do |app|
      app.reloader.to_prepare do
        require 'foreman_zs_theme/register'
      end
    end

    config.to_prepare do
      LayoutHelper.prepend ForemanZsTheme::LayoutHelperExtensions
    rescue StandardError => e
      Rails.logger.warn "Foreman ZS Theme: skipping layout helper hook (#{e})"
    end
  end

  module LayoutHelperExtensions
    def body_css_classes
      "#{super} pf-theme-dark pf-t-dark pf-v5-theme-dark pf-v6-theme-dark zs-dark-theme"
    end
  end
end
