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
                {/* TLDR */}
                {content.tldr && (
                    <Section icon="💡" title="TLDR">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{content.tldr}</p>
                    </Section>
                )}

                {/* Who You Are Meeting */}
                {content.whoYouAreMeeting && content.whoYouAreMeeting.length > 0 && (
                    <Section icon="👥" title="Who You're Meeting">
                        <div className="space-y-3">
                            {content.whoYouAreMeeting.map((person, i) => (
                                <div key={i} className="rounded-lg bg-white/5 px-4 py-3 border border-white/5">
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{person.name}</p>
                                            <p className="text-xs text-indigo-300">{person.role} {person.company && person.company !== 'Unknown' ? `@ ${person.company}` : ''}</p>
                                        </div>
                                    </div>
                                    {person.background && person.background !== person.email && person.background !== 'Unknown' && (
                                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed bg-black/20 p-2 rounded">{person.background}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Relevant Context */}
                {content.relevantContext && (
                    <Section icon="📧" title="Relevant Context">
                        <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">{content.relevantContext}</p>
                    </Section>
                )}

                {/* Strategic Insights */}
                {content.strategicInsights && Object.keys(content.strategicInsights).length > 0 && (
                    <Section icon="🎯" title="Strategic Insights">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {content.strategicInsights.whatTheyWant && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                    <h5 className="text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wider">What They Want</h5>
                                    <p className="text-sm text-gray-300">{content.strategicInsights.whatTheyWant}</p>
                                </div>
                            )}
                            {content.strategicInsights.leveragePoints && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <h5 className="text-xs font-semibold text-emerald-300 mb-1 uppercase tracking-wider">Leverage Points</h5>
                                    <p className="text-sm text-gray-300">{content.strategicInsights.leveragePoints}</p>
                                </div>
                            )}
                            {content.strategicInsights.potentialRisks && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <h5 className="text-xs font-semibold text-red-300 mb-1 uppercase tracking-wider">Potential Risks</h5>
                                    <p className="text-sm text-gray-300">{content.strategicInsights.potentialRisks}</p>
                                </div>
                            )}
                            {content.strategicInsights.opportunities && (
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                    <h5 className="text-xs font-semibold text-purple-300 mb-1 uppercase tracking-wider">Opportunities</h5>
                                    <p className="text-sm text-gray-300">{content.strategicInsights.opportunities}</p>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* Suggested Agenda */}
                {content.suggestedAgenda && content.suggestedAgenda.length > 0 && (
                    <Section icon="📝" title="Suggested Agenda">
                        <ol className="space-y-2">
                            {content.suggestedAgenda.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                                        {i + 1}
                                    </span>
                                    <span className="pt-0.5">{item}</span>
                                </li>
                            ))}
                        </ol>
                    </Section>
                )}

                {/* Smart Questions */}
                {content.smartQuestionsToAsk && content.smartQuestionsToAsk.length > 0 && (
                    <Section icon="❓" title="Smart Questions to Ask">
                        <ul className="space-y-2.5">
                            {content.smartQuestionsToAsk.map((q, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                                    <span className="font-medium">{q}</span>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* Recommended Next Step */}
                {content.recommendedNextStep && (
                    <Section icon="🚀" title="Recommended Next Step">
                        <div className="flex items-start gap-3 text-sm text-gray-300 bg-gradient-to-r from-emerald-500/10 to-transparent p-4 rounded-lg border-l-2 border-emerald-500">
                            <span className="text-lg">→</span>
                            <span className="pt-0.5 font-medium">{content.recommendedNextStep}</span>
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
}

function Section({ icon, title, children }) {
    return (
        <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-3 tracking-tight">
                <span>{icon}</span>
                {title}
            </h4>
            {children}
        </div>
    );
}
