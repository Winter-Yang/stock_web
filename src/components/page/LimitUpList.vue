<template>
  <div class="limit-up-list">
    <el-table
      :data="stockList"
      style="width: 100%"
      :row-class-name="tableRowClassName"
      height="calc(100vh - 100px)"
      :virtual-scrolling="true"
      :row-height="54"
    >
      <el-table-column type="index" label="序号" width="50" align="center"/>
      <el-table-column label="股票名称" width="100" align="center">
        <template #default="scope">
          <div class="stock-name">
            <div :class="['stock-code-name', {'red-code': scope.row.symbol.startsWith('300')}]">
                {{ scope.row.stock_chi_name }}
            </div>
            <div :class="['stock-code', {'red-code': scope.row.symbol.startsWith('300')}]">
              {{ scope.row.symbol }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="理由分析" width="300" align="center">
        <template #default="scope">
          <div class="reason">
            <span class="tag">{{ getFirstTag(scope.row) }}</span>
            <span class="reason-text">{{ scope.row.surge_reason.stock_reason }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="最新价" width="100" align="center"/>
      <el-table-column label="涨跌幅" width="100" align="center">
        <template #default="scope">
          <span class="up-percent">+{{ (scope.row.change_percent * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="buy_lock_volume_ratio" label="封单比" width="100" align="center">
        <template #default="scope">
          {{ (scope.row.buy_lock_volume_ratio * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column prop="turnover_ratio" label="换手率" width="100" align="center">
        <template #default="scope">
          {{ (scope.row.turnover_ratio * 100).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="流通市值" width="100" align="center">
        <template #default="scope">
          {{ (scope.row.non_restricted_capital / 100000000).toFixed(1) }}亿
        </template>
      </el-table-column>
      <el-table-column label="总市值" width="92" align="center">
        <template #default="scope">
          {{ (scope.row.total_capital / 100000000).toFixed(1) }}亿
        </template>
      </el-table-column>
      <el-table-column label="首次封板" width="100" align="center">
        <template #default="scope">
          {{ formatTime(scope.row.first_limit_up) }}
        </template>
      </el-table-column>
      <el-table-column 
        label="最后封板" 
        width="100" 
        align="center"
        sortable
        :sort-method="sortByLastLimitUp"
      >
        <template #default="scope">
          {{ formatTime(scope.row.last_limit_up) }}
        </template>
      </el-table-column>
      <el-table-column prop="limit_up_days" label="连板" width="80" align="center">
        <template #default="scope">
            {{ scope.row.limit_up_days === 1 ? '首板' : scope.row.limit_up_days + '连板' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { fetchLimitUpStocksDaily } from '../models/limitUpModel'

export default {
  name: 'LimitUpList',
  setup() {
    const stockList = ref([])

    const getFirstTag = (row) => {
      if (row.surge_reason?.related_plates?.length > 0) {
        return row.surge_reason.related_plates[0].plate_name
      }
      return ''
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    }

    const tableRowClassName = () => {
      return 'stock-row'
    }

    // 按最后封板时间排序
    const sortByLastLimitUp = (a, b) => {
      // 处理空值情况
      if (!a.last_limit_up) return 1;
      if (!b.last_limit_up) return -1;
      
      // 时间戳直接比较大小
      return a.last_limit_up - b.last_limit_up;
    }

    onMounted(async () => {
      try {
        stockList.value = await fetchLimitUpStocksDaily()
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    })

    return {
      stockList,
      getFirstTag,
      formatTime,
      tableRowClassName,
      sortByLastLimitUp
    }
  }
}
</script>

<style scoped>
.limit-up-list {
  height: 100%;
}

.stock-name {
  display: flex;
  flex-direction: column;
}

.stock-code-name {
  font-size: 14px;
  color: #333;
}

.stock-code {
  font-size: 12px;
  color: #333;
}



.red-code {
  color: #f56c6c;
}


.reason {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: flex-start;
  text-align: left;
  gap: 4px;
  padding: 0 8px;
}

.reason-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.6;
  flex: 1;
  min-width: 0;
}

.tag {
  color: #409eff;
  font-size: 12px;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 1.6;
}

.up-percent {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.stock-row) {
  cursor: pointer;
}

:deep(.stock-row:hover) {
  background-color: #f5f7fa;
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