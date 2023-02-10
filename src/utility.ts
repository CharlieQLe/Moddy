import GLib from 'gi://GLib';

export function getConfigDir() {
    return GLib.build_filenamev([GLib.get_user_config_dir(), 'moddy']);
}

export function getDataDir() {
    return GLib.build_filenamev([GLib.get_user_data_dir(), 'moddy']);
}