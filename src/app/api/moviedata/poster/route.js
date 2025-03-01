import fs from 'fs-extra'
import path from 'path'

export const GET = async req => {
    const searchParams = req.nextUrl.searchParams
    const posters = fs.readdirSync(path.join(process.cwd(), '/public/images/posters'))

    let toReturn
    if (searchParams.get('number')) {
        toReturn = []
        for (let i = 0; i < searchParams.get('number'); i++) {
            let rand = Math.random();
            rand *= posters.length;
            rand = Math.floor(rand);
            toReturn.push(posters[rand])
        }
    } else {
        let rand = Math.random();
        rand *= posters.length;
        rand = Math.floor(rand);
        toReturn = posters[rand]
    }

    return Response.json(toReturn)
}