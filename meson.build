project('gnome-typescript-template',
          version: '0.1.0',
    meson_version: '>= 0.61.0',
  default_options: [ 'warning_level=2', 'werror=false', ],
)

i18n = import('i18n')
gnome = import('gnome')

application_id = 'io.github.charlieqle.GnomeTypescriptTemplate'
pkgdatadir = join_paths(get_option('datadir'), meson.project_name())
resource_path = '/' + application_id.replace('.', '/')

### YARN ###

yarn = find_program('yarn', required: true)
yarn_args=[]
offline_mirror = get_option('offline-mirror')
if offline_mirror != ''
  run_command('yarn',
    'config',
    '--offline',
    'set',
    'yarn-offline-mirror',
    get_option('prefix') / 'yarn-mirror',
    env: { 'HOME': meson.project_build_root() },
    check: true
  )
  yarn_args += ['--offline', '--use-yarnrc', meson.project_build_root() / '.yarnrc']
endif
yarn_deps = custom_target('yarn-deps',
  command: [ yarn, 'install', yarn_args ],
  output: [ 'yarn-deps-out' ]
)

############

subdir('data')
subdir('src')
subdir('po')

install_symlink(
  meson.project_name(),
  pointing_to: join_paths(get_option('prefix'), get_option('bindir'), application_id),
  install_dir: join_paths(get_option('prefix'), get_option('bindir'))
)

gnome.post_install(
     glib_compile_schemas: true,
    gtk_update_icon_cache: true,
  update_desktop_database: true,
)
