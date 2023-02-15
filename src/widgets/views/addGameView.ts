import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';

import { DirectoryEntryRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/directoryEntryRow.js';
import { Game, getDefaultGameData } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';
import { Profile } from 'resource:///io/github/charlieqle/Moddy/js/backend/profile.js';
import { GamePreset, loadPresets } from 'resource:///io/github/charlieqle/Moddy/js/gamePreset.js';
import * as Steam from 'resource:///io/github/charlieqle/Moddy/js/steam.js';

const DISALLOW_CHARS = [':'];

export class AddGameView extends Gtk.Box {
    private _presetSelector!: Adw.ComboRow;
    private _titleEntry!: Adw.EntryRow;
    private _installDirEntry!: DirectoryEntryRow;
    private _nexusGroup!: Adw.PreferencesGroup;
    private _nexusSwitch!: Gtk.Switch;
    private _nexusIdEntry!: Adw.EntryRow;
    private _steamGroup!: Adw.PreferencesGroup;
    private _steamSwitch!: Gtk.Switch;
    private _steamAppIdEntry!: Adw.EntryRow;
    private _steamCompatdataDirEntry!: DirectoryEntryRow;

    private _games: Game[];
    private _validatedTitle: boolean;
    private _validatedInstallDir: boolean;
    private _presets: GamePreset[];

    static {
        GObject.registerClass({
            GTypeName: 'AddGameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/add-game-view.ui',
            InternalChildren: ['presetSelector', 'titleEntry', 'installDirEntry', 'nexusGroup',
                'nexusSwitch', 'nexusIdEntry', 'steamGroup', 'steamSwitch', 'steamAppIdEntry',
                'steamCompatdataDirEntry'],
            Signals: {
                'validated': {
                    param_types: [GObject.TYPE_BOOLEAN, GObject.TYPE_BOOLEAN],
                }
            },
        }, this);
    }

    constructor() {
        super();

        this._games = [];
        this._validatedTitle = false;
        this._validatedInstallDir = false;

        const loadedPresets = loadPresets();
        const steamPresets = Steam.parseGames(loadedPresets);
        this._presets = [...steamPresets];
        this._presets.sort((a, b) => a.name.localeCompare(b.name));
        const list = this._presetSelector.model as Gtk.StringList;
        this._presets.map(preset => preset.name).forEach(name => {
            list.append(name);
        });
    }

    public get selectedPreset() {
        const index = this._presetSelector.get_selected();
        if (index === 0) {
            return null;
        }
        return this._presets[index - 1];
    }

    public createGame(): Game {
        const game = new Game(this._titleEntry.get_text());
        game.installDir = this._installDirEntry.get_text();
        if (this._nexusGroup.get_sensitive()) {
            game.nexusId = this._nexusIdEntry.get_text();
        }
        if (this._steamGroup.get_sensitive()) {
            game.steamAppId = this._steamAppIdEntry.get_text();
            game.steamCompatdataDir = this._steamCompatdataDirEntry.get_text();
        }
        return game;
    }

    public setGames(games: Game[]) {
        this._games = games;
        this.onGameTitleChanged(this._titleEntry);
        this.onInstallDirChanged(this._installDirEntry);
    }

    public clear() {
        this._titleEntry.set_text('');
        this._installDirEntry.set_text('');
        this._nexusGroup.set_sensitive(false);
        this._nexusIdEntry.set_text('');
        this._steamGroup.set_sensitive(false);
        this._steamAppIdEntry.set_text('');
        this._steamCompatdataDirEntry.set_text('');
    }

    private onPresetSelected(_: Adw.ComboRow, __: any) {
        let index = this._presetSelector.get_selected();
        if (index === 0) {
            return;
        }
        index--;
        const preset = this._presets[index];
        this._titleEntry.set_text(preset.name);
        this._installDirEntry.set_text(preset.json.installDir || '');
        if (preset.json.nexus) {
            this._nexusSwitch.set_state(true);
            this._nexusIdEntry.set_text(preset.json.nexus.id);
        } else {
            this._nexusSwitch.set_state(false);
        }
        if (preset.json.steam) {
            this._steamSwitch.set_state(true);
            this._steamAppIdEntry.set_text(preset.json.steam.appid);
            this._steamCompatdataDirEntry.set_text(preset.json.steam.compatdataDir || '');
        } else {
            this._steamSwitch.set_state(false);
        }
    }

    private onGameTitleChanged(row: Adw.EntryRow) {
        const title = row.get_text().trim();
        const checkChars = !DISALLOW_CHARS.reduce((ret, char) => ret || title.includes(char), false);
        const checkLength = title.length > 0;
        const checkUnique = !this._games.map(game => game.name).includes(title);
        this._validatedTitle = checkChars && checkLength && checkUnique;
        this.emit('validated', this._validatedTitle, this._validatedInstallDir);
    }

    private onInstallDirChanged(row: DirectoryEntryRow) {
        const installDir = row.get_text();
        const checkExists = Gio.File.new_for_path(installDir).query_exists(null);
        const checkUnique = !this._games.map(game => game.installDir).includes(installDir);
        this._validatedInstallDir = checkExists && checkUnique;
        this.emit('validated', this._validatedTitle, this._validatedInstallDir);
    }

    private onNexusIDChanged(_: Adw.EntryRow) {
        // TODO
    }

    private onSteamAppIDChanged(_: Adw.EntryRow) {
        // TODO
    }

    private onSteamCompatdataDirChanged(_: DirectoryEntryRow) {
        // TODO
    }
}