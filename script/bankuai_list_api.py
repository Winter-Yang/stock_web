import requests
from typing import List, Dict, Any
import akshare as ak
import pandas as pd
from datetime import datetime, date
import json
import os

def getTradeDates():
    """获取最近的交易日"""
    current_date = date.today()
    df = ak.tool_trade_date_hist_sina()
    current_position = df[df['trade_date'] <= current_date].index[-1]
    historical_dates = df['trade_date'].loc[:current_position][-10:].values
    date_strings = [date.strftime('%Y-%m-%d') for date in historical_dates]
    return list(reversed(date_strings))

def fetch_block_rank(date:str,today:bool):
    """获取板块排行数据,直接返回板块列表"""
     # 设置缓存目录
    cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)
    cache_file = os.path.join(cache_dir, f"{date}.txt")
    # 如果存在缓存文件且不是今天的数据，直接读取缓存
    if os.path.exists(cache_file) and not today:
        try:
            print(f'{date}使用缓存数据')
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.loads(f.read())
        except Exception as e:
            pass

    try:
        params = {
            'Index': '0',
            'Order': '1',
            'PhoneOSNew': '2',
            'Type': '1',
            'VerSion': '5.18.0.5',
            'ZSType': '7',
            'a': 'RealRankingInfo',
            'apiv': 'w39',
            'c': 'ZhiShuRanking',
            'st': '20'
        }
        
        url = "https://apphis.longhuvip.com/w1/api/index.php"
        if today:
            url = "https://apphwhq.longhuvip.com/w1/api/index.php"
        else:
            params['Date'] = date
            params['REnd'] = "1500"
            params['RStart'] = "0925"
        response = requests.post(
            url,
            headers={'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
            data=params
        )
        data = response.json()
        
        # 直接处理原始列表数据转换成字典格式
        block_list = []
        for item in data.get('list', []):
            block_list.append({
                'code': item[0],          # 板块代码
                'name': item[1],          # 板块名称
                'price': float(item[2]),  # 当前价格
                'zdf': float(item[3]),    # 涨跌幅
                # 'hsl': float(item[4]),    # 换手率
                'cje': float(item[5]),    # 成交额
                'jlr': float(item[6]),    # 净流入
                # 'buy': float(item[7]),    # 主买
                # 'sell': float(item[8]),   # 主卖
                # 'rate': float(item[9]),   # 占比
                # 'zsz': float(item[10]),   # 总市值
                # 'zdd': float(item[11]),   # 涨跌点
                # 'zlr': float(item[12]),   # 主力净流入
                # 'ltsz': float(item[13]),  # 流通市值
                # 'jgcyd': float(item[14]), # 机构持仓异动
                # 'pe': float(item[15]),    # 市盈率
                # 'pb': float(item[16]),    # 市净率
                # 'last_price': float(item[17]), # 最新价
                # 'last_zdf': float(item[18])    # 最新涨跌幅
            })


        if not today:  # 只缓存历史数据
            try:
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(block_list, f, ensure_ascii=False, indent=2)
            except Exception as e:
                pass
        return block_list
            
    except Exception as e:
        pass
        return []

# 使用示例
if __name__ == '__main__':
    dateLists= getTradeDates()
    block_data_map = {}  # 创建字典存储数据
    index = 0
    for date in dateLists:
        result = fetch_block_rank(date,index==0)
        index = index + 1
        block_data_map[date] = result  # 将结果存入字典
        
    print(f"获取到 板块数据 {json.dumps(block_data_map)}")