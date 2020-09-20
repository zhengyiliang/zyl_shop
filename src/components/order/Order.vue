<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @clear="getOrderList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template #default="{ row }">
            <el-tag v-if="row.pay_status === '1'" type="success" size="mini">已付款</el-tag>
            <el-tag v-else type="danger" size="mini">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template #default="{ row }">{{row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button @click="showBox(row)" size="mini" icon="el-icon-edit" type="primary"></el-button>
            <el-button
              @click="showProgressBox(row)"
              size="mini"
              icon="el-icon-location"
              type="success"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog @close="addressDialogClosed" title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县：" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            clearable
            filterable
            popper-class="cascader-height"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址：" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度对话框 -->
    <el-dialog title="物流信息" :visible.sync="progressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 订单总数
      total: 0,
      // 控制修改地址对话框
      addressVisible: false,
      // 修改地址
      addressForm: {
        address1: '',
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'change' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData,
      progressVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单数据列表
    async getOrderList() {
      const res = await this.$axios.get('orders', {
        params: this.queryInfo
      })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示几条
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.queryInfo.pagesize = 1
      this.getOrderList()
    },
    // 当前页吗
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getOrderList()
    },
    // 展示修改地址对话框
    showBox(row) {
      this.addressVisible = true
    },
    // 监听修改地址对话框关闭事件
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 物流信息对话框
    async showProgressBox(row) {
      const res = await this.$axios.get('/kuaidi/1106975712662')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.progressInfo = res.data
      console.log(res.data)
      this.progressVisible = true
    }
  }
}
</script>
