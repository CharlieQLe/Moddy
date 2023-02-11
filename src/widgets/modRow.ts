import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { Mod } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class ModRow extends Adw.ActionRow {
    private _modToggle!: Gtk.Switch;

    private _mod!: Mod;

    static {
        GObject.registerClass({
            GTypeName: 'ModRow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/mod-row.ui',
            InternalChildren: ['modToggle'],
            Properties: {
                'mod': GObject.ParamSpec.object('mod', 'Mod', 'Mod', GObject.ParamFlags.READWRITE, Mod),
            },
        }, this);
    }

    constructor(mod: Mod) {
        super({
            title: mod.name
        });
        this._mod = mod;
    }

    public get mod() {
        return this._mod || new Mod('');
    }

    public set mod(mod: Mod) {
        this._mod = mod;
        this.notify('mod');
    }

    public setModState(state: boolean) {
        this._modToggle.set_state(state);
    }

    private onModStateSet(_: Gtk.Switch, state: boolean) {
        this._mod.enabled = state;
    }
}