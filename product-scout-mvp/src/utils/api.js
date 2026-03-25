// ProductScout AI - API 工具函数
// 封装与 OpenClaw Gateway 的通信

const GATEWAY_URL = 'http://127.0.0.1:18789';

/**
 * 调用 OpenClaw Agent
 * @param {string} agentId - Agent ID
 * @param {string} task - 任务描述
 * @returns {Promise<Object>} 分析结果
 */
export async function invokeAgent(agentId, task) {
  try {
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'invoke_agent',
        agentId,
        task
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway 错误：${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[API] invokeAgent failed:', error);
    throw error;
  }
}

/**
 * 分析产品（封装调用 ProductScout Agent）
 * @param {string} url - 产品 URL
 * @param {string} market - 目标市场
 * @returns {Promise<Object>} 分析结果
 */
export async function analyzeProduct(url, market = 'US') {
  return invokeAgent('product-scout', `分析电商产品：${url}, 目标市场：${market}`);
}

/**
 * 搜索关键词数据
 * @param {string} keyword - 关键词
 * @param {string} market - 目标市场
 * @returns {Promise<Object>} 关键词数据
 */
export async function searchKeywords(keyword, market = 'US') {
  return invokeAgent('product-scout', `搜索关键词数据：${keyword}, 市场：${market}`);
}

/**
 * 检查 Gateway 连接状态
 * @returns {Promise<boolean>} 是否可用
 */
export async function checkGatewayStatus() {
  try {
    const response = await fetch(`${GATEWAY_URL}/health`, {
      method: 'GET',
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    console.error('[API] Gateway health check failed:', error);
    return false;
  }
}

export default {
  invokeAgent,
  analyzeProduct,
  searchKeywords,
  checkGatewayStatus
};
