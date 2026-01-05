#!/usr/bin/env python3
import requests
import os

# 获取音范丝RSS内容
def fetch_yinfans_rss():
    url = 'https://www.yinfans.net/feed'
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # 保存到本地
        with open('yinfans_rss.xml', 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print('成功获取音范丝RSS内容')
        return True
    except Exception as e:
        print(f'获取失败: {e}')
        return False

if __name__ == '__main__':
    fetch_yinfans_rss()