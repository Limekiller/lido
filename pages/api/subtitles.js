
/**
 * Api for retrieving subtitles
 */

// Thanks to https://github.com/silviapfeiffer
/**
 * Convert SRT to VTT
 */
const srt2webvtt = (data) => {
    // remove dos newlines
    let srt = data.replace(/\r+/g, '');
    // trim white space start and end
    srt = srt.trim();
    // get cues
    const cuelist = srt.split('\n\n');
    let result = "";
    if (cuelist.length > 0) {
        result += "WEBVTT\n\n";
        for (let i = 0; i < cuelist.length; i++) {
            result += convertSrtCue(cuelist[i]);
        }
    }
    return result;
};

const convertSrtCue = (caption) => {
    // remove all html tags for security reasons
    // srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
    let cue = "";
    const s = caption.split(/\n/);
    // concatenate muilt-line string separated in array into one
    while (s.length > 3) {
        for (let i = 3; i < s.length; i++) {
            s[2] += `\n${s[i]}`;
        }
        s.splice(3, s.length - 3);
    }
    let line = 0;
    // detect identifier
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
        cue += `${s[0].match(/\w+/)}\n`;
        line += 1;
    }
    // get time strings
    if (s[line].match(/\d+:\d+:\d+/)) {
        // convert time string
        const m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
        if (m) {
            cue += `${m[1]}:${m[2]}:${m[3]}.${m[4]} --> ${m[5]}:${m[6]}:${m[7]}.${m[8]}\n`;
            line += 1;
        } else {
            // Unrecognized timestring
            return "";
        }
    } else {
        // file format error or comment lines
        return "";
    }
    // get cue text
    if (s[line]) {
        cue += `${s[line]}\n\n`;
    }
    return cue;
}

export default async (req, res) => {
    // On first request, the IMDB id is sent
    // The server makes a request to OpenSubtitles to get the first search result for that movie
    // Then fetches the data for that result and sends it back to the client for validation.
    if (req.query.imdbid) {
        const imdbid = req.query.imdbid.padStart(7, '0')

        // First try to get subtitles for this exact file
        let searchResults = []

        if (req.query.filesize !== '0' && req.query.moviehash !== '0') {
            searchResults = await fetch(`
                https://rest.opensubtitles.org/search/imdbid-${imdbid}/moviebytesize-${req.query.filesize}/moviehash-${req.query.moviehash}/sublanguageid-eng
            `, {
                headers: {
                    'User-Agent': 'TemporaryUserAgent'
                }
            })
            searchResults = await searchResults.json()
        }

        // We didn't find any results? Let's just get the first result for this item
        if (searchResults.length === 0) {
            searchResults = await fetch(`
                https://rest.opensubtitles.org/search/imdbid-${imdbid}/sublanguageid-eng
            `, {
                headers: {
                    'User-Agent': 'TemporaryUserAgent'
                }
            })
            searchResults = await searchResults.json()
        }

        try {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ link: `https://dl.opensubtitles.org/en/download/file/${searchResults[0]['IDSubtitleFile']}` }))
        } catch (error) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({}))
            return
        }
    }

    // On second request, the link is send as a base64-encoded string.
    // The server fetches the subtitles from said link and returns the .vtt file contents
    if (req.query.link) {
        let subtitles = await fetch(req.query.link)
        subtitles = await subtitles.text()
        subtitles = srt2webvtt(subtitles)
        res.setHeader('Content-Type', 'text/plain')
        res.statusCode = 200
        res.end(subtitles)
    }

}