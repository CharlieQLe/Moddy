import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Gio from 'gi://Gio';

import { DirectoryEntryRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/directoryEntryRow.js';
import { Game, GameJson, Profile, getDefaultProfileJson } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class AddGameView extends Gtk.Box {
    private _presetSelector!: Adw.ComboRow;
    private _baseGroup!: Adw.PreferencesGroup;
    private _titleEntry!: Adw.EntryRow;
    private _installDirEntry!: DirectoryEntryRow;
    private _nexusGroup!: Adw.PreferencesGroup;
    private _nexusIdEntry!: Adw.EntryRow;
    private _steamGroup!: Adw.PreferencesGroup;
    private _steamAppIdEntry!: Adw.EntryRow;
    private _steamCompatdataDirEntry!: DirectoryEntryRow;

    private _games: Game[];
    private _validatedTitle: boolean;
    private _validatedInstallDir: boolean;

    static {
        GObject.registerClass({
            GTypeName: 'AddGameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/add-game-view.ui',
            InternalChildren: ['presetSelector', 'baseGroup', 'titleEntry', 'installDirEntry', 'nexusGroup',
                'nexusIdEntry', 'steamGroup', 'steamAppIdEntry', 'steamCompatdataDirEntry'],
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
    }

    public createGame(): Game {
        const json: GameJson = {
            installDir: this._installDirEntry.get_text(),
            relativeModPath: "",
            selectedProfile: "Default",
        };
        if (this._nexusGroup.get_sensitive()) {
            json.nexus = {
                id: this._nexusIdEntry.get_text(),
            };
        }
        if (this._steamGroup.get_sensitive()) {
            json.steam = {
                appid: this._steamAppIdEntry.get_text(),
                compatdataDir: this._steamCompatdataDirEntry.get_text(),
            };
        }
        const game = new Game(this._titleEntry.get_text(), json);
        game.profiles.Default = new Profile('Default', getDefaultProfileJson());
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
        const index = this._presetSelector.get_selected();
        if (index === 0) {
            this._baseGroup.set_sensitive(true);
        } else {
            this._baseGroup.set_sensitive(false);
            // TODO: Handle selected preset
        }
    }

    private onGameTitleChanged(row: Adw.EntryRow) {
        const title = row.get_text().trim();
        const checkLength = title.length > 0;
        const checkUnique = !this._games.map(game => game.name).includes(title);
        this._validatedTitle = checkLength && checkUnique;
        this.emit('validated', this._validatedTitle, this._validatedInstallDir);
    }

    private onInstallDirChanged(row: DirectoryEntryRow) {
        const installDir = row.get_text();
        const checkExists = Gio.File.new_for_path(installDir).query_exists(null);
        const checkUnique = !this._games.map(game => game.json.installDir).includes(installDir);
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