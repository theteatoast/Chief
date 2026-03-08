import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/db';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly',
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === 'google') {
                try {
                    await query(
                        `INSERT INTO users (email, name, image, google_access_token, google_refresh_token)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email)
             DO UPDATE SET
               name = EXCLUDED.name,
               image = EXCLUDED.image,
               google_access_token = EXCLUDED.google_access_token,
               google_refresh_token = COALESCE(EXCLUDED.google_refresh_token, users.google_refresh_token)`,
                        [
                            user.email,
                            user.name,
                            user.image,
                            account.access_token,
                            account.refresh_token,
                        ]
                    );
                } catch (error) {
                    console.error('Error upserting user:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
