# SMTP 服务器部署完成 ✅

## 服务信息

| 项目 | 值 |
|------|-----|
| 服务器地址 | VM-0-3-ubuntu (或本机 IP) |
| SMTP 端口 | 25 (标准), 587 (提交) |
| IMAP 端口 | 143 |
| 认证方式 | SASL (用户名/密码) |
| 认证后端 | Dovecot |

## 测试账户

- **用户名**: `smtpuser`
- **密码**: `SecurePass123!`

## 验证配置

```bash
# 查看 Postfix SASL 配置
sudo postconf | grep smtpd_sasl

# 查看服务状态
sudo systemctl status postfix dovecot

# 查看监听端口
sudo netstat -tlnp | grep -E '(25|587|143)'
```

## 使用示例

### Python 发送测试邮件

```python
import smtplib
from email.mime.text import MIMEText

msg = MIMEText('这是一封测试邮件')
msg['Subject'] = 'SMTP 测试'
msg['From'] = 'smtpuser@localhost'
msg['To'] = 'recipient@example.com'

# 连接并发送
server = smtplib.SMTP('localhost', 25)
server.login('smtpuser', 'SecurePass123!')
server.send_message(msg)
server.quit()

print('发送成功!')
```

### 命令行测试

```bash
# 使用 telnet 手动测试
telnet localhost 25
EHLO test
AUTH LOGIN
# 输入 base64 编码的用户名和密码
```

### 使用 curl 发送

```bash
curl smtp://localhost:25 \
  --mail-from smtpuser@localhost \
  --mail-rcv recipient@example.com \
  --user smtpuser:SecurePass123! \
  -T <(echo -e "Subject: Test\n\nTest body")
```

## 添加新用户

```bash
# 创建系统用户（用于 SMTP 认证）
sudo useradd -m -s /usr/sbin/nologin newuser
echo "newuser:Password123!" | sudo chpasswd
```

## 配置文件位置

- Postfix 主配置：`/etc/postfix/main.cf`
- Dovecot 主配置：`/etc/dovecot/dovecot.conf`
- Dovecot 认证配置：`/etc/dovecot/conf.d/10-auth.conf`
- Dovecot Master 配置：`/etc/dovecot/conf.d/10-master.conf`

## 防火墙

已开放端口：
- 25/tcp (SMTP)
- 587/tcp (SMTP Submission)
- 143/tcp (IMAP)

## 注意事项

⚠️ **重要提醒**:
1. 当前为基本配置，生产环境建议启用 SSL/TLS
2. 没有域名的情况下，外网邮件可能被标记为垃圾邮件
3. 建议配置 SPF、DKIM、DMARC 记录提高送达率
4. 测试完成后建议修改默认密码

## 重启服务

```bash
sudo systemctl restart postfix dovecot
```
