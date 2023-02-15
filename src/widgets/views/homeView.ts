import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { GameRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/gameRow.js';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';

export class HomeView extends Gtk.Box {
    private _gamesGroup!: Adw.PreferencesGroup;
    private _hasGames!: boolean;

    static {
        GObject.registerClass({
            GTypeName: 'HomeView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/home-view.ui',
            InternalChildren: ['gamesGroup'],
            Properties: {
                'hasGames': GObject.ParamSpec.boolean('hasGames', 'Has games', 'Has games', GObject.ParamFlags.READWRITE, false),
            },
        }, this);
    }

    constructor() {
        super();
    }

    public get hasGames() {
        return this._hasGames || false;
    }

    public set hasGames(hasGames: boolean) {
        this._hasGames = hasGames;
        this.notify('hasGames');
    }

    public addGame(game: Game) {
        this._gamesGroup.add(new GameRow(game));
        this.hasGames = true;
    }
}