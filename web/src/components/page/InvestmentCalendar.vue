<template>
  <div class="investment-calendar">
    <el-card class="calendar-card">
      <template #header>
        <div class="calendar-header">
          <h3>投资日历</h3>
          <div class="month-selector">
            <el-date-picker
              locale="zhCn"
              v-model="selectedDate"
              type="month"
              placeholder="选择月份"
              format="YYYY年MM月"
              @change="handleMonthChange"
            />
          </div>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="(day, index) in calendarData"
          :key="index"
          :hollow="false"
          :timestamp="formatDate(day.date)"
          placement="top"
          class="custom-timeline-item"
        >
        <el-card>
          <div v-for="(article, articleIndex) in day.list" :key="articleIndex" class="event-item">
            <el-text  :type=getTimelineItemType(article)>
              {{ article.title }}
              <el-tag class="event-tag" effect="dark" type="danger" v-for="(theme, themeIndex) in article.timeline.theme_list" >
                {{ theme.name }}
              </el-tag>
            </el-text>
          </div>
        </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped>

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-item {
  margin-bottom: px;
  padding: 8px 0;
}

.event-item:last-child {
  border-bottom: none;
}

.event-title {
  font-size: 10px;
  color:red;
  margin-bottom: 0px;
}

.event-tags {
  display: flex;
  margin-top: 0px;
}

:deep(.el-timeline-item__node) {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}

:deep(.el-timeline-item.custom-timeline-item) {
  position: relative;
  padding-left: 18px;
}


</style>

<script>
import { ref, onMounted, computed } from 'vue'
import { fetchCalendarData } from '../models/investmentCalendarModel'

export default {
  name: 'InvestmentCalendar',
  setup() {
    const calendarData = ref([])
    const selectedDate = ref(new Date())
    const isLoading = ref(false)

    // 格式化日期显示
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
      return `${month}月${day}日 ${weekday}`
    }

    // 根据日期数据设置时间线项的类型
    const getTimelineItemType = (article) => {

      return 'Default'
    }

    // 处理月份变更
    const handleMonthChange = async () => {
      if (!selectedDate.value) return
      
      const year = selectedDate.value.getFullYear()
      const month = (selectedDate.value.getMonth() + 1).toString().padStart(2, '0'); // 前置补零
      await loadCalendarData(year, month)
    }

    // 加载日历数据
    const loadCalendarData = async (year, month) => {
      isLoading.value = true
      try {
        calendarData.value = await fetchCalendarData(year, month)
      } catch (error) {
        console.error('加载日历数据失败:', error)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(async () => {
      const now = new Date()
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 前置补零
      await loadCalendarData(year,month)
    })

    return {
      calendarData,
      selectedDate,
      isLoading,
      formatDate,
      getTimelineItemType,
      handleMonthChange
    }
  }
}
</script>

<style scoped>


.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.event-card {
  margin-bottom: 12px;
  border-radius: 4px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.event-tags {
  display: flex;
  gap: 6px;
}

.event-tag{
  margin-right: 5px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.event-author {
  font-style: italic;
}

.event-stats {
  display: flex;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-timeline-item__node) {
  z-index: 1;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-card__header) {
  padding: 10px 15px;
}

:deep(.el-card__body) {
  padding: 12px;
}

:deep(.el-timeline) {
  padding-left: 10px;
}
</style>