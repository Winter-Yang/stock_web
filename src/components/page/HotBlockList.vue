<template>
  <div class="hot-block-list">
    <el-card class="block-card">
      <template #header>
        <div class="block-header">
          <h3>热门板块涨跌幅</h3>
          <el-radio-group v-model="timeRange" @change="fetchBlockData">
            <el-radio-button label="con">连续上涨</el-radio-button>
            <el-radio-button label="day">日榜</el-radio-button>
            <el-radio-button label="week">周榜</el-radio-button>
            <el-radio-button label="month">月榜</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table
        :data="blockList"
        style="width: 100%"
        height="calc(100vh - 180px)"
        :virtual-scrolling="true"
        :row-height="54"
        border
      >
        <!-- 动态生成日期列 -->
        <el-table-column 
          v-for="date in dateList" 
          :key="date" 
          :prop="date" 
          :label="formatDate(date)"
          width="100" 
          align="center"
        >
          <template #default="scope">
            <span 
              :class="{ 
                'up-percent': scope.row[date] > 0, 
                'down-percent': scope.row[date] < 0,
                'continuous-up': isContinuousUp(scope.row, date)
              }"
            >
              {{ formatPercent(scope.row[date]) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { fetchHotBlocks } from "../models/hotBlockModel";

export default {
  name: 'HotBlockList',
  setup() {
    const blockList = ref([])
    const dateList = ref([])
    const timeRange = ref('con')
    const loading = ref(false)

    // 格式化日期显示
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    // 格式化百分比
    const formatPercent = (value) => {
      if (value === null || value === undefined) return '-'
      return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`
    }

    // 判断是否连续三日上涨
    const isContinuousUp = (block, currentDate) => {
      // 获取当前日期在日期列表中的索引
      const currentIndex = dateList.value.indexOf(currentDate)
      if (currentIndex < 2) return false // 需要至少3天数据才能判断连续上涨
      
      // 获取连续三天的日期
      const threeDays = dateList.value.slice(currentIndex - 2, currentIndex + 1)
      
      // 检查这三天是否都是上涨
      return threeDays.every(date => block[date] > 0)
    }

    // 处理板块数据，转换为表格需要的格式
    const processBlockData = (dailyDataList) => {
      // 提取所有日期
      const dates = dailyDataList.map(day => day.date)
      dateList.value = dates
      
      // 创建板块映射，用于合并相同板块的不同日期数据
      const blockMap = {}
      
      // 处理每一天的数据
      dailyDataList.forEach(dayData => {
        const date = dayData.date
        
        // 处理每个板块
        dayData.block_list.forEach(block => {
          if (!blockMap[block.code]) {
            blockMap[block.code] = {
              code: block.code,
              name: block.name,
              market: block.market,
              type: block.type
            }
          }
          
          // 添加该日期的涨跌幅
          blockMap[block.code][date] = parseFloat(block.zf)
        })
      })
      
      // 转换为数组
      return Object.values(blockMap)
    }

    // 获取板块数据
    const fetchBlockData = async () => {
      loading.value = true
      try {
        const dailyDataList = await fetchHotBlocks(timeRange.value)
        blockList.value = processBlockData(dailyDataList)
      } catch (error) {
        console.error('获取板块数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchBlockData()
    })

    return {
      blockList,
      dateList,
      timeRange,
      loading,
      formatDate,
      formatPercent,
      isContinuousUp,
      fetchBlockData
    }
  }
}
</script>

<style scoped>
.hot-block-list {
  padding: 12px;
  height: 100%;
}

.block-card {
  height: calc(100% - 24px);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.up-percent {
  color: #f56c6c;
}

.down-percent {
  color: #67c23a;
}

.continuous-up {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}
</style>