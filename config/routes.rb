# frozen_string_literal: true

ForemanZsTheme::Engine.routes.draw do
  scope module: 'foreman_zs_theme' do
    get 'assets/:kind', to: 'assets#show', as: :theme_asset, constraints: { kind: /logo|favicon/ }

    scope :settings do
      get 'upload/:kind', to: 'settings#redirect_to_settings_page', constraints: { kind: /logo|favicon/ }
      post 'upload/:kind', to: 'settings#upload', as: :upload_theme_asset, constraints: { kind: /logo|favicon/ }
      get 'reset/:kind', to: 'settings#redirect_to_settings_page', constraints: { kind: /logo|favicon/ }
      delete 'reset/:kind', to: 'settings#reset', as: :reset_theme_asset, constraints: { kind: /logo|favicon/ }
      post 'login_info', to: 'settings#update_login_info', as: :update_login_info
      delete 'login_info', to: 'settings#reset_login_info', as: :reset_login_info
      post 'font_sizes', to: 'settings#update_font_sizes', as: :update_font_sizes
      delete 'font_sizes', to: 'settings#reset_font_sizes', as: :reset_font_sizes
    end
  end
end

Foreman::Application.routes.draw do
  mount ForemanZsTheme::Engine, at: '/foreman_zs_theme'
end
