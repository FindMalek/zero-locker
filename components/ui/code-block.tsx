"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ 
  code, 
  language = "typescript", 
  title,
  showLineNumbers = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy code")
    }
  }

  const lines = code.split('\n')
  const maxLineNumberLength = lines.length.toString().length

  return (
    <div className="my-6 rounded-lg border bg-muted/50 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            {copied ? (
              <>
                <Icons.check className="size-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Icons.copy className="size-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <div className="flex">
                <div className="select-none text-muted-foreground pr-4 border-r mr-4">
                  {lines.map((_, index) => (
                    <div 
                      key={index} 
                      className="leading-6"
                      style={{ 
                        minWidth: `${maxLineNumberLength}ch`,
                        textAlign: 'right'
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {lines.map((line, index) => (
                    <div key={index} className="leading-6">
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {lines.map((line, index) => (
                  <div key={index} className="leading-6">
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            )}
          </code>
        </pre>
        
        {!title && (
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <>
                <Icons.check className="size-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Icons.copy className="size-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
