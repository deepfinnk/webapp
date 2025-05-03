import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read the environment variable for the external service
    const baseUrl = process.env.EXTERNAL_QUERY_URL || 'http://127.0.0.1:5001';
    const historyUrl = `${baseUrl}/history`;
    
    console.log(`[Chat History API] Fetching chat history from: ${historyUrl}`);
    
    const response = await fetch(historyUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this request
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Chat History API] External API Error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch chat history: ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Chat History API] Successfully fetched chat history');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Chat History API] Error fetching chat history:', error);
    
    let errorMessage = 'Failed to fetch chat history';
    const finalUrl = (process.env.EXTERNAL_QUERY_URL || 'http://127.0.0.1:5001') + '/history';

    if (error instanceof Error) {
      if (String(error.message).includes('ECONNREFUSED')) {
        console.error(`[Chat History API] Connection refused at ${finalUrl}. Is the service running?`);
        errorMessage = 'Could not connect to the history service.';
      } else if (String(error.message).includes('fetch failed')) {
        console.error(`[Chat History API] Fetch failed for ${finalUrl}. Network issue or incorrect URL?`);
        errorMessage = 'Failed to fetch from the history service.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
