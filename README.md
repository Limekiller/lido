## Lido Media Server

A media server/webapp for managing media hassle-free. Intended to be run on a LAN, but can be served over the web too.
A lido is a waterfront resort: a luxurious and fancy place where people go to relax and be entertained--just like this server!

#### Installation

Clone this repository and install and update Node to the latest version >=15.3.0 and NPM >=7.0.14.

You need a few dependencies:
- aria2c >=1.33.1
- ffmpeg >=3.4.8

You need to add a few directories:
- /media/Movies
- /media/TV
- /media/temp/streams

You need to create a .env.local file in the install directory with the following values:
```
OMDB_API_KEY={your_omdb_api_key (http://www.omdbapi.com/) -- this is needed to fetch metadata + subtitles}
OPENSUBTITLES_API_KEY={your_opensubs_api_key (https://www.opensubtitles.com) -- this is needed to fetch subtitles}
APP_PASSWORD={whatever_the_password_should_be}
NEXTAUTH_URL=http(s)://{the_domain}
```

And then finish her off
- `cd /path/to/install`
- `npm install`
- `npm run build`
- `npm run start`
- `aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --seed-time=0 --on-bt-download-complete=/PATH/TO/INSTALL/DIRECTORY/media/temp/onDownloadComplete.sh`

You need to edit the above command to point to your own install!

#### Streaming

One of the unique features of the server is the ability to stream video to the browser even if the video is not in a format the browser supports, like matroska in Firefox. It does this by converting the file in real-time to a fragmented MP4 HLS stream (h264/aac). Converting takes a lot of processing power, of course; to get any sort of reasonable performance out of this streaming mode, you may have to adjust the ffmpeg command in /pages/api/stream.js: I suggest adding the -preset flag before the output destination with your desired setting.
