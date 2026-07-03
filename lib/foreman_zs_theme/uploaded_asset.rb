# frozen_string_literal: true

require 'fileutils'
require 'marcel'
require 'pathname'
require 'securerandom'

module ForemanZsTheme
  class UploadedAsset
    class Error < StandardError; end

    DEFAULT_LOGO_URL = '/assets/foreman_zs_theme/redhat-satellite-logo.svg'
    DEFAULT_FAVICON_URL = ''
    MAX_UPLOAD_BYTES = 2 * 1024 * 1024
    ROOT = Pathname.new(ENV.fetch('FOREMAN_ZS_THEME_UPLOAD_DIR', '/var/lib/foreman/foreman_zs_theme/uploads')).freeze

    MIME_EXTENSIONS = {
      'image/png' => 'png',
      'image/jpeg' => 'jpg',
      'image/gif' => 'gif',
      'image/webp' => 'webp',
      'image/x-icon' => 'ico',
      'image/vnd.microsoft.icon' => 'ico'
    }.freeze

    SETTING_NAMES = {
      'logo' => 'zs_theme_header_logo_url',
      'favicon' => 'zs_theme_favicon_url'
    }.freeze

    class << self
      def normalize_kind(kind)
        normalized = kind.to_s
        return normalized if SETTING_NAMES.key?(normalized)

        raise Error, N_('Unknown ZS theme asset type.')
      end

      def setting_name(kind)
        SETTING_NAMES.fetch(normalize_kind(kind))
      end

      def default_url(kind)
        normalize_kind(kind) == 'logo' ? DEFAULT_LOGO_URL : DEFAULT_FAVICON_URL
      end

      def public_url(kind)
        "/foreman_zs_theme/assets/#{normalize_kind(kind)}?v=#{version_token(kind)}"
      end

      def uploaded?(kind)
        path_for(kind).present?
      end

      def path_for(kind)
        pattern = ROOT.join("#{normalize_kind(kind)}.*").to_s
        Dir[pattern].select { |path| MIME_EXTENSIONS.value?(File.extname(path).delete_prefix('.')) }.sort.first
      end

      def mime_for_path(path)
        extension = File.extname(path.to_s).delete_prefix('.')
        MIME_EXTENSIONS.key(extension) || 'application/octet-stream'
      end

      def mime_for(kind)
        path = path_for(kind)
        path.present? ? mime_for_path(path) : ''
      end

      def store!(kind, upload)
        kind = normalize_kind(kind)
        raise Error, N_('Choose an image file to upload.') if upload.blank?
        raise Error, N_('Image file is too large. Use a file smaller than 2 MB.') if upload.size.to_i > MAX_UPLOAD_BYTES

        mime = detect_mime(upload)
        extension = MIME_EXTENSIONS[mime]
        raise Error, N_('Unsupported image type. Use PNG, JPEG, GIF, WebP, or ICO.') if extension.blank?

        ROOT.mkpath
        remove!(kind)

        path = ROOT.join("#{kind}.#{extension}")
        tmp_path = ROOT.join(".#{kind}-#{SecureRandom.hex(8)}.#{extension}")

        upload.tempfile.rewind
        File.open(tmp_path, File::WRONLY | File::CREAT | File::EXCL, 0o640) do |file|
          IO.copy_stream(upload.tempfile, file)
        end
        FileUtils.mv(tmp_path, path)
        File.chmod(0o640, path)
        path
      ensure
        FileUtils.rm_f(tmp_path) if tmp_path
      end

      def remove!(kind)
        pattern = ROOT.join("#{normalize_kind(kind)}.*").to_s
        Dir[pattern].each { |path| FileUtils.rm_f(path) }
      end

      private

      def detect_mime(upload)
        upload.tempfile.rewind
        Marcel::MimeType.for(
          upload.tempfile,
          name: upload.original_filename,
          declared_type: upload.content_type
        )
      ensure
        upload.tempfile.rewind
      end

      def version_token(kind)
        path = path_for(kind)
        path.present? ? File.mtime(path).to_i : Time.now.to_i
      end
    end
  end
end
