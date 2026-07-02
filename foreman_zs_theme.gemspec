# frozen_string_literal: true

require_relative 'lib/foreman_zs_theme/version'

Gem::Specification.new do |s|
  s.name = 'foreman_zs_theme'
  s.version = ForemanZsTheme::VERSION
  s.authors = ['ZS Operations']
  s.summary = 'ZS dark theme for Foreman'
  s.description = 'A small Foreman plugin that applies the ZS AWX-inspired dark theme and Red Hat Satellite branding.'
  s.license = 'GPL-3.0-or-later'
  s.files = Dir['app/**/*', 'lib/**/*', 'theme.css', 'theme.js', 'redhat-satellite-logo.svg', 'README.md']
  s.require_paths = ['lib']
  s.required_ruby_version = '>= 2.7'
end
