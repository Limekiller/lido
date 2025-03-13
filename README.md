## Lido Media Server

Lido is an out-of-the box webapp for downloading, streaming, and sharing media. It
A lido is a waterfront resort: a luxurious and fancy place where people go to relax and be entertained—just like this!

#### Features
- Download media: Easily search for media and download it where you want it
- Discover: Browse popular shows and movies and get recommendations based on your watch history
- File management: Create folders to keep your files organized
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
      - Change `script-torrent-done-filename` to `/{path}/{to}/{install}/{folder}/src/lib/onDownloadComplete.sh`
      - Adjust any other settings as desired
- Create a storage location, such as /var/lidostorage
- Create a .env file in the install directory with the following values:
```
DATABASE_URL="file:./data.db"
NEXTAUTH_SECRET={some_madeup_secret_string}
NEXTAUTH_URL={the_url_of_the_app}
ADMIN_PASSWORD={a_default_password_for_the_admin_account}
STORAGE_PATH=/var/lidostorage
TMDB_API_KEY={your_tmdb_api_key} (www.themoviedb.org) -- This is required for fetching metadata and recommendations
```
- Finish the install
  - `cd /path/to/install`
  - `npm install`
  - `npm run build`
  - `npm run start`
- Run the Transmission daemon with the desired user: `transmission-daemon -f`
