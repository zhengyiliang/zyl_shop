<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 第二步：为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="height:520px;"></div>
    </el-card>
  </div>
</template>
<script>
// 第一步：导入echarts
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  methods: {
    async getEchartData() {
      const res = await this.$axios.get('reports/type/1')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      return res.data
    }
  },
  // 此时，页面上的元素，已经被渲染完毕了
  async mounted() {
    // 第三步：基于准备好的 DOM，初始化 echarts 实例
    var myChart = echarts.init(document.getElementById('main'))
    // 第四步： 基于准备好的dom，初始化echarts实例
    const option = await this.getEchartData()
    console.log(option)
    const Result = _.merge(option, this.options)
    // 第五步：使用刚指定的配置项和数据显示图表。
    myChart.setOption(Result)
  }
}
</script>
<style lang="scss" scoped>
</style>
