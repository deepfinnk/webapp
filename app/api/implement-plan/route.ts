import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body to get the plan
    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    // Read the environment variable for the external service
    const baseUrl = process.env.EXTERNAL_QUERY_URL || 'http://127.0.0.1:5001';
    const implementPlanUrl = `${baseUrl}/implement-plan`;
    
    console.log(`[API Route] Implementing plan at: ${implementPlanUrl}`);
    console.log(`[API Route] Plan details: ${typeof plan === 'string' ? plan.substring(0, 100) : JSON.stringify(plan).substring(0, 100)}...`);
    
    const response = await fetch(implementPlanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    // Log the response status from the external API
    console.log(`[API Route] Plan implementation response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Plan implementation error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `Failed to implement plan: ${response.statusText || errorText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API Route] Plan implementation successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Plan successfully implemented',
      ...data
    });

  } catch (error) {
    console.error('[API Route] Error implementing plan:', error);
    
    let errorMessage = 'Failed to implement plan';
    const finalUrl = (process.env.EXTERNAL_QUERY_URL || 'http://127.0.0.1:5001') + '/implement-plan';

    if (error instanceof Error) {
      if (String(error.message).includes('ECONNREFUSED')) {
        console.error(`[API Route] Connection refused at ${finalUrl}. Is the service running?`);
        errorMessage = 'Could not connect to the implementation service.';
      } else if (String(error.message).includes('fetch failed')) {
        console.error(`[API Route] Fetch failed for ${finalUrl}. Network issue or incorrect URL?`);
        errorMessage = 'Failed to fetch from the implementation service.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
