import { Application } from "resource:///io/github/charlieqle/Moddy/js/application.js";

pkg.initGettext();
pkg.initFormat();

export function main(argv: string[]) {
    const application = new Application();
    return application.run(argv);
}