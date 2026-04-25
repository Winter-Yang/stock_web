<template>
  <div class="limit-up-ladder">
    <div class="ladder-header">
      <div class="header-left">晋级</div>
      <div class="header-right">晋级率</div>
    </div>
    <div class="ladder-content">
      <div v-for="(level, index) in ladderLevels" :key="index" class="ladder-row">
        <div class="level-info">
          <div class="level-name">{{ level.name }}</div>
          <div class="level-rate">{{ level.rate }}</div>
        </div>
        <div class="groups-container">
          <div v-for="group in level.groups" :key="group.plateName" class="plate-group" :style="getGroupStyle(group.colorIdx)">
            <div class="plate-group-header" :style="getHeaderStyle(group.colorIdx)">{{ group.plateName }} ({{ group.stocks.length }})</div>
            <div class="stock-list">
              <div v-for="(stock, stockIndex) in group.stocks"
                   :key="stockIndex"
                   class="stock-item"
                   :style="getStockItemStyle(group.colorIdx, stock)">
                <el-popover
                  placement="auto"
                  trigger="hover"
                  :width="1100"
                  :height="400"
                  :hide-after=0
                  popper-class="stock-popover"
                >
                  <template #default>
                    <div class="popover-content">
                      <h3>{{ stock.stock_chi_name }} ({{ stock.symbol }})</h3>
                      <StockKLineChart :stockCode="stock.symbol" />
                    </div>
                  </template>
                  <template #reference>
                    <div class="stock-content">
                      <span class="stock-area">{{ getStockArea(stock.symbol) }}</span>
                      <span class="stock-name" :class="getStockNameClass(stock)">{{ stock.stock_chi_name }}</span>
                    </div>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import StockKLineChart from '../chart/StockKLineChart.vue'
