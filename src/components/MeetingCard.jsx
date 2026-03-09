'use client';

import { useState } from 'react';

export default function MeetingCard({ meeting, onBriefGenerated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const participants = typeof meeting.participants === 'string'
        ? JSON.parse(meeting.participants)
        : meeting.participants || [];

    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);
    const hasBrief = meeting.briefs && meeting.briefs.length > 0;

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getTimeUntil = () => {
        const diff = startTime - new Date();
        if (diff < 0) return 'Happening now';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `In ${hours}h ${minutes}m`;
        return `In ${minutes}m`;
    };

    const handleGenerateBrief = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/briefs/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingId: meeting.id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate brief');
            }

            const data = await res.json();
            onBriefGenerated(meeting.id, data.brief);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0a0f]/80 to-[#030303]/50 p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(100,200,255,0.1)]">
            {/* Time badge */}
            <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {getTimeUntil()}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white pr-24 mb-2">{meeting.title}</h3>

            {/* Time */}
            <p className="text-sm text-gray-400 mb-4">
                {formatTime(startTime)} — {formatTime(endTime)}
            </p>

            {/* Participants */}
            {participants.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Participants
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {participants.slice(0, 5).map((p, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-300 ring-1 ring-white/10"
                            >
                                {p.name || p.email}
                            </span>
                        ))}
                        {participants.length > 5 && (
                            <span className="inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                                +{participants.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Description */}
            {meeting.description && (
                <p className="text-sm text-gray-400 mb-5 line-clamp-2">{meeting.description}</p>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Generate button */}
            <button
                onClick={handleGenerateBrief}
                disabled={loading}
                className={`w-full rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 ${hasBrief
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    : 'bg-[#0a0a0f]/90 border border-cyan-500/20 shadow-[0_0_15px_rgba(100,200,255,0.05)] hover:shadow-[0_0_25px_rgba(100,200,255,0.15)] hover:border-cyan-500/40 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating Brief...
                    </span>
                ) : hasBrief ? (
                    '✨ Regenerate Brief'
                ) : (
                    '⚡ Generate AI Brief'
                )}
            </button>
        </div>
    );
}
