import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

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

export function iterateDirectoryChildren(directory: Gio.File, callback: (info: Gio.FileInfo) => void) {
    const enumerator = directory.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    while (true) {
        const info = enumerator.next_file(null);
        if (!info) {
            break;
        }
        callback(info);
    }
}

export function modelFind<A extends GObject.Object>(model: Gio.ListModel<A>, filterFunc: (item: A) => boolean): [boolean, number, A | null] {
    for (let i = 0; i < model.get_n_items(); i++) {
        const item = model.get_item(i);
        if (item && filterFunc(item)) {
            return [true, i, item];
        }
    }
    return [false, -1, null];
}