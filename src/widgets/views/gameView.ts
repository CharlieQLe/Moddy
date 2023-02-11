import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { Game } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class GameView extends Gtk.Box {
    private _title!: string;

    private _game: Game;

    static {
        GObject.registerClass({
            GTypeName: 'GameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/game-view.ui',
            Properties: {
                'title': GObject.ParamSpec.string('title', 'Title', 'Window title', GObject.ParamFlags.READWRITE, ''),
            },
        }, this);
    }

    constructor(game: Game) {
        super();
        this._game = game;
        this.title = game.name;
    }

    public get title() {
        return this._title || '';
    }

    public set title(title: string) {
        this._title = title;
        this.notify('title');
    }
}