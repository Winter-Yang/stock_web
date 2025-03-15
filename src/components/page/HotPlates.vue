<template>
  <div class="hot-plates">
    <!-- 题材概览区域 -->
    <el-card class="theme-overview">
      <template #header>
        <div class="theme-header">
          <span>最强题材</span>
        </div>
      </template>
      <el-table :data="plateGroups" size="small" style="width: 100%">
        <el-table-column width="50">
          <template #default="{ $index }">
            <span class="theme-number">{{ ($index + 1).toString().padStart(2, '0') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="plateName" label="板块名称" width="200" />
        <el-table-column label="涨停数量" width="80">
          <template #default="{ row }">
            <el-tag size="small" type="primary">[{{ row.stocks.length }}]</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="板块逻辑" />
      </el-table>
    </el-card>

    <!-- 板块详情区域 -->
    <el-card v-for="(group, index) in plateGroups" :key="index" class="plate-group">
      <template #header>
        <div class="plate-title">
          {{ index + 1 }} - {{ group.plateName }} [{{ group.stocks.length }}] 家 板块逻辑：{{ group.description || '无' }}
        </div>
      </template>
      
      <el-table :data="group.stocks" size="small" style="width: 100%">
        <el-table-column prop="symbol" label="代码" width="90" align="center"/>
        <el-table-column prop="stock_chi_name" label="名称" width="90" align="center"/>
        <el-table-column label="涨幅" width="90" align="center">
          <template #default="{ row }">
            <span class="red-text">{{ formatChange(row.change_percent) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总市值" width="90" align="center">
          <template #default="{ row }">
            {{ formatVolume(row.total_capital) }}亿
          </template>
        </el-table-column>
        <el-table-column label="换手率" width="90" align="center">
          <template #default="{ row }">
            {{ (row.turnover_ratio * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="首封板" width="100">
          <template #default="{ row }">
            {{ formatTime(row.first_limit_up) }}
          </template>
        </el-table-column>
        <el-table-column label="终封板" width="100">
          <template #default="{ row }">
            {{ formatTime(row.last_limit_up) }}
          </template>
        </el-table-column>
        <el-table-column label="连板" width="100">
          <template #default="{ row }">
            <el-tag :type="row.limit_up_days === 1 ? 'info' : 'danger'" size="small">
              {{ lianban(row)}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="涨停原因" min-width="200">
          <template #default="{ row }">
            {{ row.surge_reason?.stock_reason || '无' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { fetchLimitUpStocksDaily } from '../models/limitUpModel'

export default {
  name: 'HotPlates',
  setup() {
    const plateGroups = ref([])

    const initPlateGroups = (stocks) => {
      // 按板块 ID 分组
        const groups = {};
        stocks.forEach(stock => {
            stock.surge_reason?.related_plates?.forEach(plate => {
                if (!groups[plate.plate_name]) {
                    groups[plate.plate_name] = {
                        plateName: plate.plate_name,
                        stocks: [],
                        description: plate.plate_reason || '无',
                    };
                }
                groups[plate.plate_name].stocks.push(stock);
            });
        });

        // 自定义排序逻辑
        const customSort = (a, b) => {
            // 根据 `lianban` 逻辑解析
            const parseLianbanValue = (row) => {
                if (row.limit_up_days === row.m_days_n_boards_days && 
                    row.m_days_n_boards_days === row.m_days_n_boards_boards) {
                    return row.limit_up_days; // 连板数量
                }
                if (row.limit_up_days === 1 && row.m_days_n_boards_days === 0) {
                    return 0.5; // 首板赋予较小的排序权重
                }
                if (row.m_days_n_boards_days > row.m_days_n_boards_boards) {
                    return row.m_days_n_boards_boards + (row.m_days_n_boards_days * 0.1); // 天数优先级
                }
                return -1; // 错误返回最低权重
            };

            // 比较排位
            return parseLianbanValue(b) - parseLianbanValue(a);
        };

        // 转换为数组并排序
        plateGroups.value = Object.values(groups)
            .sort((a, b) => b.stocks.length - a.stocks.length) // 根据分组内股票数量排序
            .map(group => ({
                ...group,
                stocks: group.stocks.sort(customSort), // 自定义排序每个分组内的股票
            }));
    };
    const formatChange = (change) => {
      return `${(change * 100).toFixed(2)}%`
    }

    const formatVolume = (volume) => {
      return (volume / 100000000).toFixed(2)
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return '--'
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    }


    const lianban = (row) => {
        if(row.limit_up_days == row.m_days_n_boards_days && row.m_days_n_boards_days == row.m_days_n_boards_boards){
            return row.limit_up_days+'连板'
        }
        if(row.limit_up_days == 1 && row.m_days_n_boards_days==0){
          return "首板"
        }
        if(row.m_days_n_boards_days > row.m_days_n_boards_boards ){
          return row.m_days_n_boards_days+"天"+row.m_days_n_boards_boards+"板"
        }
        return "Error"

    }
    const lianbanType = (row) => {
        if(row.limit_up_days == row.m_days_n_boards_days && row.m_days_n_boards_days == row.m_days_n_boards_boards){
            return 'danger'
        }
        if(row.m_days_n_boards_days > row.m_days_n_boards_boards ){
          return 'danger'
        }
        return "info"

    }

    onMounted(async () => {
      try {
        const stocks = await fetchLimitUpStocksDaily()
        initPlateGroups(stocks)
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    })

    return {
      plateGroups,
      formatChange,
      formatVolume,
      formatTime,
      lianban,
      lianbanType
    }
  }
}
</script>

<style scoped>


.theme-overview {
  margin-bottom: 20px;
}

.theme-header {
  display: flex;
  font-size: 13px;
  font-weight: 500;
}

.plate-group {
  margin-bottom: 12px;
}

.plate-title {
  font-size: 14px;
  font-weight: 500;
}

.theme-number {
  color: #f56c6c;
  font-weight: 500;
}

.red-text {
  color: #f56c6c;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  background: #f5f7fa;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f5f7fa;
  font-size: 13px;
}

:deep(.el-table--small) {
  font-size: 12px;
}
</style>