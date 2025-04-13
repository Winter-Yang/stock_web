import axios from 'axios'

/**
 * 获取股票K线数据
 * @param {string} symbol - 股票代码
 * @param {number} tickCount - K线数据点数量，默认250个
 * @returns {Promise<Array>} K线数据数组
 */
export const fetchKLineData = async (symbol, tickCount = 250) => {
  try {
    const params = {
      tick_count: tickCount,
      prod_code: symbol,
      adjust_price_type: 'forward',
      period_type: 86400,
      fields: ['tick_at', 'open_px', 'close_px', 'high_px', 'low_px'].join(',')
    }

    const response = await axios.get('https://api-ddc-wscn.xuangubao.com.cn/market/kline', { params })
    

    if (response.status === 200 && response.data?.data?.candle?.[symbol]?.lines) {
        const klineData = response.data.data.candle[symbol].lines.map(line => {
            const date = new Date(line[4] * 1000)
            return {
                timestamp: date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                open: line[0],    // 开盘价
                close: line[1],   // 收盘价
                high: line[2],    // 最高价
                low: line[3]      // 最低价
            }
        })
        return klineData
    }
    
    throw new Error('获取K线数据失败')
  } catch (error) {
    console.error('获取K线数据出错:', error)
    throw error
  }
}