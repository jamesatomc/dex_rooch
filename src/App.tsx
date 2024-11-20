import { LoadingButton } from "@mui/lab";
import { Button, Chip, Divider, Stack, Typography } from "@mui/material";
import { Transaction } from "@roochnetwork/rooch-sdk";
import {
  UseSignAndExecuteTransaction,
  useConnectWallet,
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentSession,
  useRemoveSession,
  useRoochClientQuery,
  useWalletStore,
  useWallets,
} from "@roochnetwork/rooch-sdk-kit";
import { useState } from "react";
import "./App.css";
import { shortAddress } from "./utils";
import Swap from "./Swap";
import Pool from "./Pool";

// Publish address of the counter contract
const counterAddress = "0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a";

function App() {
  const wallets = useWallets();
  const currentAddress = useCurrentAddress();
  const sessionKey = useCurrentSession();
  const connectionStatus = useWalletStore((state) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore(
    (state) => state.setWalletDisconnected
  );
  const { mutateAsync: connectWallet } = useConnectWallet();

  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const { mutateAsync: removeSessionKey } = useRemoveSession();
  const { mutateAsync: signAndExecuteTransaction } =
    UseSignAndExecuteTransaction();
  const { data, refetch } = useRoochClientQuery("executeViewFunction", {
    target: `${counterAddress}::quick_start_counter::value`,
  });

  const [sessionLoading, setSessionLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
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

  const [activeTab, setActiveTab] = useState('swap'); // 'swap' or 'pool'
  const [showSessionKey, setShowSessionKey] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Stack
        className="font-sans px-4 md:px-6 py-6 max-w-7xl mx-auto"
        direction="column"
        sx={{
          minHeight: "calc(100vh - 4rem)",
        }}
      >
      {/* Enhanced Header with Session Key */}
      <Stack 
        direction="column"
        spacing={2} 
        className="w-full py-4 glassmorphism rounded-2xl px-6 shadow-lg"
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 2, sm: 4 }}
          justifyContent="space-between"
          alignItems="center"
          className="w-full"
        >
          <img 
            src="./kanari.svg" 
            className="w-24 md:w-22 hover:scale-105 transition-transform" 
            alt="Rooch" 
          />
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2} 
            className="w-full sm:w-auto"
          >
            <Chip
              label="Rooch Testnet"
              variant="filled"
              className="font-semibold !bg-gradient-to-r from-orange-500 to-orange-600 !text-white h-10 shadow-md"
            />
            <Button
              variant="contained"
              fullWidth
              className="sm:w-auto !bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              onClick={async () => {
                if (connectionStatus === "connected") {
                  setWalletDisconnected();
                  return;
                }
                await connectWallet({ wallet: wallets[0] });
              }}
            >
              {connectionStatus === "connected"
                ? shortAddress(currentAddress?.genRoochAddress().toStr(), 8, 6)
                : "Connect Wallet"}
            </Button>
          </Stack>
        </Stack>

        <Divider className="!my-4" />

        <button
          onClick={() => setShowSessionKey(!showSessionKey)}
          className="w-full flex items-center justify-between p-2 hover:bg-white/50 rounded-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <Typography className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Session Key
            </Typography>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-300 text-orange-500 ${
              showSessionKey ? 'rotate-180' : ''
            }`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSessionKey && (
          <div className="animate-fadeIn">
            <div className="bg-white/50 rounded-xl p-4 space-y-3">
              <div>
                <Typography className="text-sm text-gray-500">
                  Session Rooch Address
                </Typography>
                <p className="text-sm font-mono bg-white/80 p-2 rounded border break-all">
                  {sessionKey?.getRoochAddress().toStr() || 'Not created'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography className="text-sm text-gray-500">
                    Key Scheme
                  </Typography>
                  <p className="text-sm font-mono bg-white/80 p-2 rounded border">
                    {sessionKey?.getKeyScheme() || 'Not created'}
                  </p>
                </div>
                <div>
                  <Typography className="text-sm text-gray-500">
                    Create Time
                  </Typography>
                  <p className="text-sm font-mono bg-white/80 p-2 rounded border">
                    {sessionKey?.getCreateTime() || 'Not created'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                {!sessionKey ? (
                  <LoadingButton
                    loading={sessionLoading}
                    variant="contained"
                    size="small"
                    className="w-full sm:w-auto"
                    disabled={connectionStatus !== "connected"}
                    onClick={handlerCreateSessionKey}
                  >
                    {connectionStatus !== "connected"
                      ? "Please connect wallet first"
                      : "Create Session Key"}
                  </LoadingButton>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      removeSessionKey({ authKey: sessionKey.getAuthKey() });
                    }}
                  >
                    Clear Session
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Stack>
  
        {/* Enhanced Navigation Tabs */}
        <Stack 
          direction="row" 
          spacing={3} 
          className="mt-8 mb-4 w-full max-w-md mx-auto"
        >
          <button
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'swap'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-white hover:bg-gray-50 shadow-md'
            }`}
            onClick={() => setActiveTab('swap')}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Swap
            </span>
          </button>
          <button
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'pool'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-white hover:bg-gray-50 shadow-md'
            }`}
            onClick={() => setActiveTab('pool')}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Pool
            </span>
          </button>
        </Stack>
  
        {/* Enhanced Content Area */}
        <div className="w-full max-w-lg mx-auto mt-8 glassmorphism rounded-2xl shadow-xl p-6">
          {activeTab === 'swap' ? <Swap /> : <Pool />}
        </div>
      </Stack>
    </div>
  )
}

export default App;
