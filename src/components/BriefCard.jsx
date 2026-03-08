'use client';

export default function BriefCard({ brief }) {
    if (!brief) return null;

    const content = typeof brief.content === 'string' ? JSON.parse(brief.content) : brief.content;

    return (
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-purple-950/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-4 border-b border-indigo-500/10">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <h3 className="text-base font-semibold text-white">AI Meeting Brief</h3>
                    <span className="ml-auto text-xs text-gray-500">
                        {new Date(brief.created_at).toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary */}
                {content.summary && (
                    <Section icon="💡" title="Meeting Summary">
                        <p className="text-sm text-gray-300 leading-relaxed">{content.summary}</p>
                    </Section>
                )}

                {/* Attendees */}
                {content.attendees && content.attendees.length > 0 && (
                    <Section icon="👥" title="Who You're Meeting">
                        <div className="space-y-2">
                            {content.attendees.map((person, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">{person.name}</p>
                                        <p className="text-xs text-gray-400">{person.email}</p>
                                    </div>
                                    {person.role && (
                                        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300 ring-1 ring-indigo-500/20">
                                            {person.role}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Email Context */}
                {content.emailContext && (
                    <Section icon="📧" title="Key Context from Emails">
                        <p className="text-sm text-gray-300 leading-relaxed">{content.emailContext}</p>
                    </Section>
                )}

                {/* Suggested Agenda */}
                {content.suggestedAgenda && content.suggestedAgenda.length > 0 && (
                    <Section icon="📝" title="Suggested Agenda">
                        <ol className="space-y-2">
                            {content.suggestedAgenda.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-300">
                                        {i + 1}
                                    </span>
                                    <span className="pt-0.5">{item}</span>
                                </li>
                            ))}
                        </ol>
                    </Section>
                )}

                {/* Suggested Questions */}
                {content.suggestedQuestions && content.suggestedQuestions.length > 0 && (
                    <Section icon="❓" title="Suggested Questions">
                        <ul className="space-y-2">
                            {content.suggestedQuestions.map((q, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* Next Steps */}
                {content.nextSteps && content.nextSteps.length > 0 && (
                    <Section icon="🚀" title="Suggested Next Steps">
                        <ul className="space-y-2">
                            {content.nextSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="mt-0.5 text-green-400">→</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
            </div>
        </div>
    );
}

function Section({ icon, title, children }) {
    return (
        <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <span>{icon}</span>
                {title}
            </h4>
            {children}
        </div>
    );
}
