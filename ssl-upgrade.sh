#!/bin/bash
# SSL 证书升级脚本 - 从自签名升级到 Let's Encrypt

set -e

DOMAIN="mail.chenggang.wang"
EMAIL="admin@chenggang.wang"

echo "=== SSL 证书升级脚本 ==="
echo "域名：$DOMAIN"
echo ""

# 检查 certbot
if ! command -v certbot &> /dev/null; then
    echo "❌ certbot 未安装，正在安装..."
    sudo apt-get install -y certbot
fi

# 停止 Postfix 释放 80 端口
echo "📌 临时停止 Postfix 以释放 80 端口..."
sudo systemctl stop postfix

# 申请证书
echo "🔐 申请 Let's Encrypt 证书..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

if [ $? -ne 0 ]; then
    echo "❌ 证书申请失败！"
    echo "请确保："
    echo "1. DNS A 记录已正确配置 ($DOMAIN → 公网 IP)"
    echo "2. 80 端口可以公网访问"
    echo "3. 防火墙允许 80 端口"
    sudo systemctl start postfix
    exit 1
fi

echo "✅ 证书申请成功！"
echo ""

# 更新 Postfix 配置
echo "📧 更新 Postfix SSL 配置..."
sudo postconf -e "smtpd_tls_cert_file = /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
sudo postconf -e "smtpd_tls_key_file = /etc/letsencrypt/live/$DOMAIN/privkey.pem"

# 更新 Dovecot 配置
echo "📮 更新 Dovecot SSL 配置..."
sudo sed -i "s|ssl_cert = .*|ssl_cert = </etc/letsencrypt/live/$DOMAIN/fullchain.pem|" /etc/dovecot/conf.d/10-ssl.conf
sudo sed -i "s|ssl_key = .*|ssl_key = </etc/letsencrypt/live/$DOMAIN/privkey.pem|" /etc/dovecot/conf.d/10-ssl.conf

# 重启服务
echo "🔄 重启邮件服务..."
sudo systemctl start postfix
sudo systemctl restart dovecot

# 验证
echo ""
echo "=== 验证 SSL 配置 ==="
echo "检查证书有效期："
sudo ls -la /etc/letsencrypt/live/$DOMAIN/

echo ""
echo "✅ SSL 证书升级完成！"
echo ""
echo "证书有效期：90 天"
echo "自动续期：certbot 已配置自动续期"
echo "手动续期：sudo certbot renew"
echo ""
echo "测试连接："
echo "  openssl s_client -connect $DOMAIN:587 -starttls smtp"
echo "  openssl s_client -connect $DOMAIN:993"
