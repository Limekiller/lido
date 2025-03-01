import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt'

const authOptions = {
    pages: {
        signIn: "/login"
    },
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = await prisma.user.findUnique({
                    where: { username: credentials.username }
                })
                const validPw = await bcrypt.compare(user.password, credentials.password)

                if (user && validPw) {
                    return user
                } else {
                    return null
                }
            }
        })
    ]
}

const getSession = () => getServerSession(authOptions)

export { authOptions, getSession }