'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import yaml from 'js-yaml'
import { useTheme } from 'next-themes'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import('react-ace')
    await import('ace-builds/src-noconflict/mode-json')
    await import('ace-builds/src-noconflict/mode-yaml')
    await import('ace-builds/src-noconflict/theme-github')
    await import('ace-builds/src-noconflict/theme-monokai')
    await import('ace-builds/src-noconflict/ext-searchbox')
    return ace
  },
  { ssr: false }
)

const MarkdownContent = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: ({ ...props }) => <a className="text-blue-500 hover:text-blue-700 underline" {...props} />,
    }}
  >
    {children}
  </ReactMarkdown>
)

interface OpenAPISpec {
  info: {
    title: string;
    description: string;
  };
  paths: Record<string, Record<string, {
    tags: string[];
    summary: string;
    description: string;
  }>>;
  tags?: Array<{ name: string; description: string }>;
}

export default function OpenAPIDescriber() {
  const [openApiSpec, setOpenApiSpec] = useState('')
  const [parsedSpec, setParsedSpec] = useState<OpenAPISpec | null>(null)
  const [specFormat, setSpecFormat] = useState<'json' | 'yaml'>('json')
  const { theme } = useTheme()

  useEffect(() => {
    detectFormat(openApiSpec)
  }, [openApiSpec])

  const detectFormat = (content: string) => {
    try {
      JSON.parse(content)
      setSpecFormat('json')
    } catch {
      try {
        yaml.load(content)
        setSpecFormat('yaml')
      } catch {
        setSpecFormat('json')
      }
    }
  }

  const parseOpenApiSpec = () => {
    try {
      const parsed = specFormat === 'json' ? JSON.parse(openApiSpec) : yaml.load(openApiSpec) as OpenAPISpec
      setParsedSpec(parsed)
    } catch (error) {
      console.error('Failed to parse OpenAPI spec:', error)
    }
  }

  const updateSpec = (path: string, value: string) => {
    if (!parsedSpec) return
    const newSpec = JSON.parse(JSON.stringify(parsedSpec))
    const keys = path.split('.')
    let current: any = newSpec
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    setParsedSpec(newSpec)
    setOpenApiSpec(specFormat === 'json' ? JSON.stringify(newSpec, null, 2) : yaml.dump(newSpec))
  }

  const groupEndpointsByTag = () => {
    if (!parsedSpec) return {}
    const groupedEndpoints: Record<string, Array<{ path: string; method: string; details: any }>> = {}
    Object.entries(parsedSpec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, details]) => {
        const tags = details.tags || ['Untagged']
        tags.forEach((tag) => {
          if (!groupedEndpoints[tag]) {
            groupedEndpoints[tag] = []
          }
          groupedEndpoints[tag].push({ path, method, details })
        })
      })
    })
    return groupedEndpoints
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-4">OpenAPI Describer</h1>
      <p className="text-lg mb-8">
        This tool allows you to paste an OpenAPI specification (in JSON or YAML format) and view a simplified, editable representation of the API endpoints and their details.
      </p>
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="w-full lg:w-1/2 pr-4 mb-8 lg:mb-0">
          <AceEditor
            mode={specFormat}
            theme={theme === 'dark' ? 'monokai' : 'github'}
            onChange={setOpenApiSpec}
            name="openapi-editor"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              useWorker: false,
              showPrintMargin: false,
            }}
            style={{ width: '100%', height: 'calc(100% - 40px)' }}
            value={openApiSpec}
            placeholder="Paste your OpenAPI spec here (JSON or YAML format)"
            commands={[
              {
                name: 'find',
                bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
                exec: 'find',
                readOnly: true
              }
            ]}
          />
          <Button onClick={parseOpenApiSpec} className="mt-4">Parse Spec</Button>
        </div>
        <div className="w-full lg:w-1/2 pl-4 overflow-y-auto">
          {parsedSpec && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Toolkit: {parsedSpec.info.title}</h2>
              <Input
                value={parsedSpec.info.title}
                onChange={(e) => updateSpec('info.title', e.target.value)}
                className="mb-2"
              />
              <div className="mb-4">
                <MarkdownContent>{parsedSpec.info.description}</MarkdownContent>
              </div>
              {Object.entries(groupEndpointsByTag()).map(([tag, endpoints]) => (
                <Card key={tag} className="mb-6">
                  <CardHeader>
                    <CardTitle>{tag}</CardTitle>
                    <CardDescription className="whitespace-pre-wrap">
                      <MarkdownContent>
                        {parsedSpec.tags?.find((t) => t.name === tag)?.description || 'No description available.'}
                      </MarkdownContent>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {endpoints.map(({ path, method, details }) => (
                        <AccordionItem value={`${path}-${method}`} key={`${path}-${method}`}>
                          <AccordionTrigger>
                            {details.summary || `${method.toUpperCase()} ${path}`}
                          </AccordionTrigger>
                          <AccordionContent>
                            <MarkdownContent>
                              {`**Description:** ${details.description}\n\n**Path:** ${path}\n\n**Method:** ${method.toUpperCase()}`}
                            </MarkdownContent>
                            {/* Add more details here as needed */}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .ace_search {
          background-color: ${theme === 'dark' ? '#1e1e1e' : '#f0f0f0'} !important;
          color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
          border-color: ${theme === 'dark' ? '#333333' : '#cccccc'} !important;
        }
        .ace_search_form, .ace_replace_form {
          border-color: ${theme === 'dark' ? '#333333' : '#cccccc'} !important;
        }
        .ace_search_field {
          background-color: ${theme === 'dark' ? '#252525' : '#ffffff'} !important;
          color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
        }
        .ace_button {
          background-color: ${theme === 'dark' ? '#3a3a3a' : '#f0f0f0'} !important;
          color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
        }
        .ace_button:hover {
          background-color: ${theme === 'dark' ? '#4a4a4a' : '#e0e0e0'} !important;
        }
      `}</style>
    </div>
  )
}