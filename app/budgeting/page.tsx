import Header from "@/components/header"
import Navigation from "@/components/navigation"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"

interface Amount {
  _currency: string;
  _value: string;
}

interface Payment {
  id: number;
  _amount: Amount;
  description: string;
  created: string; // Assuming ISO date string format
}

interface ErrorResponse {
  error: string;
}

export default async function Budgeting() {
  let monthlySpent: number | null = null;
  let currency: string = '€'; // Default currency
  let error: string | null = null;
  let loading: boolean = true;

  // Read the base URL from the environment variable (accessible server-side)
  const baseUrl = process.env.BUNQ_MCP_SERVICE;
  let apiUrl = '';

  if (!baseUrl) {
    console.error('[Budgeting Page] BUNQ_MCP_SERVICE environment variable is not set.');
    error = 'Backend service configuration error. Environment variable missing.';
    loading = false;
  } else {
    // Ensure the URL has a scheme (default to http)
    let processedBaseUrl = baseUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      processedBaseUrl = `http://${baseUrl}`;
       console.warn(`[Budgeting Page] BUNQ_MCP_SERVICE is missing scheme, prepending http://. Value: ${baseUrl}`);
    }
    apiUrl = `${processedBaseUrl}/bunq/payments`;
  }

  // Only attempt fetch if apiUrl is set and no config error occurred
  if (!error && apiUrl) {
      try {
        console.log(`[Budgeting Page] Fetching payments from: ${apiUrl}`);
        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (!response.ok) {
          let errorMsg = `API Error (${response.status})`;
          try {
            const errorData: ErrorResponse = await response.json();
            errorMsg = errorData.error || `HTTP error! status: ${response.status}`; 
          } catch (e) {
             errorMsg = `HTTP error! status: ${response.status}, Failed to parse error body.`;
          }
          throw new Error(errorMsg);
        }
        const payments: Payment[] = await response.json();
        console.log(`[Budgeting Page] Successfully fetched ${payments.length} payments.`);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const outgoingPayments = payments.filter(payment => {
          if (!payment || !payment._amount || typeof payment._amount._value === 'undefined') {
            console.warn('Skipping payment with missing amount:', payment);
            return false; // Skip this payment
          }
          const paymentDate = new Date(payment.created);
          const isOutgoing = parseFloat(payment._amount._value) < 0;
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear &&
            isOutgoing
          );
        });

        monthlySpent = outgoingPayments.reduce((sum, payment) => {
          if (!payment || !payment._amount || typeof payment._amount._value === 'undefined') {
            return sum; // Should not happen if filter worked, but good practice
          }
          return sum + Math.abs(parseFloat(payment._amount._value));
        }, 0);

        if (outgoingPayments.length > 0 && outgoingPayments[0]._amount) { 
          currency = outgoingPayments[0]._amount._currency;
        } else {
             const firstPaymentWithAmount = payments.find(p => p && p._amount && p._amount._currency);
             if (firstPaymentWithAmount) {
                currency = firstPaymentWithAmount._amount._currency;
             } else {
                currency = '€'; 
             }
        }
      } catch (err) {
        console.error('[Budgeting Page] Error fetching or processing payments:', err);
        if (err instanceof Error) {
          // Add specific error messages for connection refused/fetch failed
          if (String(err.message).includes('ECONNREFUSED')) {
              error = `Could not connect to payment service at ${apiUrl}. Is it running?`;
          } else if (String(err.message).includes('fetch failed')){
              error = `Fetch failed for ${apiUrl}. Network issue or incorrect URL?`;
          } else {
              error = err.message;
          }
        } else {
          error = 'An unknown error occurred while fetching payment data.';
        }
      } finally {
        loading = false;
      }
  } // End of fetch block

  return (
    <>
      <div className="flex-1 flex flex-col bg-black">
        <Header title="Budgeting" />

        <h1 className="text-4xl font-bold px-4 mt-2 mb-8">Budgeting</h1>

        <div className="px-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="bg-gray-800 rounded-full py-2 px-4 flex items-center justify-between w-3/4 mx-auto mb-6">
              <FileText className="w-5 h-5 text-orange-primary" />
              <span>Total Spent</span>
              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 1.00</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 0.67</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 0.33</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 0.00</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl mb-4">This Month</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-xl">=</span>
                </div>
                <div>
                  {loading && <div className="text-2xl font-bold text-muted-foreground">Loading...</div>}
                  {error && <div className="text-2xl font-bold text-destructive">Error: {error}</div>}
                  {!loading && !error && monthlySpent !== null && (
                    <div className="text-2xl font-bold">{currency} {monthlySpent.toFixed(2)}</div>
                  )}
                  <div className="text-gray-400 text-sm">About the same as this time last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="bg-gray-800 rounded-full py-2 px-4 flex items-center justify-between w-3/4 mx-auto mb-6">
              <ChevronLeft className="w-5 h-5" />
              <span>May 2025</span>
              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="h-40 flex items-center justify-center">{/* Empty chart area */}</div>
          </div>
        </div>

        <div className="px-4 mt-auto mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="text-center">
              <p>You could have saved € 0.00</p>
              <p className="text-gray-400">Effortlessly fill your savings account:</p>
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </>
  )
}
