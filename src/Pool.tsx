import axios from 'axios';
import { Transaction } from '@roochnetwork/rooch-sdk';
import {
  useSignAndExecuteTransaction,
  useCurrentSession,
} from '@roochnetwork/rooch-sdk-kit';
import { useState, useEffect } from 'react';

const counterAddress = '0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a';

function Pool() {
  const sessionKey = useCurrentSession();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [txnLoading, setTxnLoading] = useState(false);
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [selectedPair, setSelectedPair] = useState('BTC-ROOCH');

  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const roochPrice = 200; // Fixed price for ROOCH

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

  const calculateToken2Amount = (amount: string) => {
    if (!amount) return '';
    const [token1, token2] = selectedPair.split('-');
    const token1Price = token1 === 'BTC' ? btcPrice : token1 === 'ETH' ? ethPrice : roochPrice;
    const token2Price = token2 === 'BTC' ? btcPrice : token2 === 'ETH' ? ethPrice : roochPrice;
    const calculatedAmount = (parseFloat(amount) * token1Price) / token2Price;
    return calculatedAmount.toFixed(6);
  };

  const handleAddLiquidity = async () => {
    try {
      setTxnLoading(true);
      
      const txn = new Transaction();
      txn.callFunction({
        address: counterAddress,
        module: 'liquidity_pool',
        function: 'add_liquidity',
        args: [],
      });
      await signAndExecuteTransaction({ transaction: txn });
    } catch (error) {
      console.error(String(error));
    } finally {
      setTxnLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Liquidity Pool</h2>
        </div>
        <p className="text-sm text-gray-600">Add liquidity to earn trading fees</p>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">BTC Price</div>
          <div className="text-sm font-semibold text-gray-800">${btcPrice.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ETH Price</div>
          <div className="text-sm font-semibold text-gray-800">${ethPrice.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ROOCH Price</div>
          <div className="text-sm font-semibold text-gray-800">${roochPrice}</div>
        </div>
      </div>

      {/* Pool Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Pool Pair Selection */}
        <div className="p-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Pool Pair</label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={selectedPair}
            onChange={(e) => {
              setSelectedPair(e.target.value);
              setToken1Amount('');
              setToken2Amount('');
            }}
          >
            <option value="BTC-ROOCH">BTC / ROOCH Pool</option>
            <option value="ETH-ROOCH">ETH / ROOCH Pool</option>
          </select>
        </div>

        {/* First Token Input */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">First Token</label>
            <span className="text-xs text-gray-500">Balance: 0.00</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <span className="text-sm font-semibold text-orange-700">{selectedPair.split('-')[0]}</span>
            </div>
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-lg font-semibold text-gray-800 placeholder-gray-400 border-none outline-none"
              value={token1Amount}
              onChange={(e) => {
                setToken1Amount(e.target.value);
                setToken2Amount(calculateToken2Amount(e.target.value));
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {selectedPair.split('-')[0] === 'BTC' ? `1 BTC = $${btcPrice.toLocaleString()}` : 
               selectedPair.split('-')[0] === 'ETH' ? `1 ETH = $${ethPrice.toLocaleString()}` : 
               `1 ROOCH = $${roochPrice}`}
            </span>
            <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">MAX</button>
          </div>
        </div>

        {/* Plus Icon */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-white border-4 border-gray-100 rounded-full p-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>

        {/* Second Token Input */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Second Token</label>
            <span className="text-xs text-gray-500">Balance: 0.00</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-sm font-semibold text-blue-700">{selectedPair.split('-')[1]}</span>
            </div>
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-transparent text-right text-lg font-semibold text-gray-800 placeholder-gray-400 border-none outline-none"
              value={token2Amount}
              readOnly
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {selectedPair.split('-')[1] === 'BTC' ? `1 BTC = $${btcPrice.toLocaleString()}` : 
               selectedPair.split('-')[1] === 'ETH' ? `1 ETH = $${ethPrice.toLocaleString()}` : 
               `1 ROOCH = $${roochPrice}`}
            </span>
          </div>
        </div>

        {/* Pool Info */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Pool Share</span>
              <span className="font-medium text-gray-800">0.00%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{selectedPair.split('-')[0]} per {selectedPair.split('-')[1]}</span>
              <span className="font-medium text-gray-800">
                {selectedPair === 'BTC-ROOCH' ? (btcPrice / roochPrice).toFixed(4) : 
                 selectedPair === 'ETH-ROOCH' ? (ethPrice / roochPrice).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{selectedPair.split('-')[1]} per {selectedPair.split('-')[0]}</span>
              <span className="font-medium text-gray-800">
                {selectedPair === 'BTC-ROOCH' ? (roochPrice / btcPrice).toFixed(6) : 
                 selectedPair === 'ETH-ROOCH' ? (roochPrice / ethPrice).toFixed(6) : '0.000000'}
              </span>
            </div>
          </div>
        </div>

        {/* Add Liquidity Action */}
        <div className="p-4">
          <button
            onClick={handleAddLiquidity}
            disabled={!sessionKey || !token1Amount || !token2Amount || txnLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              !sessionKey || !token1Amount || !token2Amount || txnLoading
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
                Adding Liquidity...
              </div>
            ) : !sessionKey ? (
              'Connect Wallet First'
            ) : !token1Amount || !token2Amount ? (
              'Enter Amounts'
            ) : (
              'Add Liquidity'
            )}
          </button>
        </div>
      </div>

      {/* Liquidity Pools List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Liquidity</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">No liquidity found</p>
          <p className="text-xs text-gray-400 mt-1">Add liquidity to see your positions here</p>
        </div>
      </div>
    </div>
  );
}

export default Pool;