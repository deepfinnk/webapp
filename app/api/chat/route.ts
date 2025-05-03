import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const baseUrl = process.env.EXTERNAL_QUERY_URL || 'http://127.0.0.1:5001';

    let externalApiUrl = baseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        externalApiUrl = `http://${baseUrl}`;
    }
    
    externalApiUrl = `${externalApiUrl}/query`;

    console.log(`[API Route] Forwarding request to: ${externalApiUrl} with prompt: ${prompt}`);

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other necessary headers here, e.g., Authorization if needed
      },
      body: JSON.stringify({ prompt }),
    });

    // Log the response status from the external API
    console.log(`[API Route] External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] External API Error (${response.status}): ${errorText}`);
      return NextResponse.json({ error: `External API Error: ${response.statusText || errorText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Log the successful response data
    console.log('[API Route] External API response data:', data);

    // Assuming the external API returns { response: "..." }, forward it
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API Route] Error in /api/chat:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Add more specific logging for network errors
    const finalUrl = (process.env.EXTERNAL_QUERY_URL || 'http://127.0.0.1:5001') + '/query';
    if (String(error).includes('ECONNREFUSED')) {
        console.error(`[API Route] Connection refused at ${finalUrl}. Is the service running?`);
        errorMessage = 'Could not connect to the backend query service.';
    } else if (String(error).includes('fetch failed')) {
         console.error(`[API Route] Fetch failed for ${finalUrl}. Network issue or incorrect URL?`);
        errorMessage = 'Failed to fetch from the backend query service.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