import { LimitUpStock, fetchLimitUpStocksDaily, fetchYesterdayLimitUpStocks } from '../models/limitUpModel';
export default {
  name: 'LimitUpLadder',
  components: {
    StockKLineChart
  },
  setup() {
    const todayStocks = ref([])
    const yesterdayStocks = ref([])
    const ladderLevels = ref([])

    // 板块分组颜色池
    const plateColors = [
      '#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#9c27b0',
      '#00bcd4', '#ff9800', '#795548', '#607d8b', '#e91e63',
      '#3f51b5', '#009688', '#ff5722', '#8bc34a', '#cddc39'
    ]

    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha})`
    }

    // 全局板块-颜色映射，同名板块跨梯队共享颜色
    const plateColorMap = {}
    let colorIndex = 0

    const getGroupStyle = (colorIdx) => {
      const color = plateColors[colorIdx % plateColors.length]
      return { borderColor: hexToRgba(color, 0.6) }
    }

    const getHeaderStyle = (colorIdx) => {
      const color = plateColors[colorIdx % plateColors.length]
      return { color }
    }

    const getStockItemStyle = (colorIdx, stock) => {
      if (stock.change_percent * 100 > 15) {
        const color = plateColors[colorIdx % plateColors.length]
        return { backgroundColor: hexToRgba(color, 0.25) }
      }
      return {}
    }

    const initLadderLevels = () => {
      const levels = [
        { name: '首板', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '1进2', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '2进3', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '3进4', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '4进5', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '5进6', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '更高板', stocks: [], todayCount: 0, yesterdayCount: 0 }
      ]

      // 重置颜色映射
      for (const key in plateColorMap) delete plateColorMap[key]
      colorIndex = 0

      // 统计今日涨停数据
      todayStocks.value.forEach(stock => {
        const level = stock.limit_up_days - 1
        if (level >= 0 && level < levels.length) {
          levels[level].stocks.push(stock)
          levels[level].todayCount++
        }
      })

      // 对每个梯队的股票按板块分组并排序
      levels.forEach(level => {
        // 按板块分组
        const plateGroups = {}
        level.stocks.forEach(stock => {
          const plateName = stock.surge_reason?.related_plates?.[0]?.plate_name || '其他'
          if (!plateGroups[plateName]) {
            plateGroups[plateName] = []
          }
          plateGroups[plateName].push(stock)
        })

        // 将分组转换为数组并按数量排序，组内 >15% 的股票排前面
        level.groups = Object.entries(plateGroups)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([plateName, stocks]) => {
            // 同名板块分配唯一颜色索引
            if (!(plateName in plateColorMap)) {
              plateColorMap[plateName] = colorIndex++
            }
            const sorted = stocks.sort((a, b) => {
              const aHigh = a.change_percent * 100 > 15 ? 0 : 1
              const bHigh = b.change_percent * 100 > 15 ? 0 : 1
              return aHigh - bHigh
            })
            return { plateName, stocks: sorted, colorIdx: plateColorMap[plateName] }
          })
      })

      const levelsyesterday = [
        { name: '首板', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '1进2', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '2进3', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '3进4', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '4进5', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '5进6', stocks: [], todayCount: 0, yesterdayCount: 0 },
        { name: '更高板', stocks: [], todayCount: 0, yesterdayCount: 0 }
      ]

      // 统计昨日涨停数据并处理未涨停股票
      yesterdayStocks.value.forEach(yStock => {
        const level = yStock.yesterday_limit_up_days -1
        if (level >= 0 && level < levels.length) {
            // levelsyesterday[level].stocks.push(stock)
            levelsyesterday[level].todayCount++
        }
      })
      console.log("昨日涨停")
      console.log(levelsyesterday)


      // 计算晋级率
      levels.forEach((level, index) => {
        if(index == 0){
            level.rate = `${level.todayCount}个`
        }else{
            level.yesterdayCount = levelsyesterday[index-1].todayCount
            const successRate = level.yesterdayCount > 0 ? 
            (level.todayCount / level.yesterdayCount * 100).toFixed(0) : 0
          level.rate = `${level.todayCount}/${level.yesterdayCount}=${successRate}%`
        }
      })

      ladderLevels.value = levels.reverse()
    }

    const getStockArea = (symbol) => {
      if (symbol.startsWith('SZ')) return '深'
      if (symbol.startsWith('SH')) return '沪'
      return ''
    }

    const getStockNameClass = (stock) => {
      return {
        'failed': stock.failed && !stock.yesterdayFailed,
        'success': !stock.failed,
        'yesterday-failed': stock.yesterdayFailed
      }
    }

    onMounted(async () => {
      try {
        const [today, yesterday] = await Promise.all([
        fetchLimitUpStocksDaily(),
          fetchYesterdayLimitUpStocks()
        ])
        todayStocks.value = today
        yesterdayStocks.value = yesterday
        initLadderLevels()
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    })

    return {
      ladderLevels,
      getStockArea,
      getStockNameClass,
      getGroupStyle,
      getHeaderStyle,
      getStockItemStyle
    }
  }
}
</script>

<style scoped>
.limit-up-ladder {
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.05);
}

.ladder-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f7fa;
  font-weight: 500;
  border-radius: 4px;
  color: #303133;
  margin-bottom: 12px;
  font-size: 13px;
}

.ladder-row {
  margin: 10px 0;
  padding: 0 12px 10px;
  border-bottom: 1px solid #ebeef5;
}

.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 4px 0;
}

.level-name {
  font-weight: bold;
  color: #f56c6c;
  font-size: 13px;
}

.level-rate {
  color: #909399;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}

.groups-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.plate-group {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafbfc;
  padding: 0 8px 6px;
  flex-shrink: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.plate-group-header {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 4px 4px 0;
  margin-bottom: 4px;
}

.stock-list {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s;
  background: #fff;
  border: 1px solid #ebeef5;
}

.stock-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.stock-area {
  color: #c0c4cc;
  font-size: 11px;
  font-weight: 500;
}

.stock-name {
  font-weight: 500;
  min-width: 58px;
}

.stock-name.failed {
  color: #909399;
  text-decoration: line-through;
}

.stock-name.yesterday-failed {
  color: #67c23a;
  text-decoration: none;
}

.stock-name.success {
  color: #303133;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

.stock-popover {
  padding: 16px;
}

.popover-content {
  width: 100%;
  height: 100%;
}

.popover-content h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.stock-detail {
  font-size: 14px;
  color: #606266;
}

.stock-detail p {
  margin: 8px 0;
  line-height: 1.4;
}

.stock-content {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}

:deep(.el-popover.stock-popover) {
  min-width: 800px;
  padding: 16px;
}
</style>
