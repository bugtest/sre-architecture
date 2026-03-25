// ProductScout AI - Content Script
// 注入到 Amazon/1688 产品页面，提供快速分析入口

(function() {
  console.log('[ProductScout] Content script loaded');

  // 防止重复注入
  if (window.productScoutInjected) {
    console.log('[ProductScout] Already injected, skipping');
    return;
  }
  window.productScoutInjected = true;

  /**
   * 创建浮动分析按钮
   */
  function createFloatingButton() {
    // 检查是否已存在
    if (document.getElementById('productscout-float-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'productscout-float-btn';
    button.innerHTML = '🔍 分析';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 20px;
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      transition: all 0.3s ease;
    `;

    button.onmouseover = () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.5)';
    };

    button.onmouseout = () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
    };

    button.onclick = () => {
      analyzeCurrentProduct();
    };

    document.body.appendChild(button);
    console.log('[ProductScout] Floating button created');
  }

  /**
   * 分析当前产品
   */
  function analyzeCurrentProduct() {
    const url = window.location.href;
    console.log('[ProductScout] Analyzing product:', url);

    // 发送消息给 Background Service Worker
    chrome.runtime.sendMessage(
      {
        action: 'analyzeProduct',
        url: url,
        targetMarket: detectMarket()
      },
      (response) => {
        if (response && response.success) {
          console.log('[ProductScout] Analysis complete:', response.data);
          showAnalysisPanel(response.data);
        } else {
          console.error('[ProductScout] Analysis failed:', response?.error);
          alert('分析失败，请检查 OpenClaw Gateway 是否运行');
        }
      }
    );
  }

  /**
   * 检测目标市场
   */
  function detectMarket() {
    const hostname = window.location.hostname;
    if (hostname.includes('amazon.co.uk')) return 'UK';
    if (hostname.includes('amazon.de')) return 'DE';
    if (hostname.includes('amazon.fr')) return 'FR';
    if (hostname.includes('amazon.co.jp')) return 'JP';
    if (hostname.includes('1688.com')) return 'CN';
    return 'US';
  }

  /**
   * 显示分析结果面板
   */
  function showAnalysisPanel(data) {
    // 移除已存在的面板
    const existing = document.getElementById('productscout-panel');
    if (existing) {
      existing.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'productscout-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      width: 380px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border: 1px solid #E5E7EB;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // 评分颜色
    const scoreColor = data.score >= 70 ? '#10B981' : data.score >= 50 ? '#F59E0B' : '#EF4444';
    
    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1F2937;">
          🔍 ProductScout AI 分析结果
        </h3>
        <button id="productscout-close" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #6B7280;">
          ×
        </button>
      </div>
      
      <div style="padding: 16px;">
        <!-- 产品评分 -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">选品评分</div>
            <div style="font-size: 24px; font-weight: 700; color: ${scoreColor};">
              ${data.score}/100
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">建议</div>
            <div style="font-size: 16px; font-weight: 600; color: ${data.recommendation === 'GO' ? '#10B981' : '#F59E0B'};">
              ${data.recommendation === 'GO' ? '✅ 可以进入' : '⚠️ 需要调研'}
            </div>
          </div>
        </div>

        <!-- 核心指标 -->
        <div style="background: #F9FAFB; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <div style="font-size: 12px; color: #6B7280;">月销量</div>
              <div style="font-size: 16px; font-weight: 600; color: #1F2937;">
                📊 ${data.metrics.estimatedMonthlySales >= 1000 ? (data.metrics.estimatedMonthlySales / 1000).toFixed(1) + 'K' : data.metrics.estimatedMonthlySales}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280;">价格区间</div>
              <div style="font-size: 16px; font-weight: 600; color: #1F2937;">
                💰 $${data.metrics.priceRange.min} - $${data.metrics.priceRange.max}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280;">评论数</div>
              <div style="font-size: 16px; font-weight: 600; color: #1F2937;">
                💬 ${data.metrics.reviewCount >= 1000 ? (data.metrics.reviewCount / 1000).toFixed(1) + 'K' : data.metrics.reviewCount}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6B7280;">竞争度</div>
              <div style="font-size: 14px; font-weight: 600; color: ${
                data.metrics.competitionLevel === 'LOW' ? '#10B981' : 
                data.metrics.competitionLevel === 'MEDIUM' ? '#F59E0B' : '#EF4444'
              };">
                ${data.metrics.competitionLevel === 'LOW' ? '🟢 低' : 
                  data.metrics.competitionLevel === 'MEDIUM' ? '🟡 中' : '🔴 高'}
              </div>
            </div>
          </div>
        </div>

        <!-- 利润分析 -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">
            💵 利润分析
          </div>
          <div style="background: ${data.profitAnalysis.netProfit > 0 ? '#ECFDF5' : '#FEF2F2'}; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: #6B7280;">净利润</span>
              <div style="text-align: right;">
                <span style="font-size: 20px; font-weight: 700; color: ${data.profitAnalysis.netProfit > 0 ? '#10B981' : '#EF4444'};">
                  $${data.profitAnalysis.netProfit.toFixed(2)}
                </span>
                <span style="font-size: 12px; color: #6B7280; margin-left: 8px;">
                  (${data.profitAnalysis.margin})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 关键词 -->
        <div>
          <div style="font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 8px;">
            🔑 核心关键词
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${data.keywords.slice(0, 5).map(kw => `
              <span style="
                display: inline-block;
                padding: 4px 8px;
                background: #F3F4F6;
                border-radius: 4px;
                font-size: 12px;
                color: #1F2937;
              ">
                ${kw.term} (${kw.volume >= 1000 ? (kw.volume / 1000).toFixed(0) + 'K' : kw.volume})
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 关闭按钮
    panel.querySelector('#productscout-close').onclick = () => {
      panel.remove();
    };

    document.body.appendChild(panel);
    console.log('[ProductScout] Analysis panel shown');
  }

  /**
   * 在 Amazon 页面注入快捷入口
   */
  function injectAmazonShortcut() {
    // 查找产品标题区域
    const titleElement = document.getElementById('productTitle') || 
                        document.querySelector('#title_feature_div');
    
    if (titleElement && !document.getElementById('productscout-amazon-btn')) {
      const button = document.createElement('button');
      button.id = 'productscout-amazon-btn';
      button.innerHTML = '🔍 ProductScout 分析';
      button.style.cssText = `
        margin-top: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      `;
      
      button.onmouseover = () => {
        button.style.opacity = '0.9';
      };
      
      button.onclick = () => {
        analyzeCurrentProduct();
      };
      
      titleElement.parentElement.insertBefore(button, titleElement.nextSibling);
      console.log('[ProductScout] Amazon shortcut injected');
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createFloatingButton();
      setTimeout(injectAmazonShortcut, 1000);
    });
  } else {
    createFloatingButton();
    setTimeout(injectAmazonShortcut, 1000);
  }

  console.log('[ProductScout] Content script initialization complete');
})();
