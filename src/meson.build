gnome = import('gnome')

### TYPESCRIPT ###

tsc_out = meson.project_build_root() / 'tsc-out'
typescript = custom_target('typescript-compile',
  build_by_default: true,
  build_always_stale: true,
  command: [ yarn, yarn_args, 'run', 'compile:ts', '--outDir', tsc_out ],
  depends: yarn_deps,
  output: [ 'tsc_output' ]
)

##################

src_res = gnome.compile_resources(application_id + '.src',
  application_id + '.src.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
  dependencies: typescript,
  source_dir: tsc_out
)

bin_conf = configuration_data()
bin_conf.set('GJS', find_program('gjs').full_path())
bin_conf.set('PACKAGE_VERSION', meson.project_version())
bin_conf.set('PACKAGE_NAME', meson.project_name())
bin_conf.set('prefix', get_option('prefix'))
bin_conf.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))
bin_conf.set('resource_path', resource_path)

configure_file(
  input: application_id + '.in',
  output: application_id,
  configuration: bin_conf,
  install: true,
  install_dir: get_option('bindir')
)
