import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export interface GamePresetJson {
    installDir?: string,
    relativeModPath?: string,
    nexus?: {
        id: string
    },
    steam?: {
        appid: string
        compatdataDir?: string
    }
}

export class GamePreset {
    private _name: string;
    private _json: GamePresetJson;

    public constructor(name: string, json: GamePresetJson) {
        this._name = name;
        this._json = json;
    }

    public get name() {
        return this._name;
    }

    public get json() {
        return this._json;
    }
}

export function loadPresets(): GamePreset[] {
    const decoder = new TextDecoder();
    const presets: GamePreset[] = [];
    GLib.get_system_data_dirs().map(path => GLib.build_filenamev([path, 'moddy', 'presets']))
        .map(path => Gio.File.new_for_path(path))
        .filter(file => file.query_exists(null))
        .forEach(file => {
            const enumerator = file.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
            let info: Gio.FileInfo | null = null;
            while (true) {
                info = enumerator.next_file(null);
                if (!info) {
                    break;
                }
                const filename = info.get_name();
                if (info.get_file_type() !== Gio.FileType.REGULAR || !filename.endsWith('.json')) {
                    continue;
                }
                const f = file.get_child(filename);
                const [ok, content] = f.load_contents(null);
                if (!ok) {
                    continue;
                }
                const json: GamePresetJson = JSON.parse(decoder.decode(content)) as GamePresetJson;
                const presetname = filename.substring(0, info.get_name().length - 5);
                presets.push(new GamePreset(presetname, json));
            }
        });

    return presets;
}