<template>
  <div class="limit-up-kline">
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <div v-for="(level, levelIndex) in ladderLevels" :key="levelIndex" class="level-section">
        <div class="level-title">{{ level.name }}</div>
        <div v-for="group in level.groups" :key="group.plateName" class="plate-group" :style="getGroupStyle(group.colorIdx)">
          <div class="plate-header" :style="getHeaderStyle(group.colorIdx)">{{ group.plateName }} ({{ group.stocks.length }})</div>
          <div class="stock-list">
            <div v-for="stock in group.stocks" :key="stock.symbol" class="stock-card">
              <div class="stock-info">
                <span class="stock-area">{{ getStockArea(stock.symbol) }}</span>
                <span class="stock-name" :class="getStockNameClass(stock)">{{ stock.stock_chi_name }}</span>
                <span v-for="badge in stock.badges" :key="badge.text" class="badge" :class="badge.type">{{ badge.text }}</span>
              </div>
              <div class="kline-wrapper">
                <StockKLineChart :stockCode="stock.symbol" @loaded="onKlineLoaded(stock, $event)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import StockKLineChart from '../chart/StockKLineChart.vue'
import { fetchLimitUpStocksDaily } from '../models/limitUpModel'
import { fetchKLineData } from '../models/klineModel'

export default {
  name: 'LimitUpKLine',
  components: { StockKLineChart },
  setup() {
    const ladderLevels = ref([])
    const loading = ref(true)

    const plateColors = [
      '#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#9c27b0',
      '#00bcd4', '#ff9800', '#795548', '#607d8b', '#e91e63'
    ]

    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha})`
    }

    const plateColorMap = {}
    let colorIndex = 0

    const getGroupStyle = (colorIdx) => ({ borderColor: hexToRgba(plateColors[colorIdx % plateColors.length], 0.6) })
    const getHeaderStyle = (colorIdx) => ({ color: plateColors[colorIdx % plateColors.length] })

    // 分析K线数据，检测新高
    const analyzeHighs = (klineData) => {
      const badges = []
      if (!klineData || klineData.length < 2) return badges

      const currentClose = klineData[klineData.length - 1].close

      const checks = [
        { days: 100, text: '百日新高', type: 'badge-100d' },
        { days: 60, text: '60日新高', type: 'badge-60d' },
        { days: 30, text: '30日新高', type: 'badge-30d' },
        { days: 20, text: '20日新高', type: 'badge-20d' }
      ]

      checks.forEach(({ days, text, type }) => {
        if (klineData.length >= days) {
          const period = klineData.slice(-days)
          const maxHigh = Math.max(...period.map(d => d.high))
          if (currentClose >= maxHigh) {
            badges.push({ text, type })
          }
        }
      })

      return badges
    }

    const onKlineLoaded = async (stock, klineData) => {
      stock.badges = analyzeHighs(klineData)
    }

    const getStockArea = (symbol) => symbol.startsWith('SZ') ? '深' : symbol.startsWith('SH') ? '沪' : ''

    const getStockNameClass = (stock) => ({
      'failed': stock.failed && !stock.yesterdayFailed,
      'success': !stock.failed,
      'yesterday-failed': stock.yesterdayFailed
    })

    const initPage = async () => {
      loading.value = true
      try {
        const stocks = await fetchLimitUpStocksDaily()

        const levels = [
          { name: '首板', stocks: [] },
          { name: '1进2', stocks: [] },
          { name: '2进3', stocks: [] },
          { name: '3进4', stocks: [] },
          { name: '4进5', stocks: [] },
          { name: '5进6', stocks: [] },
          { name: '更高板', stocks: [] }
        ]

        stocks.forEach(stock => {
          stock.badges = []
          const level = stock.limit_up_days - 1
          if (level >= 0 && level < levels.length) {
            levels[level].stocks.push(stock)
          }
        })

        // 按板块分组
        levels.forEach(level => {
          const plateGroups = {}
          level.stocks.forEach(stock => {
            const plateName = stock.surge_reason?.related_plates?.[0]?.plate_name || '其他'
            if (!plateGroups[plateName]) plateGroups[plateName] = []
            plateGroups[plateName].push(stock)
          })

          level.groups = Object.entries(plateGroups)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([plateName, stocks]) => {
              if (!(plateName in plateColorMap)) plateColorMap[plateName] = colorIndex++
              return { plateName, stocks, colorIdx: plateColorMap[plateName] }
            })
        })

        ladderLevels.value = levels.reverse()
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => initPage())

    return {
      ladderLevels,
      loading,
      getGroupStyle,
      getHeaderStyle,
      onKlineLoaded,
      getStockArea,
      getStockNameClass
    }
  }
}
</script>

<style scoped>
.limit-up-kline {
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.05);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.level-section {
  margin-bottom: 20px;
}

.level-title {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  padding: 8px 0 12px;
  border-bottom: 2px solid #f56c6c;
  margin-bottom: 12px;
}

.plate-group {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background: #fafbfc;
  padding: 0 10px 10px;
  margin-bottom: 12px;
}

.plate-header {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 0 6px 4px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px 12px 14px;
  transition: box-shadow 0.2s;
}

.stock-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.stock-area {
  color: #c0c4cc;
  font-size: 11px;
  font-weight: 500;
}

.stock-name {
  font-weight: 600;
  font-size: 14px;
  min-width: 70px;
  color: #303133;
}

.stock-name.failed {
  color: #909399;
  text-decoration: line-through;
}

.stock-name.success {
  color: #303133;
}

.badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.badge-100d {
  color: #f56c6c;
  background: rgba(245,108,108,0.12);
}

.badge.badge-60d {
  color: #e6a23c;
  background: rgba(230,162,60,0.12);
}

.badge.badge-30d {
  color: #409eff;
  background: rgba(64,158,255,0.12);
}

.badge.badge-20d {
  color: #67c23a;
  background: rgba(103,194,58,0.12);
}

.kline-wrapper {
  width: 100%;
  margin-bottom: 4px;
}

:deep(.k-line-chart) {
  width: 100% !important;
  height: 380px !important;
}
</style>
