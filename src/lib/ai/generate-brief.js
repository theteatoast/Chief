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

    const prompt = `You are an elite Chief of Staff preparing a briefing for a busy founder before an important meeting.

Your job is to compress all relevant information into a clear, high signal briefing that can be read in under 60 seconds.

You must think like a strategic advisor.

Use the context provided to produce a structured briefing.

MEETING DATA:
* Meeting Title: ${title}
* Meeting Time: ${startTime}
* Participants:
  - ${participantList || 'No participants listed'}
* Meeting Description: ${description || 'No description provided'}

EMAIL CONTEXT:
${emailContext}

WEB RESEARCH:
No web context available for this meeting.

Your output must follow this structure:
1. TLDR: A 2–3 sentence summary explaining why this meeting matters.
2. Who You Are Meeting: Short profiles of each participant.
3. Relevant Context: Key info from emails.
4. Strategic Insights: Important signals (what they want, leverage, risks, opportunities).
5. Suggested Agenda: Simple agenda.
6. Smart Questions To Ask: 5 thoughtful questions.
7. Recommended Next Step: Best next action.

Please generate the briefing strictly in the following JSON format:
{
  "tldr": "summary here",
  "whoYouAreMeeting": [
    { "name": "Name", "role": "Role", "company": "Company", "background": "Notable background" }
  ],
  "relevantContext": "context here",
  "strategicInsights": {
    "whatTheyWant": "...",
    "leveragePoints": "...",
    "potentialRisks": "...",
    "opportunities": "..."
  },
  "suggestedAgenda": ["item 1", "item 2"],
  "smartQuestionsToAsk": ["q1", "q2"],
  "recommendedNextStep": "next step here"
}

Respond ONLY with the JSON object, no markdown formatting, no code blocks, and no extra text before or after the JSON.`;

    const completion = await getGroqClient().chat.completions.create({
        model: 'llama-3.3-70b-versatile', // High quality model for instructions
        messages: [
            {
                role: 'system',
                content: 'You are an elite Chief of Staff and strategic advisor. Always respond with valid JSON only. Do not wrap the response in markdown blocks.',
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
            tldr: content || 'Unable to generate brief.',
            whoYouAreMeeting: participants.map((p) => ({
                name: p.name || p.email,
                role: 'Participant',
                company: 'Unknown',
                background: p.email
            })),
            relevantContext: 'Unable to process email context.',
            strategicInsights: {
                whatTheyWant: 'Determine meeting objectives',
                leveragePoints: 'N/A',
                potentialRisks: 'Unclear agenda',
                opportunities: 'Establish relationship'
            },
            suggestedAgenda: ['Review objectives', 'Discuss key topics', 'Align on next steps'],
            smartQuestionsToAsk: ['What defines success for today?', 'What are the main blockers?'],
            recommendedNextStep: 'Follow up on action items',
        };
    }
}
