import { AnimatePresence, motion } from 'motion/react';
import { AgentActivity } from '@registry/components/interlude/agent-activity/agent-activity';
import { softSpring } from '@registry/components/interlude/primitives/motion';
import { ResponseActions } from '@registry/components/interlude/response-actions/response-actions';
import { StreamingMarkdown } from '@registry/components/interlude/streaming-markdown/streaming-markdown';
import { ThinkingIndicator } from '@registry/components/interlude/thinking-indicator/thinking-indicator';
import { prompt, runTimeline, viewRun } from './fixtures';
import { useReplay } from './replay';
import { Button } from './ui';

const rise = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: softSpring,
};

/** A whole agent turn composed from registry components, driven by a scripted event log. */
export function Specimen() {
  const { released, done, replay } = useReplay(runTimeline);
  const run = viewRun(released, done);
  return (
    <div className="flex h-[36rem] min-w-0 flex-col overflow-hidden rounded-panel border border-line bg-raised shadow-[0_30px_80px_-40px_rgb(0_0_0/0.5)]">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-line pr-1.5 pl-4">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-fg/10" />
          ))}
        </span>
        <span className="font-mono text-[11px] text-faint">
          scripted replay · no model is called
        </span>
        <Button variant="ghost" size="sm" onClick={replay} className="ml-auto">
          Replay
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
        <p className="max-w-[85%] self-end rounded-[14px] rounded-br-[4px] bg-fg/[0.06] px-3.5 py-2 text-[14px]">
          {prompt}
        </p>
        <AnimatePresence initial={false}>
          {run.thinking && (
            <motion.div key="thinking" {...rise}>
              <ThinkingIndicator state={run.thinking} tool={run.tool} />
            </motion.div>
          )}
          {run.events.length > 0 && (
            <motion.div key="activity" {...rise}>
              <AgentActivity events={run.events} title="Investigating" />
            </motion.div>
          )}
          {run.text && (
            <motion.div key="answer" {...rise} className="px-1">
              <StreamingMarkdown content={run.text} streaming={!done} />
            </motion.div>
          )}
          {done && (
            <motion.div key="actions" {...rise}>
              <ResponseActions
                actions={['copy', 'regenerate', 'edit']}
                copyText={run.text}
                className="-ml-0.5"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
