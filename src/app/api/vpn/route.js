import util from 'util'
const exec = util.promisify(require('child_process').exec)
import { verifySession } from '@/lib/auth/lib'

export const GET = verifySession(
    async req => {

        let ingress_ip = await exec(`dig +short ${process.env.NEXTAUTH_URL.split('://')[1].split(':')[0]}`)
        ingress_ip = ingress_ip.stdout.trim()
        const egress_ip = await exec('curl icanhazip.com')
    
        if (process.env.EGRESS_IP) {
            ingress_ip = process.env.EGRESS_IP
        }
    
        // If EGRESS_IP is not set in the .env file,
        // we will try to determine if a VPN is active by checking the ingress IP (what dig reports) against the egress IP
        // The client will then say a VPN is on if these values don't match
        // But there's obviously set-ups where these might not match even though a VPN isn't running,
        // so for this we allow a user to specify an egress IP in the .env file; 
        // if this is set, it instead checks that this doesn't match the real egress IP (meaning VPN is active)
        return Response.json({
            result: "success",
            data: {
                ingress: ingress_ip,
                egress: egress_ip.stdout.trim()
            }
        })
    }
)
