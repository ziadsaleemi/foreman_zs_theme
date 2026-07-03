%global gem_name foreman_zs_theme
%global gem_dir /usr/share/gems

Name: rubygem-%{gem_name}
Version: 0.1.112
Release: 1%{?dist}
Summary: ZS dark theme plugin for Foreman
License: GPL-3.0-or-later
URL: https://foreman.corp.zs.us/
Source0: %{gem_name}-%{version}.gem
BuildArch: noarch
Requires: foreman >= 3.19
Requires: rubygem-deface
Requires: rubygems
Requires(post): systemd
Requires(postun): systemd

%description
Foreman Rails-engine plugin that applies the ZS AWX-inspired dark theme and
Red Hat Satellite branding without editing Foreman package-managed files.

%prep

%build

%install
rm -rf %{buildroot}
mkdir -p %{buildroot}%{gem_dir}
gem install --local --install-dir %{buildroot}%{gem_dir} --force --ignore-dependencies --no-document %{SOURCE0}

mkdir -p %{buildroot}%{_datadir}/foreman/bundler.d
cat > %{buildroot}%{_datadir}/foreman/bundler.d/%{gem_name}.rb <<'EOF'
gem 'foreman_zs_theme'
EOF

mkdir -p %{buildroot}%{_datadir}/foreman/public/assets/%{gem_name}
install -m 0644 %{buildroot}%{gem_dir}/gems/%{gem_name}-%{version}/theme.css %{buildroot}%{_datadir}/foreman/public/assets/%{gem_name}/theme.css
install -m 0644 %{buildroot}%{gem_dir}/gems/%{gem_name}-%{version}/theme.js %{buildroot}%{_datadir}/foreman/public/assets/%{gem_name}/theme.js
install -m 0644 %{buildroot}%{gem_dir}/gems/%{gem_name}-%{version}/redhat-satellite-logo.svg %{buildroot}%{_datadir}/foreman/public/assets/%{gem_name}/redhat-satellite-logo.svg

mkdir -p %{buildroot}%{_localstatedir}/lib/foreman/%{gem_name}/uploads

%post
restorecon -R %{_localstatedir}/lib/foreman/%{gem_name} >/dev/null 2>&1 || :
systemctl try-restart foreman httpd >/dev/null 2>&1 || :

%postun
if [ "$1" -eq 0 ]; then
  systemctl try-restart foreman httpd >/dev/null 2>&1 || :
fi

%files
%{gem_dir}/gems/%{gem_name}-%{version}
%{gem_dir}/specifications/%{gem_name}-%{version}.gemspec
%{gem_dir}/cache/%{gem_name}-%{version}.gem
%config(noreplace) %{_datadir}/foreman/bundler.d/%{gem_name}.rb
%dir %{_datadir}/foreman/public/assets/%{gem_name}
%{_datadir}/foreman/public/assets/%{gem_name}/theme.css
%{_datadir}/foreman/public/assets/%{gem_name}/theme.js
%{_datadir}/foreman/public/assets/%{gem_name}/redhat-satellite-logo.svg
%dir %attr(0750,foreman,foreman) %{_localstatedir}/lib/foreman/%{gem_name}
%dir %attr(0750,foreman,foreman) %{_localstatedir}/lib/foreman/%{gem_name}/uploads

