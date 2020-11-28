import fs from 'fs-extra'
import path from 'path'

export default async (req, res) => {
    const posters = fs.readdirSync(path.join(process.cwd(), '/public/images/posters'))
    
    let toReturn
    if (req.query.number) {
        toReturn = []
        for (let i=0; i<req.query.number; i++) {
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
    
    res.responseCode = 200
    res.end(JSON.stringify(toReturn))
}

