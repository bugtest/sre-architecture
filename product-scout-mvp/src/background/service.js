// ProductScout AI - Background Service Worker
// 负责与 OpenClaw Gateway 通信，处理产品分析请求

const OPENCLAW_GATEWAY_URL = 'http://127.0.0.1:18789';

// 监听来自 Popup 或 Content Script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ProductScout] Received message:', request);

  if (request.action === 'analyzeProduct') {
    analyzeProduct(request.url, request.targetMarket)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // 返回 true 表示异步响应
    return true;
  }

  if (request.action === 'getStoredData') {
    getStoredData(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'saveAnalysis') {
    saveAnalysis(request.url, request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * 分析产品
 * @param {string} url - 产品 URL
 * @param {string} targetMarket - 目标市场 (US/EU/CN)
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeProduct(url, targetMarket = 'US') {
  try {
    // 1. 检查是否有缓存
    const cached = await getStoredData(url);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 小时缓存
      console.log('[ProductScout] Using cached data');
      return cached.data;
    }

    // 2. 调用 OpenClaw Gateway
    console.log('[ProductScout] Calling OpenClaw Gateway...');
    
    const response = await fetch(OPENCLAW_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'invoke_agent',
        agentId: 'product-scout',
        task: `分析这个电商产品：${url}, 目标市场：${targetMarket}`
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway 响应错误：${response.status}`);
    }

    const result = await response.json();
    
    // 3. 缓存结果
    await saveAnalysis(url, result);
    
    return result;
  } catch (error) {
    console.error('[ProductScout] Analysis failed:', error);
    
    // 返回模拟数据用于演示
    return getMockData(url);
  }
}

/**
 * 获取存储的数据
 */
async function getStoredData(url) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([url], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[url]);
      }
    });
  });
}

/**
 * 保存分析结果
 */
async function saveAnalysis(url, data) {
  const storageData = {
    [url]: {
      data,
      timestamp: Date.now()
    }
  };

  return new Promise((resolve, reject) => {
    chrome.storage.local.set(storageData, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * 模拟数据（用于演示/测试）
 */
function getMockData(url) {
  return {
    productName: extractProductName(url),
    category: '消费电子',
    score: Math.floor(Math.random() * 30) + 65, // 65-95
    metrics: {
      estimatedMonthlySales: Math.floor(Math.random() * 3000) + 500,
      competitionLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
      priceRange: {
        min: Math.floor(Math.random() * 20) + 10,
        max: Math.floor(Math.random() * 30) + 40
      },
      reviewCount: Math.floor(Math.random() * 1000) + 50,
      averageRating: (Math.random() * 1.5 + 3.5).toFixed(1)
    },
    profitAnalysis: {
      costPrice: Math.floor(Math.random() * 10) + 5,
      sellingPrice: Math.floor(Math.random() * 30) + 25,
      platformFee: 4.5,
      fbaFee: 5.2,
      estimatedAdCost: 6.0,
      netProfit: 0,
      margin: '0%'
    },
    keywords: [
      { term: 'wireless earbuds', volume: 45000, competition: 'HIGH' },
      { term: 'bluetooth headphones', volume: 28000, competition: 'MEDIUM' },
      { term: 'sports earbuds', volume: 12000, competition: 'LOW' }
    ],
    recommendation: 'GO',
    reasoning: '演示数据 - 实际分析需要连接 OpenClaw Gateway'
  };
}

/**
 * 从 URL 提取产品名（简单实现）
 */
function extractProductName(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('amazon')) {
      const path = urlObj.pathname;
      const segments = path.split('/');
      const productSegment = segments.find(s => s.includes('/dp/'));
      return 'Amazon 产品';
    }
    if (urlObj.hostname.includes('1688')) {
      return '1688 产品';
    }
  } catch (e) {
    console.error('[ProductScout] Failed to parse URL:', e);
  }
  return '未知产品';
}

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[ProductScout] Extension installed:', details.reason);
  
  // 设置默认配置
  chrome.storage.local.set({
    settings: {
      targetMarket: 'US',
      currency: 'USD',
      autoAnalyze: true
    }
  });
});

console.log('[ProductScout] Background service worker loaded');
