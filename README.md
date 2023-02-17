<h1 align="center">
    <strong>MODDY</strong>
</h1>

<p align="center">
  <strong>Mod your games, fast and easy</strong>
</p>

> **WARNING**
>
> Moddy is currently in an **alpha** state! It may possibly delete, modify, and corrupt your game files! Use at your own risk!
>

Moddy is a tool for modding games on Linux.

The main features of Moddy include the following:

* Mod multiple games
* Installing mods from archives
* Toggling installed mods
* Profiles for separate mod lists
* Deploying mods with OverlayFS

## <strong>Installation</strong>

See [Building from source](#building-from-source)

## <a name="building-from-source"></a> <strong>Building from source</strong>

### <strong><u>Dependencies</u></strong>

* Flatpak
* [blueprint-compiler](https://gitlab.gnome.org/jwestman/blueprint-compiler) v0.6.0
* NodeJS
* Yarn
* [gnome-autoar](https://gitlab.gnome.org/GNOME/gnome-autoar/) 0.4.3

### <strong><u>Building</u></strong>

```
git clone --recursive https://github.com/CharlieQLe/Moddy.git
cd Moddy/
flatpak install --user flathub org.gnome.Platform//43 org.gnome.Sdk//43 org.freedesktop.Sdk.Extension.node18//22.08 -y
flatpak-builder --force-clean --install --user -y builddir io.github.charlieqle.Moddy.json
```

## <strong>Caveats</strong>

* Flatpak users, add your Steam library locations to your Flatpak overrides
* This has only been tested on the following distributions:
  * Fedora Silverblue 37
* If the game directory is located within ```/run/``` on trying to add a game, then replace the text with the game's real directory! Otherwise, deploying mods will not work!
* This application breaks the Flatpak sandbox! In order to deploy mods, ```flatpak-spawn --host``` needs to be called! This breaks the sandbox, so use at your own risk!

## <strong>Future</strong>

* Allow reordering mods
* Allow deleting configurations
* Launch games directly
* NexusMods download support
* Bethesda game support (Skyrim, Fallout, etc.)
* CLI arguments to deploy mods, launch a game, then purge mods once the game is closed

## <strong>Libraries used</strong>

* [@node-steam/vdf](https://github.com/node-steam/vdf), MIT-licensed
* [steam-acf2json](https://github.com/zsnmwy/steam-acf2json), MIT-licensed
* [fast-xml-parser](https://github.com/kawanet/from-xml), MIT-licensed