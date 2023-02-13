import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { Mod } from 'resource:///io/github/charlieqle/Moddy/js/config.js';
import { GameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/gameView.js';
import { ActionHandler } from 'resource:///io/github/charlieqle/Moddy/js/actionHandler.js';

export class ModRow extends Adw.ActionRow {
    private _modToggle!: Gtk.Switch;

    private _mod!: Mod;
    private _view!: GameView;

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

    constructor(mod: Mod, view: GameView) {
        super({
            title: mod.name
        });
        this._mod = mod;
        this._view = view;

        const actionHandler = new ActionHandler('mod', this);
        actionHandler.addAction('move-up', null, this.onMoveUpAction.bind(this));
        actionHandler.addAction('move-down', null, this.onMoveDownAction.bind(this));
        actionHandler.addAction('uninstall', null, this.onUninstallAction.bind(this));
    }

    public get mod() {
        return this._mod || new Mod('');
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

    private onUninstallAction(_: Gio.SimpleAction) {
        this._view.modUninstall(this);
    }
}