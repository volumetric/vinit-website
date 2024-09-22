import openApiSpecUrls from './openapi_specs_file_urls.json';

const API_BASE_URL = 'https://vinit-agrawal-website.s3.amazonaws.com/APIs/';

export interface SpecItem {
  name: string;
  children?: Record<string, SpecItem>;
  url?: string;
}

export function getApiSpecs(): Record<string, SpecItem> {
  return parseSpecObject(openApiSpecUrls.APIs);
}

function parseSpecObject(obj: any): Record<string, SpecItem> {
  const result: Record<string, SpecItem> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = { name: key, url: `${API_BASE_URL}${value}` };
    } else {
      result[key] = { name: key, children: parseSpecObject(value) };
    }
  }
  
  return result;
}

export async function fetchSpecContent(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch spec content');
  }
  return await response.text();
}