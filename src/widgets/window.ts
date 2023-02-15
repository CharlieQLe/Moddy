import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { AddGameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/addGameView.js';
import { GameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/gameView.js';
import { HomeView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/homeView.js';
import { Game, loadGames } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';
import { ActionHandler } from 'resource:///io/github/charlieqle/Moddy/js/actionHandler.js';

export class Window extends Adw.ApplicationWindow {
    private _toastOverlay!: Adw.ToastOverlay;
    private _leaflet!: Adw.Leaflet;
    private _homeView!: HomeView;
    private _addGameView!: AddGameView;

    private _actionHandler : ActionHandler;
    private _games: Game[];

    static {
        GObject.registerClass({
            GTypeName: 'Window',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/window.ui',
            InternalChildren: ['toastOverlay', 'leaflet', 'homeView', 'addGameView'],
        }, this);
    }

    constructor(application: Adw.Application) {
        super({ application });

        // Add actions
        this._actionHandler = new ActionHandler('window', this);
        this._actionHandler.addAction('change-view', GLib.VariantType.new('s'), this.changeViewActivate.bind(this));
        this._actionHandler.addAction('add-game', null, this.addGameActivate.bind(this));
        const addGameAction = this._actionHandler.getAction('add-game');
        if (addGameAction) {
            addGameAction.set_enabled(false);
        }

        // Load game files
        this._games = [];
        loadGames().forEach(game => {
            this.addGame(game);
        });

        // Send games
        this._addGameView.setGames(this._games);
    }

    public addGame(game: Game) {
        this._games.push(game);
        this._homeView.addGame(game);
        this._leaflet.append(new GameView(game, this, this._toastOverlay))
            .set_name(`game-${game.name}`);
    }

    private changeViewActivate(_: Gio.SimpleAction, pagename: GLib.Variant<string>) {
        const name = pagename.unpack() as string;
        const child = this._leaflet.get_child_by_name(name);
        if (child) {
            this._leaflet.set_visible_child(child);
        } else {
            this._toastOverlay.add_toast(Adw.Toast.new(`Page ${name} not found!`));
        }
    }

    private addGameActivate(_: Gio.SimpleAction) {
        const game = this._addGameView.createGame();
        const preset = this._addGameView.selectedPreset;
        if (preset) {
            game.relativeModTarget = preset.json.relativeModPath || '';
        }
        this.addGame(game);
        game.save();
        this._leaflet.set_visible_child_name(`game-${game.name}`);
        this._addGameView.clear();
        log(`Added ${game.name}!`);
    }

    private onAddGameValidated(_: AddGameView, validatedTitle: boolean, validatedInstallDir: boolean) {
        const addGameAction = this._actionHandler.getAction('add-game');
        if (addGameAction) {
            addGameAction.set_enabled(validatedTitle && validatedInstallDir);
        }
    }
}