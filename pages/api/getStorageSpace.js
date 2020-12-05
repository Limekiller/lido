import util from 'util'
const exec = util.promisify(require('child_process').exec);

export default async (req, res) => {

    const output = await exec('df -h | grep "/$"')
    const storageStats = output.stdout.split(/[ ]+/)

    res.statusCode = 200
    res.end(JSON.stringify(storageStats))
}

