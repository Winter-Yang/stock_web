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
        border
        :row-class-name="getRowClassName"
      >
        <!-- 排名列 -->
        <el-table-column
          label="排名"
          width="60"
          align="center"
          fixed="left"
        >
          <template #default="scope">
            <span class="rank-badge" :class="getRankClass(scope.$index)">
              {{ scope.$index + 1 }}
            </span>
          </template>
        </el-table-column>

        <!-- 日期列 -->
        <el-table-column
          v-for="date in dates"
          :key="date"
          :label="formatDate(date)"
          min-width="110"
          align="center"
        >
          <template #default="scope">
            <template v-if="scope.row[date]">
              <div class="block-name" :class="{'continuous-up': isTopRankBlock(scope.row[date].name)}">
                {{ scope.row[date].name }}
              </div>
              <div class="block-change">+{{ scope.row[date].price }}%</div>
            </template>
            <template v-else class="empty-cell">-</template>
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

    const dates = computed(() => Object.keys(rawData.value))

    const tableData = computed(() => {
      const result = []
      const maxRows = 20

      for (let i = 0; i < maxRows; i++) {
        const rowData = {}
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

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}-${date.getDate()}`
    }

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

    const getTopRankBlocks = computed(() => {
      const topBlocks = new Set()
      dates.value.forEach(date => {
        if (rawData.value[date] && rawData.value[date].length > 0) {
          topBlocks.add(rawData.value[date][0].name)
        }
      })
      return topBlocks
    })

    const isTopRankBlock = (blockName) => {
      return getTopRankBlocks.value.has(blockName)
    }

    const getRankClass = (index) => {
      if (index === 0) return 'rank-1'
      if (index === 1) return 'rank-2'
      if (index === 2) return 'rank-3'
      return ''
    }

    return {
      dates,
      tableData,
      loading,
      formatDate,
      isTopRankBlock,
      getRankClass
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

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  background-color: #f0f2f5;
}

.rank-badge.rank-1 {
  color: #fff;
  background-color: #f56c6c;
}

.rank-badge.rank-2 {
  color: #fff;
  background-color: #e6a23c;
}

.rank-badge.rank-3 {
  color: #fff;
  background-color: #f0a500;
}

.block-name {
  font-size: 14px;
  margin-bottom: 4px;
  color: #303133;
}

.block-change {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.continuous-up {
  font-weight: 700;
}

:deep(.el-table th) {
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-table__row) {
  background-color: transparent !important;
}

:deep(.el-table__row:nth-child(even)) {
  background-color: #fafbfc !important;
}

:deep(.el-table td) {
  padding: 10px 0;
}
</style>
