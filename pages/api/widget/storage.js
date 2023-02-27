import util from 'util'
import { getSession } from "next-auth/react"
const exec = util.promisify(require('child_process').exec);

/**
 * Get device storage info
 */
export default async (req, res) => {

    const session = await getSession({ req })
    if (!session) {
        res.status(401)
        res.end()
    }

    const output = await exec('df -h | grep "/$"')
    const storageStats = output.stdout.split(/[ ]+/)

    res.statusCode = 200
    res.end(JSON.stringify(storageStats))
}

