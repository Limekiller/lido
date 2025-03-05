import { prisma } from '@/lib/prisma';

import UserEditor from '@/components/settings/UserEditor/UserEditor';

const settings = async () => {
    const accounts = await prisma.user.findMany()

    return <div>
        <h1 className="title">Settings</h1>
        <div className="centeredContainer">
            <UserEditor users={accounts} />
        </div>
    </div>
}

export default settings