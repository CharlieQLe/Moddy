import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';
import { Mod } from 'resource:///io/github/charlieqle/Moddy/js/backend/mod.js';
import { GameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/gameView.js';
import { ModPreferencesWindow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/modPreferencesWindow.js';
import { ActionHandler } from 'resource:///io/github/charlieqle/Moddy/js/actionHandler.js';

export class ModRow extends Adw.ActionRow {
    private _modToggle!: Gtk.Switch;

    private _mod!: Mod;
    private _view!: GameView;

    private _game: Game;
    private _window: Gtk.Window;

    static {
        GObject.registerClass({
            GTypeName: 'ModRow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/mod-row.ui',
            InternalChildren: ['modToggle'],
            Properties: {
                'mod': GObject.ParamSpec.object('mod', 'Mod', 'Mod', GObject.ParamFlags.READABLE, Mod),
            },
            Signals: {
                'state-updated': {
                    param_types: [GObject.TYPE_BOOLEAN],
                },
            }
        }, this);
    }

    constructor(mod: Mod, game: Game, window: Gtk.Window, view: GameView) {
        super({
            title: mod.name,
        });
        this._game = game;
        this._mod = mod;
        this._view = view;
        this._window = window;

        const actionHandler = new ActionHandler('mod', this);
        actionHandler.addAction('move-up', null, this.onMoveUpAction.bind(this));
        actionHandler.addAction('move-down', null, this.onMoveDownAction.bind(this));
        actionHandler.addAction('settings', null, this.onSettingsAction.bind(this));
        actionHandler.addAction('uninstall', null, this.onUninstallAction.bind(this));

        this._mod.connect('notify::name', (_: Mod, __: any) => {
            this.set_title(mod.name);
        });
    }

    public get mod() {
        return this._mod;
    }

    public setModState(state: boolean) {
        this._modToggle.set_state(state);
    }

    private onModStateSet(_: Gtk.Switch, state: boolean) {
        this._mod.enabled = state;
        this.emit('state-updated', this._mod.enabled);
    }

    private onMoveUpAction(_: Gio.SimpleAction) {
        this._view.modMoveUp(this);
    }

    private onMoveDownAction(_: Gio.SimpleAction) {
        this._view.modMoveDown(this);
    }

    private onSettingsAction(_: Gio.SimpleAction) {
        const window = new ModPreferencesWindow(this._mod, this._game, this._window);
        window.show();
    }

    private onUninstallAction(_: Gio.SimpleAction) {
        this._view.modUninstall(this);
    }
}