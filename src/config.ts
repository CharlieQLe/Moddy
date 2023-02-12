import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import GnomeAutoar from 'gi://GnomeAutoar';

import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

export function getDefaultProfileJson(): ProfileJson {
    return {
        modOrder: [],
        enabledMods: [],
    };
}

export function getDefaultGameJson(): GameJson {
    return {
        installDir: '',
        relativeModPath: '',
        selectedProfile: '',
    };
}

export interface ProfileJson {
    modOrder: string[],
    enabledMods: string[],
    [key: string]: any,
}

export interface GameJson {
    dataDir?: string;
    installDir: string;
    relativeModPath: string;
    selectedProfile: string;
    nexus?: {
        id: string,
    },
    steam?: {
        appid: string,
        compatdataDir: string,
    },
    [key: string]: any,
}

export class Mod extends GObject.Object {
    private _name!: string;
    private _enabled!: boolean;

    static {
        GObject.registerClass({
            GTypeName: 'Mod',
            Properties: {
                'name': GObject.ParamSpec.string('name', 'Name', 'The mod name', GObject.ParamFlags.READABLE, ''),
                'enabled': GObject.ParamSpec.boolean('enabled', 'Enabled', 'The mod state', GObject.ParamFlags.READWRITE, false),
            },
        }, this);
    }

    public constructor(name: string) {
        super();
        this._name = name;
    }

    public get name() {
        return this._name;
    }

    public get enabled() {
        return this._enabled;
    }

    public set enabled(enabled: boolean) {
        this._enabled = enabled;
        this.notify('enabled');
    }
}

export class Profile {
    private _name: string;
    private _json: ProfileJson;

    static new(name: string) {
        return new Profile(name, getDefaultProfileJson());
    }

