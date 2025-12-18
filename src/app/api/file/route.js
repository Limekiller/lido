import { prisma } from "@/lib/prisma"
import { verifySession } from '@/lib/auth/lib'
import { fileInfo } from "@/lib/actions/moviedata/metadata"

export const POST = verifySession(
    async req => {
        const data = await req.json()

        // When we add a new video file, attempt to get the metadata for it
        if (data.area === 'video') {
            let metadata = await fileInfo(data.name)
            metadata = JSON.stringify(metadata)
            data.metadata = metadata
        }

        const newFile = await prisma.file.create({
            data: data
        })

        return Response.json({
            result: "success",
            data: newFile
        })
    }
)

export const GET = verifySession(
    async req => {
        const searchParams = req.nextUrl.searchParams
        
        let where = {}
        const catId = searchParams.get('category')
        if (catId) {
            where['categoryId'] = parseInt(catId)
        }
        const area = searchParams.get('area')
        if (area) {
            where['area'] = area
        }

        const files = await prisma.file.findMany({
            where: where
        })

        return Response.json({
            result: "success",
            data: files
        })
    }
)
    
//     case 'GET': {
//       // await client
//       //   .open()
//       //   .catch(err => console.log("error", err));
//       // await client.call('purgeDownloadResult')
//       // const status = await client.call("tellActive")
//       // await client
//       //   .close()
//       //   .catch(err => console.log("error", err));
//       const status = await client.getAllData()

//       status.torrents.forEach(torrent => {
//         const downloadID = torrent.savePath.split('/').slice(-1)[0]
//         torrent['path'] = Buffer.from(downloadID, 'base64').toString('ascii').slice(0, -4)
//       })

//       res.statusCode = 200
//       res.end(JSON.stringify(status.torrents))
//       break
//     }

//     case 'DELETE': {
//       // await client
//       //   .open()
//       //   .catch(err => console.log("error", err));

//       // await client.call('remove', req.query.gid)
//       await client.removeTorrent(req.query.gid, true)
//       fs.removeSync(req.query.path)
//       res.statusCode = 200;
//       res.end()
//       break
//     }
//   }
// }