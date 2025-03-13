import { prisma } from '@/lib/prisma';

import UserEditor from '@/components/settings/UserEditor/UserEditor';
import FileEditor from '@/components/settings/FileEditor/FileEditor';

import styles from './settings.module.scss'

const settings = async () => {
    const accounts = await prisma.user.findMany()
    const files = await prisma.file.findMany({
        orderBy: [
            { area: "asc" },
            { id: "desc" }
        ]
    })

    return <div className={styles.Settings}>
        <h1 className="title">Settings</h1>
        <div className={styles.settingsContainer}>
            <UserEditor users={accounts} />
            <FileEditor files={files} />
        </div>
    </div>
}

export default settings