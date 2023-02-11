import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { ModRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/modRow.js';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/config.js';
import { GameRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/gameRow.js';

export class GameView extends Gtk.Box {
    private _profileSelector!: Adw.ComboRow;
    private _modsGroup!: Adw.PreferencesGroup;
    private _installModChooser!: Gtk.FileChooserNative;
    private _deploySwitch!: Gtk.Switch;

    private _title!: string;
    private _hasMods!: boolean;

    private _window: Gtk.Window;
    private _game: Game;
    private _rows: GameRow[];
    private _toastOverlay: Adw.ToastOverlay;

    static {
        GObject.registerClass({
            GTypeName: 'GameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/game-view.ui',
            InternalChildren: ['profileSelector', 'modsGroup', 'installModChooser', 'deploySwitch'],
            Properties: {
                'title': GObject.ParamSpec.string('title', 'Title', 'Window title', GObject.ParamFlags.READWRITE, ''),
                'hasMods': GObject.ParamSpec.boolean('hasMods', 'Has mods', 'Has mods', GObject.ParamFlags.READWRITE, false),
            },
        }, this);
    }

    constructor(game: Game, window: Gtk.Window, toastOverlay: Adw.ToastOverlay) {
        super();
        this._game = game;
        this._window = window;
        this._toastOverlay = toastOverlay;
        this._rows = [];
        this.title = game.name;

        // Select profile
        const selectedProfile = game.profiles[game.json.selectedProfile];
        const list = this._profileSelector.model as Gtk.StringList;
        let i = 0;
        for (const [name, profile] of Object.entries(game.profiles)) {
            list.append(name);
            if (profile === selectedProfile) {
                this._profileSelector.set_selected(i);
            }
            i++;
        }

        // Handle mods
        this.refreshMods();

        // Handle deployment
        this._deploySwitch.set_state(this._game.isDeployed);
    }

    public get title() {
        return this._title || '';
    }

    public set title(title: string) {
        this._title = title;
        this.notify('title');
    }

    public get hasMods() {
        return this._hasMods || false;
    }

    public set hasMods(hasMods: boolean) {
        this._hasMods = hasMods;
        this.notify('hasMods');
    }

    public modMoveUp(row: ModRow) {
        // TODO
    }

    public modMoveDown(row: ModRow) {
        // TODO
    }

    public modUninstall(row: ModRow) {
        const dialog = Adw.MessageDialog.new(this._window, `Uninstall ${row.mod.name}?`, 'This action cannot be undone!');
        dialog.add_response('cancel', 'Cancel');
        dialog.add_response('uninstall', 'Uninstall');
        dialog.set_response_appearance('uninstall', Adw.ResponseAppearance.DESTRUCTIVE);
        dialog.connect('response', (_: Adw.MessageDialog, response: string) => {
            if (response === 'uninstall' && this._game.uninstallMod(row.mod)) {
                this._modsGroup.remove(row);
                this.hasMods = this._game.mods.length > 0;
            }
        });
        dialog.show();
    }

    private refreshMods() {
        // Clear rows
        this._rows.forEach(row => {
            this._modsGroup.remove(row);
        });
        this._rows = [];

        // Add mods
        const profileName = (this._profileSelector.model as Gtk.StringList).get_string(this._profileSelector.get_selected()) || 'Default';
        const profile = this._game.profiles[profileName];
        const enabledMods = this._game.getEnabledModsForProfile(profileName);
        this.hasMods = this._game.mods.length > 0;
        this._game.mods.forEach(mod => {
            const row = new ModRow(mod, this);
            row.setModState(profile.json.enabledMods.includes(mod.name));
            row.connect('state-updated', (_: ModRow, __: boolean) => {
                if (mod.enabled && !enabledMods.includes(mod)) {
                    profile.json.enabledMods.push(mod.name);
                    this._game.saveProfile(profile.name);
                } else if (!mod.enabled && enabledMods.includes(mod)) {
                    profile.json.enabledMods = profile.json.enabledMods.filter(name => name !== mod.name);
                    this._game.saveProfile(profile.name);
                }
            });
            this._modsGroup.add(row);
            this._rows.push(row);
        });
    }

    private onProfileSelected(_: Adw.ComboRow, __: any) {
        this.refreshMods();
    }

    private onInstallModClicked(_: Gtk.Button) {
        this._installModChooser.show();
    }

    private onInstallModResponse(chooser: Gtk.FileChooserNative, response: Gtk.ResponseType) {
        if (response === Gtk.ResponseType.ACCEPT) {
            const file = chooser.get_file();
            if (file) {
                const ok = this._game.installModFromFile(file);
                if (ok) {
                    this.refreshMods();
                }
            }
        }
    }

    private onDeployStateSet(_: Gtk.Switch, __: any) {
        if (this._deploySwitch.get_active()) {
            this._game.deploy();
            if (!this._game.isDeployed) {
                this._deploySwitch.set_active(false);
                if (this._toastOverlay) {
                    this._toastOverlay.add_toast(Adw.Toast.new('Could not deploy mods!'));
                }
            }
        } else if (this._game.isDeployed) {
            this._game.purge();
        }
    }
}