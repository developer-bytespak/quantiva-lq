import React from 'react'

const DemoTrades: React.FC = () => {
  const trades = [
    {
      id: 1,
      symbol: 'BTC/USD',
      type: 'Buy',
      entry: '$45,230',
      exit: '$46,580',
      profit: '+$1,350',
      profitPercent: '+2.98%',
      date: '2024-01-15',
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      type: 'Sell',
      entry: '$2,840',
      exit: '$2,720',
      profit: '+$120',
      profitPercent: '+4.23%',
      date: '2024-01-14',
    },
    {
      id: 3,
      symbol: 'AAPL',
      type: 'Buy',
      entry: '$185.50',
      exit: '$188.20',
      profit: '+$2.70',
      profitPercent: '+1.46%',
      date: '2024-01-13',
    },
    {
      id: 4,
      symbol: 'TSLA',
      type: 'Buy',
      entry: '$248.90',
      exit: '$252.40',
      profit: '+$3.50',
      profitPercent: '+1.41%',
      date: '2024-01-12',
    },
  ]

  return (
    <section id="demo-trades" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Demo Trades
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real examples of successful trades executed using our platform
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Symbol</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Entry</th>
                <th className="px-6 py-4 text-left">Exit</th>
                <th className="px-6 py-4 text-left">Profit</th>
                <th className="px-6 py-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{trade.symbol}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.type === 'Buy'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{trade.entry}</td>
                  <td className="px-6 py-4">{trade.exit}</td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-semibold">
                      {trade.profit}
                    </span>
                    <span className="text-green-600 text-sm ml-2">
                      ({trade.profitPercent})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{trade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default DemoTrades

