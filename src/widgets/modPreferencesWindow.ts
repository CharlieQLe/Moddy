import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';
import { Mod } from 'resource:///io/github/charlieqle/Moddy/js/backend/mod.js';
import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

export class ModPreferencesWindow extends Adw.Window {
    private _modNameEntry!: Adw.EntryRow;

    private _title!: string;
    private _canSave!: boolean;

    private _mod: Mod;
    private _game: Game;

    static {
        GObject.registerClass({
            GTypeName: 'ModPreferencesWindow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/mod-preferences-window.ui',
            InternalChildren: ['modNameEntry'],
            Properties: {
                'title': GObject.ParamSpec.string('title', 'Title', 'Title', GObject.ParamFlags.READWRITE, ''),
                'canSave': GObject.ParamSpec.boolean('canSave', 'Can save', 'Can save', GObject.ParamFlags.READWRITE, false),
            },
        }, this);
    }

    constructor(mod: Mod, game: Game, transientFor: Gtk.Window) {
        super({
            transientFor: transientFor,
            modal: true,
        });
        this._mod = mod;
        this._game = game;
        this.title = `${mod.name} settings`;
        this._modNameEntry.set_text(mod.name);
    }

    public get title() {
        return this._title || '';
    }

    public set title(title: string) {
        this._title = title;
        this.notify('title');
    }

    public get canSave() {
        return this._canSave || false;
    }

    public set canSave(canSave: boolean) {
        this._canSave = canSave;
        this.notify('canSave');
    }

    private onCancelClicked(_: Gtk.Button) {
        this.destroy();
    }

    private onSaveClicked(_: Gtk.Button) {
        this._mod.name = this._modNameEntry.get_text().trim();
        this.destroy();
    }

    private onModNameChanged(entry: Adw.EntryRow) {
        const newName = entry.get_text().trim();
        const [hasDuplicate] = Utility.modelFind(this._game.mods, mod => mod.name === newName);
        this.canSave = newName.length > 0 && newName !== this._mod.name && !hasDuplicate;
    }
}