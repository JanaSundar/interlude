import { REPO } from '@registry/catalog';

export { REPO };
export const REPO_URL = `https://github.com/${REPO}`;

export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof packageManagers)[number];

const runners: Record<PackageManager, string> = {
  pnpm: 'pnpm dlx',
  npm: 'npx',
  yarn: 'yarn dlx',
  bun: 'bunx --bun',
};

/** shadcn resolves `owner/repo/item` straight from the repository's registry.json. */
export const installCommandFor = (pm: PackageManager, item: string) =>
  `${runners[pm]} shadcn@latest add ${REPO}/${item}`;

export const installCommand = (item: string) => installCommandFor('npm', item);

const adders: Record<PackageManager, string> = {
  pnpm: 'pnpm add',
  npm: 'npm install',
  yarn: 'yarn add',
  bun: 'bun add',
};

/** Adding an npm dependency, for manual installs. */
export const addDependencyFor = (pm: PackageManager, pkg: string) => `${adders[pm]} ${pkg}`;

export const sourceUrl = (path: string) => `${REPO_URL}/blob/main/${path}`;
