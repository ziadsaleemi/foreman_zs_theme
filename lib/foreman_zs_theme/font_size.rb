# frozen_string_literal: true

module ForemanZsTheme
  module FontSize
    DEFAULT_SITE = 14
    DEFAULT_SIDEBAR = 14
    MIN = 11
    MAX = 20

    module_function

    def normalize(value, default)
      raw_value = value.nil? || value.to_s.strip.empty? ? default : value
      size = Integer(raw_value, exception: false)
      return default unless size

      [[size, MIN].max, MAX].min
    end
  end
end
