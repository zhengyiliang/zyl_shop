<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="mgtb-20">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            style="width: 320px;"
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{ value: 'cat_id', label: 'cat_name', children: 'children', expandTrigger: 'hover'}"
            @change="cateAndTabChanged"
            clearable
            filterable
            popper-class="cascader-height"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="cateAndTabChanged">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            :disabled="isBtnDisable"
            type="primary"
            size="mini"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <template v-for="(item, index) in row.attr_vals">
                  <el-tag
                    @close="handleClose(row, index)"
                    closable
                    class="mgtblr-10"
                    v-if="item"
                    :key="item.cat_id"
                  >{{item}}</el-tag>
                </template>
                <!-- 动态添加tag标签 -->
                <el-input
                  style="width: 100px;"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="delParams(row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            :disabled="isBtnDisable"
            type="primary"
            size="mini"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <template v-for="(item, index) in row.attr_vals">
                  <el-tag
                    @close="handleClose(row, index)"
                    closable
                    class="mgtblr-10"
                    v-if="item"
                    :key="item.cat_id"
                  >{{item}}</el-tag>
                </template>
                <!-- 动态添加tag标签 -->
                <el-input
                  style="width: 100px;"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="delParams(row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      @close="addDialogClosed"
      :title="`添加${titleDialog}`"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" ref="addFormRef" label-width="100px">
        <el-form-item
          :label="titleDialog"
          prop="attr_name"
          :rules="{required: true, message: `请输入${titleDialog}`, trigger: 'blur'}"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      @close="editDialogClosed"
      :title="`修改${titleDialog}`"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" ref="editFormRef" label-width="100px">
        <el-form-item
          :label="titleDialog"
          prop="attr_name"
          :rules="{required: true, message: `请输入${titleDialog}`, trigger: 'blur'}"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      }, // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 控制按钮与文本框的切换形式
      inputVisible: false,
      // 文本框输入的内容
      inputValue: ''
    }
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const res = await this.$axios.get('categories')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.cateList = res.data
    },
    // 级联选择框选中项变化会触发
    // tab 页签点击事件的处理函数
    async cateAndTabChanged() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类的id，和当前所处的面板，获取对应参数
      const res = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      console.log(res.data)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.split(' ')
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框的输入
        item.inputValue = ''
      })
      // 把接口返回的数据给不同的表格
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const res = await this.$axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res._RejCode !== 201) return this.$message.error(res._RejMes)
        this.cateAndTabChanged()
        this.addDialogVisible = false
        this.$message.success(res._RejMes)
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialog(row) {
      console.log(this.editForm)

      // 查询当前参数的信息
      const res = await this.$axios.get(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件重置表单
    editDialogClosed() {
      console.log(this.editForm)
      this.$refs.editFormRef.resetFields()
      this.editForm.attr_name = ''
    },
    // 点击edit按钮修改参数
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const res = await this.$axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.editForm.attr_vals
          }
        )
        if (res._RejCode !== 200) return this.$message.error(res._RejMes)
        this.cateAndTabChanged()
        this.editDialogVisible = false
        this.$message.success(res._RejMes)
      })
    },
    // 根据id删除对应参数
    async delParams(row) {
      // 弹框提示用户是否确认删除
      const confirmRes = await this.$confirm(
        `此操作将永久删除该${this.titleDialog}, 是否继续?`,
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
      const delRes = await this.$axios.delete(
        `categories/${this.cateId}/attributes/${row.attr_id}`
      )
      if (delRes._RejCode !== 200) return this.$message.error(delRes._RejMes)
      this.cateAndTabChanged()
      this.$message.success(delRes._RejMes)
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点或按enter事件
    async handleInputConfirm(row) {
      // 如果用户没有输入内容失去焦点，则重置
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入了内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求保存操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 操作，保存到数据库中
    async saveAttrVals(row) {
      const res = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.$message.success(res._RejMes)
    },
    // 删除对应参数的可选项
    handleClose(row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，反之false
    isBtnDisable() {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length == 3) return this.selectedCateKeys[2]
      return null
    },
    // 对话框标题
    titleDialog() {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
