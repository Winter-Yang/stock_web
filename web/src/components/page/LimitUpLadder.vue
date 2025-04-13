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
        <div class="stock-list">
          <div v-for="(stock, stockIndex) in level.stocks" 
               :key="stockIndex" 
               class="stock-item">
            <el-popover
            placement="auto"
            trigger="hover"
              :width="1100"
              :height="400"
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
                  <span class="stock-change" :class="getChangeClass(stock.change_percent)">
                    {{ formatChange(stock.change_percent) }}
                  </span>
                  <span class="stock-tag">{{ getStockTag(stock) }}</span>
                </div>
              </template>
            </el-popover>
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

        // 将分组转换为数组并按数量排序
        const sortedGroups = Object.entries(plateGroups)
          .sort((a, b) => b[1].length - a[1].length)

        // 重新组合排序后的股票列表
        level.stocks = sortedGroups.flatMap(([_, stocks]) => stocks)
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

    const getChangeClass = (change) => {
      return {
        'up': change > 0,
        'down': change < 0
      }
    }

    const formatChange = (change) => {
      return `${(change * 100).toFixed(2)}%`
    }

    const getStockTag = (stock) => {
      if (stock.surge_reason?.related_plates?.length > 0) {
        return stock.surge_reason.related_plates[0].plate_name
      }
      return ''
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

    // 添加新方法
    const getStockTagType = (stock) => {
      if (stock.failed && !stock.yesterdayFailed) return 'info'
      if (stock.yesterdayFailed) return 'success'
      return ''
    }
    return {
      ladderLevels,
      getStockArea,
      getStockNameClass,
      getChangeClass,
      formatChange,
      getStockTag
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
  margin: 12px 0;
  border-bottom: 1px solid #ebeef5;
  padding: 0 12px 12px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
}

.level-name {
  font-weight: bold;
  color: #f56c6c;
  font-size: 13px;
}

.level-rate {
  color: #606266;
  font-size: 12px;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.stock-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 0;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  background-color: #f8f9fb;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.2s;
}

.stock-area {
  color: #909399;
  font-size: 11px;
  background-color: #fff;
  padding: 1px 3px;
  border-radius: 2px;
}

.stock-name {
  font-weight: 500;
  min-width: 65px;
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

.up {
  color: #f56c6c;
  font-weight: 500;
  min-width: 60px;
}

.down {
  color: #67c23a;
  font-weight: 500;
  min-width: 60px;
}

.stock-tag {
  color: #409eff;
  font-size: 12px;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
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
  gap: 4px;
  cursor: pointer;
}

:deep(.el-popover.stock-popover) {
  min-width: 800px;
  padding: 16px;
}
</style>
