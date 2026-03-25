import React, { useEffect, useRef } from 'react';

function TrendChart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 模拟 90 天趋势数据
    const generateData = () => {
      const data = [];
      let value = 50;
      for (let i = 0; i < 90; i++) {
        value = value + (Math.random() - 0.45) * 10;
        value = Math.max(20, Math.min(100, value));
        data.push(value);
      }
      return data;
    };

    const data = generateData();

    // 绘制背景网格
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    
    // 横线
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 绘制趋势线
    ctx.beginPath();
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / 100) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // 绘制渐变填充
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / 100) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制起点和终点标记
    const startPoint = data[0];
    const endPoint = data[data.length - 1];
    const trend = endPoint > startPoint ? 'up' : 'down';

    // 起点
    ctx.beginPath();
    ctx.arc(0, height - (startPoint / 100) * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#9CA3AF';
    ctx.fill();

    // 终点
    ctx.beginPath();
    ctx.arc(width, height - (endPoint / 100) * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = trend === 'up' ? '#10B981' : '#EF4444';
    ctx.fill();

  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
        📈 90 天趋势
      </h3>

      {/* 趋势图 */}
      <canvas
        ref={canvasRef}
        width={320}
        height={150}
        className="w-full"
      />

      {/* 趋势说明 */}
      <div className="mt-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
          <span className="text-gray-600">90 天前</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600">今天</span>
        </div>
      </div>

      {/* 趋势分析 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 text-sm">💡</span>
          <p className="text-xs text-gray-600">
            近期趋势 <span className="font-medium text-green-600">上升</span>，
            市场需求增长中
          </p>
        </div>
      </div>
    </div>
  );
}

export default TrendChart;
