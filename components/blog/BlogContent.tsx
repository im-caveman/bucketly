'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface BlogContentProps {
    content: string
}

export function BlogContent({ content }: BlogContentProps) {
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom styling for markdown elements
                    h1: ({ node, ...props }) => (
                        <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-semibold mt-6 mb-3" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-2xl font-semibold mt-5 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="mb-4 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="ml-4" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote
                            className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                            {...props}
                        />
                    ),
                    code: ({ node, inline, ...props }: any) => {
                        if (inline) {
                            return (
                                <code
                                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                                    {...props}
                                />
                            )
                        }
                        return <code {...props} />
                    },
                    pre: ({ node, ...props }) => (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a
                            className="text-primary hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),
                    img: ({ node, ...props }) => (
                        <img className="rounded-lg my-4 w-full" {...props} alt={props.alt || ''} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-border" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => (
                        <th className="px-4 py-2 bg-muted font-semibold text-left" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="px-4 py-2 border-t border-border" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
