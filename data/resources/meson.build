subdir('icons')

gnome = import('gnome')

blueprints = custom_target('blueprints',
  input: files(
    'gtk/help-overlay.blp',
    'ui/views/add-game-view.blp',
    'ui/views/game-view.blp',
    'ui/views/home-view.blp',
    'ui/directory-entry-row.blp',
    'ui/game-row.blp',
    'ui/mod-row.blp',
    'ui/profile-create-window.blp',
    'ui/profile-preferences-window.blp',
    'ui/window.blp',
  ),
  output: '.',
  command: [find_program('blueprint-compiler'), 'batch-compile', '@OUTPUT@', '@CURRENT_SOURCE_DIR@', '@INPUT@'],
)

data_res = gnome.compile_resources(application_id + '.data',
  application_id + '.data.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
  dependencies: blueprints,
)

