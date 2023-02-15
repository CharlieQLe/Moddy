import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';

export class ProfileCreateWindow extends Adw.Window {
    private _profileNameEntry!: Adw.EntryRow;

    private _canCreate!: boolean;

    private _game: Game;

    static {
        GObject.registerClass({
            GTypeName: 'ProfileCreateWindow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/profile-create-window.ui',
            InternalChildren: ['profileNameEntry'],
            Properties: {
                'canCreate': GObject.ParamSpec.boolean('canCreate', 'Can create', 'Can create', GObject.ParamFlags.READWRITE, false),
            },
            Signals: {
                'create-profile': {
                    param_types: [GObject.TYPE_STRING],
                },
            }
        }, this);
    }

    constructor(game: Game, transientFor: Gtk.Window) {
        super({
            transientFor: transientFor,
            modal: true,
        });
        this._game = game;
    }

    public get canCreate() {
        return this._canCreate || false;
    }

    public set canCreate(canCreate: boolean) {
        this._canCreate = canCreate;
        this.notify('canCreate');
    }

    private onCancelClicked(_: Gtk.Button) {
        this.destroy();
    }

    private onCreateClicked(_: Gtk.Button) {
        this.emit('create-profile', this._profileNameEntry.get_text())
        this.destroy();
    }

    private onProfileNameChanged(entry: Adw.EntryRow) {
        const name = entry.get_text().trim();
        this.canCreate = name.length > 0 && !(name in this._game.profiles);
    }
}