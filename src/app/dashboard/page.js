'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MeetingCard from '@/components/MeetingCard';
import BriefCard from '@/components/BriefCard';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeBrief, setActiveBrief] = useState(null);
    const [activeMeetingId, setActiveMeetingId] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const fetchMeetings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/meetings');
            if (!res.ok) throw new Error('Failed to fetch meetings');
            const data = await res.json();
            setMeetings(data.meetings || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) {
            fetchMeetings();
        }
    }, [session, fetchMeetings]);

    const handleBriefGenerated = (meetingId, brief) => {
        setActiveBrief(brief);
        setActiveMeetingId(meetingId);

        // Update the meeting in the list to show it has a brief
        setMeetings((prev) =>
            prev.map((m) =>
                m.id === meetingId
                    ? { ...m, briefs: [brief] }
                    : m
            )
        );
    };

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="mx-auto max-w-6xl px-6 pt-24 pb-16">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Good {getGreeting()}, {session.user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-400">
                        Here&apos;s your meeting schedule for the next 24 hours.
                    </p>
                </div>

                {/* Error state */}
                {error && (
                    <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-300">
                        <p className="font-medium mb-1">Something went wrong</p>
                        <p>{error}</p>
                        <button
                            onClick={() => { setError(null); fetchMeetings(); }}
                            className="mt-2 text-red-200 underline underline-offset-2 hover:text-white"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="animate-shimmer rounded-2xl border border-white/5 bg-gray-900/50 p-6 h-48"
                            />
                        ))}
                    </div>
                )}

                {/* Content */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Meetings List */}
                        <div className={`${activeBrief ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-400" />
                                    Upcoming Meetings
                                    <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-gray-400">
                                        {meetings.length}
                                    </span>
                                </h2>
                                <button
                                    onClick={fetchMeetings}
                                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white border border-white/10"
                                >
                                    ↻ Refresh
                                </button>
                            </div>

                            {meetings.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-gray-900/30 px-6 py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
                                        <span className="text-3xl">📅</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No upcoming meetings</h3>
                                    <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                        You&apos;re all clear for the next 24 hours. Meetings from your Google Calendar will appear here automatically.
                                    </p>
                                </div>
                            ) : (
                                <div className={`grid gap-4 ${activeBrief ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
                                    {meetings.map((meeting, i) => (
                                        <div
                                            key={meeting.id}
                                            className="animate-fade-in"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <MeetingCard
                                                meeting={meeting}
                                                onBriefGenerated={handleBriefGenerated}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Brief Panel */}
                        {activeBrief && (
                            <div className="lg:col-span-3 animate-fade-in">
                                <div className="sticky top-24">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold text-white">
                                            AI Brief
                                        </h2>
                                        <button
                                            onClick={() => { setActiveBrief(null); setActiveMeetingId(null); }}
                                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                                        >
                                            ✕ Close
                                        </button>
                                    </div>
                                    <BriefCard brief={activeBrief} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}