%changelog
* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.112-1
- Make the sidebar search field fill the top navigation strip.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.111-1
- Reduce the selected sidebar bar width and disable sidebar collapse/expand animation.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.110-1
- Clear the selected sidebar link after-pseudo marker so only one blue active bar remains.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.109-1
- Remove the inherited gray selected-sidebar marker so only the blue active bar is shown.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.108-1
- Increase the selected sidebar item marker to match the AWX-style active bar.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.107-1
- Match sidebar hover background to selected items and use a blue active left accent.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.106-1
- Add Dark Theme settings for site and sidebar font sizes.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.105-1
- Shorten sidebar descriptions so they fit on one line without clipping.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.104-1
- Hide sidebar category icons and keep menu descriptions on one line.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.103-1
- Add sidebar descriptions for theme, organization, and location submenus.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.102-1
- Use muted AWX-style text color for sidebar menu descriptions.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.101-1
- Add AWX-style descriptions to expandable sidebar menu items.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.100-1
- Add configurable plain-text login page info under the logo.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.99-1
- Remove forced 150px logo width while preserving 64px logo height.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.98-1
- Replace Foreman's default favicon links with the uploaded theme favicon.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.97-1
- Increase header and login logo height to 64px.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.96-1
- Redirect direct GET requests to theme upload/reset endpoints back to Settings.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.95-1
- Store uploaded theme assets under Foreman's writable var-lib tree.
- Restore the upload directory SELinux context during package install.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.94-1
- Stop injecting a default favicon URL until one is uploaded or configured.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.93-1
- Route plugin upload and asset endpoints to namespaced engine controllers.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.92-1
- Return upload and reset actions to the normal Settings page.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.91-1
- Add Dark Theme settings uploads for header logo and favicon.
- Draw one consistent full-width topbar divider from the plugin.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.90-1
- Apply AWX cancel text styling to PatternFly form cancel buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.89-1
- Render form and modal Cancel actions as AWX text buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.88-1
- Override high-specificity new-action buttons with compact AWX spacing.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.87-1
- Keep page actions compact while preserving large form footer buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.86-1
- Normalize compact action-button spacing and secondary PatternFly buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.85-1
- Compact top action buttons and remove excess icon/text spacing.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.84-1
- Add AWX primary, secondary, and cancel button taxonomy.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.83-1
- Restore filled action-button styling while keeping AWX search/filter controls.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.82-1
- Treat top-page create actions as AWX primary buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.81-1
- Match AWX toolbar search, dropdown menus, and primary action buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.80-1
- Stretch sidebar search to the full rail and remove nested menu dividers.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.79-1
- Normalize Bootstrap and PatternFly buttons to the AWX dark action style.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.78-1
- Hide nested sidebar divider rows inside expanded menu sections.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.77-1
- Remove empty sidebar search action slot so the input spans the rail.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.76-1
- Stretch PatternFly sidebar search to the full sidebar width.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.75-1
- Widen the sidebar search field and remove nested menu separator lines.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.74-1
- Remove legacy row borders from Audits change tables.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.73-1
- Ensure Audits change tables keep the flattened dark row styling late in the cascade.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.72-1
- Restyle Audits expanded rows and diff values for the dark theme.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.71-1
- Normalize PatternFly current sidebar link borders during focus.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.70-1
- Remove light rectangular focus borders from sidebar links and tab controls.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.69-1
- Make sidebar collapse clicks deterministic by immediately applying the intended plugin state.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.68-1
- Flatten legacy Bootstrap well panels and include table-view-pf in the cleanup list.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.67-1
- Ensure the About stats-well side-border override wins the final cascade.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.66-1
- Flatten Foreman About stats-well panels to match AWX card shells.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.65-1
- Make sidebar collapse target visible geometry first and delay fallback mutation.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.64-1
- Flatten card and panel shells by removing boxed side borders.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.63-1
- Apply sidebar collapse fallback directly during restore and faster after toggle clicks.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.62-1
- Remove boxed side borders from legacy Bootstrap tab rows.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.61-1
- Flatten legacy Bootstrap form well wrappers on tabbed Foreman forms.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.60-1
- Harden sidebar collapse fallback when Foreman's native toggle handler misses a click.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.59-1
- Flatten legacy tab content frames and make topbar notification badge icon-like.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.58-1
- Harden sidebar collapse state sync against stale body and sidebar classes.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.57-1
- Guard sidebar theme JavaScript until body exists and reduce fallback state mutation.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.56-1
- Fix Bootstrap popover and tooltip inner text contrast for dark interactive states.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.55-1
- Improve Bootstrap switch active-state contrast with AWX-style filled control blue.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.54-1
- Make sidebar collapse finish reliably and remove the collapsed border remnant.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.53-1
- Keep legacy mobile table text readable with contained horizontal scrolling.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.52-1
- Contain legacy mobile toolbars and tables within the viewport.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.51-1
- Keep mobile content full-width by rendering expanded sidebar as an overlay.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.50-1
- Restore sidebar collapse persistence across reloads and page navigation.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.49-1
- Match AWX active sidebar navigation background without changing secondary sidebar surfaces.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.48-1
- Match AWX data-row density in Foreman dashboard widget tables.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.47-1
- Restore AWX-style panel backgrounds for PatternFly table headers inside cards.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.46-1
- Darken context selector expanded surfaces and standalone PatternFly table header cells.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.45-1
- Align legacy and PatternFly table header surfaces with AWX data-grid panels.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.44-1
- Let Foreman's native sidebar collapse state drive the theme and add a legacy navigation collapse fallback.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.43-1
- Neutralize masthead notification badges to match AWX's black topbar controls.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.42-1
- Improve legacy status text contrast and darken host detail chart labels and frames.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.41-1
- Keep plugin collapse fallback synchronized with Foreman's real expanded and collapsed state.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.40-1
- Harden sidebar collapse state synchronization for Foreman PatternFly navigation.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.39-1
- Tighten React page title sections to remove excess top whitespace.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.38-1
- Align sidebar sizing, shell typography, legacy content offset, page title spacing, and table row density with AWX.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.37-1
- Guard sidebar persistence click handling for non-element event targets.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.36-1
- Persist Foreman sidebar collapse state across reloads and page navigation.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.35-1
- Darken legacy table headers, pagination bars, Select2 controls, disabled buttons, and long data-list rows.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.34-1
- Preserve Foreman sidebar collapse behavior while keeping the expanded AWX-width sidebar.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.33-1
- Keep React pages aligned with the AWX-width sidebar and remove tree-table chevron button borders.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.32-1
- Align sidebar width, tab rhythm, card headers, and table dividers closer to AWX.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.31-1
- Make tree-table expand chevrons plain while preserving the AWX-style row rhythm.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.30-1
- Add the explicit Deface runtime dependency and finalize AWX-style tree table controls.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.29-1
- Match AWX tree-table row rhythm and make expand controls read as clear compact buttons.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.28-1
- Align Sync Status treegrid parent controls and reduce child-row indentation to match AWX density.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.27-1
- Make Sync Status treegrid controls flatter and denser to better match AWX data tables.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.26-1
- Preserve sticky treegrid header layout while styling expandable row controls.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.25-1
- Tighten PatternFly tree-view tables and style expandable row controls closer to AWX.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.24-1
- Keep dashboard widget tables contained, fix dark text leaks, and align tab bars with the AWX active-tab style.

