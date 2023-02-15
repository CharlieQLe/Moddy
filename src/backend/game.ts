import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GnomeAutoar from 'gi://GnomeAutoar';

import { Mod } from 'resource:///io/github/charlieqle/Moddy/js/backend/mod.js';
import { Profile } from 'resource:///io/github/charlieqle/Moddy/js/backend/profile.js';
import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

interface ProfileData {
    modOrder: string[],
    enabledMods: string[],
}

interface GameData {
    dataDir: string;
    installDir: string;
    relativeModTarget: string;
    selectedProfileName: string;
    nexus: {
        id: string,
    },
    steam: {
        appid: string,
        compatdataDir: string,
    },
}

function getDefaultGameData() {
    return {
        dataDir: '',
        installDir: '',
        relativeModTarget: '',
        selectedProfileName: '',
        nexus: {
            id: ''
        },
        steam: {
            appid: '',
            compatdataDir: ''
        },
    } as GameData;
}

export function loadGames(): Game[] {
    const games: Game[] = [];

    const configFolder = Gio.File.new_for_path(Utility.getConfigDir());
    Utility.iterateDirectoryChildren(configFolder, info => {
        const fileName = info.get_name();
        if (info.get_file_type() !== Gio.FileType.REGULAR || !fileName.endsWith('.json')) {
            return;
        }
        games.push(new Game(fileName.substring(0, fileName.length - 5)));
    });

    return games;
}

export class Game extends GObject.Object {
    private _name: string;
    private _mods: Gio.ListStore<Mod>;
    private _profiles: Gio.ListStore<Profile>;
    private _data: GameData;

    static {
        GObject.registerClass({
            GTypeName: 'Game',
            Properties: {
                'name': GObject.ParamSpec.string(
                    'name',
                    'Name',
                    'Name',
                    GObject.ParamFlags.READABLE,
                    ''
                ),
                'selectedProfileName': GObject.ParamSpec.string(
                    'selectedProfileName',
                    'Selected profile name',
                    'Selected profile name',
                    GObject.ParamFlags.READWRITE,
                    ''
                ),
                'mods': GObject.ParamSpec.object(
                    'mods',
                    'Mods',
                    'Mods',
                    GObject.ParamFlags.READABLE,
                    Gio.ListStore<Mod>
                ),
                'profiles': GObject.ParamSpec.object(
                    'profiles',
                    'Profiles',
                    'Profiles',
                    GObject.ParamFlags.READABLE,
                    Gio.ListStore<Profile>
                ),
            }
        }, this);
    }

