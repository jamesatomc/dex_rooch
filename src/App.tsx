import { LoadingButton } from "@mui/lab";
import { Button, Chip, Stack, Typography } from "@mui/material";
import {
  useConnectWallet,
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentSession,
  useRemoveSession,
  useCurrentWallet,
  useWallets,
} from "@roochnetwork/rooch-sdk-kit";
import { useState, useEffect } from "react";
import "./App.css";
import { shortAddress } from "./utils";
import Swap from "./Swap";
import Pool from "./Pool";
import RemovePool from "./RemovePool";

// Publish address of the counter contract
const counterAddress = "0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a";

function App() {
  const wallets = useWallets();
  const currentAddress = useCurrentAddress();
  const sessionKey = useCurrentSession();
  const currentWallet = useCurrentWallet();
  const { mutateAsync: connectWallet } = useConnectWallet();

  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const { mutateAsync: removeSessionKey } = useRemoveSession();
  const [sessionLoading, setSessionLoading] = useState(false);
  const handlerCreateSessionKey = async () => {
    if (sessionLoading) {
      return;
    }
    setSessionLoading(true);

    const defaultScopes = [`${counterAddress}::*::*`];
    createSessionKey(
      {
        appName: "my_first_rooch_dapp",
        appUrl: "http://localhost:5173",
        maxInactiveInterval: 1000,
        scopes: defaultScopes,
      },
      {
        onSuccess: (result) => {
          console.log("session key", result);
        },
        onError: (why) => {
          console.log(why);
        },
      }
    ).finally(() => setSessionLoading(false));
  };

  const [activeTab, setActiveTab] = useState('swap'); // 'swap', 'pool', or 'remove'
  const [showSessionKey, setShowSessionKey] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down & past 100px
          setIsNavbarVisible(false);
        } else {
          // Scrolling up or at top
          setIsNavbarVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Navbar with auto-hide and margins */}
      <nav className={`fixed top-3 left-3 right-3 z-40 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl transition-transform duration-300 ${
        isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-8xl mx-auto px-6 md:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="./kanari.svg" 
                className="w-10 h-10 hover:scale-105 transition-transform" 
                alt="Rooch" 
              />
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Rooch DEX
              </span>
            </div>
            
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'swap'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pool'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('pool')}
              >
                Pool
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'remove'
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('remove')}
              >
                Remove
              </button>
            </div>
            
            {/* Right side - Network & Wallet */}
            <div className="flex items-center space-x-2">
              <Chip
                label="Testnet"
                size="small"
                className="font-medium !bg-gradient-to-r from-orange-500 to-orange-600 !text-white shadow-sm !text-xs"
              />
              
              <div className="relative">
                <Button
                  variant="contained"
                  size="medium"
                  className="!bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all !text-sm !py-2 !px-4"
                  onClick={async () => {
                    if (currentWallet.status === "connected") {
                      setShowSessionKey(!showSessionKey);
                      return;
                    }
                    await connectWallet({ wallet: wallets[0] });
                  }}
                  endIcon={currentWallet.status === "connected" ? (
                    <svg className={`w-4 h-4 transition-transform ${showSessionKey ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : null}
                >
                  {currentWallet.status === "connected"
                    ? shortAddress(currentAddress?.genRoochAddress().toStr(), 4, 3)
                    : "Connect"}
                </Button>
                
                {/* Session Key Dropdown */}
                {currentWallet.status === "connected" && showSessionKey && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg p-3 shadow-xl border z-50 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                      </svg>
                      <Typography className="text-sm font-bold text-orange-600">
                        Session Key
                      </Typography>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Typography className="text-xs text-gray-500 mb-1">
                          Session Address
                        </Typography>
                        <p className="text-xs font-mono bg-gray-100 p-1.5 rounded text-gray-700 break-all">
                          {sessionKey?.getRoochAddress().toStr() || 'Not created'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Typography className="text-xs text-gray-500 mb-1">
                            Scheme
                          </Typography>
                          <p className="text-xs font-mono bg-gray-100 p-1.5 rounded text-gray-700">
                            {sessionKey?.getKeyScheme() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <Typography className="text-xs text-gray-500 mb-1">
                            Created
                          </Typography>
                          <p className="text-xs font-mono bg-gray-100 p-1.5 rounded text-gray-700">
                            {sessionKey?.getCreateTime() || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-1">
                        {!sessionKey ? (
                          <LoadingButton
                            loading={sessionLoading}
                            variant="contained"
                            size="small"
                            className="!text-sm !py-1.5 !px-4"
                            onClick={handlerCreateSessionKey}
                          >
                            Create Key
                          </LoadingButton>
                        ) : (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            className="!text-sm !py-1.5 !px-4"
                            onClick={() => {
                              removeSessionKey({ authKey: sessionKey.getAuthKey() });
                            }}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding to account for fixed navbar */}
      <main className="pt-24 pb-6 px-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Mobile Navigation Tabs */}
          <div className="md:hidden mb-6">
            <Stack 
              direction="row" 
              spacing={1} 
              className="w-full max-w-sm mx-auto"
            >
              <button
                className={`flex-1 px-2 py-2 rounded-lg font-medium transition-all text-xs ${
                  activeTab === 'swap'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
                onClick={() => setActiveTab('swap')}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Swap
                </span>
              </button>
              <button
                className={`flex-1 px-2 py-2 rounded-lg font-medium transition-all text-xs ${
                  activeTab === 'pool'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
                onClick={() => setActiveTab('pool')}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Pool
                </span>
              </button>
              <button
                className={`flex-1 px-2 py-2 rounded-lg font-medium transition-all text-xs ${
                  activeTab === 'remove'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
                onClick={() => setActiveTab('remove')}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  Remove
                </span>
              </button>
            </Stack>
          </div>

          {/* Content Area */}
          <div className="w-full max-w-lg mx-auto glassmorphism rounded-xl shadow-lg p-4">
            {activeTab === 'swap' ? <Swap /> : activeTab === 'pool' ? <Pool /> : <RemovePool />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;
