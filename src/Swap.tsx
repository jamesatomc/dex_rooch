import axios from 'axios';
import { Transaction } from '@roochnetwork/rooch-sdk';
import {
  UseSignAndExecuteTransaction,
  useCurrentSession,
} from '@roochnetwork/rooch-sdk-kit';
import { useState, useEffect } from 'react';

const counterAddress = '0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a';

function Swap() {
  const sessionKey = useCurrentSession();
  const { mutateAsync: signAndExecuteTransaction } = UseSignAndExecuteTransaction();

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
    <div className="mt-4 w-full font-medium flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-bold">Coin Swap</h1>
      <div className="w-full max-w-md flex flex-col items-start space-y-2">

        {/* Fee Section */}
        <div className="space-y-2 w-full">
          <label className="text-xl font-semibold">Fee:</label>
          <div className="flex space-x-2">
            <select
              className="border p-2 rounded flex-1 text-black bg-white"
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
                placeholder="Fee %"
                className="border p-2 rounded w-1/2 text-black bg-white"
                value={customFee}
                onChange={(e) => setCustomFee(e.target.value)}
              />
            )}
          </div>
          <p className="text-sm text-gray-500">
            Fee: {feeType === 'free' ? '0%' : feeType === 'custom' ? `${customFee}%` : '0.3%'}
          </p>
        </div>


        <div className="space-y-4 w-full">
          {/* From Section */}
          <div className="space-y-2">
            <label className="text-xl font-semibold">From:</label>
            <div className="flex space-x-2">
              <select
                className="border p-2 rounded flex-1 text-black bg-white"
                value={fromCoin}
                onChange={(e) => setFromCoin(e.target.value)}
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="ROOCH">ROOCH</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="border p-2 rounded w-1/2 text-black bg-white"
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
            <p className="text-sm text-gray-500">
              {fromCoin === 'BTC' ? `1 BTC = $${btcPrice}` : 
               fromCoin === 'ETH' ? `1 ETH = $${ethPrice}` : 
               `1 ROOCH = $${roochPrice}`}
            </p>
          </div>
        
          {/* To Section */}
          <div className="space-y-2">
            <label className="text-xl font-semibold">To:</label>
            <div className="flex space-x-2">
              <select
                className="border p-2 rounded flex-1 text-black bg-white"
                value={toCoin}
                onChange={(e) => setToCoin(e.target.value)}
              >
                <option value="ROOCH">ROOCH</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="border p-2 rounded w-1/2 text-black bg-white"
                value={toAmount}
                readOnly
              />
            </div>
            <p className="text-sm text-gray-500">
              {toCoin === 'BTC' ? `1 BTC = $${btcPrice}` : 
               toCoin === 'ETH' ? `1 ETH = $${ethPrice}` : 
               `1 ROOCH = $${roochPrice}`}
            </p>
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={!sessionKey || !amount || txnLoading}
          className={`mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded ${
            txnLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {txnLoading
            ? 'Processing...'
            : sessionKey
            ? 'Swap Coins'
            : 'Please create Session Key first'}
        </button>
      </div>
    </div>
  );
}

export default Swap;