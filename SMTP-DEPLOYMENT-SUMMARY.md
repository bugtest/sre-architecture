# 邮件服务器部署完成总结

## ✅ 已完成配置

| 组件 | 状态 | 说明 |
|------|------|------|
| Postfix (SMTP) | ✅ 运行中 | 邮件发送/接收 |
| Dovecot (IMAP) | ✅ 运行中 | 邮件接收/认证 |
| SASL 认证 | ✅ 已启用 | 用户名密码验证 |
| SSL/TLS | ✅ 已配置 | 自签名证书（可升级） |
| OpenDKIM | ✅ 运行中 | DKIM 邮件签名 |
| 域名 | ✅ chenggang.wang | 已配置 |

---

## 🔑 测试账户

| 项目 | 值 |
|------|-----|
| 邮箱地址 | `smtpuser@chenggang.wang` |
| 密码 | `SecurePass123!` |
| SMTP 服务器 | `mail.chenggang.wang:587` (STARTTLS) |
| IMAP 服务器 | `mail.chenggang.wang:993` (SSL) |

---

## 📡 客户端配置

### 发送 (SMTP)
```
服务器：mail.chenggang.wang
端口：587
加密：STARTTLS
认证：用户名/密码
用户名：smtpuser@chenggang.wang
密码：SecurePass123!
```

### 接收 (IMAP)
```
服务器：mail.chenggang.wang
端口：993
加密：SSL/TLS
认证：用户名/密码
用户名：smtpuser@chenggang.wang
密码：SecurePass123!
```

---

## ⚠️ 必须配置 DNS 记录

请在域名管理后台添加以下记录（详见 `DNS-RECORDS.md`）：

| 类型 | 主机 | 值 |
|------|------|-----|
| A | mail | 10.3.0.3 |
| MX | @ | mail.chenggang.wang (优先级 10) |
| TXT (SPF) | @ | `v=spf1 mx ip4:10.3.0.3 ~all` |
| TXT (DKIM) | mail._domainkey | (见 DNS-RECORDS.md) |
| TXT (DMARC) | _dmarc | `v=DMARC1; p=none; rua=mailto:admin@chenggang.wang` |

---

## 🔐 SSL 证书升级

当前使用自签名证书。DNS 配置完成后，运行以下命令升级到 Let's Encrypt 正式证书：

```bash
cd ~/workspace
./ssl-upgrade.sh
```

---

## 📂 配置文件位置

| 文件 | 路径 |
|------|------|
| Postfix 主配置 | `/etc/postfix/main.cf` |
| Dovecot 主配置 | `/etc/dovecot/dovecot.conf` |
| Dovecot SSL 配置 | `/etc/dovecot/conf.d/10-ssl.conf` |
| OpenDKIM 配置 | `/etc/opendkim.conf` |
| DKIM 密钥 | `/etc/opendkim/keys/chenggang.wang/` |

---

## 📋 文档

- DNS 配置指南：`~/workspace/DNS-RECORDS.md`
- SSL 升级脚本：`~/workspace/ssl-upgrade.sh`
- 生产环境指南：`~/workspace/SMTP-PROD-README.md`

---

## 🧪 测试命令

```bash
# 测试 SMTP 连接
openssl s_client -connect mail.chenggang.wang:587 -starttls smtp

# 测试 IMAP 连接
openssl s_client -connect mail.chenggang.wang:993

# 发送测试邮件
echo "测试内容" | mail -s "测试主题" recipient@example.com

# 查看邮件日志
sudo tail -f /var/log/mail.log
```

---

## 🚀 服务管理

```bash
# 重启所有服务
sudo systemctl restart postfix dovecot opendkim

# 查看状态
sudo systemctl status postfix dovecot opendkim

# 查看日志
sudo journalctl -u postfix -f
sudo journalctl -u dovecot -f
sudo journalctl -u opendkim -f
```

---

## 📊 端口列表

| 端口 | 服务 | 说明 |
|------|------|------|
| 25 | SMTP | 标准邮件传输 |
| 587 | SMTP | 邮件提交 (推荐) |
| 465 | SMTPS | SMTP over SSL (可选) |
| 143 | IMAP | 标准 IMAP |
| 993 | IMAPS | IMAP over SSL (推荐) |
| 8891 | OpenDKIM | 内部 milter (仅本地) |

---

## ⚡ 快速添加用户

```bash
# 创建新用户
sudo useradd -m -s /usr/sbin/nologin 用户名
echo "用户名：密码" | sudo chpasswd

# 用户邮箱：用户名@chenggang.wang
```

---

部署完成！🎉
