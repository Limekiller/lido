import { prisma } from '@/lib/prisma'
import fs from 'fs-extra'
import jsdom from 'jsdom'
import Zip from 'adm-zip'

/**
 * Convert SRT to VTT
 * Thanks to https://github.com/silviapfeiffer
 **/
const srt2webvtt = (data) => {
    let srt = data.replace(/\r+/g, '');
    srt = srt.trim();
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
    let cue = "";
    const s = caption.split(/\n/);
    while (s.length > 3) {
        for (let i = 3; i < s.length; i++) {
            s[2] += `\n${s[i]}`;
        }
        s.splice(3, s.length - 3);
    }
    let line = 0;
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
        cue += `${s[0].match(/\w+/)}\n`;
        line += 1;
    }
    if (s[line].match(/\d+:\d+:\d+/)) {
        const m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
        if (m) {
            cue += `${m[1]}:${m[2]}:${m[3]}.${m[4]} --> ${m[5]}:${m[6]}:${m[7]}.${m[8]}\n`;
            line += 1;
        } else {
            return "";
        }
    } else {
        return "";
    }
    if (s[line]) {
        cue += `${s[line]}\n\n`;
    }
    return cue;
}

const getSubsFromPodnapisi = async (id, name, categoryId, downloadId) => {
    // podnapisi actually associates subtitle files to download filenames, so we can search for the name of the file
    let searchResults = await fetch(
        `https://www.podnapisi.net/nb/subtitles/search/?keywords=${name}&sort=stats.downloads&order=desc
    `)
    searchResults = await searchResults.text()
    const dom = new jsdom.JSDOM(searchResults)
    const firstResult = dom.window.document.querySelector('.subtitle-entry a')

    if (!firstResult) {
        return false
    }

    const downloadLink = firstResult.href

    // Unfortunately it provides downloads as a .zip containing the subtitle files, so we have to download it,
    // write it to disk, extract the first entry (we're not going to bother trying to figure out the best one in the archive)
    // and THEN convert it to vtt for videojs

    // Download zip to disk
    let subtitles = await fetch(`https://www.podnapisi.net${downloadLink}`)
    subtitles = await subtitles.arrayBuffer()
    const tempPathName = `${process.env.STORAGE_PATH}/temp/subtitles-${id}`
    fs.mkdirSync(tempPathName)
    fs.writeFileSync(`${tempPathName}/subtitles-${id}.zip`, Buffer.from(subtitles))

    // Extract first entry
    const zip = new Zip(`${tempPathName}/subtitles-${id}.zip`)
    const subtitleFile = zip.getEntries()[0]
    const subtitleData = zip.readAsText(subtitleFile)

    // Convert to .vtt and write to disk and database
    const vttData = srt2webvtt(subtitleData)
    const storedSubFile = await prisma.file.create({
        data: {
            name: `${name}.vtt`,
            categoryId: categoryId,
            downloadId: downloadId,
            mimetype: "text/vtt",
            area: "subtitles",
            parentId: id
        }
    })
    fs.writeFileSync(`${process.env.STORAGE_PATH}/subtitles/${storedSubFile.id}.vtt`, vttData)

    fs.rmSync(tempPathName, { recursive: true, force: true })
    return vttData
}

export const GET = async req => {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')

    const subTitleFile = await prisma.file.findFirst({
        where: {
            parentId: id,
            area: "subtitles"
        }
    })

    if (subTitleFile) {
        const buffer = fs.readFileSync(`${process.env.STORAGE_PATH}/subtitles/${subTitleFile.id}.vtt`)
        return new Response(buffer, {
            headers: {
                'content-type': 'text/vtt'
            }
        })
    } else {
        // No subtitles found--let's see if we can find and download some from podnapisi
        const movieFile = await prisma.file.findUnique({
            where: {
                id: id
            }
        })
        const subData = await getSubsFromPodnapisi(id, movieFile.name, movieFile.categoryId, movieFile.downloadId)
        if (subData) {
            return new Response(Buffer.from(subData), {
                headers: {
                    'content-type': 'text/vtt'
                }
            })
        }
    }

    return Response.json({
        result: "error",
        data: {
            message: "No subtitles found"
        }
    }, { status: 404 })
}
