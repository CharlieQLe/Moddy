import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

import { PreferencesWindow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/preferencesWindow.js';
import { Window } from "resource:///io/github/charlieqle/Moddy/js/widgets/window.js";

pkg.initGettext();
pkg.initFormat();

export class Application extends Adw.Application {
    private _mainWindow: Window | null;

    static {
        GObject.registerClass(this);
    }

    constructor() {
        super({ application_id: pkg.name, flags: Gio.ApplicationFlags.FLAGS_NONE });

        this._mainWindow = null;

        const preferencesAction = new Gio.SimpleAction({ name: 'preferences' });
        preferencesAction.connect('activate', _ => {
            const window = new PreferencesWindow();
            window.present();
        });
        this.add_action(preferencesAction);

        const quit_action = new Gio.SimpleAction({ name: 'quit' });
        quit_action.connect('activate', _ => this.quit());
        this.add_action(quit_action);
        this.set_accels_for_action('app.quit', ['<primary>q']);

        const show_about_action = new Gio.SimpleAction({ name: 'about' });
        show_about_action.connect('activate', _ => {
            const aboutWindow = new Adw.AboutWindow({
                transient_for: this._mainWindow,
                application_name: 'Moddy',
                application_icon: pkg.name,
                developer_name: 'Charlie Le',
                version: pkg.version,
                developers: ['Charlie Le'],
                copyright: '© 2023 Charlie Le'
            });
            aboutWindow.present();
        });
        this.add_action(show_about_action);
    }

    vfunc_activate() {
        if (this._mainWindow == null) {
            this._mainWindow = new Window(this);
        }
        this._mainWindow.present();
    }
}