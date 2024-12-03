## Lido Media Server

https://github.com/user-attachments/assets/8ec7ada1-ae88-4e65-81a8-7eb61977831e

Lido is an out-of-the box webapp for downloading, streaming, and sharing media. It
A lido is a waterfront resort: a luxurious and fancy place where people go to relax and be entertained—just like this!

#### Features
- Download media: Easily search for media and download it where you want it
- Stream media: Don't want to wait for a download? Browse for the media you want and watch it right away
- File management: Create folders to keep your files organized
- Stream incompatible files: A file you downloaded can't play in your browser? Lido will convert it on-the-fly and create a livestream for you to watch
- Watch with your friends: Watch any file on the server with your friends by creating a party room and sharing the link with anyone—Lido will keep everyone synced up and provide a chat room for discussion.

#### Installation

Clone this repository and install and update Node and NPM to the latest versions

- Install ffmpeg: `apt install ffmpeg`
- Set up Transmission:
  - First, install the required packages: `apt install transmission-cli transmission-daemon`
  - Transmission will need to run a script after completing a download; this allows it to move the downloaded movie files to the right locations. You will need to prepare Transmission to run under the same user that you run the server with (ie, the user should be able to use `npm` commands). The easiest way to do this is as follows:
    - As the desired user, run Transmission once with `transmission-daemon -f`.
    - Stop Transmission with CTRL+C. This populates the config file for the user.
    - Edit `/home/{user}/.config/transmission-daemon/settings.json`
      - Change `rpc-authentication-required` to `false`
      - Change `script-torrent-done-enabled` to `true`
      - Change `script-torrent-done-filename` to `/{path}/{to}/{install}/{folder}/media/temp/onDownloadComplete.sh`
      - Adjust any other settings as desired
- Create the following directories:
  - `/media/Movies`
  - `/media/TV`
  - `/media/temp/streams`
- Create a .env.local file in the install directory with the following values:
```
OMDB_API_KEY={your_omdb_api_key (http://www.omdbapi.com/) -- this is needed to fetch metadata + subtitles}
APP_PASSWORD={whatever_the_password_should_be}
NEXTAUTH_SECRET={some_made_up_secret_string}
NEXTAUTH_URL=http(s)://{the_domain}
EGRESS_IP={the_egress_ip_of_your_server} (optional)
```
- Finish the install
  - `cd /path/to/install`
  - `npm install`
  - `npm run build`
  - `npm run start`
- Run the Transmission daemon with the desired user: `transmission-daemon -f`

#### Streaming

One of the unique features of the server is the ability to stream video to the browser even if the video is not in a format the browser supports, like matroska in Firefox. It does this by converting the file in real-time to a fragmented MP4 HLS stream (h264/aac). Converting takes a lot of processing power, of course; to get any sort of reasonable performance out of this streaming mode, you may have to adjust the ffmpeg command in /pages/api/stream.js: I suggest adding the -preset flag before the output destination with your desired setting.
