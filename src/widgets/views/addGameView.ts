import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';

import { Game } from 'resource:///io/github/charlieqle/Moddy/js/config.js';

export class AddGameView extends Gtk.Box {
    static {
        GObject.registerClass({
            GTypeName: 'AddGameView',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/views/add-game-view.ui',
        }, this);
    }

    constructor() {
        super();
    }
}