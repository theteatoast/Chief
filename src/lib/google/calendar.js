import { google } from 'googleapis';

export async function getUpcomingMeetings(accessToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 20,
    });

    const events = response.data.items || [];

    return events
        .filter((event) => event.start?.dateTime) // Only timed events
        .map((event) => ({
            eventId: event.id,
            title: event.summary || 'Untitled Meeting',
            description: event.description || '',
            start: event.start.dateTime,
            end: event.end.dateTime,
            participants: (event.attendees || []).map((a) => ({
                email: a.email,
                name: a.displayName || a.email,
                responseStatus: a.responseStatus,
            })),
            organizer: event.organizer
                ? { email: event.organizer.email, name: event.organizer.displayName || event.organizer.email }
                : null,
            location: event.location || '',
            meetLink: event.hangoutLink || '',
        }));
}
