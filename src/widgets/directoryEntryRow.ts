import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';

export class DirectoryEntryRow extends Adw.EntryRow {
    private _fileChooser!: Gtk.FileChooserNative;

    static {
        GObject.registerClass({
            GTypeName: 'DirectoryEntryRow',
            Template: 'resource:///io/github/charlieqle/Moddy/ui/directory-entry-row.ui',
            InternalChildren: ['fileChooser'],
        }, this);
    }

    constructor() {
        super();
    }

    private onFileChooserBtnClicked(_: Gtk.Button) {
        this._fileChooser.show();
    }

    private onFileChooserResponse(_: Gtk.FileChooserNative, response: Gtk.ResponseType) {
        if (response === Gtk.ResponseType.ACCEPT) {
            const file = this._fileChooser.get_file();
            if (file && file.query_exists(null)) {
                this.set_text(file.get_path() as string);
            }
        }
    }
}