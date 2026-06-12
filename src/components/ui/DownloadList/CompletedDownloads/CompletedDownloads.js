import Download from "../Download/Download"
import EmptyAlert from "../EmptyAlert/EmptyAlert"

const CompletedDownloads = ({ completedDownloads }) => {
    return completedDownloads.length > 0 ?
        completedDownloads.map(download => {
            return <Download 
                key={download.id}
                download={download}
            />
        })
    :  
        <EmptyAlert />
}

export default CompletedDownloads