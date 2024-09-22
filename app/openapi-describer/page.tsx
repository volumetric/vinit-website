'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import yaml from 'js-yaml'
import { useTheme } from 'next-themes'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApiSpecs, fetchSpecContent, SpecItem } from './api'

// Dynamically import AceEditor to avoid SSR issues
const AceEditor = dynamic(
  async () => {
    const ace = await import('react-ace')
    await import('ace-builds/src-noconflict/mode-json')
    await import('ace-builds/src-noconflict/mode-yaml')
    await import('ace-builds/src-noconflict/theme-github')
    await import('ace-builds/src-noconflict/theme-monokai')
    await import('ace-builds/src-noconflict/ext-searchbox')
    await import('ace-builds/src-noconflict/ext-language_tools')
    return ace
  },
  { ssr: false }
)

const EditableContent = ({ children, onEdit }: { children: string; onEdit: (newContent: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleBlur = () => {
    setIsEditing(false);
    if (contentRef.current) {
      onEdit(contentRef.current.innerText);
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable={true}
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
      className={`p-2 rounded whitespace-pre-wrap ${isEditing ? 'bg-muted' : ''}`}
      suppressContentEditableWarning={true}
    >
      {children}
    </div>
  );
};

interface OpenAPISpec {
  info: {
    title: string;
    description: string;
  };
  paths: Record<string, Record<string, PathItemObject>>;
  tags?: Array<{ name: string; description: string }>;
}

interface PathItemObject {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  // Add other properties as needed
}

interface ParameterObject {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: {
    type: string;
    // Add other schema properties as needed
  };
}

export default function OpenAPIDescriber() {
  const [openApiSpec, setOpenApiSpec] = useState('')
  const [parsedSpec, setParsedSpec] = useState<OpenAPISpec | null>(null)
  const [specFormat, setSpecFormat] = useState<'json' | 'yaml'>('json')
  const { theme } = useTheme()
  const [apiSpecs, setApiSpecs] = useState<Record<string, SpecItem>>({})
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    const specs = getApiSpecs();
    setApiSpecs(specs);
  }, []);

  const handleSpecSelect = (index: number, value: string) => {
    const newPath = [...selectedPath.slice(0, index), value];
    setSelectedPath(newPath);

    let currentLevel: Record<string, SpecItem> | undefined = apiSpecs;
    for (const pathPart of newPath) {
      currentLevel = currentLevel?.[pathPart].children;
      if (!currentLevel) break;
    }

    if (currentLevel === undefined) {
      // We've reached a leaf node (YAML file)
      const specItem = getSpecItemFromPath(apiSpecs, newPath);
      if (specItem?.url) {
        fetchSpecContent(specItem.url)
          .then(content => {
            setOpenApiSpec(content);
            detectFormat(content);
            parseOpenApiSpec(content);
          })
          .catch(error => console.error('Error fetching spec content:', error));
      }
    }
  };

  const getSpecItemFromPath = (specs: Record<string, SpecItem>, path: string[]): SpecItem | undefined => {
    let current: SpecItem | undefined = specs[path[0]];
    for (let i = 1; i < path.length; i++) {
      if (!current?.children) return undefined;
      current = current.children[path[i]];
    }
    return current;
  };

  const getCurrentOptions = (specs: Record<string, SpecItem>, path: string[]): Record<string, SpecItem> => {
    let current: Record<string, SpecItem> | undefined = specs;
    for (const pathPart of path) {
      current = current?.[pathPart].children;
      if (!current) return {};
    }
    return current || {};
  };

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

  const parseOpenApiSpec = (content: string) => {
    try {
      const parsed = specFormat === 'json' ? JSON.parse(content) : yaml.load(content) as OpenAPISpec
      setParsedSpec(parsed)
    } catch (error) {
      console.error('Failed to parse OpenAPI spec:', error)
    }
  }

  const updateSpec = (path: string, value: string) => {
    if (!parsedSpec) return
    const newSpec = JSON.parse(JSON.stringify(parsedSpec))
    const keys = path.split('.')
    let current: Record<string, unknown> = newSpec
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>
    }
    current[keys[keys.length - 1]] = value
    setParsedSpec(newSpec)
    setOpenApiSpec(specFormat === 'json' ? JSON.stringify(newSpec, null, 2) : yaml.dump(newSpec))
  }

  const groupEndpointsByTag = () => {
    if (!parsedSpec) return {}
    const groupedEndpoints: Record<string, Array<{ path: string; method: string; details: PathItemObject }>> = {}
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

  const getTagDescription = (tag: string) => {
    if (Array.isArray(parsedSpec?.tags)) {
      const tagObject = parsedSpec.tags.find((t) => t.name === tag);
      return tagObject?.description || 'No description available.';
    }
    return 'No description available.';
  }

  const updateTagDescription = (tag: string, newDescription: string) => {
    if (!parsedSpec) return;
    const newSpec = { ...parsedSpec };
    if (!Array.isArray(newSpec.tags)) {
      newSpec.tags = [];
    }
    const tagIndex = newSpec.tags.findIndex(t => t.name === tag);
    if (tagIndex !== -1) {
      newSpec.tags[tagIndex] = { ...newSpec.tags[tagIndex], description: newDescription };
    } else {
      newSpec.tags.push({ name: tag, description: newDescription });
    }
    setParsedSpec(newSpec);
    setOpenApiSpec(specFormat === 'json' ? JSON.stringify(newSpec, null, 2) : yaml.dump(newSpec));
  };

  const reloadSpec = useCallback(() => {
    setIsReloading(true);
    parseOpenApiSpec(openApiSpec);
    setTimeout(() => setIsReloading(false), 500); // Reset after animation
  }, [openApiSpec, parseOpenApiSpec]);

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-4">OpenAPI Describer</h1>
      <p className="text-lg mb-8">
        This tool allows you to select an OpenAPI specification (in JSON or YAML format) and view a simplified, editable representation of the API endpoints and their details.
      </p>
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="w-full lg:w-1/2 pr-4 mb-8 lg:mb-0">
          <div className="flex flex-col space-y-2 mb-4">
            {selectedPath.map((selected, index) => (
              <Select 
                key={index} 
                onValueChange={(value) => handleSpecSelect(index, value)} 
                value={selected}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${index === 0 ? 'API provider' : 'option'}`} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(getCurrentOptions(apiSpecs, selectedPath.slice(0, index))).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {Object.keys(getCurrentOptions(apiSpecs, selectedPath)).length > 0 && (
              <Select
                onValueChange={(value) => handleSpecSelect(selectedPath.length, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${selectedPath.length === 0 ? 'API provider' : 'option'}`} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(getCurrentOptions(apiSpecs, selectedPath)).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button 
            onClick={reloadSpec} 
            className={`mb-4 transition-transform duration-200 ease-in-out ${isReloading ? 'scale-95' : ''}`}
            disabled={isReloading}
          >
            {isReloading ? 'Reloading...' : 'Reload'}
          </Button>
          <AceEditor
            mode={specFormat}
            theme={theme === 'dark' ? 'monokai' : 'github'}
            onChange={setOpenApiSpec}
            name="openapi-editor"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              useWorker: false,
              showPrintMargin: false,
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              foldStyle: 'markbegin', // Enable code folding
            }}
            style={{ width: '100%', height: 'calc(100% - 80px)' }}
            value={openApiSpec}
            placeholder="Paste your OpenAPI spec here (JSON or YAML format)"
            commands={[
              {
                name: 'find',
                bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
                exec: 'find',
                readOnly: true
              },
              {
                name: 'toggleFold',
                bindKey: {win: 'Alt-L|Ctrl-F1', mac: 'Command-Alt-L|Command-F1'},
                exec: 'toggleFold',
                readOnly: false
              },
              {
                name: 'foldall',
                bindKey: {win: 'Alt-0', mac: 'Command-Option-0'},
                exec: 'foldall',
                readOnly: false
              },
              {
                name: 'unfoldall',
                bindKey: {win: 'Alt-Shift-0', mac: 'Command-Option-Shift-0'},
                exec: 'unfoldall',
                readOnly: false
              }
            ]}
          />
        </div>
        <div className="w-full lg:w-1/2 pl-4 overflow-y-auto">
          {parsedSpec && (
            <div>
              <h1 className="text-2xl font-bold mb-4">{parsedSpec.info.title}</h1>
              <div className="mb-4">
                <EditableContent onEdit={(newContent) => updateSpec('info.description', newContent)}>
                  {parsedSpec.info.description}
                </EditableContent>
              </div>
              <Accordion type="multiple" className="space-y-4">
                {Object.entries(groupEndpointsByTag()).map(([tag, endpoints]) => (
                  <AccordionItem value={tag} key={tag}>
                    <AccordionTrigger className="text-xl font-semibold">{tag}</AccordionTrigger>
                    <AccordionContent>
                      <Card className="mb-6">
                        <CardContent className="pt-6">
                          <div className="mb-4">
                            <EditableContent onEdit={(newContent) => updateTagDescription(tag, newContent)}>
                              {getTagDescription(tag)}
                            </EditableContent>
                          </div>
                          <Accordion type="single" collapsible className="w-full">
                            {endpoints.map(({ path, method, details }) => (
                              <AccordionItem value={`${path}-${method}`} key={`${path}-${method}`}>
                                <AccordionTrigger>
                                  {details.summary || `${method.toUpperCase()} ${path}`}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Description:</h4>
                                      <Textarea
                                        value={details.description || ''}
                                        onChange={(e) => updateSpec(`paths.${path}.${method}.description`, e.target.value)}
                                        className="w-full"
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <pre className="bg-muted p-2 rounded-md text-sm">{`${method.toUpperCase()} ${path}`}</pre>
                                    </div>
                                    {details.parameters && details.parameters.length > 0 && (
                                      <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="parameters">
                                          <AccordionTrigger className="text-sm font-medium">
                                            Parameters
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <table className="w-full text-sm">
                                              <thead>
                                                <tr className="bg-muted">
                                                  <th className="p-2 text-left">Name</th>
                                                  <th className="p-2 text-left">In</th>
                                                  <th className="p-2 text-left">Type</th>
                                                  <th className="p-2 text-left">Required</th>
                                                  <th className="p-2 text-left">Description</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {details.parameters.map((param, index) => (
                                                  <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted'}>
                                                    <td className="p-2">{param.name}</td>
                                                    <td className="p-2">{param.in}</td>
                                                    <td className="p-2">{param.schema?.type || 'N/A'}</td>
                                                    <td className="p-2">{param.required ? 'Yes' : 'No'}</td>
                                                    <td className="p-2">{param.description || 'N/A'}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </AccordionContent>
                                        </AccordionItem>
                                      </Accordion>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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