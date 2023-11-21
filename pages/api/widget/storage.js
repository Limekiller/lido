import util from 'util'
import { getServerSession } from 'next-auth';
const exec = util.promisify(require('child_process').exec);

/**
 * Get device storage info
 */
export default async (req, res) => {

    const session = await getServerSession(req, res)
    if (!session) {
        res.status(401)
        res.end()
    }

    const output = await exec('df -h | grep "/$"')
    const storageStats = output.stdout.split(/[ ]+/)

    res.statusCode = 200
    res.end(JSON.stringify(storageStats))
}

