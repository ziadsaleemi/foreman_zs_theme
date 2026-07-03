# frozen_string_literal: true

ForemanZsTheme::Engine.routes.draw do
  scope module: 'foreman_zs_theme' do
    get 'assets/:kind', to: 'assets#show', as: :theme_asset, constraints: { kind: /logo|favicon/ }

    scope :settings do
      post 'upload/:kind', to: 'settings#upload', as: :upload_theme_asset, constraints: { kind: /logo|favicon/ }
      delete 'reset/:kind', to: 'settings#reset', as: :reset_theme_asset, constraints: { kind: /logo|favicon/ }
    end
  end
end

Foreman::Application.routes.draw do
  mount ForemanZsTheme::Engine, at: '/foreman_zs_theme'
end
