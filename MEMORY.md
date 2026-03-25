# MEMORY.md - 长期记忆

_最后更新：2026-03-07_

---

## 👤 用户信息

- **姓名：** 刚哥（王成刚）
- **时区：** Asia/Shanghai
- **主要沟通渠道：** 飞书、WhatsApp

---

## 🚀 重要项目

### SRE-NanoBot

**GitHub:** https://github.com/bugtest/sre-nanobot

**状态：** 核心功能已完成（2026-02-27）

**完成情况：**
- ✅ 4 个 Agent（K8s/Monitor/Incident/AutoFix）
- ✅ 2 个 MCP 服务器（K8s/Prometheus）
- ✅ 15+ 标准预案
- ✅ Skills 框架（loader.py, base.py, sre_alert_handler）
- ✅ WebUI（5 个页面 + WebSocket）
- ✅ 飞书集成
- ✅ 文档完成度 95%

**代码规模：** ~22,000+ 行，50+ 文件

**待完成：**
- ⏳ sre_incident_analyzer（故障分析）
- ⏳ sre_runbook_executor（预案执行）
- ⏳ Docker/K8s 部署配置
- ⏳ WebUI 管理页面优化

**目标完成日：** 原计划 3 月 2 日（需确认是否延期）

---

## 🛠️ 工具与环境

### 已安装工具
- **Kiro CLI** v1.26.2（亚马逊 AI 开发工具）

### OpenClaw 配置
- **工作空间：** /home/ubuntu/.openclaw/workspace
- **模型：** bailian/qwen3.5-plus
- **渠道：** 飞书、WhatsApp

### Windows 安装问题记录（2026-03-09）
**问题：** `node-llama-cpp` 编译失败
**解决方案：** 
```bash
setx NODE_LLAMA_CPP_DISABLE_BINARY_INSTALL 1
npm install -g openclaw@latest --ignore-scripts
```

---

## 📝 重要决策与偏好

- 偏好直接、简洁的沟通风格
- 重视文档和代码质量
- 关注 SRE/自动化/运维领域

---

## 🔐 安全提醒

- 长期记忆仅在主会话（私聊）加载
- 群聊时不加载 MEMORY.md（防止隐私泄露）
- 外部操作（邮件、推文等）需先确认

---

*此文件会定期回顾更新，保持精炼和准确*
