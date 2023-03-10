import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ModRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/modRow.js';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';
import { Profile } from 'resource:///io/github/charlieqle/Moddy/js/backend/profile.js';
import { GameRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/gameRow.js';
import { ProfileCreateWindow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/profileCreateWindow.js';
import { ProfilePreferencesWindow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/profilePreferencesWindow.js';
import { ActionHandler } from 'resource:///io/github/charlieqle/Moddy/js/actionHandler.js';
import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

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
    private _profileActionHandler: ActionHandler;

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

        // Profile actions
        this._profileActionHandler = new ActionHandler('profile', this);
        this._profileActionHandler.addAction('create', null, this.onProfileCreateAction.bind(this));
        this._profileActionHandler.addAction('settings', null, this.onProfileSettingsAction.bind(this));
        this._profileActionHandler.addAction('delete', null, this.onProfileDeleteAction.bind(this));

        // Select profile
        const selectedProfile = game.selectedProfile;
        if (!selectedProfile) {
            throw new Error('Profile doesn\'t exist!');
        }

        const list = this._profileSelector.model as Gtk.StringList;
        let i = 0;
        for (const profile of game.profiles) {
            list.append(profile.name);
            if (profile === selectedProfile) {
                this._profileSelector.set_selected(i);
            }
            i++;
        }
        const action = this._profileActionHandler.getAction('delete');
        if (action) {
            action.set_enabled(list.get_n_items() > 1);
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

    public get selectedProfile() {
        const profileName = (this._profileSelector.model as Gtk.StringList).get_string(this._profileSelector.get_selected());
        const [,, profile] = Utility.modelFind(this._game.profiles, profile => profile.name === profileName);
        return profile;
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
                this._rows.splice(this._rows.indexOf(row), 1);
                this._modsGroup.remove(row);
                this.hasMods = this._game.mods.get_n_items() > 0;
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
        const profile = this.selectedProfile;
        if (!profile) {
            return; // TODO: print error
        }
        this.hasMods = this._game.mods.get_n_items() > 0;
        for (const mod of this._game.mods) {
            const row = new ModRow(mod, this._game, this._window, this);
            row.setModState(mod.enabled);
            this._modsGroup.add(row);
            this._rows.push(row);
        }
    }

    private onProfileSelected(_: Adw.ComboRow, __: any) {
        const profile = this.selectedProfile;
        if (!profile) {
            return; // TODO: print error
        }
        this._game.selectedProfileName = profile.name;
        this._game.save();
        this.refreshMods();
    }

    private onInstallModClicked(_: Gtk.Button) {
        this._installModChooser.show();
    }

    private onInstallModResponse(chooser: Gtk.FileChooserNative, response: Gtk.ResponseType) {
        if (response === Gtk.ResponseType.ACCEPT) {
            const file = chooser.get_file();
            if (file) {
                const ok = this._game.installMod(file);
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

    private onProfileCreateAction(_: Gio.SimpleAction) {
        const window = new ProfileCreateWindow(this._game, this._window);
        window.connect('create-profile', (_: ProfileCreateWindow, name: string) => {
            this._game.addProfile(new Profile(name, this._game));
            (this._profileSelector.model as Gtk.StringList).append(name);
            const action = this._profileActionHandler.getAction('delete');
            if (action) {
                action.set_enabled(true);
            }
        });
        window.show();
    }

    private onProfileSettingsAction(_: Gio.SimpleAction) {
        const profile = this.selectedProfile;
        if (!profile) {
            return; // TODO: print error
        }
        const window = new ProfilePreferencesWindow(profile, this._game, this._window);
        window.connect('save-profile', (_: ProfilePreferencesWindow, name: string) => {
            profile.name = name;
            const index = this._profileSelector.get_selected();
            const list = (this._profileSelector.model as Gtk.StringList);
            list.splice(index, 1, null);
            list.splice(index, 0, [name]);
            this._profileSelector.set_selected(index);
        });
        window.show();
    }

    private onProfileDeleteAction(_: Gio.SimpleAction) {
        const profile = this.selectedProfile;
        if (!profile) {
            return; // TODO: print error
        }
        const dialog = Adw.MessageDialog.new(this._window, `Remove profile ${profile.name}?`, 'This action cannot be undone!');
        dialog.add_response('cancel', 'Cancel');
        dialog.add_response('remove', 'Remove');
        dialog.set_response_appearance('remove', Adw.ResponseAppearance.DESTRUCTIVE);
        dialog.connect('response', (_: Adw.MessageDialog, response: string) => {
            if (response === 'remove' && this._game.removeProfile(profile)) {
                let index = this._profileSelector.get_selected();
                const list = (this._profileSelector.model as Gtk.StringList);
                list.splice(index, 1, null);
                if (index >= list.get_n_items()) {
                    index = list.get_n_items() - 1;
                }
                this._profileSelector.set_selected(index);
                const action = this._profileActionHandler.getAction('delete');
                if (action) {
                    action.set_enabled(list.get_n_items() > 1);
                }
            }
        });
        dialog.show();
    }
}