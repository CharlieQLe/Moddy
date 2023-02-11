import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { AddGameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/addGameView.js';
import { HomeView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/homeView.js';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

export class Window extends Adw.ApplicationWindow {
    private _toastOverlay!: Adw.ToastOverlay;
    private _leaflet!: Adw.Leaflet;
    private _homeView!: HomeView;
    private _addGameView!: AddGameView;

    private _addGameAction: Gio.SimpleAction;

    static {
        GObject.registerClass({
            GTypeName: 'Window',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/window.ui',
            InternalChildren: ['toastOverlay', 'leaflet', 'homeView', 'addGameView'],
        }, this);
    }

    constructor(application: Adw.Application) {
        super({ application });

        // Add actions
        const actionGroup = Gio.SimpleActionGroup.new();
        this.insert_action_group('window', actionGroup);
        const changeViewAction = Gio.SimpleAction.new('change-view', GLib.VariantType.new('s'));
        changeViewAction.connect('activate', this.changeViewActivate.bind(this));
        actionGroup.insert(changeViewAction);
        this._addGameAction = Gio.SimpleAction.new('add-game', null);
        this._addGameAction.set_enabled(false);
        this._addGameAction.connect('activate', this.addGameActivate.bind(this));
        actionGroup.insert(this._addGameAction);

        // Load game files
        const configFile = Gio.File.new_for_path(Utility.getConfigDir());
        const enumerator = configFile.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
        while (true) {
            const info = enumerator.next_file(null);
            if (!info) {
                break;
            }
            const filename = info.get_name();
            if (info.get_file_type() === Gio.FileType.REGULAR && filename.endsWith('.json')) {
                const game = Game.load(filename.substring(0, filename.length - 5));
                if (game) {
                    this.addGame(game);
                }
            }
        }
    }

    public addGame(game: Game) {
        // TODO: add game widgets
    }

    private changeViewActivate(_: Gio.SimpleAction, pagename: GLib.Variant<string>) {
        const name = pagename.unpack() as string;
        const child = this._leaflet.get_child_by_name(name);
        if (child) {
            this._leaflet.set_visible_child(child);
        } else {
            this._toastOverlay.add_toast(Adw.Toast.new(`Page ${name} not found!`));
        }
    }

    private addGameActivate(_: Gio.SimpleAction, __: null) {
        // TODO: Implement adding a game
    }
}