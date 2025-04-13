import { getSession } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

import Providers from "@/lib/auth/providers"
import MessageContainer from "@/components/contexts/MessageContainer/MessageContainer"

import PartyController from '@/components/PartyController/PartyController'
import Navbar from "@/components/ui/Navbar/Navbar"


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
        <MessageContainer>
            {session ? <Navbar hidden={true} /> : ''}
            <div>
                <PartyController 
                    room={room}
                    file={file}
                />
            </div>
        </MessageContainer>
    </Providers>

}

export default party