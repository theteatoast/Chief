import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { getRelatedEmails } from '@/lib/google/gmail';
import { generateMeetingBrief } from '@/lib/ai/generate-brief';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { meetingId } = await request.json();
        if (!meetingId) {
            return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
        }

        // Get user
        const userResult = await query('SELECT * FROM users WHERE email = $1', [session.user.email]);
        const user = userResult.rows[0];
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get meeting details
        const meetingResult = await query(
            'SELECT * FROM meetings WHERE id = $1 AND user_id = $2',
            [meetingId, user.id]
        );
        const meeting = meetingResult.rows[0];
        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Fetch related emails from Gmail
        let emails = [];
        try {
            const participants = typeof meeting.participants === 'string'
                ? JSON.parse(meeting.participants)
                : meeting.participants || [];
            emails = await getRelatedEmails(session.accessToken, participants, meeting.title);
        } catch (error) {
            console.error('Error fetching emails:', error.message);
            // Continue without emails
        }

        // Generate AI brief
        const participants = typeof meeting.participants === 'string'
            ? JSON.parse(meeting.participants)
            : meeting.participants || [];

        const briefContent = await generateMeetingBrief({
            title: meeting.title,
            participants,
            description: meeting.description,
            emails,
            startTime: meeting.start_time,
        });

        // Store brief in DB
        const briefResult = await query(
            `INSERT INTO briefs (meeting_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [meeting.id, user.id, JSON.stringify(briefContent)]
        );

        return NextResponse.json({ brief: briefResult.rows[0] });
    } catch (error) {
        console.error('Error generating brief:', error);
        return NextResponse.json(
            { error: 'Failed to generate brief', details: error.message },
            { status: 500 }
        );
    }
}
