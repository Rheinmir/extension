#!/bin/bash
mkdir -p public/extensions
# List of extensions to package
EXTENSIONS=("aio-menu" "fb_video_downloader")

for ext in "${EXTENSIONS[@]}"; do
    echo "Packaging $ext..."
    if [ -d "extension-db/$ext" ]; then
        cd "extension-db/$ext"
        # Zip contents to ../../public/extensions/$ext.zip
        rm -f "../../public/extensions/$ext.zip"
        # -r: recursive
        # -X: exclude extra file attributes (cleaner)
        # -x: exclude patterns (git, DS_Store)
        zip -r -X "../../public/extensions/$ext.zip" . -x "*.git*" -x "*.DS_Store"
        cd ../..
        echo "Created public/extensions/$ext.zip"
    else
        echo "Warning: Directory extension-db/$ext not found"
    fi
done
