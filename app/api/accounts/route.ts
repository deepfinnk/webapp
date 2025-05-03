import { NextResponse } from 'next/server';

// Define an interface for the expected structure of an account from the external API
interface BunqAccount {
  _balance: {
    _currency: string;
    _value: string;
  };
  _description: string;
  // Include other fields if needed, but these are the core ones for now
}

// Define an interface for the data structure we want to return to the frontend
interface FrontendAccount {
  description: string;
  balance: number;
  currency: string;
}

export async function GET() {
  // Read the base URL from the environment variable
  const baseUrl = process.env.BUNQ_MCP_SERVICE;

  if (!baseUrl) {
    console.error('[API Route /api/accounts] BUNQ_MCP_SERVICE environment variable is not set.');
    return NextResponse.json({ error: 'Backend service configuration error.' }, { status: 500 });
  }

  // Ensure the URL has a scheme (default to http)
  let processedBaseUrl = baseUrl;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    processedBaseUrl = `http://${baseUrl}`;
    console.warn(`[API Route /api/accounts] BUNQ_MCP_SERVICE is missing scheme, prepending http://. Value: ${baseUrl}`);
  }

  const externalApiUrl = `${processedBaseUrl}/bunq/accounts`;

  try {
    console.log(`[API Route /api/accounts] Fetching accounts from ${externalApiUrl}`);
    const response = await fetch(externalApiUrl, {
      // Add cache: 'no-store' if the data should always be fresh
      cache: 'no-store',
      // Add headers if required by the external API
      // headers: {
      //   'Authorization': 'Bearer YOUR_TOKEN', 
      // },
    });

    if (!response.ok) {
      let errorBody = 'Unknown error';
      try {
        errorBody = await response.text();
        console.error(`[API Route /api/accounts] External API error response body: ${errorBody}`);
      } catch (parseError) {
        console.error(`[API Route /api/accounts] Could not parse error response body.`);
      }
      console.error(`[API Route /api/accounts] External API Error (${response.status}): ${response.statusText}`);
      throw new Error(`External API failed with status ${response.status}: ${response.statusText}`);
    }

    const accountsData: BunqAccount[] = await response.json();
    console.log(`[API Route /api/accounts] Received ${accountsData.length} accounts from external API.`);

    let totalBalance = 0;
    let currency = 'EUR'; // Assume EUR if no accounts or use first account's currency

    const processedAccounts: FrontendAccount[] = accountsData.map((account) => {
      const balanceValue = parseFloat(account._balance._value);
      totalBalance += balanceValue;
      // Update currency based on the first account found (can be refined)
      if (account._balance._currency) {
        currency = account._balance._currency; 
      }
      return {
        description: account._description,
        balance: balanceValue,
        currency: account._balance._currency,
      };
    });

    console.log(`[API Route /api/accounts] Processed accounts. Total Balance: ${totalBalance.toFixed(2)} ${currency}`);

    return NextResponse.json({
      accounts: processedAccounts,
      totalBalance: parseFloat(totalBalance.toFixed(2)), // Ensure totalBalance is a number
      currency: currency,
    });

  } catch (error) {
    console.error('[API Route /api/accounts] Error fetching or processing accounts:', error);
    let errorMessage = 'Failed to fetch accounts';
    if (error instanceof Error) {
        // Provide more specific error messages based on common fetch issues
        if (String(error.message).includes('ECONNREFUSED')) {
            errorMessage = `Connection refused at ${externalApiUrl}. Is the service running?`;
        } else if (String(error.message).includes('fetch failed')) {
            errorMessage = `Fetch failed for ${externalApiUrl}. Network issue or incorrect URL?`;
        } else {
            errorMessage = error.message;
        }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
