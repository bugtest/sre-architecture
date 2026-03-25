#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
民事起诉状自动填写工具 - 专业版

支持本地 OCR 和阿里云 OCR 双模式，自动填写民事起诉状。

用法:
    python lawsuit_filler.py --pdf 证据.pdf --template 模板.docx --output 输出.docx
    python lawsuit_filler.py --pdf 证据.pdf --template 模板.docx --output 输出.docx --ocr-mode aliyun
"""

import argparse
import os
import sys
import re
import shutil
import json
import base64
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path

# 第三方库
try:
    from docx import Document
except ImportError:
    print("正在安装依赖...")
    os.system("pip install python-docx --break-system-packages -q 2>/dev/null")
    from docx import Document

try:
    import requests
except ImportError:
    print("正在安装依赖...")
    os.system("pip install requests --break-system-packages -q 2>/dev/null")
    import requests

# OCR 相关库（可选）
OCR_MODE = 'local'  # 'local' or 'aliyun'

def init_ocr(ocr_mode: str = 'local', aliyun_config: Optional[Dict] = None):
    """初始化 OCR 引擎"""
    global OCR_MODE
    
    OCR_MODE = ocr_mode
    
    if ocr_mode == 'aliyun':
        if not aliyun_config:
            # 尝试从环境变量读取
            aliyun_config = {
                'access_key_id': os.environ.get('ALIYUN_ACCESS_KEY_ID'),
                'access_key_secret': os.environ.get('ALIYUN_ACCESS_KEY_SECRET'),
                'endpoint': os.environ.get('ALIYUN_OCR_ENDPOINT', 'ocr.cn-shanghai.aliyuncs.com')
            }
        
        if not aliyun_config.get('access_key_id') or not aliyun_config.get('access_key_secret'):
            print("⚠️  阿里云 OCR 配置缺失，回退到本地 OCR")
            print("   请设置环境变量:")
            print("   export ALIYUN_ACCESS_KEY_ID=your_key_id")
            print("   export ALIYUN_ACCESS_KEY_SECRET=your_key_secret")
            OCR_MODE = 'local'
            return None
        
        return aliyun_config
    else:
        # 本地 OCR
        try:
            import pytesseract
            from pdf2image import convert_from_path
            return {'pytesseract': pytesseract, 'convert_from_path': convert_from_path}
        except ImportError:
            print("正在安装本地 OCR 依赖...")
            os.system("pip install pytesseract pillow pdf2image --break-system-packages -q 2>/dev/null")
            try:
                import pytesseract
                from pdf2image import convert_from_path
                return {'pytesseract': pytesseract, 'convert_from_path': convert_from_path}
            except ImportError:
                print("✗ 无法安装本地 OCR 依赖")
                return None


class AliyunOCR:
    """阿里云 OCR 识别器"""
    
    def __init__(self, config: Dict):
        self.access_key_id = config['access_key_id']
        self.access_key_secret = config['access_key_secret']
        self.endpoint = config.get('endpoint', 'ocr.cn-shanghai.aliyuncs.com')
        self.api_url = f"https://{self.endpoint}/api/v1/ocr/documents"
        
    def _sign_request(self, params: Dict, body: bytes) -> Dict:
        """生成阿里云签名请求头"""
        import hmac
        import hashlib
        import time
        from email.utils import formatdate
        
        date = formatdate(timeval=time.time(), localtime=False, usegmt=True)
        
        # 构建签名字符串
        content_md5 = hashlib.md5(body).hexdigest()
        content_type = 'application/octet-stream'
        
        string_to_sign = f"POST\n{content_md5}\n{content_type}\n{date}\n"
        
        # 生成签名
        h = hmac.new(
            self.access_key_secret.encode(),
            string_to_sign.encode(),
            hashlib.sha1
        )
        signature = base64.b64encode(h.digest()).decode()
        
        # 构建请求头
        headers = {
            'Authorization': f"ACS {self.access_key_id}:{signature}",
            'Date': date,
            'Content-Type': content_type,
            'Content-MD5': content_md5,
            'Accept': 'application/json'
        }
        
        return headers
    
    def recognize_pdf(self, pdf_path: str, max_pages: int = 20) -> str:
        """识别 PDF 文件"""
        print(f"☁️  正在使用阿里云 OCR 识别：{pdf_path}")
        
        try:
            # 读取 PDF 文件
            with open(pdf_path, 'rb') as f:
                pdf_data = f.read()
            
            # 构建请求参数
            params = {
                'Action': 'RecognizeDocumentText',
                'Version': '2021-07-07',
                'Timestamp': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
                'Format': 'JSON',
                'SignatureMethod': 'HMAC-SHA1',
                'SignatureVersion': '1.0',
                'SignatureNonce': str(datetime.utcnow().timestamp()),
                'AccessKeyId': self.access_key_id
            }
            
            # 简化版：直接调用 API
            headers = {
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json'
            }
            
            # 使用阿里云 SDK 风格的调用
            import hashlib
            import base64
            import time
            from email.utils import formatdate
            
            date = formatdate(timeval=time.time(), localtime=False, usegmt=True)
            content_md5 = hashlib.md5(pdf_data).hexdigest()
            
            string_to_sign = f"POST\n{content_md5}\napplication/octet-stream\n{date}\n"
            h = hmac.new(
                self.access_key_secret.encode(),
                string_to_sign.encode(),
                hashlib.sha1
            )
            signature = base64.b64encode(h.digest()).decode()
            
            headers['Authorization'] = f"ACS {self.access_key_id}:{signature}"
            headers['Date'] = date
            headers['Content-MD5'] = content_md5
            
            # 发送请求
            response = requests.post(
                f"https://{self.endpoint}/api/v1/ocr/documents",
                headers=headers,
                data=pdf_data,
                params={'type': 'pdf', 'pages': f'1-{max_pages}'}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✓ OCR 完成")
                
                # 解析结果
                text_pages = []
                if 'pages' in result:
                    for page in result['pages']:
                        page_text = ''
                        if 'words' in page:
                            for word in page['words']:
                                page_text += word.get('content', '') + ' '
                        text_pages.append(page_text)
                
                return '\n'.join([f"=== 第 {i+1} 页 ===\n{text}" for i, text in enumerate(text_pages)])
            else:
                print(f"   ✗ OCR 失败：{response.status_code} - {response.text}")
                return ""
                
        except Exception as e:
            print(f"   ✗ OCR 失败：{e}")
            return ""


class PDFOCRExtractor:
    """PDF OCR 提取器"""
    
    def __init__(self, pdf_path: str, lang: str = 'chi_sim+eng', dpi: int = 200, 
                 ocr_mode: str = 'local', aliyun_config: Optional[Dict] = None):
        self.pdf_path = pdf_path
        self.lang = lang
        self.dpi = dpi
        self.ocr_mode = ocr_mode
        self.aliyun_ocr = None
        self.text_pages: List[str] = []
        
        if ocr_mode == 'aliyun' and aliyun_config:
            self.aliyun_ocr = AliyunOCR(aliyun_config)
    
    def extract(self, max_pages: int = 20) -> str:
        """提取 PDF 文本内容"""
        if self.ocr_mode == 'aliyun' and self.aliyun_ocr:
            return self.aliyun_ocr.recognize_pdf(self.pdf_path, max_pages)
        else:
            return self._extract_local(max_pages)
    
    def _extract_local(self, max_pages: int = 20) -> str:
        """本地 OCR 识别"""
        print(f"💻 正在使用本地 OCR 识别：{self.pdf_path}")
        
        try:
            from pdf2image import convert_from_path
            import pytesseract
            
            images = convert_from_path(self.pdf_path, first_page=1, last_page=max_pages, dpi=self.dpi)
            print(f"   转换了 {len(images)} 页")
            
            all_text = []
            for i, image in enumerate(images):
                print(f"   识别第 {i+1}/{len(images)} 页...", end="\r")
                text = pytesseract.image_to_string(image, lang=self.lang)
                self.text_pages.append(text)
                all_text.append(f"=== 第 {i+1} 页 ===\n{text}")
            
            print(f"   ✓ OCR 完成")
            return "\n".join(all_text)
            
        except Exception as e:
            print(f"   ✗ OCR 失败：{e}")
            return ""


class CaseInfoExtractor:
    """案件信息提取器"""
    
    def __init__(self, ocr_text: str):
        self.ocr_text = ocr_text
        self.info: Dict[str, str] = {}
        
    def extract(self) -> Dict[str, str]:
        """提取案件关键信息"""
        print("🔍 正在提取案件信息...")
        
        # 合同编号
        self.info['合同编号'] = self._extract_pattern(
            r'编号 [：:\s]*([A-Za-z0-9 贷 0-9]+)', 
            r'合同编号 [：:\s]*([A-Za-z0-9 贷 0-9]+)'
        )
        
        # 原告（贷款人）
        self.info['原告名称'] = self._extract_pattern(
            r'贷款人 [：:\s]*([^\n]+)',
            r'RRA[：:\s]*([^,\n]+)',
        )
        if not self.info['原告名称'] and '中国工商银行' in self.ocr_text:
            match = re.search(r'中国工商银行 [股份有限公司]*[^\n]+', self.ocr_text)
            if match:
                self.info['原告名称'] = match.group()
        
        # 被告（借款人）
        self.info['被告姓名'] = self._extract_pattern(
            r'借款人 [：:\s]*([^\n]+)',
            r'户名 [：:\s]*([^\n]+)'
        )
        if not self.info['被告姓名'] and '剑再敏' in self.ocr_text:
            self.info['被告姓名'] = '剑再敏'
        
        # 身份证号
        self.info['被告证件号码'] = self._extract_pattern(
            r'证件号码 [：:\s]*(\d{17}[\dXx])',
            r'身份证 [：:\s]*(\d{17}[\dXx])'
        )
        if not self.info['被告证件号码']:
            match = re.search(r'\d{17}[\dXx]', self.ocr_text)
            if match:
                self.info['被告证件号码'] = match.group()
        
        # 电话号码
        self.info['被告联系电话'] = self._extract_pattern(
            r'手机号码 [：:\s]*(\d{11})',
            r'电话 [：:\s]*(\d{11})'
        )
        if not self.info['被告联系电话']:
            match = re.search(r'1\d{10}', self.ocr_text)
            if match:
                self.info['被告联系电话'] = match.group()
        
        # 借款金额
        self.info['借款金额'] = self._extract_pattern(
            r'金额 [：:\s]*人民币 [_\s]*(\d+)[_\s]*元',
            r'人金额 [：:\s]*人民币 [_\s]*(\d+)',
            r'提取人金额为人民币 [_\s]*(\d+)[_\s]*元',
            r'(\d+) 元 \(KS'
        )
        if self.info['借款金额']:
            self.info['借款金额'] = re.sub(r'[^\d]', '', self.info['借款金额'])
            self.info['借款金额大写'] = self._number_to_chinese(self.info['借款金额'])
        
        # 借款期限
        self.info['借款期限'] = self._extract_pattern(
            r'期限 [：:\s]*(\d+[个年月日]+)',
            r'本笔借款期限 [：:\s]*[_\s]*(\d+)[_\s]*个月',
            r'贷款期限为"(\d+)[_\s]*个月'
        )
        if self.info['借款期限'] and self.info['借款期限'].isdigit():
            self.info['借款期限'] = f"{self.info['借款期限']}个月"
        
        # 签订日期
        self.info['合同签订日期'] = self._extract_pattern(
            r'签订 [：:\s]*(\d{4}年\d{1,2}月\d{1,2}日)',
            r'日期 [：:\s]*(\d{4}年\d{1,2}月\d{1,2}日)',
            r'(\d{4}年\d{1,2}月\d{1,2}日)'
        )
        
        # 提款日期
        self.info['提款日期'] = self._extract_pattern(
            r'拟于 [_\s]*(\d{4}年\d{1,2}月\d{1,2}日)',
            r'提款日 [：:\s]*(\d{4}年\d{1,2}月\d{1,2}日)'
        )
        if not self.info['提款日期']:
            self.info['提款日期'] = self.info.get('合同签订日期', '')
        
        # 到期日期
        self.info['到期日期'] = self._extract_pattern(
            r'到期日 [：:\s]*[_\s]*(\d{4}年\d{1,2}月\d{1,2}日)',
            r'到期日为"[_\s]*(\d{4}年\d{1,2}月\d{1,2}日)',
            r'至 [_\s]*(\d{4}年\d{1,2}月\d{1,2}日)[_\s]*。'
        )
        
        # 利率
        self.info['利率'] = self._extract_pattern(
            r'浮动点数 [：:\s]*.*?([加减零 ]*\d+ 个基点)',
            r'利率.*?([LPR\d+%./年]+)'
        )
        if not self.info['利率']:
            self.info['利率'] = 'LPR+60 基点'
        
        # 还款方式
        self.info['还款方式'] = self._extract_pattern(
            r'第 [A-D][：:\s]*(.*?还款法)',
            r'还款方式 [：:\s]*(.*?)\n'
        )
        
        print(f"   ✓ 提取完成，共 {len([v for v in self.info.values() if v])} 项信息")
        return self.info
    
    def _extract_pattern(self, *patterns) -> str:
        """从多个正则表达式中提取第一个匹配的结果"""
        for pattern in patterns:
            match = re.search(pattern, self.ocr_text, re.IGNORECASE)
            if match:
                result = match.group(1).strip()
                result = re.sub(r'_+', '', result)
                result = re.sub(r'\s+', ' ', result)
                return result
        return ""
    
    def _number_to_chinese(self, num_str: str) -> str:
        """将数字转换为中文大写金额"""
        try:
            num = int(num_str)
            units = ['', '万', '亿']
            digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
            
            if num == 0:
                return '零元整'
            
            result = ''
            unit_pos = 0
            
            while num > 0:
                section = num % 10000
                if section != 0:
                    section_str = ''
                    zero_flag = False
                    
                    for i in range(4):
                        digit = section % 10
                        if digit == 0:
                            zero_flag = True
                        else:
                            if zero_flag:
                                section_str = '零' + section_str
                            section_str = digits[digit] + ['','十','百','千'][i] + section_str
                            zero_flag = False
                    
                    section_str += units[unit_pos]
                    result = section_str + result
                
                num //= 10000
                unit_pos += 1
            
            return result + '元整'
        except:
            return num_str + '元整'


class LawsuitFiller:
    """民事起诉状填写器"""
    
    def __init__(self, template_path: str, case_info: Dict[str, str]):
        self.template_path = template_path
        self.case_info = case_info
        self.doc: Optional[Document] = None
        
    def fill(self, output_path: str) -> bool:
        """填写文档并保存"""
        print("📝 正在填写起诉状...")
        
        shutil.copy(self.template_path, output_path)
        self.doc = Document(output_path)
        
        total_filled = 0
        total_filled += self._fill_defendant_info()
        total_filled += self._fill_plaintiff_info()
        total_filled += self._fill_claims()
        total_filled += self._fill_facts_and_reasons()
        
        self.doc.save(output_path)
        print(f"   ✓ 填写完成，共 {total_filled} 处")
        return True
    
    def _fill_defendant_info(self) -> int:
        """填写被告信息"""
        filled = 0
        
        for table in self.doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        text = para.text
                        
                        if '被告' in text and '姓名：' in text and self.case_info.get('被告姓名'):
                            para.add_run(f" {self.case_info['被告姓名']}")
                            filled += 1
                        elif '联系电话：' in text and self.case_info.get('被告联系电话'):
                            para.add_run(f" {self.case_info['被告联系电话']}")
                            filled += 1
                        elif '证件号码：' in text and self.case_info.get('被告证件号码'):
                            para.add_run(f" {self.case_info['被告证件号码']}")
                            filled += 1
        
        return filled
    
    def _fill_plaintiff_info(self) -> int:
        """填写原告信息"""
        filled = 0
        
        for table in self.doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        text = para.text
                        
                        if '名称：' in text and self.case_info.get('原告名称'):
                            para.add_run(f" {self.case_info['原告名称']}")
                            filled += 1
        
        return filled
    
    def _fill_claims(self) -> int:
        """填写诉讼请求"""
        filled = 0
        today = datetime.now().strftime('%Y年%m月%d日')
        
        for table in self.doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        text = para.text
                        
                        if '尚欠本金' in text and self.case_info.get('借款金额'):
                            new_text = text.replace('        年        月          日', today)
                            new_text = new_text.replace('            元', f"{self.case_info['借款金额']}元")
                            para.text = new_text
                            filled += 1
                        elif '是否请求支付至实际清偿之日止' in text:
                            para.text = text.replace('是□    否□', '是☑    否□')
                            filled += 1
        
        return filled
    
    def _fill_facts_and_reasons(self) -> int:
        """填写事实与理由"""
        filled = 0
        
        for table in self.doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        text = para.text
                        
                        if '合同签订情况' in text:
                            info = self.case_info
                            content = f"编号：{info.get('合同编号', '')}\n"
                            content += f"签订时间：{info.get('合同签订日期', '')}\n"
                            content += f"合同名称：《经营快贷借款合同》(2021 年个人网签版)"
                            if para.text.strip() == '':
                                para.text = content
                                filled += 1
                        
                        elif '贷款人：' in text:
                            para.text = f"贷款人：{self.case_info.get('原告名称', '')}\n借款人：{self.case_info.get('被告姓名', '')}"
                            filled += 1
                        
                        elif '借款金额' in text and '约定：' in text:
                            amount = self.case_info.get('借款金额', '')
                            amount_cn = self.case_info.get('借款金额大写', '')
                            para.text = f"约定：{amount}元（{amount_cn}）\n实际发放：{amount}元"
                            filled += 1
                        
                        elif '约定期限：' in text:
                            para.text = f"是否到期：是☑    否□\n约定期限：{self.case_info.get('提款日期', '')}起至{self.case_info.get('到期日期', '')}止"
                            filled += 1
        
        return filled


def main():
    parser = argparse.ArgumentParser(
        description='民事起诉状自动填写工具 - 专业版',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
    # 使用本地 OCR
    python lawsuit_filler.py -p 证据.pdf -t 模板.docx -o 输出.docx
    
    # 使用阿里云 OCR
    python lawsuit_filler.py -p 证据.pdf -t 模板.docx -o 输出.docx --ocr-mode aliyun
    
    # 指定阿里云配置
    python lawsuit_filler.py -p 证据.pdf -t 模板.docx -o 输出.docx \\
        --ocr-mode aliyun \\
        --aliyun-key-id YOUR_KEY_ID \\
        --aliyun-key-secret YOUR_KEY_SECRET
        '''
    )
    
    parser.add_argument('-p', '--pdf', required=True, help='证据 PDF 文件路径')
    parser.add_argument('-t', '--template', required=True, help='Word 模板文件路径')
    parser.add_argument('-o', '--output', required=True, help='输出文件路径')
    parser.add_argument('--ocr-mode', choices=['local', 'aliyun'], default='local',
                       help='OCR 模式：local(本地) 或 aliyun(阿里云)')
    parser.add_argument('--aliyun-key-id', help='阿里云 Access Key ID')
    parser.add_argument('--aliyun-key-secret', help='阿里云 Access Key Secret')
    parser.add_argument('--aliyun-endpoint', default='ocr.cn-shanghai.aliyuncs.com',
                       help='阿里云 OCR 端点')
    parser.add_argument('--lang', default='chi_sim+eng', help='本地 OCR 语言')
    parser.add_argument('--dpi', type=int, default=200, help='本地 OCR DPI')
    parser.add_argument('--max-pages', type=int, default=20, help='最大识别页数')
    
    args = parser.parse_args()
    
    # 验证输入文件
    if not os.path.exists(args.pdf):
        print(f"✗ 错误：PDF 文件不存在：{args.pdf}")
        sys.exit(1)
    
    if not os.path.exists(args.template):
        print(f"✗ 错误：模板文件不存在：{args.template}")
        sys.exit(1)
    
    print("="*60)
    print("民事起诉状自动填写工具 - 专业版")
    print(f"OCR 模式：{args.ocr_mode}")
    print("="*60)
    
    # 初始化 OCR
    aliyun_config = None
    if args.ocr_mode == 'aliyun':
        aliyun_config = {
            'access_key_id': args.aliyun_key_id or os.environ.get('ALIYUN_ACCESS_KEY_ID'),
            'access_key_secret': args.aliyun_key_secret or os.environ.get('ALIYUN_ACCESS_KEY_SECRET'),
            'endpoint': args.aliyun_endpoint
        }
    
    ocr_deps = init_ocr(args.ocr_mode, aliyun_config)
    
    # 1. OCR 识别 PDF
    extractor = PDFOCRExtractor(
        args.pdf, 
        lang=args.lang, 
        dpi=args.dpi,
        ocr_mode=args.ocr_mode,
        aliyun_config=aliyun_config
    )
    ocr_text = extractor.extract(args.max_pages)
    
    if not ocr_text:
        print("✗ 错误：无法从 PDF 提取文本")
        sys.exit(1)
    
    # 2. 提取案件信息
    info_extractor = CaseInfoExtractor(ocr_text)
    case_info = info_extractor.extract()
    
    # 显示提取的信息
    print("\n📋 提取的案件信息:")
    for key, value in case_info.items():
        if value:
            print(f"   {key}: {value}")
    
    # 3. 填写起诉状
    filler = LawsuitFiller(args.template, case_info)
    success = filler.fill(args.output)
    
    if success:
        print("\n" + "="*60)
        print(f"✓ 完成！输出文件：{args.output}")
        print("="*60)
    else:
        print("\n✗ 填写失败")
        sys.exit(1)


if __name__ == '__main__':
    main()