    public constructor(name: string) {
        super();
        this._name = name;
        this._mods = new Gio.ListStore<Mod>();
        this._profiles = new Gio.ListStore<Profile>();

        this._data = getDefaultGameData();

        const decoder = new TextDecoder();

        // Load from config file
        const configFile = Gio.File.new_for_path(GLib.build_filenamev([Utility.getConfigDir(), `${name}.json`]));
        if (configFile.query_exists(null)) {
            const [ok, contents] = configFile.load_contents(null);
            if (ok) {
                this._data = JSON.parse(decoder.decode(contents)) as GameData;
            }
        }

        // Load mods
        const modFolder = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'mods']));
        if (modFolder.query_exists(null)) {
            Utility.iterateDirectoryChildren(modFolder, info => {
                if (info.get_file_type() !== Gio.FileType.DIRECTORY) {
                    return;
                }
                this.addMod(new Mod(info.get_name(), this));
            });
        }

        // Load profiles
        const profileFolder = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'profiles']));
        if (profileFolder.query_exists(null)) {
            Utility.iterateDirectoryChildren(profileFolder, info => {
                const fileName = info.get_name();
                if (info.get_file_type() !== Gio.FileType.REGULAR || !fileName.endsWith('.json')) {
                    return;
                }
                const [ok, contents] = profileFolder.get_child(fileName).load_contents(null);
                if (!ok) {
                    return;
                }
                this.addProfile(new Profile(fileName.substring(0, fileName.length - 5), this), JSON.parse(decoder.decode(contents)) as ProfileData);
            });
        }
        if (this.profiles.get_n_items() === 0) {
            this.addProfile(new Profile('Default', this));
        }
        if (this.selectedProfileName === '') {
            this.selectedProfileName = (this.profiles.get_item(0) as Profile).name;
        }

        // TODO: Connect signals?

        // Save
        this.save();
    }

    public get name() {
        return this._name;
    }

    public get selectedProfileName() {
        return this._data.selectedProfileName;
    }

    public set selectedProfileName(name: string) {
        const [, , profile] = Utility.modelFind(this.profiles, profile => profile.name === name);
        if (!profile) {
            throw new Error('Selected profile name not found!');
        }
        this._data.selectedProfileName = name;
        this.notify('selectedProfileName');
        this.saveConfig();

        for (const mod of this.mods) {
            mod.enabled = profile.enabledMods.includes(mod.name);
        }

        this.mods.sort((a: Mod, b: Mod) => profile.modOrder.indexOf(a.name) - profile.modOrder.indexOf(b.name));
    }

    public get mods() {
        return this._mods;
    }

    public get profiles() {
        return this._profiles;
    }

    public get dataDir() {
        return this._data.dataDir.length === 0 ? GLib.build_filenamev([Utility.getDataDir(), this.name]) : this._data.dataDir;
    }

    public get installDir() {
        return this._data.installDir;
    }

    public set installDir(dir: string) {
        this._data.installDir = dir;
        this.saveConfig();
    }

    public get relativeModTarget() {
        return this._data.relativeModTarget;
    }

    public set relativeModTarget(target: string) {
        this._data.relativeModTarget = target;
        this.saveConfig();
    }

    public get selectedProfile() {
        const [ok, , profile] = Utility.modelFind(this.profiles, profile => profile.name === this.selectedProfileName);
        return ok ? profile : null;
    }

    public get nexusId() {
        return this._data.nexus.id;
    }

    public set nexusId(id: string) {
        this._data.nexus.id = id;
        this.saveConfig();
    }

    public get steamAppId() {
        return this._data.steam.appid;
    }

    public set steamAppId(appid: string) {
        this._data.steam.appid = appid;
        this.saveConfig();
    }

    public get steamCompatdataDir() {
        return this._data.steam.appid;
    }

    public set steamCompatdataDir(compatdataDir: string) {
        this._data.steam.compatdataDir = compatdataDir;
        this.saveConfig();
    }

    public saveConfig() {
        const configFile = Gio.File.new_for_path(GLib.build_filenamev([Utility.getConfigDir(), `${this.name}.json`]));
        const contents = new TextEncoder().encode(JSON.stringify(this._data, null, 4));
        if (configFile.query_exists(null)) {
            configFile.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
        } else {
            const stream = configFile.create(Gio.FileCreateFlags.NONE, null);
            stream.write_all(contents, null);
        }
    }

    public saveData() {
        // Make folders
        const dataFolder = Gio.File.new_for_path(this.dataDir);
        if (!dataFolder.query_exists(null)) {
            dataFolder.make_directory_with_parents(null);
        }
        const profileFolder = dataFolder.get_child('profiles');
        [
            dataFolder.get_child('downloads'),
            dataFolder.get_child('overwrite'),
            dataFolder.get_child('mods'),
            dataFolder.get_child('work'),
            profileFolder,
        ].forEach(file => {
            if (!file.query_exists(null)) {
                file.make_directory(null);
            }
        });

        // Save profiles
        if (!profileFolder.query_exists(null)) {
            profileFolder.make_directory(null);
        }
        for (const profile of this.profiles) {
            profile.save();
        }
    }

    public save() {
        // Save data
        this.saveData();

        // Save config
        this.saveConfig();
    }

    public installMod(file: Gio.File) {
        const filename = file.get_basename();
        if (!filename) {
            return false;
        }
        const modname = filename.substring(0, filename.lastIndexOf('.'));
        const output = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'mods', modname]));
        if (output.query_exists(null)) {
            // TODO: Open dialog for potential override
            return false;
        }
        output.make_directory_with_parents(null);
        const extractor = GnomeAutoar.Extractor.new(file, output);
        extractor.set_output_is_dest(true);
        extractor.start(null);
        this.addMod(new Mod(modname, this));
        return true;
    }

    public uninstallMod(mod: Mod) {
        const [ok, index] = this.mods.find(mod);
        if (!ok) {
            return false;
        }
        this.mods.remove(index);
        const output = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'mods', mod.name]));
        output.trash(null);
        for (const profile of this.profiles) {
            const orderIndex = profile.modOrder.indexOf(mod.name);
            if (orderIndex >= 0) {
                profile.modOrder.splice(orderIndex, 1);
            }

            const enabledIndex = profile.enabledMods.indexOf(mod.name);
            if (enabledIndex >= 0) {
                profile.enabledMods.splice(enabledIndex, 1);
            }
        }
        this.saveData();
        return true;
    }

    private addMod(mod: Mod) {
        this.mods.append(mod);

        for (const profile of this.profiles) {
            if (!profile.modOrder.includes(mod.name)) {
                profile.modOrder.push(mod.name);
            }
        }

        mod.connect('renamed', this.onModRenamed.bind(this));
        mod.connect('notify::enabled', this.onModEnabledChanged.bind(this));

        // TODO: Connect signals
    }

    public addProfile(profile: Profile, data?: ProfileData) {
        this.profiles.append(profile);

        if (!data) {
            const file = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'profiles', `${profile.name}.json`]));
            if (file.query_exists(null)) {
                const [ok, content] = file.load_contents(null);
                if (ok) {
                    data = JSON.parse(new TextDecoder().decode(content)) as ProfileData;
                }
            }
        }
        if (data) {
            data.modOrder.forEach(mod => {
                profile.modOrder.push(mod);
            });

            data.enabledMods.forEach(mod => {
                profile.enabledMods.push(mod);
            });
        }

        profile.connect('renamed', this.onProfileRenamed.bind(this));

        // TODO: Connect signals
    }

    public removeProfile(profile: Profile) {
        const [ok, index] = this.profiles.find(profile);
        if (!ok) {
            return false;
        }
        this.profiles.remove(index);
        if (this.profiles.get_n_items() === 0) {
            this.addProfile(new Profile('Default', this));
        }
        if (profile.name === this.selectedProfileName) {
            this.selectedProfileName = (this.profiles.get_item(0) as Profile).name;
        }
        return true;
    }

    private onModRenamed(mod: Mod, oldName: string, name: string) {
        const modFolder = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'mods', oldName]));
        if (!modFolder.query_exists(null)) {
            return;
        }
        modFolder.set_display_name(name, null);
        for (const profile of this.profiles) {
            const orderIndex = profile.modOrder.indexOf(oldName);
            if (orderIndex >= 0) {
                profile.modOrder[orderIndex] = name;
            }

            const enabledIndex = profile.enabledMods.indexOf(oldName);
            if (enabledIndex >= 0) {
                profile.enabledMods[enabledIndex] = name;
            }

            profile.save();
        }
    }

    private onModEnabledChanged(mod: Mod, _: GObject.ParamSpec<boolean>) {
        const selectedProfile = this.selectedProfile;
        if (!selectedProfile) {
            return;
        }
        const i = selectedProfile.enabledMods.indexOf(mod.name);
        if (mod.enabled && i < 0) {
            selectedProfile.enabledMods.push(mod.name);
        } else if (!mod.enabled && i >= 0) {
            selectedProfile.enabledMods.splice(i, 1);
        }
        selectedProfile.save();
    }

    private onProfileRenamed(profile: Profile, oldName: string, name: string) {
        const profileFile = Gio.File.new_for_path(GLib.build_filenamev([this.dataDir, 'profiles', `${oldName}.json`]));
        if (!profileFile.query_exists(null)) {
            return;
        }
        profileFile.set_display_name(`${name}.json`, null);
        if (this.selectedProfileName === name) {
            this.selectedProfileName = name;
        }
        profile.save();
    }

    public get modTargetPath() {
        const paths = [this.installDir];
        if (this.relativeModTarget.length > 0) {
            paths.push(this.relativeModTarget);
        }
        return GLib.build_filenamev(paths);
    }

    public get isDeployed() {
        const path = this.modTargetPath;
        if (!Gio.File.new_for_path(path).query_exists(null)) {
            return false;
        }
        const [ok, stdout, stderr, exit] = Utility.spawn('mountpoint', `\"${path}\"`);
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
        return ok && exit === 0;
    }

    public deploy() {
        if (this.isDeployed) {
            return false;
        }

        // Get the selected profile
        const selectedProfile = this.selectedProfile;
        if (!selectedProfile) {
            return false;
        }

        // Build paths
        const path = this.modTargetPath;
        const upperdir = GLib.build_filenamev([this.dataDir, 'overwrite']);
        const workdir = GLib.build_filenamev([this.dataDir, 'work']);

        // Build lower directory order
        const lower: string[] = [path, ...selectedProfile.modOrder.filter(modname => selectedProfile.enabledMods.includes(modname))
            .map(modname => GLib.build_filenamev([this.dataDir, 'mods', modname]))
            .reverse()];

        // Try to mount on the host
        const [ok, stdout, stderr, exit] = Utility.spawnHost('pkexec', 'mount', '-t', 'overlay', 'overlay', `\"-olowerdir=${lower.join(':')},upperdir=${upperdir},workdir=${workdir}\"`, `\"${path}\"`);
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
        const [ok, _, __, exit] = Utility.spawnHost('pkexec', 'umount', `\"${path}\"`);
        return ok && exit === 0 && !this.isDeployed;
    }
}