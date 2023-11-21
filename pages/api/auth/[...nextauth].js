import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
        name: 'Credentials',

        credentials: {
            password: {  label: "Password", type: "password" }
        },
        async authorize (credentials, req) {
            let user = null
            if (credentials.password == process.env.APP_PASSWORD) {
                return {user: true}
            }

            return null
        }
    })
  ],
  pages: {
      signIn: '/login'
  }
}

export default NextAuth(authOptions)