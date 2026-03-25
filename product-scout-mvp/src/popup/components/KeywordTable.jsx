import React from 'react';

function KeywordTable({ keywords }) {
  // 竞争度颜色
  const getCompetitionColor = (competition) => {
    switch (competition) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 格式化搜索量
  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}K`;
    }
    return volume.toString();
  };

  // 竞争度中文
  const getCompetitionLabel = (competition) => {
    const labels = {
      'HIGH': '高竞争',
      'MEDIUM': '中竞争',
      'LOW': '低竞争'
    };
    return labels[competition] || competition;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
        🔑 核心关键词
      </h3>

      <div className="space-y-2">
        {keywords.map((keyword, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded-lg ${getCompetitionColor(keyword.competition)}`}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {keyword.term}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 搜索量 */}
              <div className="text-right">
                <p className="text-xs text-gray-500">搜索量</p>
                <p className="text-sm font-bold text-gray-800">
                  {formatVolume(keyword.volume)}
                </p>
              </div>
              
              {/* 竞争度 */}
              <div className="text-right min-w-[60px]">
                <p className="text-xs text-gray-500">竞争度</p>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-50">
                  {getCompetitionLabel(keyword.competition)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 关键词建议 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 text-sm">💡</span>
          <p className="text-xs text-gray-600">
            建议优先关注 <span className="font-medium text-green-600">低竞争</span> 关键词，
            这些是潜在的蓝海机会
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-3 flex gap-2">
        <button className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded transition">
          📋 复制全部
        </button>
        <button className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded transition">
          🔍 深入分析
        </button>
      </div>
    </div>
  );
}

export default KeywordTable;
