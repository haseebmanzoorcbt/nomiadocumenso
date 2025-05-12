import { useEffect, useState } from 'react';

import Plausible from 'plausible-tracker';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router';
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from 'remix-themes';

import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { SessionProvider } from '@documenso/lib/client-only/providers/session';
import { APP_I18N_OPTIONS, type SupportedLanguageCodes } from '@documenso/lib/constants/i18n';
import { type TGetTeamsResponse, getTeams } from '@documenso/lib/server-only/team/get-teams';
import { createPublicEnv, env } from '@documenso/lib/utils/env';
import { extractLocaleData } from '@documenso/lib/utils/i18n';
import { TrpcProvider } from '@documenso/trpc/react';
import { Toaster } from '@documenso/ui/primitives/toaster';
import { TooltipProvider } from '@documenso/ui/primitives/tooltip';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { GenericErrorLayout } from './components/general/generic-error-layout';
import { langCookie } from './storage/lang-cookie.server';
import { themeSessionResolver } from './storage/theme-session.server';
import { appMetaTags } from './utils/meta';

const { trackPageview } = Plausible({
  domain: 'documenso.com',
  trackLocalhost: false,
});

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400..600&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: stylesheet },
];

export function meta() {
  return appMetaTags();
}

/**
 * Don't revalidate (run the loader on sequential navigations) on the root layout
 *
 * Update values via providers.
 */
export const shouldRevalidate = () => false;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isInternal = url.searchParams.get('internal') === 'true';
  const isEdit = url.searchParams.get('edit') === 'true';
  const sessionId = url.searchParams.get('sessionId');

  const headers = new Headers();
  let lang: SupportedLanguageCodes = await langCookie.parse(request.headers.get('cookie') ?? '');
  headers.append('Set-Cookie', await langCookie.serialize(lang));

  // Create a modified request with the sessionId as a cookie if it exists in query params
  let modifiedRequest = request;

  if (sessionId) {
    console.log('Setting sessionId cookie from query param:', sessionId);

    const cookieExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();

    const setCookieHeaders = [
      `__Secure-sessionId=; Path=/; Domain=sign.nomiadocs.com; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None`,
      `__Secure-sessionId=${sessionId}; Path=/; Domain=sign.nomiadocs.com; Expires=${cookieExpires}; HttpOnly; Secure; SameSite=None`,
    ];

    setCookieHeaders.forEach((cookie) => {
      headers.append('Set-Cookie', cookie);
    });

    // Create a new request with the updated cookie header for this request cycle
    const cookieHeader = request.headers.get('cookie') || '';

    // Remove any existing sessionId cookie from the header
    let cookieArray = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter((cookie) => !cookie.startsWith('__Secure-sessionId='));

    // Add the new sessionId
    cookieArray.push(`__Secure-sessionId=${sessionId}`);
    const updatedCookieHeader = cookieArray.join('; ');

    // Create new request with updated cookies
    const newHeaders = new Headers(request.headers);
    newHeaders.set('cookie', updatedCookieHeader);

    modifiedRequest = new Request(request.url, {
      headers: newHeaders,
      method: request.method,
      body: request.body,
      signal: request.signal,
      cache: request.cache,
      credentials: request.credentials,
      integrity: request.integrity,
      keepalive: request.keepalive,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
    });
  }

  // Use the modified request that includes the sessionId cookie
  const session = await getOptionalSession(modifiedRequest);
  let teams: TGetTeamsResponse = [];

  if (session.isAuthenticated) {
    teams = await getTeams({ userId: session.user.id });
  } else if (isInternal && sessionId) {
    console.warn('Failed to authenticate with sessionId:', sessionId);
  }

  const { getTheme } = await themeSessionResolver(request);

  if (!APP_I18N_OPTIONS.supportedLangs.includes(lang)) {
    lang = extractLocaleData({ headers: request.headers }).lang;
  }

  return data(
    {
      lang,
      theme: getTheme(),
      session: session.isAuthenticated
        ? {
            user: session.user,
            session: session.session,
            teams,
          }
        : null,
      publicEnv: createPublicEnv(),
    },
    {
      headers,
    },
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, session } = useLoaderData<typeof loader>() || {};

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (env('NODE_ENV') === 'production') {
      trackPageview();
    }
  }, [location.pathname]);

  return (
    <ThemeProvider specifiedTheme={theme} themeAction="/api/theme">
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { publicEnv, session, lang, ...data } = useLoaderData<typeof loader>() || {};

  const [theme] = useTheme();

  return (
    <html translate="no" lang={lang} data-theme={'light'} className={theme ?? ''}>
      <head>
        <meta charSet="utf-8" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="google" content="notranslate" />
        <Meta />
        <Links />
        <meta name="google" content="notranslate" />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />

        {/* Fix: https://stackoverflow.com/questions/21147149/flash-of-unstyled-content-fouc-in-firefox-only-is-ff-slow-renderer */}
        <script>0</script>
      </head>
      <body>
        <SessionProvider initialSession={session}>
          <TooltipProvider>
            <TrpcProvider>
              {children}
              <Toaster />
            </TrpcProvider>
          </TooltipProvider>
        </SessionProvider>
        <ScrollRestoration />
        <Scripts />

        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__ = ${JSON.stringify(publicEnv)}`,
          }}
        />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const errorCode = isRouteErrorResponse(error) ? error.status : 500;

  if (errorCode !== 404) {
    console.error('[RootErrorBoundary]', error);
  }

  return <GenericErrorLayout errorCode={errorCode} />;
}
