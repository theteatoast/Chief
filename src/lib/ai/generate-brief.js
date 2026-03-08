import Groq from 'groq-sdk';

let groq;

function getGroqClient() {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groq;
}

export async function generateMeetingBrief({ title, participants, description, emails, startTime }) {
    const participantList = participants
        .map((p) => (typeof p === 'string' ? p : `${p.name || p.email} (${p.email})`))
        .join('\n  - ');

    const emailContext = emails && emails.length > 0
        ? emails
            .map((e) => `Subject: ${e.subject}\nFrom: ${e.from}\nDate: ${e.date}\nSnippet: ${e.snippet}`)
            .join('\n---\n')
        : 'No recent email threads found with participants.';

    const prompt = `You are an executive chief of staff preparing a meeting brief.

Using the following information, prepare a short structured briefing for a professional meeting.

MEETING DETAILS:
- Title: ${title}
- Time: ${startTime}
- Description: ${description || 'No description provided'}
- Participants:
  - ${participantList || 'No participants listed'}

RECENT EMAIL CONTEXT WITH PARTICIPANTS:
${emailContext}

Please generate a structured meeting briefing in the following JSON format:
{
  "summary": "2-3 sentence overview of the meeting purpose and context",
  "attendees": [
    { "name": "Name", "email": "email", "role": "their likely role/relationship" }
  ],
  "emailContext": "Key insights from recent email threads relevant to this meeting",
  "suggestedAgenda": [
    "Agenda item 1",
    "Agenda item 2",
    "Agenda item 3"
  ],
  "suggestedQuestions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ],
  "nextSteps": [
    "Suggested follow-up 1",
    "Suggested follow-up 2"
  ]
}

Respond ONLY with the JSON object, no markdown formatting, no code blocks, and no extra text before or after the JSON.`;

    const completion = await getGroqClient().chat.completions.create({
        model: 'llama-3.3-70b-versatile', // High quality model for instructions
        messages: [
            {
                role: 'system',
                content: 'You are a professional executive assistant. Always respond with valid JSON only. Do not wrap the response in markdown blocks.',
            },
            { role: 'user', content: prompt },
        ],
        temperature: 0.1, // low temp for JSON consistency
        max_tokens: 1500,
        response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content?.trim();

    try {
        return JSON.parse(content);
    } catch {
        // If parsing fails, return a structured fallback
        return {
            summary: content || 'Unable to generate brief.',
            attendees: participants.map((p) => ({
                name: p.name || p.email,
                email: p.email,
                role: 'Participant',
            })),
            emailContext: 'Unable to process email context.',
            suggestedAgenda: ['Review meeting objectives', 'Discuss key topics', 'Align on next steps'],
            suggestedQuestions: ['What are the key priorities?', 'Are there any blockers?'],
            nextSteps: ['Follow up on action items', 'Share meeting notes'],
        };
    }
}
