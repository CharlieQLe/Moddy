import GLib from 'gi://GLib';

export function getConfigDir() {
    return GLib.build_filenamev([GLib.get_user_config_dir(), 'moddy']);
}

export function getDataDir() {
    return GLib.build_filenamev([GLib.get_user_data_dir(), 'moddy']);
}

export function spawnHost(...args: string[]) {
    return spawn('/usr/bin/flatpak-spawn', '--host', ...args);
}

export function spawn(...args: string[]) {
    return GLib.spawn_command_line_sync(args.join(' '));
}