import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import { GSettings } from 'resource:///io/github/charlieqle/Moddy/js/gsettings.js';

export class PreferencesWindow extends Adw.PreferencesWindow {
    private _nexusEntry!: Adw.PasswordEntryRow;

    private _gsettings: GSettings;
    private _restartToast?: Adw.Toast;

    static {
        GObject.registerClass({
            GTypeName: 'PreferencesWindow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/preferences-window.ui',
            InternalChildren: ['nexusEntry'],
        }, this);
    }

    constructor() {
        super();
        this._gsettings = new GSettings();
        this._nexusEntry.set_text(this._gsettings.nexusKey);
        this._restartToast?.dismiss();
    }

    private onNexusKeyChanged(entry: Adw.PasswordEntryRow) {
        this._gsettings.nexusKey = entry.get_text();
        if (!this._restartToast) {
            this._restartToast = Adw.Toast.new('Restart to use new API key!');
            this._restartToast.connect('dismissed', _ => {
                this._restartToast = undefined;
            });
            this.add_toast(this._restartToast);
        }
    }
}