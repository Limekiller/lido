import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

const options = {
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
        name: 'Credentials',

        credentials: {
            password: {  label: "Password", type: "password" }
        },
        authorize: async (credentials) => {
            let user = null
            if (credentials.password == process.env.APP_PASSWORD) {
                user = {fuck: 'off'}
            }
            
            if (user) {
                return Promise.resolve(user)
            } else {
                return Promise.resolve(null)
            }
        }
    })
  ],
  pages: {
      signIn: '/login'
  }

}

export default (req, res) => NextAuth(req, res, options)