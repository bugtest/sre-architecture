# 配置 SMTP 中继 - 解决 25 端口被封问题

## 问题原因
云服务器（腾讯云/阿里云等）通常封锁 25 端口出站连接，防止垃圾邮件。

## 解决方案

### 方案 A：使用阿里云邮件推送（推荐国内）

1. 登录阿里云控制台 → 邮件推送 DirectMail
2. 创建发信地址 me@chenggang.wang
3. 获取 SMTP 信息：
   ```
   服务器：smtpdm.aliyun.com
   端口：465 (SSL)
   用户名：me@chenggang.wang
   密码：(阿里云生成的授权码)
   ```

4. 配置 Postfix 中继：
   ```bash
   sudo postconf -e "relayhost = [smtpdm.aliyun.com]:465"
   sudo postconf -e "smtp_sasl_auth_enable = yes"
   sudo postconf -e "smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd"
   sudo postconf -e "smtp_sasl_security_options = noanonymous"
   sudo postconf -e "smtp_tls_security_level = encrypt"
   ```

5. 创建认证文件：
   ```bash
   echo "[smtpdm.aliyun.com]:465 me@chenggang.wang:你的授权码" | sudo tee /etc/postfix/sasl_passwd
   sudo postmap /etc/postfix/sasl_passwd
   sudo chmod 600 /etc/postfix/sasl_passwd
   sudo systemctl restart postfix
   ```

### 方案 B：使用腾讯云邮件推送

```bash
# 腾讯云服务器可用
sudo postconf -e "relayhost = [smtp.exmail.qq.com]:465"
# 其他配置同上
```

### 方案 C：使用 SendGrid（国际）

```bash
sudo postconf -e "relayhost = [smtp.sendgrid.net]:587"
echo "[smtp.sendgrid.net]:587 apikey:你的 SendGrid API 密钥" | sudo tee /etc/postfix/sasl_passwd
```

### 方案 D：使用 587 端口提交（如果可用）

有些云服务商允许 587 端口：
```bash
# 测试 587 端口是否可用
telnet smtp.163.com 587
```

---

## 测试中继配置

```bash
# 发送测试邮件
echo "测试中继" | mail -s "中继测试" recipient@example.com

# 查看日志
sudo tail -f /var/log/mail.log | grep relay
```

---

## 临时方案：本地测试

如果只是内部测试，可以让邮件只投递到本地：
```bash
# 发送给本地用户
echo "测试" | mail -s "本地测试" me@chenggang.wang
```
