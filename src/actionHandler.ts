import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

export class ActionHandler {
    private _actionGroup: Gio.SimpleActionGroup;
    private _actions: {
        [name: string]: Gio.SimpleAction
    };

    public constructor(name: string, widget: Gtk.Widget) {
        this._actionGroup = Gio.SimpleActionGroup.new();
        widget.insert_action_group(name, this._actionGroup);
        this._actions = {};
    }

    public getAction(name: string) {
        return name in this._actions ? this._actions[name] : undefined;
    }

    public addAction(name: string, parameterType: GLib.VariantType<any> | null, onActivate?: (...args: any) => void) {
        if (name in this._actions) {
            return;
        }
        const action = Gio.SimpleAction.new(name, parameterType);
        this._actions[name] = action;
        this._actionGroup.insert(action);
        if (onActivate) {
            action.connect('activate', onActivate);
        }
    }
}