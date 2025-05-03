import Header from "@/components/header"
import Navigation from "@/components/navigation"
import { ChevronDown, ArrowUp, ArrowDown, Plus, Wallet, Settings, PiggyBank, Target } from "lucide-react"

interface FrontendAccount {
  description: string;
  balance: number;
  currency: string;
}

interface AccountDataResponse {
  accounts: FrontendAccount[];
  totalBalance: number;
  currency: string;
  error?: string; 
}

const formatCurrency = (value: number | null | undefined, currency: string = 'EUR'): string => {
  if (value === null || typeof value === 'undefined') {
    return 'N/A';
  }
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: currency }).format(value);
};

async function getAccountData(): Promise<AccountDataResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts` : 'http://localhost:3000/api/accounts';
  console.log(`[Home Page] Fetching accounts from ${apiUrl}`);
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' }); 

    if (!response.ok) {
      let errorMsg = `API Error (${response.status})`;
      try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg; 
      } catch (e) {
          errorMsg = `API Error (${response.status}): ${response.statusText || 'Failed to fetch'}`;
      }
      console.error(`[Home Page] ${errorMsg}`);
      return { accounts: [], totalBalance: 0, currency: 'EUR', error: errorMsg };
    }

    const data: AccountDataResponse = await response.json();
    console.log(`[Home Page] Successfully fetched accounts. Total Balance: ${data.totalBalance}`);
    return { ...data, error: data.error }; 
  } catch (error) {
    console.error('[Home Page] Failed to fetch accounts:', error);
    let errorMessage = 'Failed to connect to API';
     if (error instanceof Error) {
        if (String(error.message).includes('ECONNREFUSED')) {
            errorMessage = `Connection refused at ${apiUrl}. Is the API running?`;
        } else if (String(error.message).includes('fetch failed')) {
             errorMessage = `Fetch failed for ${apiUrl}. Network issue or incorrect URL?`;
        } else {
             errorMessage = error.message;
        }
    }
    return { accounts: [], totalBalance: 0, currency: 'EUR', error: errorMessage };
  }
}

export default async function Home() {
  const { accounts, totalBalance, currency, error } = await getAccountData();

  return (
    <>
      <div className="flex-1 flex flex-col bg-black text-white min-h-screen"> 
        <Header title="Home" showNotification={true} />

        <h1 className="text-4xl font-bold px-4 mt-2 mb-8">Home</h1>

        <div className="px-4 mb-6 flex-grow"> 
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl">Victor Hornet</h2> 
            <ChevronDown className="w-6 h-6" />
          </div>

          {error && (
            <div className="bg-red-800 text-white p-3 rounded-lg mb-4 shadow-md">
              <p className="font-semibold">Could not load account data:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="account-card bg-purple-primary p-4 rounded-xl shadow-md"> 
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-purple-100" />
                <span className="text-purple-100 font-medium">Total Balance</span>
              </div>
              <span className="text-2xl font-bold block truncate">{formatCurrency(error ? null : totalBalance, currency)}</span> 
            </div>

            {!error && accounts && accounts.length > 0 && accounts.map((account, index) => {
              // Determine card style and icon based on description
              let bgColor = 'bg-gray-dark'; // Default background
              let IconComponent = Wallet; // Default icon
              let textColor = 'text-gray-300'; // Default text color for icon/title
              const descriptionLower = account.description.toLowerCase();

              if (descriptionLower.includes('main')) {
                bgColor = 'bg-brown-primary'; 
                IconComponent = Target;
                textColor = 'text-orange-100'; // Adjust text color for brown background
              } else if (descriptionLower.includes('savings')) {
                bgColor = 'bg-gray-dark'; // Explicitly dark gray for savings
                IconComponent = PiggyBank;
                textColor = 'text-gray-300'; // Standard text color for dark gray
              }
              
              return (
                <div 
                  key={account.description + index} 
                  className={`account-card ${bgColor} p-4 rounded-xl shadow-md ${accounts.length === 1 ? 'col-span-2' : ''}`} 
                > 
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-5 h-5 ${textColor}`} /> 
                    <span className={`${textColor} font-medium truncate`}>{account.description || 'Unnamed Account'}</span> 
                  </div>
                  <span className="text-2xl font-bold block truncate text-white"> 
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </div>
              );
            })}

            {!error && (!accounts || accounts.length === 0) && (
                <div className="col-span-2 bg-gray-dark p-4 rounded-xl shadow-md text-center text-gray-400"> 
                    No individual accounts found.
                </div>
            )}
          </div>
        </div>

        <div className="flex justify-around pt-4 pb-4"> 
          <div className="flex flex-col items-center text-center w-1/3">
            <button className="action-button w-14 h-14 rounded-full flex items-center justify-center bg-brown-primary hover:bg-brown-primary/80 transition-colors">
              <ArrowUp className="w-6 h-6" />
            </button>
            <span className="mt-2 text-sm">Pay</span>
          </div>

          <div className="flex flex-col items-center text-center w-1/3">
            <button className="action-button w-14 h-14 rounded-full flex items-center justify-center bg-blue-primary hover:bg-blue-primary/80 transition-colors">
              <ArrowDown className="w-6 h-6" />
            </button>
            <span className="mt-2 text-sm">Request</span>
          </div>

          <div className="flex flex-col items-center text-center w-1/3">
            <button className="action-button w-14 h-14 rounded-full flex items-center justify-center bg-purple-primary hover:bg-purple-primary/80 transition-colors">
              <Plus className="w-6 h-6" />
            </button>
            <span className="mt-2 text-sm">Add</span>
          </div>
        </div>
      </div>

      <Navigation />
    </>
  )
}
