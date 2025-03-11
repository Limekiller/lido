import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { verifyAdmin, verifySession } from '@/lib/auth/lib'
import fs from 'fs-extra'
import bcrypt from 'bcrypt'

export const PUT = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        // Ensure that the user is logged in, and is either the same user that is being updated,
        // or is an admin
        const session = await getSession()
        if (session.user.id !== id && session.user.admin !== true) {
            return Response.json({
                result: "error",
                data: {
                    message: "Unauthorized"
                }
            }, { status: 401 })   
        }

        const data = await req.formData()
        let dataToUpdate = {
            name: data.get('name'),
            email: data.get('email'),
        }
        if (data.has('admin')) {
            dataToUpdate.admin = data.get('admin') === 'true' ? true : false
        }
        if (data.has('password')) {
            const salt = await bcrypt.genSaltSync(10)
            dataToUpdate.password = await bcrypt.hash(data.get('password'), salt)
        }

        const profileImg = data.get('profileImg')
        if (profileImg && profileImg !== 'undefined') {
            const profileImgFile = await prisma.file.create({
                data: {
                    name: profileImg.name,
                    mimetype: profileImg.type,
                    area: 'profile'
                }
            })

            console.log(profileImgFile)

            const bytes = await profileImg.arrayBuffer();
            const buffer = Buffer.from(bytes);
            fs.writeFileSync(`${process.env.STORAGE_PATH}/profile/${profileImgFile.id}.${profileImg.type.split('/')[1]}`, buffer)
            dataToUpdate.image = profileImgFile.id
        }

        const updateUser = await prisma.user.update({
            where: {
                id: id
            },
            data: dataToUpdate
        })

        return Response.json({
            result: "success",
            data: updateUser
        })
    }
)

export const DELETE = verifyAdmin(
    async (req, { params }) => {
        const id = (await params).id

        const deleteUser = await prisma.user.delete({
            where: {
                id: id
            },
        })

        return Response.json({
            result: "success",
            data: deleteUser
        })
    }
)