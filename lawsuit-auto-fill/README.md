# 民事起诉状自动填写工具 - 专业版

基于 OCR 技术自动识别 PDF 证据文件，填写民事起诉状 Word 模板。

**特点：**
- 🖥️ 支持本地 OCR（Tesseract）
- ☁️ 支持阿里云 OCR（高精度）
- 🔒 数据隐私安全
- ⚡ 自动化处理，2 分钟完成

---

## 📦 安装

### 1. 克隆项目

```bash
git clone git@github.com:bugtest/sre-architecture.git
cd sre-architecture/lawsuit-auto-fill
```

### 2. 安装依赖

```bash
pip install -r requirements.txt --break-system-packages
```

### 3. 系统依赖（仅本地 OCR 需要）

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim poppler-utils
```

**macOS:**
```bash
brew install tesseract poppler
```

**Windows:**
- 下载 Tesseract: https://github.com/tesseract-ocr/tesseract/releases
- 下载 Poppler: https://github.com/oschwartz10612/poppler-windows/releases

---

## 🚀 快速开始

### 使用本地 OCR（免费）

```bash
python src/lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx
```

### 使用阿里云 OCR（高精度）

```bash
python src/lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx \
    --ocr-mode aliyun \
    --aliyun-key-id YOUR_KEY_ID \
    --aliyun-key-secret YOUR_KEY_SECRET
```

### 使用环境变量配置阿里云

```bash
export ALIYUN_ACCESS_KEY_ID=your_key_id
export ALIYUN_ACCESS_KEY_SECRET=your_key_secret

python src/lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx \
    --ocr-mode aliyun
```

---

## 📋 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-p, --pdf` | 证据 PDF 文件路径（必填） | - |
| `-t, --template` | Word 模板文件路径（必填） | - |
| `-o, --output` | 输出文件路径（必填） | - |
| `--ocr-mode` | OCR 模式：`local` 或 `aliyun` | `local` |
| `--aliyun-key-id` | 阿里云 Access Key ID | 环境变量 |
| `--aliyun-key-secret` | 阿里云 Access Key Secret | 环境变量 |
| `--aliyun-endpoint` | 阿里云 OCR 端点 | `ocr.cn-shanghai.aliyuncs.com` |
| `--lang` | 本地 OCR 语言 | `chi_sim+eng` |
| `--dpi` | 本地 OCR 识别精度 | `200` |
| `--max-pages` | 最大识别页数 | `20` |

---

## 📖 使用示例

### 示例 1：基本使用（本地 OCR）

```bash
cd /path/to/lawsuit-auto-fill

python src/lawsuit_filler.py \
    -p /path/to/evidence.pdf \
    -t /path/to/template.docx \
    -o /path/to/output.docx
```

### 示例 2：使用阿里云 OCR

```bash
python src/lawsuit_filler.py \
    -p evidence.pdf \
    -t template.docx \
    -o output.docx \
    --ocr-mode aliyun \
    --aliyun-key-id LTAI5t... \
    --aliyun-key-secret abc123...
```

### 示例 3：高精度识别

```bash
python src/lawsuit_filler.py \
    -p evidence.pdf \
    -t template.docx \
    -o output.docx \
    --ocr-mode aliyun \
    --dpi 300 \
    --max-pages 30
```

---

## 🔧 阿里云 OCR 配置

### 1. 开通服务

1. 访问 [阿里云 OCR](https://www.aliyun.com/product/ocr)
2. 开通"通用文字识别"服务
3. 获取 AccessKey ID 和 AccessKey Secret

### 2. 查看密钥

访问：https://ram.console.aliyun.com/manage/ak

### 3. 价格参考

- 免费额度：每月 500 次
- 超出后：约 0.0035 元/次

---

## 📊 提取的信息

工具会自动从 PDF 中提取以下信息：

| 字段 | 说明 |
|------|------|
| 合同编号 | 借款合同编号 |
| 原告名称 | 贷款人（银行）名称 |
| 被告姓名 | 借款人姓名 |
| 被告证件号码 | 身份证号 |
| 被告联系电话 | 手机号码 |
| 借款金额 | 贷款金额（元） |
| 借款期限 | 贷款期限（月） |
| 合同签订日期 | 合同签署日期 |
| 提款日期 | 贷款发放日期 |
| 到期日期 | 贷款到期日期 |
| 利率 | 贷款利率（LPR+ 基点） |
| 还款方式 | 等额本息/按月付息等 |

---

## 📁 项目结构

```
lawsuit-auto-fill/
├── src/
│   └── lawsuit_filler.py    # 主程序
├── tests/
│   └── test_filler.py       # 测试文件
├── config/
│   └── config.yaml          # 配置文件（可选）
├── requirements.txt          # 依赖列表
├── README.md                 # 使用说明
└── LICENSE                   # 许可证
```

---

## 🔍 对比：本地 OCR vs 阿里云 OCR

| 特性 | 本地 OCR | 阿里云 OCR |
|------|---------|-----------|
| **精度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **速度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **成本** | 免费 | 付费（有免费额度） |
| **隐私** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **安装** | 需要系统依赖 | 无需安装 |
| **离线** | ✅ 支持 | ❌ 需网络 |

**推荐场景：**
- 日常使用 → 本地 OCR
- 重要案件/模糊扫描件 → 阿里云 OCR

---

## ⚠️ 注意事项

1. **PDF 质量**：扫描件需清晰，模糊会影响识别率
2. **信息核对**：自动填写后请人工核对关键信息
3. **补充内容**：部分信息（如详细地址）可能需手动补充
4. **模板格式**：使用标准的民事起诉状 Word 模板

---

## 🐛 故障排除

### OCR 识别失败

```bash
# 检查 Tesseract
tesseract --version

# 检查中文语言包
tesseract --list-langs

# 检查 Poppler
pdfinfo -v
```

### 缺少依赖

```bash
pip install -r requirements.txt --break-system-packages
```

### 阿里云认证失败

```bash
# 检查密钥配置
echo $ALIYUN_ACCESS_KEY_ID
echo $ALIYUN_ACCESS_KEY_SECRET

# 测试网络连接
curl https://ocr.cn-shanghai.aliyuncs.com
```

---

## 📝 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系

如有问题，请提交 Issue 或联系作者。
