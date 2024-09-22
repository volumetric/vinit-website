import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

async function getApiSpecs(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const res = path.resolve(dir, entry.name)
    if (entry.isDirectory()) {
      return getApiSpecs(res)
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.json'))) {
      return res.replace(path.resolve(process.cwd(), 'public'), '')
    }
    return []
  }))
  return files.flat().filter(Boolean) as string[]
}

export async function GET() {
  try {
    const apiSpecsDir = path.join(process.cwd(), 'public', 'APIs')
    const specs = await getApiSpecs(apiSpecsDir)
    // Sort the specs alphabetically
    specs.sort((a, b) => a.localeCompare(b))
    return NextResponse.json(specs)
  } catch (error) {
    console.error('Error listing API specs:', error)
    return NextResponse.json([]) // Return an empty array instead of an error object
  }
}