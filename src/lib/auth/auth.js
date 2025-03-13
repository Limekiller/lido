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
                let user, validPw
                if (credentials.username === 'Admin') {
                    user = { name: "Admin", id: -1, admin: true}
                    validPw = process.env.ADMIN_PASSWORD === credentials.password
                } else {
                    user = await prisma.user.findUnique({
                        where: { name: credentials.username }
                    })
                    validPw = await bcrypt.compare(credentials.password, user.password)
                }

                if (user && validPw) {
                    return user
                } else {
                    return null
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update") {
                token.name = session.name
                token.email = session.email
                token.image = session.image
            }
            if (user) {
                token.id = user.id
                token.admin = user.admin
                token.image = user.image
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.user.name = token.name
            session.user.email = token.email
            session.user.admin = token.admin
            session.user.image = token.image
            return session
        }
    }
}

const getSession = () => getServerSession(authOptions)

export { authOptions, getSession }