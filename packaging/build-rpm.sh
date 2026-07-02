#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(ruby -I"$ROOT/lib" -rforeman_zs_theme/version -e 'print ForemanZsTheme::VERSION')"
RPMTOP="${RPMTOP:-$ROOT/pkg/rpmbuild}"

rm -rf "$ROOT/pkg" "$RPMTOP"
mkdir -p "$RPMTOP"/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

cd "$ROOT"
gem build foreman_zs_theme.gemspec
cp "foreman_zs_theme-${VERSION}.gem" "$RPMTOP/SOURCES/"
cp packaging/rubygem-foreman_zs_theme.spec "$RPMTOP/SPECS/"

rpmbuild --define "_topdir $RPMTOP" -bb "$RPMTOP/SPECS/rubygem-foreman_zs_theme.spec"
