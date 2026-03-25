# DNS 记录配置指南 - chenggang.wang

## ⚠️ 必须在域名管理后台添加以下记录

登录你的域名管理平台（如阿里云、腾讯云、Cloudflare 等），添加以下 DNS 记录：

---

## 1. A 记录 - 邮件服务器地址

| 字段 | 值 |
|------|-----|
| 主机记录 | `mail` |
| 记录类型 | `A` |
| 记录值 | `10.3.0.3` (或你的公网 IP) |
| TTL | `600` |

---

## 2. MX 记录 - 邮件交换记录

| 字段 | 值 |
|------|-----|
| 主机记录 | `@` |
| 记录类型 | `MX` |
| 记录值 | `mail.chenggang.wang` |
| 优先级 | `10` |
| TTL | `600` |

---

## 3. SPF 记录 - 防止伪造发件人

| 字段 | 值 |
|------|-----|
| 主机记录 | `@` |
| 记录类型 | `TXT` |
| 记录值 | `v=spf1 mx ip4:10.3.0.3 ~all` |
| TTL | `600` |

**说明：**
- `mx` - 允许 MX 记录中的服务器发送
- `ip4:10.3.0.3` - 允许此 IP 发送
- `~all` - 其他服务器标记为软失败（可改为 `-all` 硬失败）

---

## 4. DKIM 记录 - 邮件签名验证

| 字段 | 值 |
|------|-----|
| 主机记录 | `mail._domainkey` |
| 记录类型 | `TXT` |
| 记录值 | `v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2Uoqck4Bu5DX9S2WfMQwIQFrxlhy86Rx0dZXuzz5GTo90L3GiPRwHljA7LX0j6FsGIC+urmlYgwtf/FlC6QK2R0Mxf/VMdpdmfhGY7QgVboyupj2oAe5UTR3w1iI50VGAWse3BC44nIFUv8dVYVIlGyyxz/VLkyvX7rq11XNIoFMPEbI5Yy+Q3pHp0jAK95BKvGOIJlK+b4V5HXEdrm7e12U7iGNtw3q60NLIi7GY3BejT/m81stpxMNxm2hMLazGwzbJbS7I711p6cefAyaIaqSUB1WPJm7nisYVm5F6S/ugpHqV07GTWYxkLfqdNxD77K+eUKTkqhtNFhFsV+CywIDAQAB` |
| TTL | `600` |

**注意：** 如果平台有长度限制，可能需要分段填写：
```
v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2Uoqck4Bu5DX9S2WfMQwIQFrxlhy86Rx0dZXuzz5GTo90L3GiPRwHljA7LX0j6FsGIC+urmlYgwtf/FlC6QK2R0Mxf/VMdpdmfhGY7QgVboyupj2oAe5UTR3w1iI50VGAWse3BC44nIFUv8dVYVIlGyyxz/VLkyvX7rq11XNIoFMPEbI5Yy+Q3pHp0jAK95BKvGOIJlK+b4V5H
XEdrm7e12U7iGNtw3q60NLIi7GY3BejT/m81stpxMNxm2hMLazGwzbJbS7I711p6cefAyaIaqSUB1WPJm7nisYVm5F6S/ugpHqV07GTWYxkLfqdNxD77K+eUKTkqhtNFhFsV+CywIDAQAB
```

---

## 5. DMARC 记录 - 邮件认证策略

| 字段 | 值 |
|------|-----|
| 主机记录 | `_dmarc` |
| 记录类型 | `TXT` |
| 记录值 | `v=DMARC1; p=none; rua=mailto:admin@chenggang.wang; ruf=mailto:admin@chenggang.wang; fo=1` |
| TTL | `600` |

**说明：**
- `p=none` - 监控模式（不拒绝邮件，只收集报告）
- 可改为 `p=quarantine` (隔离) 或 `p=reject` (拒绝)
- `rua` - 聚合报告发送地址
- `ruf` - 失败报告发送地址

---

## 6. PTR 记录 - 反向 DNS（需要联系 ISP 设置）

联系你的服务器提供商（腾讯云/阿里云等），请求设置 PTR 记录：

```
IP: 10.3.0.3 (或公网 IP)
PTR: mail.chenggang.wang
```

---

## 验证 DNS 记录

添加完成后，使用以下命令验证：

```bash
# 验证 A 记录
dig mail.chenggang.wang A

# 验证 MX 记录
dig chenggang.wang MX

# 验证 SPF
dig chenggang.wang TXT

# 验证 DKIM
dig mail._domainkey.chenggang.wang TXT

# 验证 DMARC
dig _dmarc.chenggang.wang TXT
```

---

## 验证邮件配置

```bash
# 测试 DKIM 签名
echo "Test email" | mail -s "DKIM Test" test@chenggang.wang

# 查看邮件头，确认 DKIM-Signature 存在
mail -H test@chenggang.wang
```

---

## 各平台配置示例

### 阿里云万网
1. 登录阿里云控制台
2. 进入域名管理 → 解析设置
3. 点击"添加记录"
4. 按上述表格填写

### 腾讯云 DNSPod
1. 登录 DNSPod 控制台
2. 选择域名
3. 点击"添加记录"
4. 按上述表格填写

### Cloudflare
1. 登录 Cloudflare 控制台
2. 选择域名 → DNS
3. 点击"Add record"
4. 按上述表格填写

---

## 生效时间

DNS 记录通常在 5-60 分钟内生效，全球传播可能需要 24-48 小时。

---

## 下一步

DNS 配置完成后，运行以下命令升级到 Let's Encrypt 正式证书：

```bash
# 申请证书
sudo certbot certonly --standalone -d mail.chenggang.wang

# 更新 Postfix 证书路径
sudo postconf -e "smtpd_tls_cert_file = /etc/letsencrypt/live/mail.chenggang.wang/fullchain.pem"
sudo postconf -e "smtpd_tls_key_file = /etc/letsencrypt/live/mail.chenggang.wang/privkey.pem"

# 更新 Dovecot 证书路径
sudo sed -i 's|ssl_cert = .*|ssl_cert = </etc/letsencrypt/live/mail.chenggang.wang/fullchain.pem|' /etc/dovecot/conf.d/10-ssl.conf
sudo sed -i 's|ssl_key = .*|ssl_key = </etc/letsencrypt/live/mail.chenggang.wang/privkey.pem|' /etc/dovecot/conf.d/10-ssl.conf

# 重启服务
sudo systemctl restart postfix dovecot
```
