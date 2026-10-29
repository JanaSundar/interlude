import { useEffect, useState } from 'react';
import { CodeTabs } from './code';
import { loadSources, type SourceFile } from './source';

/** Tabs over the exact files `shadcn add` writes into a project. */
export function SourceViewer({ folders }: { folders: string[] }) {
  const [files, setFiles] = useState<SourceFile[] | null>(null);
  const key = folders.join(',');

  useEffect(() => {
    let live = true;
    loadSources(key.split(','))
      .then((f) => live && setFiles(f))
      .catch(() => live && setFiles([]));
    return () => {
      live = false;
    };
  }, [key]);

  if (!files) return <p className="font-mono text-xs text-faint">Loading source…</p>;
  if (files.length === 0)
    return <p className="font-mono text-xs text-faint">Source unavailable.</p>;
  return (
    <CodeTabs
      label="Source files"
      maxHeight="32rem"
      lineNumbers
      tabs={files.map((f) => ({
        id: f.path,
        label: f.path.replace('components/interlude/', ''),
        code: f.code,
      }))}
    />
  );
}
