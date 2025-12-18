"use server"

import util from 'util'
const exec = util.promisify(require('child_process').exec)

export const get = async () => {
    const output = await exec(`df -h ${process.env.STORAGE_PATH} | grep "/"`)
    const storageStats = output.stdout.split(/[ ]+/)

    return {
        result: "success",
        data: storageStats
    }
}
