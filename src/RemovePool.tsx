import axios from 'axios';
import { Transaction } from '@roochnetwork/rooch-sdk';
import {
  useSignAndExecuteTransaction,
  useCurrentSession,
} from '@roochnetwork/rooch-sdk-kit';
import { useState, useEffect } from 'react';

const counterAddress = '0xe454cffdfccf8e4d03030083339fa29356040cee45fd3a51f5046abeaba0681a';

function RemovePool() {
  const sessionKey = useCurrentSession();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [txnLoading, setTxnLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState('BTC-ROOCH');
  const [removePercentage, setRemovePercentage] = useState(25);

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

  const handleRemoveLiquidity = async () => {
    try {
      setTxnLoading(true);
      
      const txn = new Transaction();
      txn.callFunction({
        address: counterAddress,
        module: 'liquidity_pool',
        function: 'remove_liquidity',
        args: [],
      });
      await signAndExecuteTransaction({ transaction: txn });
    } catch (error) {
      console.error(String(error));
    } finally {
      setTxnLoading(false);
    }
  };

  // Mock liquidity positions
  const liquidityPositions = [
    {
      pair: 'BTC-ROOCH',
      token1Amount: '0.0025',
      token2Amount: '125.50',
      share: '0.15',
      value: '$185.40'
    },
    {
      pair: 'ETH-ROOCH',
      token1Amount: '0.045',
      token2Amount: '89.20',
      share: '0.08',
      value: '$156.80'
    }
  ];

  const selectedPosition = liquidityPositions.find(pos => pos.pair === selectedPool);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4 4m4-4l-4-4" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Remove Liquidity</h2>
        </div>
        <p className="text-sm text-gray-600">Remove your tokens from liquidity pools</p>
      </div>

      {/* Your Liquidity Positions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Liquidity Positions</h3>
        <div className="space-y-3">
          {liquidityPositions.map((position, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                 onClick={() => setSelectedPool(position.pair)}>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{position.pair.split('-')[0][0]}</span>
                  </div>
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{position.pair.split('-')[1][0]}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{position.pair}</div>
                  <div className="text-xs text-gray-500">{position.share}% of pool</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{position.value}</div>
                <div className="text-xs text-gray-500">{position.token1Amount} / {position.token2Amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remove Liquidity Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Pool Selection */}
        <div className="p-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Pool</label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
          >
            <option value="BTC-ROOCH">BTC / ROOCH Pool</option>
            <option value="ETH-ROOCH">ETH / ROOCH Pool</option>
          </select>
        </div>

        {/* Remove Percentage */}
        <div className="p-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Amount to Remove</label>
          
          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[25, 50, 75, 100].map(percent => (
              <button
                key={percent}
                onClick={() => setRemovePercentage(percent)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  removePercentage === percent
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {percent}%
              </button>
            ))}
          </div>

          {/* Custom Percentage Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="100"
              value={removePercentage}
              onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1%</span>
              <span className="font-medium text-gray-800">{removePercentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Estimated Receive */}
        {selectedPosition && (
          <div className="p-4 bg-red-50 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700 mb-3">You will receive</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{selectedPool.split('-')[0][0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{selectedPool.split('-')[0]}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {(parseFloat(selectedPosition.token1Amount) * removePercentage / 100).toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{selectedPool.split('-')[1][0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{selectedPool.split('-')[1]}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {(parseFloat(selectedPosition.token2Amount) * removePercentage / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Remove Action */}
        <div className="p-4">
          <button
            onClick={handleRemoveLiquidity}
            disabled={!sessionKey || !selectedPosition || txnLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              !sessionKey || !selectedPosition || txnLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {txnLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Removing Liquidity...
              </div>
            ) : !sessionKey ? (
              'Connect Wallet First'
            ) : !selectedPosition ? (
              'No Liquidity Position'
            ) : (
              `Remove ${removePercentage}% Liquidity`
            )}
          </button>
        </div>
      </div>

      {/* Price Info */}
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

export default RemovePool;