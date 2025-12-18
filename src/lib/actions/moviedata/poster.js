"use server"

import fs from 'fs-extra'
import path from 'path'

export const get = async number => {
    const posters = fs.readdirSync(path.join(process.cwd(), '/public/images/posters'))

    let toReturn
    if (number) {
        toReturn = []
        for (let i = 0; i < number; i++) {
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

    return toReturn
}