* Fri Jul 03 2026 ZS Operations <ops@zs.us> - 0.1.23-1
- Align legacy Bootstrap tables, buttons, search controls, labels, and pagination with the AWX dark data-grid style.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.22-1
- Flatten nested host overview cards, description lists, empty states, and tables.
- Prevent the host title grid from matching broad skeleton loader selectors.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.21-1
- Align sidebar, content, table, toolbar, form, and skeleton colors with AWX dark surfaces.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.20-1
- Neutralize PatternFly sidebar dividers and keep active nav accents to the left edge only.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.19-1
- Force the React/PatternFly masthead toolbar containers black so the full topbar band is uniform.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.18-1
- Rename theme plugin, gem, RPM, bundler hook, assets, settings, CSS hooks, and JS hooks to ZS.
- Preserve the AWX-inspired dark theme coverage and cache-busted public assets.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.16-1
- Force remaining topbar containers black and neutralize blue sidebar horizontal separators.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.15-1
- Darken topbar child controls and switch the bundled logo to a transparent dark-header variant.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.14-1
- Make the topbar black and remove the hamburger menu button fill.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.13-1
- Align dark theme palette with the live AWX PatternFly dark tokens.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.12-1
- Rename the theme settings category to Dark Theme.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.11-1
- Register ZS theme settings through the Rails reloader during plugin boot.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.10-1
- Add Foreman settings for the theme logo URL and hiding the FOREMAN header text.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.9-1
- Darken Red Hat repository containers and Bootstrap switch controls.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.8-1
- Restrict sidebar selected styling to the active item and darken Katello React tables.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.7-1
- Darken skeleton loader shimmer and placeholder variants.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.6-1
- Neutralize PatternFly nav item pseudo-element blue separators.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.5-1
- Neutralize blue sidebar separator and selected-item accents.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.4-1
- Override PatternFly nav link background tokens to remove remaining teal rows.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.3-1
- Change sidebar/nav palette from teal to AWX-style charcoal gray.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.2-1
- Darken Bootstrap table hover, selected, and status row states.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.1-2
- Keep Foreman plugin registry version in sync with the gem version.

* Thu Jul 02 2026 ZS Operations <ops@zs.us> - 0.1.1-1
- Package plugin as an installable/upgradable RPM.
- Improve dashboard widget and legacy sidebar dark-mode coverage.
