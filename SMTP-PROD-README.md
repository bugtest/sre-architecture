# 邮件服务器生产环境配置指南

## 服务器信息

| 项目 | 配置 |
|------|------|
| 域名 | chenggang.wang |
| 邮件服务器 | mail.chenggang.wang |
| 服务器 IP | 10.3.0.3 (内网) |
| SMTP 端口 | 25 (收发), 587 (提交+TLS) |
| IMAP 端口 | 143 (明文), 993 (SSL) |
| 认证方式 | SASL (用户名/密码) |

---

## ⚠️ DNS 配置（必须）

要让邮件正常收发，需要在域名管理后台添加以下 DNS 记录：

### A 记录
```
主机记录：mail
记录类型：A
记录值：10.3.0.3 (或你的公网 IP)
TTL: 600
```

### MX 记录
```
主机记录：@
记录类型：MX
记录值：mail.chenggang.wang
优先级：10
TTL: 600
```

### SPF 记录（防止被当作垃圾邮件）
```
主机记录：@
记录类型：TXT
记录值：v=spf1 mx ip4:10.3.0.3 ~all
TTL: 600
```

### DKIM 记录（可选，强烈推荐）
需要安装 OpenDKIM 生成密钥，然后添加 TXT 记录。

### DMARC 记录（可选）
```
主机记录：_dmarc
记录类型：TXT
记录值：v=DMARC1; p=none; rua=mailto:admin@chenggang.wang
TTL: 600
```

---

## 测试账户

| 用户名 | 密码 | 邮箱地址 |
|--------|------|----------|
| smtpuser | SecurePass123! | smtpuser@chenggang.wang |

### 添加新用户
```bash
sudo useradd -m -s /usr/sbin/nologin 用户名
echo "用户名：密码" | sudo chpasswd
```

---

## 客户端配置

### SMTP 发送设置
```
服务器：mail.chenggang.wang
端口：587 (推荐) 或 25
加密：STARTTLS
认证：用户名/密码
用户名：你的完整邮箱地址
```

### IMAP 接收设置
```
服务器：mail.chenggang.wang
端口：993 (SSL) 或 143
加密：SSL/TLS (993) 或 STARTTLS (143)
认证：用户名/密码
```

---

## 测试命令

### 测试 SMTP 连接
```bash
openssl s_client -connect mail.chenggang.wang:587 -starttls smtp
```

### 测试 IMAP 连接
```bash
openssl s_client -connect mail.chenggang.wang:993
```

### 发送测试邮件
```bash
echo "测试邮件内容" | mail -s "测试主题" recipient@example.com
```

### Python 测试
```python
import smtplib
from email.mime.text import MIMEText

msg = MIMEText('测试邮件正文')
msg['Subject'] = 'SMTP 测试'
msg['From'] = 'smtpuser@chenggang.wang'
msg['To'] = 'recipient@example.com'

# 发送
server = smtplib.SMTP_SSL('mail.chenggang.wang', 465)
# 或者用 STARTTLS:
# server = smtplib.SMTP('mail.chenggang.wang', 587)
# server.starttls()
server.login('smtpuser', 'SecurePass123!')
server.send_message(msg)
server.quit()
print('发送成功!')
```

---

## 升级到 Let's Encrypt 正式证书

DNS 配置完成后，执行：

```bash
# 停止邮件服务临时占用 80 端口
sudo systemctl stop postfix

# 申请证书
sudo certbot certonly --standalone -d mail.chenggang.wang

# 更新证书路径
sudo postconf -e "smtpd_tls_cert_file = /etc/letsencrypt/live/mail.chenggang.wang/fullchain.pem"
sudo postconf -e "smtpd_tls_key_file = /etc/letsencrypt/live/mail.chenggang.wang/privkey.pem"

sudo sed -i 's|ssl_cert = .*|ssl_cert = </etc/letsencrypt/live/mail.chenggang.wang/fullchain.pem|' /etc/dovecot/conf.d/10-ssl.conf
sudo sed -i 's|ssl_key = .*|ssl_key = </etc/letsencrypt/live/mail.chenggang.wang/privkey.pem|' /etc/dovecot/conf.d/10-ssl.conf

# 重启服务
sudo systemctl start postfix
sudo systemctl restart dovecot
```

---

## 日志查看

```bash
# Postfix 日志
sudo tail -f /var/log/mail.log

# Dovecot 日志
sudo doveadm log errors
```

---

## 防火墙端口

确保以下端口开放：
- 25/tcp (SMTP)
- 587/tcp (SMTP Submission)
- 465/tcp (SMTPS，可选)
- 143/tcp (IMAP)
- 993/tcp (IMAPS)

```bash
sudo ufw allow 25,587,465,143,993/tcp
```

---

## 常见问题

### 邮件被当作垃圾邮件
1. 检查 SPF 记录是否正确
2. 配置 DKIM 签名
3. 确保反向 DNS (PTR) 记录正确
4. 检查 IP 是否在黑名单中

### 无法接收外网邮件
1. 检查 MX 记录是否正确
2. 检查 25 端口是否开放
3. 检查 Postfix 配置 `mydestination`

### 认证失败
1. 确认用户名密码正确
2. 检查 Dovecot auth socket 权限
3. 查看 /var/log/mail.log 错误信息
