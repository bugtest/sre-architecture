# 民事起诉状自动填写工具 - 专业版

基于 OCR 技术自动识别 PDF 证据文件，填写民事起诉状 Word 模板。

**特点：**
- 🖥️ 支持本地 OCR（Tesseract）
- ☁️ 支持腾讯云 OCR（高精度）
- 🔄 支持混合模式（本地 + 腾讯云）
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

### 模式一：本地 OCR（免费、离线）

```bash
python src/lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx
```

### 模式二：腾讯云 OCR（高精度）

```bash
python src/lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx \
    --ocr-mode tencent \
    --tencent-secret-id YOUR_SECRET_ID \
    --tencent-secret-key YOUR_SECRET_KEY
```

### 模式三：混合模式（推荐⭐）

结合本地 OCR 和腾讯云 OCR 的优势，自动选择最佳识别结果。

```bash
python src/lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx \
    --ocr-mode hybrid \
    --tencent-secret-id YOUR_SECRET_ID \
    --tencent-secret-key YOUR_SECRET_KEY
```

---

## 📋 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-p, --pdf` | 证据 PDF 文件路径（必填） | - |
| `-t, --template` | Word 模板文件路径（必填） | - |
| `-o, --output` | 输出文件路径（必填） | - |
| `--ocr-mode` | OCR 模式：`local` / `tencent` / `hybrid` | `local` |
| `--tencent-secret-id` | 腾讯云 Secret ID | 环境变量 |
| `--tencent-secret-key` | 腾讯云 Secret Key | 环境变量 |
| `--tencent-region` | 腾讯云区域 | `ap-guangzhou` |
| `--lang` | 本地 OCR 语言 | `chi_sim+eng` |
| `--dpi` | 本地 OCR 识别精度 | `200` |
| `--max-pages` | 最大识别页数 | `20` |

---

## 📖 使用示例

### 示例 1：本地 OCR（日常使用）

```bash
cd /path/to/lawsuit-auto-fill

python src/lawsuit_filler.py \
    -p /path/to/evidence.pdf \
    -t /path/to/template.docx \
    -o /path/to/output.docx
```

### 示例 2：腾讯云 OCR（重要案件）

```bash
python src/lawsuit_filler.py \
    -p evidence.pdf \
    -t template.docx \
    -o output.docx \
    --ocr-mode tencent \
    --tencent-secret-id AKIDWu53... \
    --tencent-secret-key abc123...
```

### 示例 3：混合模式（最佳效果⭐）

```bash
python src/lawsuit_filler.py \
    -p evidence.pdf \
    -t template.docx \
    -o output.docx \
    --ocr-mode hybrid \
    --tencent-secret-id AKIDWu53... \
    --tencent-secret-key abc123...
```

### 示例 4：使用环境变量

```bash
export TENCENT_SECRET_ID=your_secret_id
export TENCENT_SECRET_KEY=your_secret_key

python src/lawsuit_filler.py \
    -p evidence.pdf \
    -t template.docx \
    -o output.docx \
    --ocr-mode hybrid
```

---

## 🔧 腾讯云 OCR 配置

### 1. 开通服务

1. 访问 [腾讯云 OCR](https://console.cloud.tencent.com/ocr)
2. 开通"通用文字识别 OCR"服务
3. 获取 SecretId 和 Secret Key

### 2. 查看密钥

访问：https://console.cloud.tencent.com/cam/capi

### 3. 价格参考

- 免费额度：每月 1000 次
- 超出后：约 0.003 元/次

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

## 🔍 对比：三种 OCR 模式

| 特性 | 本地 OCR | 腾讯云 OCR | 混合模式 |
|------|---------|-----------|---------|
| **精度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **速度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **成本** | 免费 | 付费（有免费额度） | 付费（有免费额度） |
| **隐私** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **安装** | 需要系统依赖 | 无需安装 | 需要系统依赖 |
| **离线** | ✅ 支持 | ❌ 需网络 | ❌ 需网络 |
| **推荐场景** | 日常使用 | 重要案件 | 最佳效果 |

**混合模式优势：**
- 🎯 自动结合两种 OCR 的优势
- 📊 智能选择每个字段的最准确识别结果
- ✅ 合同编号、姓名优先本地 OCR
- 📞 联系电话优先腾讯云 OCR
- 📝 填写位置更多（29+ 处）

**推荐场景：**
- 日常使用 → 本地 OCR
- 重要案件/模糊扫描件 → 腾讯云 OCR
- 最佳效果/不差钱 → 混合模式 ⭐

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

### 腾讯云认证失败

```bash
# 检查密钥配置
echo $TENCENT_SECRET_ID
echo $TENCENT_SECRET_KEY

# 测试网络连接
curl https://ocr.tencentcloudapi.com
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
