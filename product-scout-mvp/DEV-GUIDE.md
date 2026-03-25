# 🚀 ProductScout AI - 开发指南

> 快速开始开发你的 AI 电商选品助手 Chrome 插件

---

## 一、环境要求

- Node.js v18+ (推荐 v20+)
- npm 或 pnpm
- Chrome 浏览器 110+
- OpenClaw Gateway 运行中

---

## 二、快速开始

### 1. 安装依赖

```bash
cd /home/ubuntu/.openclaw/workspace/product-scout-mvp
npm install
```

### 2. 开发模式

```bash
# 启动 Vite 开发服务器（自动热重载）
npm run dev

# 或者监听构建
npm run watch
```

### 3. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录

### 4. 打包为 ZIP

```bash
npm run pack
# 生成 product-scout-v0.1.zip
```

---

## 三、加载到 Chrome

### 步骤

1. **打开 Chrome 扩展管理页面**
   - 地址栏输入：`chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**
   - 点击右上角的 "开发者模式" 开关

3. **加载未打包的扩展**
   - 点击 "加载未打包的扩展"
   - 选择 `dist/` 目录（构建后）或项目根目录（开发时）

4. **验证安装**
   - 浏览器工具栏应该出现 🔍 图标
   - 点击图标打开 Popup 界面

---

## 四、配置 OpenClaw

### 1. 确保 Gateway 运行

```bash
openclaw gateway status
# 如果没运行：openclaw gateway start
```

### 2. 配置 ProductScout Agent

在 `~/.openclaw/agents/` 下创建 Agent 配置：

```bash
mkdir -p ~/.openclaw/agents/product-scout
```

创建 `~/.openclaw/agents/product-scout/agent.json`:

```json
{
  "id": "product-scout",
  "name": "ProductScout AI",
  "model": "bailian/qwen3.5-plus",
  "workspace": "/home/ubuntu/.openclaw/workspace/product-scout-mvp",
  "systemPrompt": "复制 AGENT-TEMPLATE.md 中的角色定义内容"
}
```

### 3. 测试 Agent

```bash
# 测试调用
openclaw agent run product-scout "分析这个产品：https://www.amazon.com/dp/B08XYZ123"
```

---

## 五、功能测试

### 测试 Popup 界面

1. 点击插件图标
2. 应该看到：
   - 产品信息卡片
   - 利润分析
   - 关键词表格
   - 趋势图表

### 测试 Amazon 页面注入

1. 访问 Amazon 产品页（如 `amazon.com/dp/B08XYZ123`）
2. 页面右下角应该出现 "🔍 分析" 浮动按钮
3. 点击按钮，应该弹出分析结果面板

### 测试 OpenClaw 集成

1. 确保 Gateway 运行
2. 点击插件图标
3. 查看浏览器控制台（F12）
4. 应该看到 API 调用日志

---

## 六、调试技巧

### 查看 Popup 日志

1. 右键点击插件图标
2. 选择 "检查弹出内容"
3. 打开 DevTools 控制台

### 查看 Background 日志

1. 访问 `chrome://extensions/`
2. 找到 ProductScout
3. 点击 "service worker" 链接
4. 打开 DevTools 控制台

### 查看 Content Script 日志

1. 访问 Amazon 产品页
2. 按 F12 打开 DevTools
3. 查看控制台输出

---

## 七、常见问题

### Q: Popup 显示 "分析失败"
**A:** 检查 OpenClaw Gateway 是否运行
```bash
openclaw gateway status
```

### Q: Amazon 页面没有浮动按钮
**A:** 
1. 检查 manifest.json 的 `content_scripts` 配置
2. 刷新页面
3. 查看控制台是否有报错

### Q: 构建失败
**A:** 
1. 删除 `node_modules/` 和 `dist/`
2. 重新安装：`npm install`
3. 重新构建：`npm run build`

### Q: 图标不显示
**A:** 
1. 检查 `public/icons/` 目录是否有图标文件
2. 检查 manifest.json 的 `icons` 配置
3. 重新加载扩展

---

## 八、项目结构

```
product-scout-mvp/
├── manifest.json          # Chrome 扩展配置
├── package.json           # 项目依赖
├── vite.config.js         # Vite 构建配置
├── tailwind.config.js     # TailwindCSS 配置
├── README.md              # 产品规划文档
├── AGENT-TEMPLATE.md      # OpenClaw Agent 模板
├── DEV-GUIDE.md           # 本文件
├── src/
│   ├── popup/             # Popup UI (React)
│   │   ├── App.jsx        # 主组件
│   │   ├── main.jsx       # 入口文件
│   │   ├── index.css      # 样式
│   │   └── components/    # React 组件
│   ├── background/        # Service Worker
│   │   └── service.js     # 后台服务
│   ├── content/           # Content Scripts
│   │   └── injector.js    # 页面注入
│   └── utils/             # 工具函数
│       ├── api.js         # API 封装
│       └── storage.js     # 存储封装
└── public/
    └── icons/             # 图标资源
```

---

## 九、下一步开发

### Week 1 任务清单
- [ ] 完成开发环境搭建
- [ ] 测试 Popup 界面显示
- [ ] 测试 Amazon 页面注入
- [ ] 配置 ProductScout Agent
- [ ] 测试 OpenClaw 集成

### Week 2 任务清单
- [ ] 实现真实数据抓取
- [ ] 优化选品评分算法
- [ ] 添加更多电商平台支持（1688、Shopify）
- [ ] 实现本地数据缓存

### Week 3 任务清单
- [ ] 完善趋势图表
- [ ] 添加历史记录功能
- [ ] 优化 UI/UX
- [ ] 性能优化

### Week 4 任务清单
- [ ] 内部测试（5-10 个产品）
- [ ] 修复 Bug
- [ ] 编写用户文档
- [ ] 准备 Chrome Store 上架材料
- [ ] 提交审核 🚀

---

## 十、资源链接

- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [React 官方文档](https://react.dev/)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
- [OpenClaw 文档](https://docs.openclaw.ai/)
- [Brave Search API](https://brave.com/search/api/)

---

## 十一、联系与支持

- 项目仓库：[待创建]
- 问题反馈：[待创建]
- 文档更新：2026-03-02

---

**祝你开发顺利！🚀**
