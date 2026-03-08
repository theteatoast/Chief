import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.user?.email) return null;

    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [session.user.email]
    );

    return result.rows[0] || null;
}
