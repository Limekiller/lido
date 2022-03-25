import g from 'glob'
import path from 'path'
import { promisify } from "util";
import FileType from 'file-type'

export default async (req, res) => {
    
    const glob = promisify(g)

    let searchQuery = req.query.query.split(' ')
    searchQuery.sort((a, b) => b.length - a.length)
    const results = await glob(
        path.join(process.cwd(), '/media/**/*' + searchQuery[0] + '*'),
        { nocase: true, nodir: true }
    )

    let rankedResults = []
    for (const result of results) {
        const filetype = await FileType.fromFile(result)
        if (!filetype || filetype.mime.split('/')[0] != 'video') {
            continue
        }

        let points = 0
        searchQuery.forEach(word => {
            if (result.includes(word)) {
                points++
            }
        })
        if (result.search(`/${searchQuery.join('.')}/`)) {
            points += 3
        }
        rankedResults.push({
            path: result,
            points: points
        })
    }

    let sortedResults = rankedResults.slice(0);
    sortedResults.sort(function(a,b) {
        return b.points - a.points;
    });

    const files = await Promise.all(sortedResults.map(async file => {
        let data = await fetch(process.env.NEXTAUTH_URL + '/api/getMovieData?title=' + file.path)
        return { 
            name: file.path.split('/media').slice(-1).join(), 
            data: await data.json()
        }
    }))

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(files))
    
}