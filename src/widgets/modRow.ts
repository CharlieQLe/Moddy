import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { Mod } from 'resource:///io/github/charlieqle/Moddy/js/config.js';
import { GameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/gameView.js';

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

        const actionGroup = Gio.SimpleActionGroup.new();
        this.insert_action_group('mod', actionGroup);

        const moveUpAction = Gio.SimpleAction.new('move-up', null);
        moveUpAction.connect('activate', (_: Gio.SimpleAction, __: null) => {
            view.modMoveUp(this);
        });
        actionGroup.insert(moveUpAction);

        const moveDownAction = Gio.SimpleAction.new('move-down', null);
        moveDownAction.connect('activate', (_: Gio.SimpleAction, __: null) => {
            view.modMoveDown(this);
        });
        actionGroup.insert(moveDownAction);

        const uninstallAction = Gio.SimpleAction.new('uninstall', null);
        uninstallAction.connect('activate', (_: Gio.SimpleAction, __: null) => {
            view.modUninstall(this);
        });
        actionGroup.insert(uninstallAction);
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
}