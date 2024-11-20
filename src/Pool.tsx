// Pool.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Transaction } from '@roochnetwork/rooch-sdk';
import {
  UseSignAndExecuteTransaction,
  useCurrentSession,
} from '@roochnetwork/rooch-sdk-kit';

const counterAddress = '0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a';

function Pool() {
  const sessionKey = useCurrentSession();
  const { mutateAsync: signAndExecuteTransaction } = UseSignAndExecuteTransaction();

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
      const [token1, token2] = selectedPair.split('-');
      
      const txn = new Transaction();
      txn.callFunction({
        address: counterAddress,
        module: 'liquidity_pool',
        function: 'add_liquidity',
        args: [token1, token2, token1Amount, token2Amount],
      });
      await signAndExecuteTransaction({ transaction: txn });
    } catch (error) {
      console.error(String(error));
    } finally {
      setTxnLoading(false);
    }
  };

  return (
    <div className="mt-4 w-full font-medium flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-bold">Liquidity Pool</h1>
      <div className="w-full max-w-md flex flex-col items-start space-y-2">
        <div className="space-y-4 w-full">
          {/* Price Display */}
          <div className="w-full p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold mb-2">Current Prices (USD):</p>
            <div className="grid grid-cols-3 gap-4">
              <div>BTC: ${btcPrice}</div>
              <div>ETH: ${ethPrice}</div>
              <div>ROOCH: ${roochPrice}</div>
            </div>
          </div>

          {/* Pool Pair Selection */}
          <div className="space-y-2">
            <label className="text-xl font-semibold">Select Pair:</label>
            <select 
              className="w-full p-2 border rounded-lg bg-white text-black"
              value={selectedPair}
              onChange={(e) => {
                setSelectedPair(e.target.value);
                setToken1Amount('');
                setToken2Amount('');
              }}
            >
              <option value="BTC-ROOCH">BTC-ROOCH</option>
              <option value="ETH-ROOCH">ETH-ROOCH</option>
            </select>
          </div>

          {/* Token Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xl font-semibold">First Token Amount:</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 border rounded-lg bg-gray-50">
                  <span className="font-bold">{selectedPair.split('-')[0]}</span>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="border p-2 rounded w-1/2 text-black bg-white"
                  value={token1Amount}
                  onChange={(e) => {
                    setToken1Amount(e.target.value);
                    setToken2Amount(calculateToken2Amount(e.target.value));
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-xl font-semibold">Second Token Amount:</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 border rounded-lg bg-gray-50">
                  <span className="font-bold">{selectedPair.split('-')[1]}</span>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="border p-2 rounded w-1/2 text-black bg-white"
                  value={token2Amount}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddLiquidity}
          disabled={!sessionKey || !token1Amount || !token2Amount || txnLoading}
          className={`mt-4 w-full py-3 rounded-lg font-bold text-white transition-colors
            ${!sessionKey || !token1Amount || !token2Amount || txnLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          {txnLoading 
            ? 'Adding Liquidity...' 
            : !sessionKey 
            ? 'Please create Session Key first'
            : 'Add Liquidity'}
        </button>
      </div>
    </div>
  );
}

export default Pool;