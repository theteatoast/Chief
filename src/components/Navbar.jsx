'use client';

import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#030303]/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white shadow-lg shadow-cyan-500/25">
                        C
                    </div>
                    <span className="text-lg font-semibold text-white tracking-tight">
                        Chief of Staff
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">{session.user?.name}</p>
                            <p className="text-xs text-gray-400">{session.user?.email}</p>
                        </div>
                        {session.user?.image && (
                            <img
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                className="h-9 w-9 rounded-full ring-2 ring-cyan-500/50"
                            />
                        )}
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-white/10 hover:text-white border border-white/10"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
