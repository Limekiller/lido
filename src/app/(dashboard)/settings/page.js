import { prisma } from '@/lib/prisma';

import UserEditor from '@/components/settings/UserEditor/UserEditor';
import FileEditor from '@/components/settings/FileEditor/FileEditor';

const settings = async () => {
    const accounts = await prisma.user.findMany()
    const files = await prisma.file.findMany({
        orderBy: [
            { area: "asc" },
            { id: "desc" }
        ]
    })

    return <div>
        <h1 className="title">Settings</h1>
        <div style={{
            display: 'grid', 
            gap: '1rem', 
            gridTemplateRows: 'masonry', 
            gridTemplateColumns: '50% 50%',
            marginTop: '4rem'            
        }}>
            <UserEditor users={accounts} />
            <FileEditor files={files} />
        </div>
    </div>
}

export default settings