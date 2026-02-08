'use client'

import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

export function Caption({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed bg-stocrates-gray/50 p-4 rounded-lg border-2 border-stocrates-dark/20">
      <MemoizedReactMarkdown
        className="prose prose-sm break-words prose-p:leading-relaxed prose-p:my-2 font-body text-stocrates-dark prose-headings:font-title prose-headings:text-stocrates-dark prose-strong:text-stocrates-dark"
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          p({ children }) {
            return <p className="my-2 first:mt-0 last:mb-0">{children}</p>
          },
          strong({ children }) {
            return <strong className="font-semibold">{children}</strong>
          },
          ul({ children }) {
            return <ul className="my-2 space-y-1">{children}</ul>
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>
          }
        }}
      >
        {children}
      </MemoizedReactMarkdown>
    </div>
  )
}

