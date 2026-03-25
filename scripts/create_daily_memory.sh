#!/bin/bash
# 每日记忆文件创建脚本
# 功能：检查并创建当天的短期记忆文件

MEMORY_DIR="/home/ubuntu/.openclaw/workspace/memory"
TODAY=$(date +%Y-%m-%d)
MEMORY_FILE="${MEMORY_DIR}/${TODAY}.md"

# 确保目录存在
mkdir -p "${MEMORY_DIR}"

# 检查文件是否已存在
if [ -f "${MEMORY_FILE}" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 记忆文件 ${TODAY}.md 已存在，跳过创建"
    exit 0
fi

# 创建新的记忆文件
cat > "${MEMORY_FILE}" << EOF
# ${TODAY} - 记忆日志

## 📝 今日记录

（待填充）

---

## 🎯 待跟进事项

（待填充）

---

*记录时间：${TODAY} 00:01*
EOF

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 成功创建记忆文件 ${TODAY}.md"
