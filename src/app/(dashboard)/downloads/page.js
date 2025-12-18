import { get } from '@/lib/actions/downloads';
import DownloadList from '@/components/ui/DownloadList/DownloadList';

const Downloads = async () => {

    let downloadData = await get()
    const torrents = downloadData.data.torrents
    const downloads = downloadData.data.downloads

    return <div>
        <h1 className="title">Downloads</h1>
        <DownloadList downloads={downloads} torrents={torrents} />
    </div>
}

export default Downloads