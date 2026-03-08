import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { meetingId } = await params;

        // Get user
        const userResult = await query('SELECT * FROM users WHERE email = $1', [session.user.email]);
        const user = userResult.rows[0];
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get brief for meeting
        const briefResult = await query(
            'SELECT * FROM briefs WHERE meeting_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1',
            [meetingId, user.id]
        );

        if (briefResult.rows.length === 0) {
            return NextResponse.json({ brief: null });
        }

        return NextResponse.json({ brief: briefResult.rows[0] });
    } catch (error) {
        console.error('Error fetching brief:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brief', details: error.message },
            { status: 500 }
        );
    }
}
