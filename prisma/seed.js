import { PrismaClient } from './generated/prisma/client'
const prisma = new PrismaClient()

const main = async () => {
    const defaultMoviesCat = await prisma.category.create({
        data: {
            id: 0,
            name: 'Movies',
        },
    })

    const defaultTVCat = await prisma.category.create({
        data: {
            id: 1,
            name: 'TV',
        },
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })