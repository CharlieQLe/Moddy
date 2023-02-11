import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { ModRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/modRow.js';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/config.js';
import { GameRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/gameRow.js';

export class GameView extends Gtk.Box {
    private _profileSelector!: Adw.ComboRow;
    private _modsGroup!: Adw.PreferencesGroup;

    private _title!: string;
    private _hasMods!: boolean;

    private _game: Game;
    private _rows: GameRow[];

    static {
        GObject.registerClass({
            GTypeName: 'GameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/game-view.ui',
            InternalChildren: ['profileSelector', 'modsGroup'],
            Properties: {
                'title': GObject.ParamSpec.string('title', 'Title', 'Window title', GObject.ParamFlags.READWRITE, ''),
                'hasMods': GObject.ParamSpec.boolean('hasMods', 'Has mods', 'Has mods', GObject.ParamFlags.READWRITE, false),
            },
        }, this);
    }

    constructor(game: Game) {
        super();
        this._game = game;
        this._rows = [];
        this.title = game.name;

        // Select profile
        const selectedProfile = game.profiles[game.json.selectedProfile];
        const list = this._profileSelector.model as Gtk.StringList;
        let i = 0;
        for (const [name, profile] of Object.entries(game.profiles)) {
            list.append(name);
            if (profile === selectedProfile) {
                this._profileSelector.set_selected(i);
            }
            i++;
        }

        // Handle mods
        this.refreshMods();
    }

    public get title() {
        return this._title || '';
    }

    public set title(title: string) {
        this._title = title;
        this.notify('title');
    }

    public get hasMods() {
        return this._hasMods || false;
    }

    public set hasMods(hasMods: boolean) {
        this._hasMods = hasMods;
        this.notify('hasMods');
    }

    private refreshMods() {
        // Clear rows
        this._rows.forEach(row => {
            this._modsGroup.remove(row);
        });
        this._rows = [];

        // Add mods
        const list = this._profileSelector.model as Gtk.StringList;
        const profileName = list.get_string(this._profileSelector.get_selected()) || 'Default';
        const profile = this._game.profiles[profileName];
        this.hasMods = this._game.mods.length > 0;
        this._game.mods.forEach(mod => {
            const row = new ModRow(mod);
            row.setModState(profile.json.enabledMods.includes(mod.name));
            row.connect('state-updated', (_: ModRow, __: boolean) => {
                if (mod.enabled && !profile.json.enabledMods.includes(mod.name)) {
                    profile.json.enabledMods.push(mod.name);
                    this._game.saveProfile(profile.name);
                } else if (!mod.enabled && profile.json.enabledMods.includes(mod.name)) {
                    profile.json.enabledMods = profile.json.enabledMods.filter(name => name !== mod.name);
                    this._game.saveProfile(profile.name);
                }
            });
            this._modsGroup.add(row);
            this._rows.push(row);
        });
    }

    private onProfileSelected(_: Adw.ComboRow, __: any) {
        //
    }

    private onInstallModClicked(_: Gtk.Button) {
        //
    }
}