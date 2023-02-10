import Gio from 'gi://Gio';

import { Application } from 'resource:///io/github/charlieqle/Moddy/js/application.js';

import * as Utility from 'resource:///io/github/charlieqle/Moddy/js/utility.js';

pkg.initGettext();
pkg.initFormat();

export function main(argv: string[]) {
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