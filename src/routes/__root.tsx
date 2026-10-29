import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Footer, Header, themeScript } from '@/site/chrome';
import { REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, pageHead } from '@/site/meta';
import { NotFound } from '@/site/not-found';
import appCss from '../styles.css?url';

/** Describes the site to search engines: a software project with a searchable docs site. */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'SoftwareSourceCode',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      codeRepositoryUrl: REPO_URL,
      programmingLanguage: 'TypeScript',
      license: 'https://opensource.org/license/mit',
    },
  ],
};

export const Route = createRootRoute({
  head: () => {
    const page = pageHead({ path: '/' });
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0e0f11' },
        ...page.meta,
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
      scripts: [
        { children: themeScript },
        { type: 'application/ld+json', children: JSON.stringify(structuredData) },
      ],
    };
  },
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
  notFoundComponent: NotFound,
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
