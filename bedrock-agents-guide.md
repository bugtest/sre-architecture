# AWS Bedrock Agents 开发指南

> 完整讲解在 AWS Bedrock 上开发生成式 AI 应用和智能体 (Agents) 的流程、配置与最佳实践

---

## 目录

1. [Bedrock 核心概念](#1-bedrock-核心概念)
2. [开发前准备](#2-开发前准备)
3. [基础调用流程](#3-基础调用流程)
4. [Agents for Bedrock 详解](#4-agents-for-bedrock-详解)
5. [Action Group API 设计](#5-action-group-api-设计)
6. [Knowledge Bases 集成](#6-knowledge-bases-集成)
7. [完整示例：电商客服系统](#7-完整示例电商客服系统)
8. [部署与运维](#8-部署与运维)
9. [最佳实践](#9-最佳实践)

---

## 1. Bedrock 核心概念

### 1.1 什么是 Amazon Bedrock？

> **Amazon Bedrock = 托管的 Foundation Model 服务平台**

- **无需管理基础设施** - 全托管 API 服务
- **多模型选择** - Anthropic Claude、AI21、Cohere、Meta Llama、Amazon Titan、Stability AI 等
- **按需付费** - 按 Token 或按请求计费
- **企业级安全** - VPC、私有链接、数据不用于训练

### 1.2 核心能力

```
┌─────────────────────────────────────────────┐
│              Amazon Bedrock                 │
├─────────────┬─────────────┬─────────────────┤
│  Foundation │    Agents   │   Knowledge     │
│   Models    │   for       │   Bases         │
│  (文本/图像)│  Bedrock    │   (RAG)         │
├─────────────┼─────────────┼─────────────────┤
│  Guardrails │  Flows      │  Custom Models  │
│  (安全)     │  (工作流)   │  (微调)         │
└─────────────┴─────────────┴─────────────────┘
```

### 1.3 可用模型家族

| 提供商 | 模型 | 适用场景 |
|--------|------|---------|
| **Anthropic** | Claude 3.5/3 Sonnet, Haiku | 复杂推理、多模态、长上下文 |
| **Meta** | Llama 3 70B/8B | 开源替代、成本敏感 |
| **Amazon** | Titan Text, Embeddings | AWS 原生集成 |
| **Cohere** | Command R+ | RAG、企业搜索 |
| **AI21** | Jurassic-2 | 文本生成 |
| **Stability AI** | SDXL | 图像生成 |

---

## 2. 开发前准备

### 2.1 账号与权限

```bash
# 启用 Bedrock 服务
aws bedrock list-foundation-models

# 创建 IAM 策略
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel",
        "bedrock:CreateAgent",
        "bedrock:InvokeAgent"
      ],
      "Resource": "*"
    }
  ]
}

# 配置 AWS CLI
aws configure
```

### 2.2 模型访问申请

部分模型需要在 AWS Console 中单独申请：

```
Bedrock Console → Model access → Request access
→ 选择需要的模型家族 (Anthropic、Meta、AI21 等)
```

### 2.3 区域支持

Bedrock 主要在以下区域可用：
- `us-east-1` (N. Virginia) - 最全模型
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-northeast-1` (Tokyo)

---

## 3. 基础调用流程

### 3.1 Python SDK 调用示例

```python
import boto3
import json

# 创建 Bedrock Runtime 客户端
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'
)

# 选择模型
model_id = 'anthropic.claude-3-5-sonnet-20241022-v2:0'

# 构建请求体 (Claude 格式)
body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [
        {
            "role": "user",
            "content": "请用 Python 写一个快速排序算法"
        }
    ]
}

# 调用模型
response = bedrock.invoke_model(
    modelId=model_id,
    contentType='application/json',
    accept='application/json',
    body=json.dumps(body)
)

# 解析响应
response_body = json.loads(response['body'].read())
print(response_body['content'][0]['text'])
```

### 3.2 流式响应

```python
import boto3
import json

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 2048,
    "messages": [{"role": "user", "content": "写一篇关于 AI 的文章"}]
}

# 流式调用
response = bedrock.invoke_model_with_response_stream(
    modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
    contentType='application/json',
    accept='application/json',
    body=json.dumps(body)
)

# 处理流式响应
for event in response['body']:
    chunk = event.get('chunk', {})
    if chunk:
        chunk_data = json.loads(chunk['bytes'])
        if chunk_data.get('type') == 'content_block_delta':
            print(chunk_data['delta']['text'], end='', flush=True)
```

### 3.3 不同模型的请求格式

#### Anthropic Claude
```python
body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "你好"}],
    "system": "你是一个有帮助的助手"
}
```

#### Meta Llama
```python
body = {
    "prompt": "<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n你好<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
    "max_gen_len": 512,
    "temperature": 0.7,
    "top_p": 0.9
}
```

#### Amazon Titan
```python
body = {
    "inputText": "你好，请介绍一下自己",
    "textGenerationConfig": {
        "maxTokenCount": 512,
        "temperature": 0.7,
        "topP": 0.9
    }
}
```

---

## 4. Agents for Bedrock 详解

### 4.1 什么是 Agents for Bedrock？

> **Agents for Bedrock = 让大模型能够执行复杂任务的智能体框架**

核心能力：
- 理解用户意图并分解任务
- 调用外部 API 和 Lambda 函数
- 查询知识库 (RAG)
- 多轮对话管理和记忆

### 4.2 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户请求                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Agent 核心                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Foundation Model (Claude/Llama 等)                  │   │
│  │  - 理解用户意图                                       │   │
│  │  - 任务分解与编排                                     │   │
│  │  - 生成响应                                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
    ┌─────────▼─────────┐   ┌─────────▼─────────┐
    │   Action Groups   │   │  Knowledge Bases  │
    │   (API/函数调用)   │   │   (RAG 检索)       │
    └─────────┬─────────┘   └─────────┬─────────┘
              │                       │
    ┌─────────▼─────────┐   ┌─────────▼─────────┐
    │   Lambda 函数      │   │   OpenSearch      │
    │   API Gateway     │   │   S3 文档存储       │
    │   第三方 API       │   │   向量索引         │
    └───────────────────┘   └───────────────────┘
```

### 4.3 创建 Agent

#### 使用 AWS CLI
```bash
aws bedrock-agent create-agent \
  --agent-name CustomerServiceAgent \
  --description "客户服务智能助手" \
  --foundation-model "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0" \
  --instruction "你是一个客户服务助手，帮助用户查询订单状态、处理退货请求、回答产品相关问题。" \
  --idle-session-ttl-in-seconds 3600
```

#### 使用 Python SDK
```python
import boto3

bedrock_agent = boto3.client('bedrock-agent', region_name='us-east-1')

response = bedrock_agent.create_agent(
    agentName='CustomerServiceAgent',
    description='客户服务智能助手',
    agentResourceRoleArn='arn:aws:iam::123456789:role/BedrockAgentRole',
    foundationModel='anthropic.claude-3-5-sonnet-20241022-v2:0',
    instruction='''你是一个客户服务助手，帮助用户：
    1. 查询订单状态
    2. 处理退货请求
    3. 回答产品相关问题
    
    使用友好专业的语气。''',
    idleSessionTTLInSeconds=3600
)

agent_id = response['agent']['agentId']
```

### 4.4 准备和调用 Agent

```python
# 准备 Agent (必须步骤)
bedrock_agent.prepare_agent(agentId=agent_id)

# 调用 Agent
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime', region_name='us-east-1')

response = bedrock_agent_runtime.invoke_agent(
    agentId=agent_id,
    agentAliasId='DRAFT',  # 或生产别名
    sessionId='unique-session-id',
    inputText='我的订单 ORD-123456 状态是什么？',
    enableTrace=False
)

# 处理响应
completion = response['completion']
result = completion.decode('utf-8')
print(result)
```

---

## 5. Action Group API 设计

### 5.1 OpenAPI Schema 基础

Bedrock Agents 使用 **OpenAPI 3.0** 规范定义 API。

**关键要素：**

| 要素 | 说明 | 重要性 |
|------|------|--------|
| **operationId** | Agent 用它识别要调用哪个函数 | ⭐⭐⭐ 必须唯一 |
| **description** | 帮助 Agent 理解何时调用 | ⭐⭐⭐ 越清晰越好 |
| **parameters** | 定义 Agent 需要从用户输入中提取什么 | ⭐⭐⭐ 类型要准确 |
| **schema** | 响应格式，Agent 用它生成回复 | ⭐⭐ 影响输出质量 |

### 5.2 API Schema 示例

```yaml
openapi: 3.0.0
info:
  title: Customer Service API
  version: 1.0.0
  description: 电商客户服务 API

paths:
  /orders/{orderId}:
    get:
      summary: 查询订单状态
      description: |
        根据订单 ID 查询订单的当前状态、物流信息和预计送达时间。
        当用户询问"我的订单怎么样了"、"订单发货了吗"等问题时调用。
      operationId: getOrderStatus
      parameters:
        - name: orderId
          in: path
          required: true
          description: 订单 ID，格式为 ORD-开头后跟数字
          schema:
            type: string
            pattern: '^ORD-\d+$'
            example: 'ORD-123456'
      responses:
        '200':
          description: 订单查询成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderId:
                    type: string
                  status:
                    type: string
                    enum: [pending, paid, shipped, delivered, cancelled]
                  trackingNumber:
                    type: string
                  estimatedDelivery:
                    type: string
                    format: date
```

### 5.3 Lambda 函数实现

```python
import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table(os.environ['ORDERS_TABLE'])

def lambda_handler(event, context):
    """
    Bedrock Agent Action Group 入口函数
    """
    api_path = event.get('apiPath')
    http_method = event.get('httpMethod')
    
    try:
        if api_path == '/orders/{orderId}' and http_method == 'GET':
            result = get_order_status(event)
        else:
            return create_response(404, {'message': 'API not found'})
        
        return create_response(200, result)
    
    except ValueError as e:
        return create_response(400, {'message': str(e)})
    except Exception as e:
        return create_response(500, {'message': 'Internal server error'})


def get_order_status(event):
    """查询订单状态"""
    order_id = get_path_parameter(event, 'orderId')
    
    response = orders_table.get_item(Key={'orderId': order_id})
    
    if 'Item' not in response:
        raise ValueError(f'订单 {order_id} 不存在')
    
    order = response['Item']
    
    return {
        'orderId': order['orderId'],
        'status': order['status'],
        'trackingNumber': order.get('trackingNumber'),
        'estimatedDelivery': order.get('estimatedDelivery')
    }


def get_path_parameter(event, name):
    """从 event 中提取 path 参数"""
    for param in event.get('parameters', []):
        if param['name'] == name:
            return param['value']
    raise ValueError(f'Missing required parameter: {name}')


def create_response(status_code, body):
    """创建标准化的响应格式"""
    return {
        'messageVersion': '1.0',
        'response': {
            'httpStatusCode': status_code,
            'responseBody': {
                'application/json': {
                    'body': json.dumps(body, default=str)
                }
            }
        }
    }
```

### 5.4 创建 Action Group

```python
bedrock_agent.create_agent_action_group(
    agentId=agent_id,
    agentVersion='DRAFT',
    actionGroupExecutor={
        'lambda': 'arn:aws:lambda:us-east-1:123456789:function:OrderQueryFunction'
    },
    actionGroupName='OrderManagement',
    description='订单查询和管理功能',
    apiSchema={
        's3': {
            's3BucketName': 'your-api-schema-bucket',
            's3ObjectKey': 'api-schema.yaml'
        }
    },
    actionGroupState='ENABLED'
)
```

---

## 6. Knowledge Bases 集成

### 6.1 创建知识库

```python
bedrock_agent = boto3.client('bedrock-agent', region_name='us-east-1')

# 创建知识库
kb_response = bedrock_agent.create_knowledge_base(
    name='ProductKnowledgeBase',
    description='产品文档知识库',
    roleArn='arn:aws:iam::123456789:role/BedrockKBRole',
    knowledgeBaseConfiguration={
        'type': 'VECTOR',
        'vectorKnowledgeBaseConfiguration': {
            'embeddingModelArn': 'arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0',
            'embeddingModelConfiguration': {
                'bedrockEmbeddingModelConfiguration': {
                    'dimension': 1024
                }
            }
        }
    },
    storageConfiguration={
        'type': 'OPENSEARCH_SERVERLESS',
        'opensearchServerlessConfiguration': {
            'collectionArn': 'arn:aws:aoss:us-east-1:123456789:collection/xxx',
            'fieldMapping': {
                'vectorField': 'vector',
                'textField': 'text',
                'metadataField': 'metadata'
            }
        }
    }
)

kb_id = kb_response['knowledgeBase']['knowledgeBaseId']
```

### 6.2 创建数据源并同步

```python
# 创建 S3 数据源
data_source = bedrock_agent.create_data_source(
    knowledgeBaseId=kb_id,
    name='ProductDocs',
    dataSourceConfiguration={
        'type': 'S3',
        's3Configuration': {
            'bucketArn': 'arn:aws:s3:::your-product-docs-bucket',
            'inclusionPrefixes': ['documents/']
        }
    }
)

# 开始同步
bedrock_agent.start_ingestion_job(
    knowledgeBaseId=kb_id,
    dataSourceId=data_source['dataSource']['dataSourceId']
)
```

### 6.3 关联知识库到 Agent

```python
bedrock_agent.associate_agent_knowledge_base(
    agentId=agent_id,
    agentVersion='DRAFT',
    knowledgeBaseId=kb_id,
    knowledgeBaseState='ENABLED',
    description='产品知识库用于回答产品相关问题',
    instruction='使用此知识库回答产品规格、价格、库存等问题'
)
```

---

## 7. 完整示例：电商客服系统

### 7.1 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    用户 (飞书/WhatsApp)              │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Bedrock Agent                           │
│  Foundation Model: Claude 3.5 Sonnet                │
└─────┬─────────────────────────────┬─────────────────┘
      │                             │
┌─────▼─────────┐           ┌───────▼─────────┐
│ Action Groups │           │ Knowledge Base  │
│ - 订单查询     │           │ - 产品文档       │
│ - 退货处理     │           │ - FAQ          │
│ - 产品搜索     │           │ - 政策说明       │
└─────┬─────────┘           └───────┬─────────┘
      │                             │
┌─────▼─────────┐           ┌───────▼─────────┐
│ Lambda 函数    │           │ OpenSearch      │
│ DynamoDB      │           │ S3 文档存储       │
└───────────────┘           └─────────────────┘
```

### 7.2 API 端点列表

| 端点 | 方法 | 功能 |
|------|------|------|
| `/orders/{orderId}` | GET | 查询订单状态 |
| `/orders` | GET | 查询用户订单列表 |
| `/returns` | POST | 创建退货申请 |
| `/returns/{returnId}` | GET | 查询退货状态 |
| `/products/{productId}` | GET | 查询产品详情 |
| `/products/search` | GET | 搜索产品 |
| `/shipments/{trackingNumber}` | GET | 追踪物流 |

### 7.3 典型对话流程

```
用户：我的订单 ORD-123456 怎么样了？

Agent 思考过程:
1. 识别意图：查询订单状态
2. 提取参数：orderId = "ORD-123456"
3. 选择 API：getOrderStatus
4. 调用 Lambda → 获取订单数据
5. 生成回复

Agent: 您的订单 ORD-123456 已发货，物流单号 SF1234567890，
       预计 2 月 28 日送达。
```

---

## 8. 部署与运维

### 8.1 SAM 部署模板

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  CustomerServiceFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: customer-service-action-handler
      Runtime: python3.11
      Handler: lambda_function.lambda_handler
      CodeUri: .
      Timeout: 30
      Environment:
        Variables:
          ORDERS_TABLE: !Ref OrdersTable
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable

  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: customer-orders
      BillingMode: PAY_PER_REQUEST

  AgentRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: bedrock.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AmazonBedrockFullAccess
        - arn:aws:iam::aws:policy/AWSLambdaInvokeFunction
```

### 8.2 部署命令

```bash
# 构建和部署
sam build
sam deploy --guided

# 上传 API Schema
aws s3 cp api-schema.yaml s3://your-bucket/api-schema.yaml

# 创建 Action Group
aws bedrock-agent create-agent-action-group \
  --agent-id YOUR_AGENT_ID \
  --agent-version DRAFT \
  --action-group-executor lambda=YOUR_LAMBDA_ARN \
  --action-group-name CustomerServiceActionGroup \
  --api-schema s3BucketName=your-bucket,s3ObjectKey=api-schema.yaml

# 准备 Agent
aws bedrock-agent prepare-agent --agent-id YOUR_AGENT_ID
```

### 8.3 监控指标

```bash
# 查看调用次数
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock/Agents \
  --metric-name Invocations \
  --dimensions Name=AgentId,Value=YOUR_AGENT_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 \
  --statistics Sum
```

### 8.4 启用 Trace 调试

```python
response = bedrock_agent_runtime.invoke_agent(
    agentId=agent_id,
    agentAliasId='DRAFT',
    sessionId='session-123',
    inputText='测试问题',
    enableTrace=True  # 启用详细 trace
)

# 处理 trace 事件
for event in response['completion']:
    if 'trace' in event:
        trace = event['trace']
        print(f"Trace: {json.dumps(trace, indent=2)}")
```

---

## 9. 最佳实践

### ✅ Do's

| 实践 | 说明 |
|------|------|
| **使用版本控制** | 发布生产别名，不要直接用 DRAFT |
| **启用 Guardrails** | 内容安全过滤 |
| **实现错误处理** | Lambda 函数要有完善的错误处理 |
| **使用会话状态** | 保持多轮对话上下文 |
| **监控成本** | 设置预算告警 |
| **测试 Action Group** | 单独测试每个 API |
| **清晰的 API 描述** | 帮助 Agent 正确理解何时调用 |
| **统一的响应格式** | 便于 Agent 解析和生成回复 |

### ❌ Don'ts

| 避免 | 原因 |
|------|------|
| 直接在 Agent 中硬编码凭证 | 使用 IAM Role |
| 过度复杂的指令 | 保持 instruction 简洁清晰 |
| 忽略速率限制 | 实现重试和 backoff |
| 不使用知识库处理文档 | RAG 比长 prompt 更高效 |
| operationId 重复 | Agent 无法区分函数 |
| 参数描述模糊 | Agent 提取错误信息 |

### 成本估算

| 组件 | 计费方式 | 月估算 (中等用量) |
|------|---------|------------------|
| **Bedrock 模型** | 按 Token | $50-200 |
| **Lambda** | 按调用+时长 | $5-20 |
| **OpenSearch** | 按 OCU 小时 | ~$100 |
| **DynamoDB** | 按读写单元 | $10-50 |
| **Titan Embeddings** | 按 Token | $5-10 |

---

## 参考资源

- [AWS Bedrock 官方文档](https://docs.aws.amazon.com/bedrock/)
- [Agents for Bedrock 指南](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [AWS Samples GitHub](https://github.com/aws-samples/bedrock-agents-samples)
- [Action Group 示例](https://github.com/aws-samples/bedrock-agents-action-groups)
- [定价计算器](https://calculator.aws/#/estimate?id=bedrock)

---

*最后更新：2026-02-25*
*作者：小球 (Xiǎo Qiú) - AI 助手*
