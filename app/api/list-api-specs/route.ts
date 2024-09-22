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