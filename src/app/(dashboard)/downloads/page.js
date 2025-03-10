import { GET as getDownloads } from '@/app/api/download/route'

import DownloadList from '@/components/ui/DownloadList/DownloadList';

const Downloads = async () => {

    let response = await getDownloads()
    response = await response.json()
    const torrents = response.data.torrents
    const downloads = response.data.downloads

    console.log(downloads)

    return <div>
        <h1 className="title">Downloads</h1>
        <DownloadList downloads={downloads} torrents={torrents} />
    </div>
}

export default Downloads