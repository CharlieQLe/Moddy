import Gio from 'gi://Gio';

const NEXUS_KEY = 'nexus-key';

export class GSettings {
    private _settings: Gio.Settings;

    static newSettings() {
        return Gio.Settings.new('io.github.charlieqle.Moddy');
    }

    public constructor() {
        this._settings = GSettings.newSettings();
    }

    public get nexusKey(): string {
        return this._settings.get_string(NEXUS_KEY);
    }

    public set nexusKey(key: string) {
        this._settings.set_string(NEXUS_KEY, key);
    }

    public onNexusKeyChanged(callback: (settings: Gio.Settings, settingName: string) => void) {
        this._settings.connect(`changed::${this.nexusKey}`, callback);
    }
}