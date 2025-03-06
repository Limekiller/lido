import { getSession } from "@/lib/auth/auth"

export default async function Home() {
    const session = await getSession()
    return <h2>Hey, {session.user.name}!</h2>
}
