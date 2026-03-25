// ProductScout AI - 本地存储工具函数
// 封装 chrome.storage 操作

const STORAGE_PREFIX = 'productscout_';

/**
 * 保存分析结果
 * @param {string} url - 产品 URL
 * @param {Object} data - 分析数据
 */
export async function saveAnalysis(url, data) {
  const key = STORAGE_PREFIX + 'analysis_' + hashUrl(url);
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({
      [key]: {
        data,
        timestamp: Date.now(),
        url
      }
    }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * 获取分析结果
 * @param {string} url - 产品 URL
 * @param {number} maxAge - 最大缓存时间（毫秒），默认 1 小时
 * @returns {Promise<Object|null>} 分析数据，过期返回 null
 */
export async function getAnalysis(url, maxAge = 3600000) {
  const key = STORAGE_PREFIX + 'analysis_' + hashUrl(url);
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        const cached = result[key];
        if (!cached) {
          resolve(null);
          return;
        }
        
        // 检查是否过期
        if (Date.now() - cached.timestamp > maxAge) {
          resolve(null);
          return;
        }
        
        resolve(cached.data);
      }
    });
  });
}

/**
 * 保存用户设置
 * @param {Object} settings - 设置对象
 */
export async function saveSettings(settings) {
  const key = STORAGE_PREFIX + 'settings';
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * 获取用户设置
 * @returns {Promise<Object>} 设置对象
 */
export async function getSettings() {
  const key = STORAGE_PREFIX + 'settings';
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[key] || getDefaultSettings());
      }
    });
  });
}

/**
 * 获取保存的历史记录
 * @param {number} limit - 最多返回多少条
 * @returns {Promise<Array>} 历史记录列表
 */
export async function getHistory(limit = 20) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (allData) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        const history = Object.entries(allData)
          .filter(([key]) => key.startsWith(STORAGE_PREFIX + 'analysis_'))
          .map(([, value]) => value)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        
        resolve(history);
      }
    });
  });
}

/**
 * 清除所有缓存
 */
export async function clearCache() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (allData) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      const keysToRemove = Object.keys(allData)
        .filter(key => key.startsWith(STORAGE_PREFIX + 'analysis_'));
      
      chrome.storage.local.remove(keysToRemove, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * 获取默认设置
 */
function getDefaultSettings() {
  return {
    targetMarket: 'US',
    currency: 'USD',
    autoAnalyze: true,
    cacheEnabled: true,
    cacheDuration: 3600000 // 1 小时
  };
}

/**
 * 简单的 URL hash 函数
 */
function hashUrl(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export default {
  saveAnalysis,
  getAnalysis,
  saveSettings,
  getSettings,
  getHistory,
  clearCache
};
