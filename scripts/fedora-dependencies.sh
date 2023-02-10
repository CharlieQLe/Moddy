#!/bin/bash

if ! command -v dnf > /dev/null ; then
    echo "This system is not running Fedora!"
    exit 1
fi

sudo dnf install \
    at-spi2-atk-devel \
    at-spi2-core-devel \
    atk-devel \
    cairo-devel \
    cairo-gobject-devel \
    dbus-devel \
    gdk-pixbuf2-devel \
    glib2-devel \
    glibc-devel \
    gnome-autoar-devel \
    gobject-introspection-devel \
    graphene-devel \
    graphite2-devel \
    gstreamer1-devel \
    gtk3-devel \
    gtk4-devel \
    gtksourceview5-devel \
    harfbuzz-devel \
    javascriptcoregtk5.0-devel \
    libadwaita-devel \
    libarchive-devel \
    libmanette-devel \
    libsoup3-devel \
    libxml2-devel \
    pango-devel \
    tracker-devel \
    webkit2gtk5.0-devel;