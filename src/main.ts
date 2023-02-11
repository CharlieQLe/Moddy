import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import { AddGameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/addGameView.js';
import { GameView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/gameView.js';
import { HomeView } from 'resource:///io/github/charlieqle/Moddy/js/widgets/views/homeView.js';
import { DirectoryEntryRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/directoryEntryRow.js';
import { GameRow } from 'resource:///io/github/charlieqle/Moddy/js/widgets/gameRow.js';
import { Application } from 'resource:///io/github/charlieqle/Moddy/js/application.js';
import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

pkg.initGettext();
pkg.initFormat();

export function main(argv: string[]) {
    [
        AddGameView.$gtype,
        GameView.$gtype,
        HomeView.$gtype,
        DirectoryEntryRow.$gtype,
        GameRow.$gtype,
    ].forEach(gtype => {
        GObject.type_ensure(gtype);
    })

    const configFile = Gio.File.new_for_path(Utility.getConfigDir());
    if (!configFile.query_exists(null)) {
        configFile.make_directory_with_parents(null);
    }

    const dataFile = Gio.File.new_for_path(Utility.getDataDir());
    if (!dataFile.query_exists(null)) {
        dataFile.make_directory_with_parents(null);
    }

    const application = new Application();
    return application.run(argv);
}