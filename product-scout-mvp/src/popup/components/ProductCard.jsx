import React from 'react';

function ProductCard({ data }) {
  const { productName, category, score, metrics } = data;

  // 评分颜色
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 竞争等级标识
  const getCompetitionBadge = (level) => {
    const config = {
      'LOW': { color: 'bg-green-100 text-green-700', label: '低' },
      'MEDIUM': { color: 'bg-yellow-100 text-yellow-700', label: '中' },
      'HIGH': { color: 'bg-red-100 text-red-700', label: '高' }
    };
    return config[level] || config['MEDIUM'];
  };

  const competitionBadge = getCompetitionBadge(metrics.competitionLevel);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* 产品标题 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
            📦 {productName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{category}</p>
        </div>
        
        {/* 选品评分 */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)}`}>
          🏆 {score}/100
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">预估月销量</p>
          <p className="text-lg font-bold text-gray-800">
            📊 {metrics.estimatedMonthlySales >= 1000 
              ? `${(metrics.estimatedMonthlySales / 1000).toFixed(1)}K` 
              : metrics.estimatedMonthlySales}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">价格区间</p>
          <p className="text-lg font-bold text-gray-800">
            💰 ${metrics.priceRange.min} - ${metrics.priceRange.max}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">评论数</p>
          <p className="text-lg font-bold text-gray-800">
            💬 {metrics.reviewCount >= 1000 
              ? `${(metrics.reviewCount / 1000).toFixed(1)}K` 
              : metrics.reviewCount}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">竞争度</p>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${competitionBadge.color}`}>
            {competitionBadge.label}
          </span>
        </div>
      </div>

      {/* 评分 */}
      <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          {'⭐'.repeat(Math.floor(metrics.averageRating))}
          <span className="text-gray-400 ml-1">
            ({metrics.averageRating}/5)
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
