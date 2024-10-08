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
  try {
    const response = await fetch('http://localhost:8020/api/tool/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool_type: 'cognitive',
        tool_name: toolName,
        tool_config: {},
        tool_input: toolInput,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling cognitive tool:', error);
    throw error;
  }
}

export async function POST(req) {
  // Handle CORS
  const origin = req.headers.get('origin');
  
  // Check if the origin is allowed (add chrome-extension:// to allow requests from your extension)
  const allowedOrigins = ['http://localhost:3000', 'https://www.youtube.com', 'chrome-extension://'];
  
  const isAllowed = allowedOrigins.some(allowedOrigin => 
    origin && (origin.startsWith(allowedOrigin) || origin === allowedOrigin)
  );

  if (isAllowed) {
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight request
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
  } else {
    // If the origin is not allowed, return a 403 Forbidden response
    console.error('Forbidden access attempt from origin:', origin);
    return new NextResponse(null, { status: 403 });
  }
}