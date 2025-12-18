"use server"

import bcrypt from 'bcrypt'
import fs from 'fs-extra'
import { prisma } from "@/lib/prisma"
import { refresh } from 'next/cache'

export const create = async (name, email, admin, password) => {
    const salt = bcrypt.genSaltSync(10)
    const hashedPw = await bcrypt.hash(password, salt)

    const createUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            admin: admin,
            password: hashedPw
        }
    })

    refresh()
    return {
        result: "success",
        data: createUser
    }
}

export const update = async (id, data) => {
    let dataToUpdate = {
        name: data.name,
        email: data.email
    }
    if ('admin' in data) {
        dataToUpdate.admin = data.admin
    }
    if ('password' in data) {
        const salt = bcrypt.genSaltSync(10)
        dataToUpdate.password = await bcrypt.hash(data.password, salt)
    }

    const profileImg = data.profileImg
    if (profileImg && profileImg !== 'undefined') {
        const profileImgFile = await prisma.file.create({
            data: {
                name: profileImg.name,
                mimetype: profileImg.type,
                area: 'profile'
            }
        })

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

    refresh()
    return {
        result: "success",
        data: updateUser
    }
}

export const delete_ = async id => {
    const deleteUser = await prisma.user.delete({
        where: {
            id: id
        },
    })

    refresh()
    return {
        result: "success",
        data: deleteUser
    }
}

