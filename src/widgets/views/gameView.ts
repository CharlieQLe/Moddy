import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { Game, Profile } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class GameView extends Gtk.Box {
    private _profileSelector!: Adw.ComboRow;

    private _title!: string;

    private _game: Game;
    private _profiles: Profile[];

    static {
        GObject.registerClass({
            GTypeName: 'GameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/game-view.ui',
            InternalChildren: ['profileSelector'],
            Properties: {
                'title': GObject.ParamSpec.string('title', 'Title', 'Window title', GObject.ParamFlags.READWRITE, ''),
            },
        }, this);
    }

    constructor(game: Game) {
        super();
        this._game = game;
        this._profiles = [];
        this.title = game.name;
        const list = this._profileSelector.model as Gtk.StringList;
        for (const [name, profile] of Object.entries(game.profiles)) {
            list.append(name);
            this._profiles.push(profile);
        }
    }

    public get title() {
        return this._title || '';
    }

    public set title(title: string) {
        this._title = title;
        this.notify('title');
    }

    private onProfileSelected(_: Adw.ComboRow, __: any) {
        //
    }
}