    public constructor(name: string, json: ProfileJson) {
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

export class Game {
    private _name: string;
    private _json: GameJson;
    private _profiles: {
        [name: string]: Profile
    };
    private _mods: Mod[];

    static load(name: string) {
        const jsonFile = Gio.File.new_for_path(GLib.build_filenamev([Utility.getConfigDir(), `${name}.json`]));
        if (!jsonFile.query_exists(null)) {
            return null;
        }
        const [ok, contents] = jsonFile.load_contents(null);
        if (!ok) {
            return null;
        }
        const decoder = new TextDecoder();
        const json = JSON.parse(decoder.decode(contents)) as GameJson;
        const game = new Game(name, json);
        const dataFile = Gio.File.new_for_path(game.dataPath);
        if (!dataFile.query_exists(null)) {
            return null;
        }
        if (!game.refresh()) {
            return null;
        }
        return game;
    }

    public constructor(name: string, json: GameJson) {
        this._name = name;
        this._json = json;
        this._profiles = {};
        this._mods = [];
    }

    public get name() {
        return this._name;
    }

    public get json() {
        return this._json;
    }

    public get profiles() {
        return this._profiles;
    }

    public get mods() {
        return this._mods;
    }

    public get configPath() {
        return GLib.build_filenamev([Utility.getConfigDir(), `${this.name}.json`]);
    }

    public get dataPath() {
        return this.json.dataDir || GLib.build_filenamev([Utility.getDataDir(), this.name]);
    }

    public get modTargetPath() {
        const paths = [this._json.installDir];
        if (this._json.relativeModPath.length > 0) {
            paths.push(this._json.relativeModPath);
        }
        return GLib.build_filenamev(paths);
    }

    public get isDeployed() {
        const path = this.modTargetPath;
        if (!Gio.File.new_for_path(path).query_exists(null)) {
            return false;
        }
        const [ok, _, __, exit] = Utility.spawn('mountpoint', path);
        return ok && exit === 0;
    }

    public deploy() {
        if (this.isDeployed || !(this.json.selectedProfile in this.profiles)) {
            return false;
        }

        // Get the selected profile
        const selectedProfile = this.profiles[this.json.selectedProfile];

        // Build paths
        const path = this.modTargetPath;
        const upperdir = GLib.build_filenamev([this.dataPath, 'overwrite']);
        const workdir = GLib.build_filenamev([this.dataPath, 'work']);

        // Build lower directory order
        const lower: string[] = [path, ...selectedProfile.json.modOrder.filter(modname => selectedProfile.json.enabledMods.includes(modname))
            .map(modname => GLib.build_filenamev([this.dataPath, 'mods', modname]))
            .reverse()];

        // Try to mount on the host
        const [ok, stdout, stderr, exit] = Utility.spawnHost('pkexec', 'mount', '-t', 'overlay', 'overlay', `"-olowerdir=${lower.join(':')},upperdir=${upperdir},workdir=${workdir}"`, `"${path}"`);
        const decoder = new TextDecoder();
        if (stdout) {
            const str = decoder.decode(stdout);
            if (str.length > 0) {
                log(str);
            }
        }
        if (stderr) {
            const str = decoder.decode(stderr);
            if (str.length > 0) {
                log(str);
            }
        }
        return ok && exit === 0 && this.isDeployed;
    }

    public purge() {
        if (!this.isDeployed) {
            return false;
        }
        const path = this.modTargetPath;
        const [ok, _, __, exit] = Utility.spawnHost('pkexec', 'umount', path);
        return ok && exit === 0 && !this.isDeployed;
    }

    public refresh() {
        const dataFile = Gio.File.new_for_path(this.dataPath);
        if (!dataFile.query_exists(null)) {
            return false;
        }

        // Load new profiles
        const profilesFile = dataFile.get_child('profiles');
        if (!profilesFile.query_exists(null)) {
            return false;
        }
        const decoder = new TextDecoder();
        const profilesEnumerator = profilesFile.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
        while (true) {
            const info = profilesEnumerator.next_file(null);
            if (!info) {
                break;
            }
            const filename = info.get_name();
            if (info.get_file_type() === Gio.FileType.REGULAR && filename.endsWith('.json')) {
                const profilename = filename.substring(0, filename.length - 5);
                if (!(profilename in this.profiles)) {
                    const [ok, contents] = profilesFile.get_child(filename).load_contents(null);
                    if (ok) {
                        this.profiles[profilename] = new Profile(profilename, JSON.parse(decoder.decode(contents)) as ProfileJson);
                    }
                }
            }
        }

        // Ensure that there is always a profile
        if (Object.keys(this.profiles).length === 0) {
            this.profiles.Default = new Profile('Default', getDefaultProfileJson());
        }

        // Ensure that selectedProfile is always valid
        if (!(this.json.selectedProfile in this.profiles)) {
            this.json.selectedProfile = Object.keys(this.profiles)[0];
        }

        // Load mods
        const modsFile = dataFile.get_child('mods');
        if (!modsFile.query_exists(null)) {
            return false;
        }
        const modNames = this.mods.map(mod => mod.name);
        const modsEnumerator = modsFile.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
        while (true) {
            const info = modsEnumerator.next_file(null);
            if (!info) {
                break;
            }
            const modname = info.get_name();
            if (info.get_file_type() === Gio.FileType.DIRECTORY && !modNames.includes(modname)) {
                this.mods.push(new Mod(modname));
            }
        }

        // Add new mods to the list
        for (const profile of Object.values(this.profiles)) {
            const names = this.mods.map(mod => mod.name);
            profile.json.modOrder = profile.json.modOrder.filter(name => names.includes(name));
            profile.json.modOrder.push(...names.filter(name => !profile.json.modOrder.includes(name)));
        }
        this.save();
        return true;
    }

    public installModFromFile(file: Gio.File) {
        const filename = file.get_basename();
        if (!filename) {
            return false;
        }
        const modname = filename.substring(0, filename.lastIndexOf('.'));
        const output = Gio.File.new_for_path(GLib.build_filenamev([this.dataPath, 'mods', modname]));
        if (output.query_exists(null)) {
            // TODO: Open dialog for potential override
            return false;
        }
        output.make_directory_with_parents(null);
        const extractor = GnomeAutoar.Extractor.new(file, output);
        extractor.set_output_is_dest(true);
        extractor.start(null);
        this.refresh();
        return true;
    }

    public uninstallMod(mod: Mod) {
        if (!this._mods.includes(mod)) {
            return false;
        }
        this._mods.splice(this._mods.indexOf(mod), 1);
        const output = Gio.File.new_for_path(GLib.build_filenamev([this.dataPath, 'mods', mod.name]));
        output.trash(null);
        for (const profile of Object.values(this.profiles)) {
            profile.json.modOrder = profile.json.modOrder.filter(name => name !== mod.name);
            profile.json.enabledMods = profile.json.enabledMods.filter(name => name !== mod.name);
        }
        this.save();
        return true;
    }

    public getEnabledModsForProfile(profilename: string) {
        if (!(profilename in this.profiles)) {
            return [];
        }
        const profile = this.profiles[profilename];
        return this.mods.filter(mod => profile.json.enabledMods.includes(mod.name));
    }

    public saveProfile(name: string) {
        if (!(name in this.profiles)) {
            return;
        }
        const profileFile = Gio.File.new_for_path(GLib.build_filenamev([this.dataPath, 'profiles', `${name}.json`]));
        const contents = new TextEncoder().encode(JSON.stringify(this.profiles[name].json, null, 4));
        if (profileFile.query_exists(null)) {
            profileFile.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
        } else {
            const stream = profileFile.create(Gio.FileCreateFlags.NONE, null);
            stream.write_all(contents, null);
        }
    }

    public removeProfile(name: string) {
        if (!(name in this.profiles)) {
            return false;
        }
        const profileFile = Gio.File.new_for_path(GLib.build_filenamev([this.dataPath, 'profiles', `${name}.json`]));
        if (!profileFile.query_exists(null)) {
            return false;
        }

        if (!profileFile.delete(null)) {
            return false;
        }

        const profiles: {
            [name: string]: Profile,
        } = {};
        for (const [profileName, profile] of Object.entries(this.profiles)) {
            if (profileName !== name) {
                profiles[profileName] = profile;
            }
        }
        this._profiles = profiles;

        this.save();
        return true;
    }

    public renameProfile(name: string, newName: string) {
        if (!(name in this.profiles) || newName in this.profiles) {
            return false;
        }
        const oldProfilePath = GLib.build_filenamev([this.dataPath, 'profiles', `${name}.json`]);
        const profileFile = Gio.File.new_for_path(oldProfilePath);
        if (!profileFile.query_exists(null)) {
            return false;
        }
        profileFile.set_display_name(`${newName}.json`, null);

        const profiles: {
            [name: string]: Profile,
        } = {};
        for (const [profileName, profile] of Object.entries(this.profiles)) {
            if (profileName !== name) {
                profiles[profileName] = profile;
            }
        }
        profiles[newName] = new Profile(newName, this.profiles[name].json);
        this._profiles = profiles;

        if (this.json.selectedProfile === name) {
            this.json.selectedProfile = newName;
        }

        this.save();
        return true;
    }

    public save() {
        const dataFile = Gio.File.new_for_path(this.dataPath);
        if (!dataFile.query_exists(null)) {
            dataFile.make_directory_with_parents(null);
        }

        // Create directories
        const profilesFile = dataFile.get_child('profiles');
        [
            dataFile.get_child('downloads'),
            dataFile.get_child('overwrite'),
            dataFile.get_child('mods'),
            dataFile.get_child('work'),
            profilesFile,
        ].forEach(file => {
            if (!file.query_exists(null)) {
                file.make_directory(null);
            }
        });

        // Save profiles
        for (const name of Object.keys(this.profiles)) {
            this.saveProfile(name);
        }

        // Save file
        const configFile = Gio.File.new_for_path(this.configPath);
        const contents = new TextEncoder().encode(JSON.stringify(this.json, null, 4));
        if (configFile.query_exists(null)) {
            configFile.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
        } else {
            const stream = configFile.create(Gio.FileCreateFlags.NONE, null);
            stream.write_all(contents, null);
        }
    }
}