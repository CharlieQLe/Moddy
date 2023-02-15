import GObject from 'gi://GObject';

import { Game } from 'resource:///io/github/charlieqle/Moddy/js/backend/game.js';

export class Mod extends GObject.Object {
    private _name: string;
    private _game: Game;
    private _enabled: boolean;

    static {
        GObject.registerClass({
            GTypeName: 'Mod',
            Properties: {
                'name': GObject.ParamSpec.string(
                    'name',
                    'Name',
                    'Name',
                    GObject.ParamFlags.READWRITE,
                    ''
                ),
                'enabled': GObject.ParamSpec.boolean(
                    'enabled',
                    'Enabled',
                    'Enabled',
                    GObject.ParamFlags.READWRITE,
                    false
                )
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
        this._enabled = false;
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

    public get enabled() {
        return this._enabled || false;
    }

    public set enabled(enabled: boolean) {
        this._enabled = enabled;
        this.notify('enabled');
    }
}