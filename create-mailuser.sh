#!/bin/bash
# 批量创建邮件用户脚本

if [ $# -lt 2 ]; then
    echo "用法：$0 用户名 密码 [用户名2 密码2 ...]"
    echo "示例：$0 zhangsan 123456 lisi 654321"
    exit 1
fi

while [ $# -ge 2 ]; do
    USERNAME=$1
    PASSWORD=$2
    
    echo "创建用户：$USERNAME"
    
    # 检查用户是否存在
    if id "$USERNAME" &>/dev/null; then
        echo "❌ 用户 $USERNAME 已存在"
    else
        # 创建用户
        sudo useradd -m -s /usr/sbin/nologin "$USERNAME"
        echo "$USERNAME:$PASSWORD" | sudo chpasswd
        
        if [ $? -eq 0 ]; then
            echo "✅ 用户 $USERNAME 创建成功"
            echo "   邮箱：$USERNAME@chenggang.wang"
        else
            echo "❌ 用户 $USERNAME 创建失败"
        fi
    fi
    
    shift 2
done

echo ""
echo "完成！"
