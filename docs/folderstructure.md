# FOLDER STRUCTURE

## CONFIGS

Moddy utilizes the folder located via `$XDG_CONFIG_DIR` or `$HOME/.config` to store configs related to Moddy and configured games. The folder structure is as follows:

```
moddy/
└ gametitle.json
```

## DATA

Moddy utilizes the folder located via `$XDG_DATA_DIR` or `$HOME/.local/share` to store data related to configured games. The folder structure is as follows:

```
moddy/
└ games/
  └ gametitle/
    ├ downloads/
    | └ modarchive
    ├ mods/
    | └ modname/
    ├ overwrite/
    ├ profiles/
    | └ profilename.json
    └ metadata.json
```

Games are stored as folders containing subdirectories and a metadata JSON file.

Profiles are JSON files stored in the profile subdirectory of the game folder.

Mods are subdirectories stored in the mods subdirectory of the game folder.

Downloads contains downloaded mod archives. Mod archives that are placed here manually will also show up as completed downloads.

Overwrite is meant for an OverlayFS-based deployment mechanism- new files are placed here if they are generated while mods are deployed.