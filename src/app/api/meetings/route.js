import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/lib/db';
import { getUpcomingMeetings } from '@/lib/google/calendar';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from DB
        const userResult = await query('SELECT * FROM users WHERE email = $1', [session.user.email]);
        const user = userResult.rows[0];
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch meetings from Google Calendar
        const calendarMeetings = await getUpcomingMeetings(session.accessToken);

        // Upsert meetings into DB
        for (const meeting of calendarMeetings) {
            await query(
                `INSERT INTO meetings (user_id, google_event_id, title, description, start_time, end_time, participants)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, google_event_id)
         DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           participants = EXCLUDED.participants`,
                [
                    user.id,
                    meeting.eventId,
                    meeting.title,
                    meeting.description,
                    meeting.start,
                    meeting.end,
                    JSON.stringify(meeting.participants),
                ]
            );
        }

        // Fetch meetings from DB (with any existing briefs)
        const meetingsResult = await query(
            `SELECT m.*, 
              (SELECT json_agg(b.*) FROM briefs b WHERE b.meeting_id = m.id) as briefs
       FROM meetings m
       WHERE m.user_id = $1
         AND m.start_time >= NOW()
         AND m.start_time <= NOW() + INTERVAL '24 hours'
       ORDER BY m.start_time ASC`,
            [user.id]
        );

        return NextResponse.json({ meetings: meetingsResult.rows });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch meetings', details: error.message },
            { status: 500 }
        );
    }
}
