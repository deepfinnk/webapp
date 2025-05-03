import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { task } = await req.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Use the server-side environment variable (no NEXT_PUBLIC_ prefix needed)
    const apiUrl = process.env.BUNQ_MCP_SERVICE;
    if (!apiUrl) {
      console.error('BUNQ_MCP_SERVICE environment variable is not set.');
      return NextResponse.json({ error: 'API service configuration error' }, { status: 500 });
    }

    // Prepend http:// if scheme is missing and it's localhost or just numbers/dots
    let externalApiUrl = apiUrl;
    if (!apiUrl.startsWith('http') && (apiUrl.startsWith('localhost') || /^\d+(\.\d+)*(:\d+)?$/.test(apiUrl))) {
        externalApiUrl = `http://${apiUrl}`;
    } else if (!apiUrl.startsWith('http')) {
        // Assume https for other cases if no scheme is provided
        externalApiUrl = `https://${apiUrl}`;
    }
    
    externalApiUrl = `${externalApiUrl}/task`; // Append the endpoint path

    console.log(`[API Route] Forwarding request to: ${externalApiUrl} with task: ${task}`);

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other necessary headers here, e.g., Authorization if needed
      },
      body: JSON.stringify({ task }),
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
    if (String(error).includes('ECONNREFUSED')) {
        const serviceUrl = process.env.BUNQ_MCP_SERVICE || 'undefined';
        console.error(`[API Route] Connection refused at ${serviceUrl}/task. Is the service running?`);
        errorMessage = 'Could not connect to the backend service.';
    } else if (String(error).includes('fetch failed')) {
         const serviceUrl = process.env.BUNQ_MCP_SERVICE || 'undefined';
        console.error(`[API Route] Fetch failed for ${serviceUrl}/task. Network issue or incorrect URL?`);
        errorMessage = 'Failed to fetch from the backend service.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
