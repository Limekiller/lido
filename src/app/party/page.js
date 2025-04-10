import { getSession } from "@/lib/auth/auth"
import Providers from "@/lib/auth/providers"
import PartyController from '@/components/PartyController/PartyController'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

const party = async ({ params, searchParams }) => {
    searchParams = await searchParams
    const session = await getSession()

    let room
    if (!searchParams.room) {
        const fileId = searchParams.fileId
        room = await prisma.room.create({
            data: {
                fileId: fileId
            }
        })
    } else {
        const roomId = searchParams.room
        room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })
    }

    if (!room) {
        redirect('/login')
    }

    const file = await prisma.file.findUnique({
        where: {
            id: room.fileId
        }
    })

    return <Providers session={session}>
        <PartyController 
            room={room}
            file={file}
        />
    </Providers>

}

export default party