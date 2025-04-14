<template>
  <div class="stock-k-line">
    <div ref="chartRef" class="k-line-chart"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted,watch } from 'vue'
import * as echarts from 'echarts'
import { fetchKLineData } from '../models/klineModel'

export default {
  name: 'StockKLineChart',
  props: {
    stockCode: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const chartRef = ref(null)
    let chart = null

    const upColor = '#CA4948'
    const upBorderColor = '#CA4948'
    const downColor = '#57A870'
    const downBorderColor = '#57A870'

    // 将 testData 替换为异步获取数据
    const getKLineData = async () => {
      try {
        const data = await fetchKLineData(props.stockCode)
        return data
      } catch (error) {
        console.error('获取K线数据失败:', error)
        return []
      }
    }

    const splitData = (rawData) => {
      const categoryData = []
      const values = []
      for (let i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i]['timestamp'])
        values.push([
          rawData[i]['open'],
          rawData[i]['close'],
          rawData[i]['high'],
          rawData[i]['low']
        ])
      }
      return {
        categoryData,
        values
      }
    }

    const calculateMA = (dayCount, data) => {
      const result = []
      for (let i = 0; i < data.values.length; i++) {
        if (i < dayCount) {
          result.push('-')
          continue
        }
        let sum = 0
        for (let j = 0; j < dayCount; j++) {
          sum += +data.values[i - j][1]
        }
        result.push((sum / dayCount).toFixed(2))
      }
      return result
    }

    const initChart =async () => {
        if (!chartRef.value) return


        chart = echarts.init(chartRef.value,null, {width: 1100,height: 340});
        const klineData = await getKLineData()
        const data = splitData(klineData)
        const option = {
        title: {
          left: 0
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['日K', 'MA5', 'MA60']
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '20%'
        },
        xAxis: {
          type: 'category',
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: { show: true }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 40,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 40,
            end: 100
          }
        ],
        series: [
          {
            name: '日K',
            type: 'candlestick',
            data: data.values,
            itemStyle: {
              color: upColor,
              color0: downColor,
              borderColor: upBorderColor,
              borderColor0: downBorderColor
            },
            markPoint: {
              data: [
                {
                  name: 'highest value',
                  type: 'max',
                  valueDim: 'highest',
                  symbolOffset:['0%','-20%']
                },
                {
                  name: 'lowest value',
                  type: 'min',
                  valueDim: 'lowest',
                  symbolOffset:['0%','-10%']
                }
              ],
              itemStyle: {
                    color: '#FF7F24' // 标记点的颜色
                    }
            },
            markLine: {
              symbol: ['true', 'true'],
              data: [
                {
                  name: 'min line on close',
                  type: 'min',
                  valueDim: 'close'
                },
                {
                  name: 'max line on close',
                  type: 'max',
                  valueDim: 'close'
                }
              ]
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5, data),
            symbolSize: 0,
            lineStyle: { opacity: 1 ,color: '#E69542'}
          },
          {
            name: 'MA60',
            type: 'line',
            data: calculateMA(60, data),
            smooth: true,
            symbolSize: 0,
            lineStyle: { opacity: 1 ,color: '#5CC9e1'}
          }
        ]
        }

        chart.setOption(option)
    }

    watch(() => props.stockCode, () => {
      if (chart) {
        initChart()
      }
    })

    onMounted(() => {
      initChart()
    })

    onUnmounted(() => {
      if (chart) {
        chart.dispose()
        chart = null
      }
    })

    return {
      chartRef
    }
  }
}
</script>

<style scoped>
.stock-k-line {
  width: 100%;
  height: 100%;
}

.k-line-chart {
  width: 100%;
  height: 350px;
}
</style>