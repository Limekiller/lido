## BENK React (I need a cooler name!)

A media server/webapp for downloading and consuming media hassle-free. Intended to be run on a LAN, but can be served over the web too.

#### Installation

Clone this repository and install and update Node to the latest version -- you definitely need at least v10. I'm running Node v15.3.0 and NPM v7.0.14.
You'll also need Aria2 running in the background, so install that as well.

Then, add a "TV" and "Movies" directory to the /media subfolder. Then

- `cd /path/to/install`
- `npm install`
- `npm run build`
- `npm run start`
- `aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --seed-time=0 --on-bt-download-complete=/PATH/TO/INSTALL/DIRECTORY/media/temp/onDownloadComplete.sh`

<span style="color:red">You need to edit the above command to point to your own install!</span>
