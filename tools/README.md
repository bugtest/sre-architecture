# 民事起诉状自动填写工具

根据证据 PDF 和 Word 模板，自动填写民事起诉状。

## 安装依赖

```bash
pip install python-docx pytesseract pillow pdf2image --break-system-packages
```

还需要安装系统级 OCR 引擎：

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim poppler-utils

# macOS
brew install tesseract poppler

# Windows
# 下载 https://github.com/tesseract-ocr/tesseract/releases
```

## 用法

### 基本用法

```bash
python lawsuit_filler.py -p 证据.pdf -t 模板.docx -o 输出.docx
```

### 完整参数

```bash
python lawsuit_filler.py \
    --pdf 证据.pdf \
    --template 模板.docx \
    --output 输出.docx \
    --lang chi_sim+eng \
    --dpi 200 \
    --max-pages 20
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-p, --pdf` | 证据 PDF 文件路径（必填） | - |
| `-t, --template` | Word 模板文件路径（必填） | - |
| `-o, --output` | 输出文件路径（必填） | - |
| `--lang` | OCR 识别语言 | `chi_sim+eng` |
| `--dpi` | OCR 识别 DPI | `200` |
| `--max-pages` | 最大识别页数 | `20` |

## 示例

### 示例 1：基本使用

```bash
cd /home/ubuntu/.openclaw/workspace-main/tools

python lawsuit_filler.py \
    -p /path/to/证据.pdf \
    -t /path/to/模板.docx \
    -o /path/to/民事起诉状_填写完成.docx
```

### 示例 2：高分辨率识别

```bash
python lawsuit_filler.py \
    -p 证据.pdf \
    -t 模板.docx \
    -o 输出.docx \
    --dpi 300 \
    --max-pages 30
```

## 提取的信息

工具会自动从 PDF 中提取以下信息：

- 合同编号
- 原告名称（贷款人）
- 被告姓名（借款人）
- 被告身份证号
- 被告联系电话
- 借款金额
- 借款期限
- 合同签订日期
- 提款日期
- 到期日期
- 利率
- 还款方式
- 开户行
- 账号

## 输出

填写完成的 Word 文档包含：

1. ✅ 当事人信息（原告/被告）
2. ✅ 诉讼请求（本金、利息、罚息等）
3. ✅ 事实与理由（合同信息、借款详情、逾期情况）
4. ✅ 勾选相应选项

## 注意事项

1. **PDF 质量**：扫描件需要清晰，模糊的 PDF 可能影响 OCR 识别准确率
2. **模板格式**：使用标准的民事起诉状 Word 模板
3. **信息核对**：自动填写后请人工核对关键信息
4. **补充内容**：部分信息（如详细地址、具体利息金额）可能需要手动补充

## 故障排除

### OCR 识别失败

```bash
# 检查 tesseract 是否安装
tesseract --version

# 检查中文语言包
tesseract --list-langs
```

### 缺少 Python 依赖

```bash
pip install python-docx pytesseract pillow pdf2image --break-system-packages
```

### PDF 转换失败

```bash
# 检查 poppler 是否安装
pdfinfo -v

# Ubuntu/Debian 安装
sudo apt-get install poppler-utils
```

## 技术栈

- **OCR**: pytesseract (Tesseract OCR)
- **PDF 处理**: pdf2image, PyPDF2
- **Word 处理**: python-docx
- **语言**: Python 3.8+
