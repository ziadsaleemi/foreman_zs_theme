# frozen_string_literal: true

module ForemanZsTheme
  class SettingsController < ::ApplicationController
    MAX_LOGIN_INFO_LENGTH = 1000

    before_action :require_edit_settings

    def upload
      UploadedAsset.store!(asset_kind, params[:file])
      update_setting(UploadedAsset.setting_name(asset_kind), UploadedAsset.public_url(asset_kind))
      success(_('%s uploaded.') % asset_label)
      redirect_to_settings
    rescue UploadedAsset::Error => e
      error(_(e.message))
      redirect_to_settings
    end

    def reset
      UploadedAsset.remove!(asset_kind)
      update_setting(UploadedAsset.setting_name(asset_kind), UploadedAsset.default_url(asset_kind))
      success(_('%s reset to default.') % asset_label)
      redirect_to_settings
    rescue UploadedAsset::Error => e
      error(_(e.message))
      redirect_to_settings
    end

    def update_login_info
      login_info = normalized_login_info
      update_setting('zs_theme_login_info_text', login_info)
      success(_('Login page info updated.'))
      redirect_to_settings
    rescue UploadedAsset::Error => e
      error(_(e.message))
      redirect_to_settings
    end

    def reset_login_info
      update_setting('zs_theme_login_info_text', '')
      success(_('Login page info cleared.'))
      redirect_to_settings
    end

    def redirect_to_settings_page
      redirect_to_settings
    end

    private

    def asset_kind
      @asset_kind ||= UploadedAsset.normalize_kind(params[:kind])
    end

    def asset_label
      asset_kind == 'logo' ? _('Header logo') : _('Favicon')
    end

    def normalized_login_info
      value = params[:zs_theme_login_info_text].to_s.gsub(/\r\n?/, "\n").strip
      if value.length > MAX_LOGIN_INFO_LENGTH
        raise UploadedAsset::Error, N_('Login page info is too long. Use 1000 characters or fewer.')
      end

      value
    end

    def update_setting(name, value)
      setting = Foreman.settings.set_user_value(name, value)
      setting.save!
    end

    def redirect_to_settings
      redirect_to main_app.settings_path
    end

    def require_edit_settings
      return true if User.current&.can?(:edit_settings)

      deny_access
      false
    end

    def controller_permission
      'settings'
    end

    def action_permission
      'edit'
    end
  end
end
