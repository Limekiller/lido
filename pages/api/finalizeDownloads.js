import Aria2 from 'aria2'

const aria2 = new Aria2();

export default async (req, res) => {

    if (req.method == 'GET') {

        await aria2
            .open()
            .catch(err => console.log("error", err));
        await aria2.call('purgeDownloadResult')
        const status = await aria2.call("tellActive")

    }
}
