## Lido Media Server

A media server/webapp for downloading and consuming media hassle-free. Intended to be run on a LAN, but can be served over the web too.
A lido is a waterfront resort: a luxurious and fancy place where people go to relax and be entertained--just like this server!

#### Installation

Clone this repository and install and update Node to the latest version >=15.3.0 and NPM >=7.0.14.

You need a few dependencies:
- aria2c >=1.35.0
- ffmpeg >=4.2.4

You need to add a few directories:
- /media/Movies
- /media/TV
- /public/streams

And then finish her off
- `cd /path/to/install`
- `npm install`
- `npm run build`
- `npm run start`
- `aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --seed-time=0 --on-bt-download-complete=/PATH/TO/INSTALL/DIRECTORY/media/temp/onDownloadComplete.sh`

<span style="color:red">You need to edit the above command to point to your own install!</span>
