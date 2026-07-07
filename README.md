# Foreman ZS Theme

`foreman_zs_theme` is a small Foreman Rails-engine plugin that applies the
ZS AWX-inspired dark theme and Red Hat Satellite branding.

The plugin deliberately avoids editing Foreman package-managed views. It adds
body theme classes through a helper extension and injects one public stylesheet
with Deface.

## Theme Source

The shipped `/assets/foreman_zs_theme/theme.css` file is generated from:

- `app/assets/stylesheets/foreman_zs_theme/theme.scss`
- `app/assets/stylesheets/foreman_zs_theme/theme/*.css`

Use the split files under `app/assets/stylesheets/foreman_zs_theme/theme/`
for shared AWX-style components such as buttons, forms, tables, toolbar
controls, and switches.

Regenerate the public CSS before building a gem directly:

```bash
scripts/build-theme-css
```

`packaging/build-rpm.sh` runs this automatically.

## Install/Upgrade

Build the gem:

```bash
scripts/build-theme-css
gem build foreman_zs_theme.gemspec
```

Build the RPM:

```bash
packaging/build-rpm.sh
```

Install or upgrade the RPM on the Foreman host:

```bash
dnf install -y pkg/rpmbuild/RPMS/noarch/rubygem-foreman_zs_theme-0.1.139-1.el9.noarch.rpm
```

## Release

RPM releases are built by GitHub Actions when a version tag is pushed. The tag
must match `ForemanZsTheme::VERSION` in `lib/foreman_zs_theme/version.rb`.

```bash
git tag -a v0.1.139 -m "foreman_zs_theme 0.1.139"
git push origin v0.1.139
```

The release workflow builds the EL9 RPM in a CentOS Stream 9 container, uploads
the RPM and SHA-256 checksum as workflow artifacts, and attaches both files to
the GitHub Release for the tag.
