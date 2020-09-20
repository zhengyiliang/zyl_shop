<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage('add')">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template #default="{ row }">{{row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template #default="{ row }">
            <el-button size="mini" icon="el-icon-edit" type="primary"></el-button>
            <el-button
              @click="removeById(row.goods_id)"
              size="mini"
              type="danger"
              icon="el-icon-delete"
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
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 总条数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const res = await this.$axios.get('goods', { params: this.queryInfo })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
      this.$message.success(res._RejMes)
    },
    // 每页显示几条
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.queryInfo.pagesize = 1

      this.getGoodsList()
    },
    // 当前页吗
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 删除商品
    async removeById(ID) {
      // 弹框提示用户是否确认删除
      const confirmRes = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      if (confirmRes !== 'confirm') {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
      const delRes = await this.$axios.delete(`goods/${ID}`)
      if (delRes._RejCode !== 200) return this.$message.error(delRes._RejMes)
      this.getGoodsList()
      this.$message.success(delRes._RejMes)
    },
    // 跳转到添加商品页面
    goAddPage(val, row) {
      let title = ''
      if (val === 'add') {
        title = '添加商品'
      } else {
        title = '修改商品'
      }
      this.$router.push({
        name: 'Add-Edit',
        params: {
          title,
          row
        }
      })
    }
  }
}
</script>
