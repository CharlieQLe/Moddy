import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as ACF from 'resource:///io/github/charlieqle/Moddy/js/vendor/acf-parser.js';
import * as VDF from 'resource:///io/github/charlieqle/Moddy/js/vendor/vdf-parser.js';
import { GamePreset } from 'resource:///io/github/charlieqle/Moddy/js/gamePreset.js';

const STEAMAPPS = [
    '.var/app/com.valvesoftware.Steam/.steam/steam/steamapps',
    '.steam/steam/steamapps'
]

interface AppManifestACF {
    AppState: {
        appid: string,
        name: string,
        installdir: string,
    },
}

interface LibraryVDF {
    libraryfolders: {
        [key: string]: {
            path: string,
            apps: {
                [appid: string]: string
            }
        },
    },
}

export function parseGames(presets: GamePreset[]): GamePreset[] {
    const libraryFolderPaths = STEAMAPPS.map(path => GLib.build_filenamev([GLib.get_home_dir(), path]));
    const libraryVdfFiles = libraryFolderPaths.map(path => GLib.build_filenamev([path, 'libraryfolders.vdf']))
        .map(path => Gio.File.new_for_path(path))
        .filter(file => file.query_exists(null));
    const decoder = new TextDecoder();
    const steamPresets: GamePreset[] = [];
    libraryVdfFiles.forEach(file => {
        const [ok, content] = file.load_contents(null);
        if (!ok) {
            return;
        }
        const vdf = VDF.parse(decoder.decode(content)) as LibraryVDF;
        if (!vdf.libraryfolders) {
            return;
        }
        for (const library of Object.values(vdf.libraryfolders)) {
            const path = library.path || '';
            const apps = Object.keys(library.apps || {});
            const libraryFile = Gio.File.new_for_path(path);
            if (!libraryFile.query_exists(null)) {
                continue;
            }
            apps.map(appid => libraryFile.get_child('steamapps').get_child(`appmanifest_${appid}.acf`))
                .filter(file => file.query_exists(null))
                .forEach(file => {
                    const [ok, content] = file.load_contents(null);
                    if (!ok) {
                        return;
                    }
                    const acf = ACF.default.decode(decoder.decode(content)) as AppManifestACF;
                    if (!acf.AppState || !acf.AppState.appid || !acf.AppState.name || !acf.AppState.installdir) {
                        return;
                    }
                    const appid = acf.AppState.appid;
                    const installdir = acf.AppState.installdir;
                    presets.filter(preset => !steamPresets.map(preset => preset.name).includes(preset.name))
                        .forEach(preset => {
                            if (!preset.json.steam || preset.name !== installdir || preset.json.steam.appid !== appid) {
                                return;
                            }
                            const installDirFile = Gio.File.new_for_path(GLib.build_filenamev([libraryFile.get_path() as string, 'steamapps', 'common', installdir]));
                            if (!installDirFile.query_exists(null)) {
                                return;
                            }
                            preset.json.installDir = installDirFile.get_path() || '';
                            preset.json.steam.compatdataDir = GLib.build_filenamev([libraryFile.get_path() as string, 'steamapps', 'compatdata', appid]);
                            steamPresets.push(preset);
                        });
                });
        }
    });
    log(`Found ${steamPresets.length} Steam games!`)
    return steamPresets;
}