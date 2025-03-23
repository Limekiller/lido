import util from 'util'
const exec = util.promisify(require('child_process').exec)
import { verifySession } from '@/lib/auth/lib'

export const GET = verifySession(
    async req => {

        const output = await exec('df -h | grep "/$"')
        const storageStats = output.stdout.split(/[ ]+/)

        return Response.json({
            result: "success",
            data: storageStats
        })
    }
)