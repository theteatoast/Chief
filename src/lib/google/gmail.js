import { google } from 'googleapis';

export async function getRelatedEmails(accessToken, participants, meetingTitle) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    // Build search query from participants and meeting title
    const participantEmails = participants
        .map((p) => (typeof p === 'string' ? p : p.email))
        .filter((email) => email)
        .slice(0, 3); // Limit to avoid overly complex queries

    const queries = [];

    // Search by participant emails
    if (participantEmails.length > 0) {
        const fromQuery = participantEmails.map((e) => `from:${e}`).join(' OR ');
        queries.push(`(${fromQuery})`);
    }

    // Search by meeting title keywords
    if (meetingTitle && meetingTitle !== 'Untitled Meeting') {
        const titleWords = meetingTitle
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .slice(0, 3);
        if (titleWords.length > 0) {
            queries.push(`subject:(${titleWords.join(' ')})`);
        }
    }

    if (queries.length === 0) {
        return [];
    }

    const searchQuery = queries.join(' OR ');

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: searchQuery,
            maxResults: 5,
        });

        const messages = response.data.messages || [];

        const emailDetails = await Promise.all(
            messages.map(async (msg) => {
                try {
                    const detail = await gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id,
                        format: 'metadata',
                        metadataHeaders: ['Subject', 'From', 'Date'],
                    });

                    const headers = detail.data.payload?.headers || [];
                    const getHeader = (name) =>
                        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

                    return {
                        id: msg.id,
                        subject: getHeader('Subject'),
                        from: getHeader('From'),
                        date: getHeader('Date'),
                        snippet: detail.data.snippet || '',
                    };
                } catch {
                    return null;
                }
            })
        );

        return emailDetails.filter(Boolean);
    } catch (error) {
        console.error('Error fetching emails:', error.message);
        return [];
    }
}
