import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import ProfitCalculator from './components/ProfitCalculator';
import KeywordTable from './components/KeywordTable';
import TrendChart from './components/TrendChart';

function App() {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 获取当前标签页 URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        analyzeProduct(currentTab.url);
      }
    });
  }, []);

  const analyzeProduct = async (url) => {
    setLoading(true);
    setError(null);

    try {
      // 调用 OpenClaw Gateway
      const response = await fetch('http://127.0.0.1:18789', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invoke_agent',
          agentId: 'product-scout',
          task: `分析这个电商产品：${url}`
        })
      });

      if (!response.ok) {
        throw new Error('分析失败，请检查 OpenClaw Gateway 是否运行');
      }

      const result = await response.json();
      setProductData(result);
    } catch (err) {
      setError(err.message);
      // 演示模式：使用模拟数据
      setProductData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据（用于演示）
  const getMockData = () => ({
    productName: '无线蓝牙耳机',
    category: '消费电子',
    score: 78,
    metrics: {
      estimatedMonthlySales: 1500,
      competitionLevel: 'MEDIUM',
      priceRange: { min: 15, max: 35 },
      reviewCount: 342,
      averageRating: 4.3
    },
    profitAnalysis: {
      costPrice: 8,
      sellingPrice: 29.99,
      platformFee: 4.5,
      fbaFee: 5.2,
      estimatedAdCost: 6.0,
      netProfit: 6.29,
      margin: '21%'
    },
    keywords: [
      { term: 'wireless earbuds', volume: 45000, competition: 'HIGH' },
      { term: 'bluetooth headphones', volume: 28000, competition: 'MEDIUM' },
      { term: 'sports earbuds', volume: 12000, competition: 'LOW' }
    ],
    recommendation: 'GO',
    reasoning: '竞争中等，利润率 21%，月销量可观，适合进入'
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">🔍 ProductScout AI</h1>
        <button className="text-gray-500 hover:text-gray-700">⚙️</button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl">🔄</div>
          <p className="mt-2 text-gray-600">正在分析产品...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
          <p className="text-gray-500 text-xs mt-1">已加载演示数据</p>
        </div>
      )}

      {/* Product Data */}
      {productData && !loading && (
        <>
          <ProductCard data={productData} />
          <ProfitCalculator data={productData.profitAnalysis} />
          <KeywordTable keywords={productData.keywords} />
          <TrendChart />
          
          {/* Recommendation */}
          <div className={`rounded-lg p-3 ${
            productData.recommendation === 'GO' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`font-bold ${
              productData.recommendation === 'GO' 
                ? 'text-green-700' 
                : 'text-yellow-700'
            }`}>
              🎯 建议：{productData.recommendation === 'GO' ? '可以进入' : '需要调研'}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {productData.reasoning}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              📊 详细报告
            </button>
            <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition">
              💾 保存
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
