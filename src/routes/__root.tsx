import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Footer, Header, themeScript } from '@/site/chrome';
import { ButtonLink } from '@/site/ui';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Interlude — Components for the in-between' },
      {
        name: 'description',
        content:
          'Open-source React components for loading states and AI interactions: honest loaders, hidden mini-games, agent activity, sources and approvals. Install one at a time.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300..700&family=JetBrains+Mono:wght@400..600&display=swap',
      },
    ],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: () => (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-fg px-3 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-1/2 hidden w-full max-w-[76rem] -translate-x-1/2 sm:block"
      >
        <span className="dots-y absolute inset-y-0 left-0" />
        <span className="dots-y absolute inset-y-0 right-0" />
      </div>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  ),
  notFoundComponent: () => (
    <div className="page py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Nothing is loading here.</h1>
      <ButtonLink to="/" className="mt-6">
        Back to the start
      </ButtonLink>
    </div>
  ),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
