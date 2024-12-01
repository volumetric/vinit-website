import { NextResponse } from 'next/server';

let google;

async function initializeGoogleAPI() {
  if (!google) {
    const { google: googleAPI } = await import('googleapis');
    google = googleAPI;
  }
  return google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });
}

async function getYouTubeTranscript(videoId) {
  try {
    const youtube = await initializeGoogleAPI();
    const response = await youtube.videos.list({
      part: 'snippet',
      id: videoId,
    });

    if (response.data.items && response.data.items.length > 0) {
      const videoDescription = response.data.items[0].snippet.description;
      // Note: This is a simplified approach. The actual transcript might not be in the description.
      // You might need to implement a more sophisticated method to extract the transcript.
      return videoDescription;
    } else {
      throw new Error('No video found with the given ID');
    }
  } catch (error) {
    console.error('Error fetching YouTube video data:', error);
    throw error;
  }
}

async function callCognitiveTool(toolName, toolInput) {
  const baseUrl = process.env.ASIMOV_COGNITIVE_TOOLS_URL;
  const apiKey = process.env.ASIMOV_COGNITIVE_TOOLS_API_KEY;

  if (!baseUrl) {
    throw new Error('ASIMOV_COGNITIVE_TOOLS_URL is not set in the environment variables');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const url = `${baseUrl}/api/tool/run`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        tool_type: 'cognitive',
        tool_name: toolName,
        tool_config: {},
        tool_input: toolInput,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling cognitive tool:', error);
    throw error;
  }
}

export async function POST(req) {
  // Handle CORS - Allow all origins for public API
  const headers = {
    'Access-Control-Allow-Origin': 'chrome-extension://*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  const body = await req.json();
  const { cognitive_tool, yt_videoid } = body;

  if (!cognitive_tool || !yt_videoid) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400, headers });
  }

  try {
    const transcript = await getYouTubeTranscript(yt_videoid);
    const cognitiveToolResult = await callCognitiveTool(cognitive_tool, transcript);

    const result = {
      youtube_transcript: transcript,
      cognitive_tool_result: cognitiveToolResult,
    };

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error('Error in transform API:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
}