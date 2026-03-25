#!/bin/bash
# SMTP 认证测试脚本

SERVER="localhost"
PORT="25"
USERNAME="smtpuser"
PASSWORD="SecurePass123!"

echo "=== SMTP 认证测试 ==="
echo "服务器：$SERVER:$PORT"
echo "用户：$USERNAME"
echo ""

# 使用 openssl 测试 STARTTLS 认证（如果支持）
echo "测试命令（手动）："
echo "1. telnet $SERVER $PORT"
echo "2. EHLO test"
echo "3. AUTH LOGIN"
echo "4. 输入 base64 编码的用户名和密码"
echo ""

# 生成 base64 认证信息
echo "Base64 编码的认证信息："
echo -n "$USERNAME" | base64
echo -n "$PASSWORD" | base64
echo ""

# 使用 curl 测试（如果可用）
if command -v curl &> /dev/null; then
    echo "使用 curl 测试发送（需要正确配置）："
    echo "curl smtp://$SERVER:$PORT --mail-from test@localhost --mail-rcv test@localhost --user $USERNAME:$PASSWORD"
fi
