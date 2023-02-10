# CONFIG FILES

Games, profiles, and mods all have metadata JSON files associated with them.

## GAME

```
{
    "dataDir": "/path/to/data/dir",
    "installDir": "/path/to/game/",
    "relativeModPath": "relative/path/to/install/mods/",
    "selectedProfile": "profilename",
    "nexus": {
        "id": "nexusidhere"
    },
    "steam": {
        "appid": "appidhere",
        "compatdataDir": "/path/to/compatdata/"
    }
}
```

```dataDir```: where the downloads, mods, etc. are stored.

```installDir```: where the game is installed. 

```relativeModPath```: the subdirectory where the mods should be installed

```nexus```: contains NexusMods-specific information

```nexus/id```: the id for the game on NexusMods

```steam```: contains Steam-specific information

```steam/appid```: the app id for the game on Steam

```steam/compatdataDir```: the game's compatdata directory for Proton. Blank by default

## PROFILE

```
{
    "modOrder": [
        "mod 1",
        "mod 2",
        ...
    ]
    "enabledMods": [
        "mod 1",
        "mod 2",
        ...
    ]
}
```

```modOrder```: the order of the mods. Includes both enabled and disabled mods

```enabledMods```: the names of the mods that are enabled