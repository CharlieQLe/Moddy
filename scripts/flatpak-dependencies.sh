#!/bin/bash

if ! command -v flatpak > /dev/null ; then
    echo "Flatpak not found! Install from your package manager!"
    exit 1
fi

flatpak --user install \
    org.freedesktop.Sdk.Extension.node18//22.08 \
    org.gnome.Platform//43 \
    org.gnome.Sdk//43;