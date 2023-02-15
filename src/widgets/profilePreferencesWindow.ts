import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';
import { Profile } from 'resource:///io/github/charlieqle/Moddy/js/backend/profile.js';
import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

export class ProfilePreferencesWindow extends Adw.Window {
    private _profileNameEntry!: Adw.EntryRow;

    private _title!: string;
    private _canSave!: boolean;

    private _profile: Profile;
    private _game: Game;

    static {
        GObject.registerClass({
            GTypeName: 'ProfilePreferencesWindow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/profile-preferences-window.ui',
            InternalChildren: ['profileNameEntry'],
            Properties: {
                'title': GObject.ParamSpec.string('title', 'Title', 'Title', GObject.ParamFlags.READWRITE, ''),
                'canSave': GObject.ParamSpec.boolean('canSave', 'Can save', 'Can save', GObject.ParamFlags.READWRITE, false),
            },
            Signals: {
                'save-profile': {
                    param_types: [GObject.TYPE_STRING],
                },
            }
        }, this);
    }

    constructor(profile: Profile, game: Game, transientFor: Gtk.Window) {
        super({
            transientFor: transientFor,
            modal: true,
        });
        this._profile = profile;
        this._game = game;
        this.title = `${profile.name} settings`;
        this._profileNameEntry.set_text(profile.name);
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
        this.emit('save-profile', this._profileNameEntry.get_text())
        this.destroy();
    }

    private onProfileNameChanged(entry: Adw.EntryRow) {
        const newName = entry.get_text().trim();
        const [hasDuplicate] = Utility.modelFind(this._game.profiles, profile => profile.name === newName);
        this.canSave = newName.length > 0 && newName !== this._profile.name && !hasDuplicate;
    }
}