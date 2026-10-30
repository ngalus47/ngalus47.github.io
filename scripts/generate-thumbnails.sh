#!/usr/bin/env bash
# Generates a JPG thumbnail of the first page of every PDF in resources/pdfs.
#   resources/pdfs/Foo Bar.pdf  ->  resources/thumbnails/Foo Bar.jpg
# Thumbnails whose PDF no longer exists are removed.
# Requires pdftoppm (poppler-utils).
set -euo pipefail

cd "$(dirname "$0")/.."

PDF_DIR="resources/pdfs"
THUMB_DIR="resources/thumbnails"
WIDTH=600

mkdir -p "$THUMB_DIR"

shopt -s nullglob

for pdf in "$PDF_DIR"/*.pdf; do
    name="$(basename "$pdf" .pdf)"
    echo "Generating thumbnail for $name"
    pdftoppm -f 1 -l 1 -singlefile -jpeg -jpegopt quality=85 \
        -scale-to-x "$WIDTH" -scale-to-y -1 \
        "$pdf" "$THUMB_DIR/$name"
done

for thumb in "$THUMB_DIR"/*.jpg; do
    name="$(basename "$thumb" .jpg)"
    if [[ ! -f "$PDF_DIR/$name.pdf" ]]; then
        echo "Removing orphaned thumbnail $thumb"
        rm "$thumb"
    fi
done
