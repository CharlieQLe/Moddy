import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { ModRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/modRow.js';
import { Game, Profile, Mod } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class GameView extends Gtk.Box {
    private _profileSelector!: Adw.ComboRow;
    private _modsGroup!: Adw.PreferencesGroup;

    private _title!: string;
    private _hasMods!: boolean;

    private _game: Game;
    private _profiles: Profile[];

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
        this._profiles = [];
        this.title = game.name;
        const list = this._profileSelector.model as Gtk.StringList;
        for (const [name, profile] of Object.entries(game.profiles)) {
            list.append(name);
            this._profiles.push(profile);
        }
        const selectedProfile = game.profiles[game.json.selectedProfile];
        const index = this._profiles.indexOf(selectedProfile);
        this._profileSelector.set_selected(index);
        this.hasMods = game.mods.length > 0;
        game.mods.forEach(mod => {
            const row = new ModRow(mod);
            this._modsGroup.add(row);
            row.setModState(selectedProfile.json.enabledMods.includes(mod.name));
            mod.connect('notify::enabled', (_: Mod, __: GObject.ParamSpec<boolean>) => {
                if (mod.enabled && !selectedProfile.json.enabledMods.includes(mod.name)) {
                    selectedProfile.json.enabledMods.push(mod.name);
                } else if (!mod.enabled && selectedProfile.json.enabledMods.includes(mod.name)) {
                    selectedProfile.json.enabledMods = selectedProfile.json.enabledMods.filter(name => name !== mod.name);
                }
                game.saveProfile(selectedProfile.name);
            });
        });
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

    private onProfileSelected(_: Adw.ComboRow, __: any) {
        //
    }

    private onInstallModClicked(_: Gtk.Button) {
        //
    }
}