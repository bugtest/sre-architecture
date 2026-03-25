import React from 'react';

function ProfitCalculator({ data }) {
  const {
    costPrice,
    sellingPrice,
    platformFee,
    fbaFee,
    estimatedAdCost,
    netProfit,
    margin
  } = data;

  const totalCost = costPrice + platformFee + fbaFee + estimatedAdCost;
  const profitMargin = parseFloat(margin);

  // 利润率颜色
  const getMarginColor = () => {
    if (profitMargin >= 20) return 'text-green-600';
    if (profitMargin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 是否盈利
  const isProfitable = netProfit > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
        💵 利润分析
      </h3>

      {/* 收入 */}
      <div className="mb-3">
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600">售价</span>
          <span className="text-sm font-semibold text-gray-800">${sellingPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* 成本明细 */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600">采购价</span>
          <span className="text-sm text-gray-800">${costPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600">平台佣金</span>
          <span className="text-sm text-gray-800">${platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600">FBA 配送费</span>
          <span className="text-sm text-gray-800">${fbaFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600">预估广告费</span>
          <span className="text-sm text-gray-800">${estimatedAdCost.toFixed(2)}</span>
        </div>
        
        {/* 总成本 */}
        <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2">
          <span className="text-sm font-semibold text-gray-700">总成本</span>
          <span className="text-sm font-bold text-red-600">-${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* 净利润 */}
      <div className={`rounded-lg p-3 ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">净利润</span>
          <div className="text-right">
            <span className={`text-lg font-bold ${getMarginColor()}`}>
              ${netProfit.toFixed(2)}
            </span>
            <span className={`text-xs ml-2 font-medium ${getMarginColor()}`}>
              ({margin})
            </span>
          </div>
        </div>
        
        {/* 利润状态 */}
        <div className="mt-2 flex items-center">
          {isProfitable ? (
            <>
              <span className="text-green-600 text-xs">✅</span>
              <span className="text-green-700 text-xs ml-1">盈利空间充足</span>
            </>
          ) : (
            <>
              <span className="text-red-600 text-xs">⚠️</span>
              <span className="text-red-700 text-xs ml-1">利润为负，谨慎进入</span>
            </>
          )}
        </div>
      </div>

      {/* 成本结构饼图提示 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 建议采购价控制在售价的 20-30%
        </p>
      </div>
    </div>
  );
}

export default ProfitCalculator;
