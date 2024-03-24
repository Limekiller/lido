#!/bin/bash

# Get the directory this script is running in, 
# no matter where its called from
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# CD into the directory and use the npm script to run the node file
# so we have the all the right libraries installed
# no matter where we're running from
cd $DIR
npm run completeDownload $TR_TORRENT_DIR $TR_TORRENT_NAME

transmission-remote -t $TR_TORRENT_ID --remove-and-delete
