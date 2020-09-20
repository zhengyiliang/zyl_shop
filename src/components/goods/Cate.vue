<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table
        :data="cateList"
        row-key="cat_id"
        border
        stripe
        :tree-props="{children: 'children'}"
      >
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="是否有效">
          <template #default="{ row }">
            <i class="el-icon-success is-active-icon" v-if="!row.cat_deleted"></i>
            <i class="el-icon-error is-active-icon" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template #default="{ row }">
            <el-tag size="mini" v-if="row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else-if="row.cat_level === 2">三级</el-tag>
            <el-tag size="mini" type="info" v-else>四级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="primary"
              @click="showEditCateDialog(row)"
            >编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delCate(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      @close="addCateDialogClosed"
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectdKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true }"
            @change="parentCateChanged"
            clearable
            filterable
            popper-class="cascader-height"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类的对话框 -->
    <el-dialog
      @close="editCateDialogClosed"
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 商品分类查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据总条数
      total: 0,
      // 控制添加分类的对话框显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类id
        cat_id: 0,
        // 分类的等级，默认添加一级分类
        cat_level: 0,
        // 不能为空，如果要添加1级分类，则父分类Id应该设置为  `0`
        cat_pid: 0
      },
      // 添加分类表单校验
      addCateRules: {
        // 分类名称表单校验
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的符集分类的id数组
      selectdKeys: [],
      // 控制修改分类的显示与隐藏
      editCateDialogVisible: false,
      // 添加分类表单对象
      editCateForm: {
        // 分类名称
        cat_name: ''
      },
      // 添加分类表单校验
      editCateRules: {
        // 分类名称表单校验
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      // get 请求上送字段是 params!!!
      const res = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      console.log(res.data)
      // 把数据列表给 cateList
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.queryInfo.pagenum = 1
      this.getCateList()
    },
    // 监听 pagenum 的改变
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    // 显示添加分类的对话框
    showAddCateDialog() {
      // 先获取符集分类的数据列表
      this.getParentCateList()
      // 再显示弹框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      // get 请求上送字段是 params!!!
      const res = await this.$axios.get('categories', {
        params: { type: 2 }
      })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 父级分类选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectdKeys)
      // 如果 selectdKeys 大于0，证明选中父级分类
      if (this.selectdKeys.length) {
        // 父级分类id
        this.addCateForm.cat_pid = this.selectdKeys[this.selectdKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectdKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        console.log(this.addCateForm)
        const res = await this.$axios.post('categories', this.addCateForm)
        if (res._RejCode !== 201) return this.$message.error(res._RejMes)
        this.$message.success(res._RejMes)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectdKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 修改商品分类名称
    async showEditCateDialog(row) {
      console.log(row.cat_id)
      const res = await this.$axios.get(`categories/${row.cat_id}`)
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 点击按钮修改商品分类名称
    async editCate() {
      const res = await this.$axios.put(
        `categories/${this.editCateForm.cat_id}`,
        {
          cat_name: this.editCateForm.cat_name
        }
      )
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.$message.success(res._RejMes)
      this.getCateList()
      this.editCateDialogVisible = false
    },
    // 监听修改分类对话框关闭事件
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除商品分类
    async delCate(row) {
      // 弹框提示用户是否确认删除
      const confirmRes = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
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
      const delRes = await this.$axios.delete(`categories/${row.cat_id}`)
      if (delRes._RejCode !== 200) return this.$message.error(delRes._RejMes)
      // 如果用户取消了删除，则返回值为字符串 cancel
      console.log(
        this.total % this.queryInfo.pagesize,
        this.total,
        this.queryInfo.pagesize
      )
      this.getCateList()
      this.$message.success(delRes._RejMes)
    }
  }
}
</script>
<style lang="scss">
.is-active-icon {
  color: #00b672;
  font-size: 18px;
}
.el-cascader {
  width: 100%;
}
</style>
