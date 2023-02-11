import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import { Game } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class GameRow extends Adw.ActionRow {
    static {
        GObject.registerClass({
            GTypeName: 'GameRow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/game-row.ui',
        }, this);
    }

    constructor(game: Game) {
        super({
            title: game.name
        });
        this.set_action_target_value(GLib.Variant.new_string(`game-${game.name}`));
    }
}