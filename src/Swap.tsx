import axios from 'axios';
import { Transaction } from '@roochnetwork/rooch-sdk';
import {
  useSignAndExecuteTransaction,
  useCurrentSession,
} from '@roochnetwork/rooch-sdk-kit';
import { useState, useEffect } from 'react';

const counterAddress = '0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a';

function Swap() {
  const sessionKey = useCurrentSession();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [txnLoading, setTxnLoading] = useState(false);
  const [fromCoin, setFromCoin] = useState('BTC');
  const [toCoin, setToCoin] = useState('ROOCH');
  const [amount, setAmount] = useState('');

  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const roochPrice = 200; // Fixed price for ROOCH
  const [toAmount, setToAmount] = useState('');
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const btcResponse = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const ethResponse = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        setBtcPrice(btcResponse.data.bitcoin.usd);
        setEthPrice(ethResponse.data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
    fetchPrices();
  }, []);

  const handleSwap = async () => {
    try {
      setTxnLoading(true);
  
      
      const txn = new Transaction();
      txn.callFunction({
        address: counterAddress,
        module: 'dex',
        function: 'swap',
        args: [],
      });
  
      await signAndExecuteTransaction({ transaction: txn });
    } catch (error) {
      console.error(String(error));
    } finally {
      setTxnLoading(false);
    }
  };

  // Add new state for fee
  const [feeType, setFeeType] = useState('auto'); // 'auto', 'custom'
  const [customFee, setCustomFee] = useState('');

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Swap Tokens</h2>
        </div>
        <p className="text-sm text-gray-600">Trade tokens instantly with best rates</p>
      </div>

      {/* Swap Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* From Token */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">From</label>
            <span className="text-xs text-gray-500">Balance: 0.00</span>
          </div>
          <div className="flex items-center space-x-3">
            <select
              className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={fromCoin}
              onChange={(e) => setFromCoin(e.target.value)}
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="ROOCH">ROOCH</option>
            </select>
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-lg font-semibold text-gray-800 placeholder-gray-400 border-none outline-none"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                // Calculate toAmount here based on prices
                const fromPrice = fromCoin === 'BTC' ? btcPrice : fromCoin === 'ETH' ? ethPrice : roochPrice;
                const toPrice = toCoin === 'BTC' ? btcPrice : toCoin === 'ETH' ? ethPrice : roochPrice;
                const calculatedAmount = (parseFloat(e.target.value) * fromPrice) / toPrice;
                setToAmount(calculatedAmount.toFixed(6));
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {fromCoin === 'BTC' ? `1 BTC = $${btcPrice.toLocaleString()}` : 
               fromCoin === 'ETH' ? `1 ETH = $${ethPrice.toLocaleString()}` : 
               `1 ROOCH = $${roochPrice}`}
            </span>
            <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">MAX</button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button 
            className="bg-white border-4 border-gray-100 rounded-full p-2 hover:border-orange-100 transition-colors"
            onClick={() => {
              // Swap the tokens
              const tempCoin = fromCoin;
              setFromCoin(toCoin);
              setToCoin(tempCoin);
              setAmount('');
              setToAmount('');
            }}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">To</label>
            <span className="text-xs text-gray-500">Balance: 0.00</span>
          </div>
          <div className="flex items-center space-x-3">
            <select
              className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={toCoin}
              onChange={(e) => setToCoin(e.target.value)}
            >
              <option value="ROOCH">ROOCH</option>
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-lg font-semibold text-gray-800 placeholder-gray-400 border-none outline-none"
              value={toAmount}
              readOnly
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {toCoin === 'BTC' ? `1 BTC = $${btcPrice.toLocaleString()}` : 
               toCoin === 'ETH' ? `1 ETH = $${ethPrice.toLocaleString()}` : 
               `1 ROOCH = $${roochPrice}`}
            </span>
          </div>
        </div>

        {/* Fee Section */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Trading Fee</span>
            <div className="flex items-center space-x-2">
              <select
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700"
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
              >
                <option value="auto">Auto (0.3%)</option>
                <option value="free">Free</option>
                <option value="custom">Custom</option>
              </select>
              {feeType === 'custom' && (
                <input
                  type="number"
                  placeholder="0.3"
                  className="w-16 text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700"
                  value={customFee}
                  onChange={(e) => setCustomFee(e.target.value)}
                />
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Fee: {feeType === 'free' ? '0%' : feeType === 'custom' ? `${customFee}%` : '0.3%'}
          </div>
        </div>

        {/* Swap Action */}
        <div className="p-4">
          <button
            onClick={handleSwap}
            disabled={!sessionKey || !amount || txnLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              !sessionKey || !amount || txnLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {txnLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Swap...
              </div>
            ) : !sessionKey ? (
              'Connect Wallet First'
            ) : !amount ? (
              'Enter Amount'
            ) : (
              'Swap Tokens'
            )}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">BTC</div>
          <div className="text-sm font-semibold text-gray-800">${btcPrice.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ETH</div>
          <div className="text-sm font-semibold text-gray-800">${ethPrice.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ROOCH</div>
          <div className="text-sm font-semibold text-gray-800">${roochPrice}</div>
        </div>
      </div>
    </div>
  );
}

export default Swap;