# frozen_string_literal: true

module ForemanZsTheme
  class AssetsController < ::ActionController::Base
    def show
      path = UploadedAsset.path_for(params[:kind])
      return head :not_found if path.blank? || !File.file?(path)

      response.headers['Cache-Control'] = 'public, max-age=300'
      send_file path,
        disposition: 'inline',
        filename: File.basename(path),
        type: UploadedAsset.mime_for_path(path)
    rescue UploadedAsset::Error
      head :not_found
    end
  end
end
