import { getSession } from "@/lib/auth/auth";

import UserProfile from "@/components/ui/UserProfile/UserProfile";

const profile = async () => {

    const session = await getSession();

    return <div>
        <h1 className="title">Profile</h1>
        <div className="centeredContainer">
            {session.user.name === 'Admin' ?
                <span>Sorry, the admin user cannot be edited.</span>
                :
                <UserProfile data={session.user} />
            }
        </div>
    </div>
}

export default profile