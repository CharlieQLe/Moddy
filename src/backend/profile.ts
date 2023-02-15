import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';

export class Profile extends GObject.Object {
    private _name: string;
    private _game: Game;
    private _modOrder: string[];
    private _enabledMods: string[];

    static {
        GObject.registerClass({
            GTypeName: 'Profile',
            Properties: {
                'name': GObject.ParamSpec.string(
                    'name',
                    'Name',
                    'Name',
                    GObject.ParamFlags.READWRITE,
                    ''
                ),
            },
            Signals: {
                'renamed': {
                    param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING],
                },
            },
        }, this);
    }

    public constructor(name: string, game: Game) {
        super();
        this._name = name;
        this._game = game;
        this._modOrder = [];
        this._enabledMods = [];
    }

    public get name() {
        return this._name || '';
    }

    public set name(name: string) {
        const oldName = this.name;
        this._name = name;
        this.notify('name');
        this.emit('renamed', oldName, name);
    }

    public get game() {
        return this._game;
    }

    public get modOrder() {
        return this._modOrder;
    }

    public get enabledMods() {
        return this._enabledMods;
    }

    public save() {
        const file = Gio.File.new_for_path(GLib.build_filenamev([this.game.dataDir, 'profiles', `${this.name}.json`]));
        const contents = new TextEncoder().encode(JSON.stringify({
            modOrder: this.modOrder,
            enabledMods: this.enabledMods,
        }, null, 4));
        if (file.query_exists(null)) {
            file.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
        } else {
            const stream = file.create(Gio.FileCreateFlags.NONE, null);
            stream.write_all(contents, null);
        }
    }
}