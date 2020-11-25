## BENK React (I need a cooler name!)

This is me porting the BENK Media Server I wrote before I knew how to write good code to React. Going forward, this is the real media server.
When I'm further along I'll write out a proper readme with instructions for install, but for now just know that you need to add a Movies directory to the media folder, and install aria2 and run it with the command `aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --seed-time=0 --on-bt-download-complete=/path/to/install/folder/media/temp/onDownloadComplete.sh`
