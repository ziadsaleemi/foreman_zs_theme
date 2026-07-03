# Foreman ZS Theme

`foreman_zs_theme` is a small Foreman Rails-engine plugin that applies the
ZS AWX-inspired dark theme and Red Hat Satellite branding.

The plugin deliberately avoids editing Foreman package-managed views. It adds
body theme classes through a helper extension and injects one public stylesheet
with Deface.

## Install/Upgrade

Build the gem:

```bash
gem build foreman_zs_theme.gemspec
```

Build the RPM:

```bash
packaging/build-rpm.sh
```

Install or upgrade the RPM on the Foreman host:

```bash
dnf install -y pkg/rpmbuild/RPMS/noarch/rubygem-foreman_zs_theme-0.1.42-1.el9.noarch.rpm
```
