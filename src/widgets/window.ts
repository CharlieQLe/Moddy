import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

export class Window extends Adw.ApplicationWindow {
    static {
        GObject.registerClass({
            GTypeName: 'Window',
            Template: 'resource:///io/github/charlieqle/GnomeTypescriptTemplate/ui/window.ui',
        }, this);
    }

    constructor(application: Adw.Application) {
        super({ application });
    }
}