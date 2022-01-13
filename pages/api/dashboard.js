import util from 'util'
import { getSession } from "next-auth/client"
const exec = util.promisify(require('child_process').exec);

export default async (req, res) => {

    const session = await getSession({ req })
    if (!session) {
        res.status(401)
        res.end()
    }

    const module = req.query.module

    if (module == 'space') {
        const output = await exec('df -h | grep "/$"')
        const storageStats = output.stdout.split(/[ ]+/)
    
        res.statusCode = 200
        res.end(JSON.stringify(storageStats))
    } else {
        const ingress_ip = await exec(`dig +short ${process.env.NEXTAUTH_URL.split('://')[1].split(':')[0]}`)
        const egress_ip = await exec('curl icanhazip.com')

        res.statusCode = 200
        res.end(JSON.stringify({
            'ingress': ingress_ip.stdout.trim(),
            'egress': egress_ip.stdout.trim()
        }))
    }

}

