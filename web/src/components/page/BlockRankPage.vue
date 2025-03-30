<template>
  <div class="block-rank">
    <el-card class="rank-card">
      <template #header>
        <div class="rank-header">
          <h3>板块排行</h3>
        </div>
      </template>

      <el-table
        :data="tableData"
        style="width: 100%"
        height="calc(100vh - 180px)"
        :virtual-scrolling="true"
        :row-height="54"
        border
      >
        <!-- 日期列 -->
        <el-table-column 
          v-for="date in dates" 
          :key="date"
          :label="formatDate(date)"
          min-width="100"
          align="center"
        >
          <template #default="scope">
            <template v-if="scope.row[date]">
              <div class="block-name" :class="{'continuous-up': isTopRankBlock(scope.row[date].name)}">
                {{ scope.row[date].name }}
              </div>
              <div class="block-price" :class="{'up-percent': scope.row[date].price > 5000}">
                {{ scope.row[date].price }}
              </div>
            </template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        
        
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { fetchBlockRank } from '../models/blockRankModel'

export default {
  name: 'BlockRankPage',
  setup() {
    const rawData = ref({})
    const loading = ref(false)

    // 获取所有日期
    const dates = computed(() => Object.keys(rawData.value))

    // 处理数据为表格格式
    const tableData = computed(() => {
      const result = []
      const maxRows = 20 // 显示前20行数据

      // 为每一行创建数据
      for (let i = 0; i < maxRows; i++) {
        const rowData = {}
        // 填充每个日期的数据
        dates.value.forEach(date => {
          if (rawData.value[date] && rawData.value[date][i]) {
            rowData[date] = {
              name: rawData.value[date][i].name,
              price: rawData.value[date][i].price
            }
          }
        })
        result.push(rowData)
      }
      return result
    })

    // 格式化日期显示
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}-${date.getDate()}`
    }

    // 获取板块数据
    const loadBlockData = async () => {
      loading.value = true
      try {
        const response = await fetchBlockRank()
        if (response) {
          rawData.value = response
        }
      } catch (error) {
        console.error('获取板块排行数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadBlockData()
    })

    // 判断是否连续三天排名增长或不变
    const isContinuousUp = (row, currentDate) => {
      const dateList = dates.value.sort().reverse() // 按日期倒序排列
      const currentIndex = dateList.indexOf(currentDate)
      
      // 如果当前日期后面没有足够的历史数据，返回false
      if (currentIndex > dateList.length - 3) return false
      
      // 获取连续三天的数据
      const day1 = dateList[currentIndex]
      const day2 = dateList[currentIndex + 1]
      const day3 = dateList[currentIndex + 2]
      
      // 如果任何一天数据缺失，返回false
      if (!row[day1] || !row[day2] || !row[day3]) return false
      
      // 获取三天的名称，用于比较是否是同一个板块
      const name1 = row[day1].name
      const name2 = row[day2].name
      const name3 = row[day3].name
      
      // 首先确保是同一个板块
      if (name1 !== name2 || name2 !== name3) return false
      
      // 获取三天的排名
      const rank1 = rawData.value[day1].findIndex(item => item.name === name1)
      const rank2 = rawData.value[day2].findIndex(item => item.name === name2)
      const rank3 = rawData.value[day3].findIndex(item => item.name === name3)
      
      // 判断排名是否持平或上升（排名数字越小越好）
      return rank1 <= rank2 && rank2 <= rank3
    }

    // 获取所有日期的第一名板块名称集合
    const getTopRankBlocks = computed(() => {
      const topBlocks = new Set()
      dates.value.forEach(date => {
        if (rawData.value[date] && rawData.value[date].length > 0) {
          topBlocks.add(rawData.value[date][0].name)
        }
      })
      return topBlocks
    })

    // 判断是否为第一名板块
    const isTopRankBlock = (blockName) => {
      return getTopRankBlocks.value.has(blockName)
    }

    return {
      dates,
      tableData,
      loading,
      formatDate,
      isTopRankBlock  // 替换原来的 isContinuousUp
    }
  }
}
</script>

<style scoped>
.block-rank {
  width: 100%;
  height: 100%;
}

.rank-card {
  height: 100%;
}

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rank-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.block-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.block-price {
  font-size: 12px;
  /* color: #dd0e0e; */
}

.up-percent {
  /* color: #f56c6c; */
  font-weight: 500;
  color: #dd0e0e;

}

.down-percent {
  color: #67c23a;
  font-weight: 500;
}

:deep(.el-table th) {
  /* color: #606266; */
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
}
/* 
:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
} */

:deep(.el-table__row) {
  background-color: transparent !important;
}



.continuous-up {
  color: red !important;
  font-weight: bold;
}

.block-name {
  color: #333;
}
</style>