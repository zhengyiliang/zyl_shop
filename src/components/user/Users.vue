<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" width="50" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-switch v-model="row.mg_state" @change="userStateChange(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <!-- 修改按钮 -->
            <el-button @click="showEditDialog(row)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button @click="setRole(row)" type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      class="adduser-dialog"
      @close="addDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名：" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机：" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      class="adduser-dialog"
      @close="editDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名：">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机：" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      @close="setRoleDialogClosed"
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      class="adduser-dialog"
    >
      <!-- 内容主题区域 -->
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{ userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户列表得参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表
      userList: [],
      // 用户总数
      total: 0,
      // 控制添加用户对话框得显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户得表单数据
      addForm: {
        // 用户名
        username: '',
        // 密码
        password: '',
        // 邮箱
        email: '',
        // 手机
        mobile: ''
      },
      // 添加用户得表单校验
      addRules: {
        // 用户名表单校验
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        // 密码表单校验
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        // 邮箱表单校验
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/,
            message: '邮箱格式不正确',
            trigger: 'blur'
          }
        ],
        // 手机表单校验
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          {
            pattern: /^(0|86|17951)?(13[0-9]|15[0123456789]|17[5678]|18[0-9]|14[57])[0-9]{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur'
          }
        ]
      },
      // 修改用户得表单数据
      editForm: {},
      // 添加用户得表单校验
      editRules: {
        // 邮箱表单校验
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/,
            message: '邮箱格式不正确',
            trigger: 'blur'
          }
        ],
        // 手机表单校验
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          {
            pattern: /^(0|86|17951)?(13[0-9]|15[0123456789]|17[5678]|18[0-9]|14[57])[0-9]{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur'
          }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色数据列表
      rolesList: [],
      // 选中的新角色的id值
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const res = await this.$axios.get('users', { params: this.queryInfo })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 一页显示多少条数据
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    // 当前页数，当前在第几页
    handleCurrentChange(curPage) {
      this.queryInfo.pagenum = curPage
      this.getUserList()
    },
    // 监听状态开关改变
    async userStateChange(row) {
      const res = await this.$axios.put(`users/${row.id}/state/${row.mg_state}`)
      if (res._RejCode !== 200) {
        row.mg_state = !row.mg_state
        return this.$message.error(res._RejMes)
      }
      this.$message.success(res._RejMes)
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 监听对话框关闭事件，重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const res = await this.$axios.post('users', this.addForm)
        if (res._RejCode !== 201) return this.$message.error(res._RejMes)
        this.$message.success(res._RejMes)
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 修改按钮 展示编辑用户的对话框
    async showEditDialog(row) {
      const res = await this.$axios.get(`users/${row.id}`)
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮，修改用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户的网络请求
        const res = await this.$axios.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res._RejCode !== 200) this.$message.error(res._RejMes)
        // 关闭弹框
        this.editDialogVisible = false
        // 刷新列表
        this.getUserList()
        // 提示修改成功
        this.$message.success(res._RejMes)
      })
    },
    // 删除用户
    async removeUserById(id) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      const delRes = await this.$axios.delete(`users/${id}`)
      if (delRes._RejCode !== 200) return this.$message.error(delRes._RejMes)
      // 如果用户取消了删除，则返回值为字符串 cancel
      this.$message.success(delRes._RejMes)
      // 刷新列表
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole(row) {
      this.userInfo = row
      // 在展示对话框之前，获取所有角色的列表
      const res = await this.$axios.get('roles')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击确定按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const res = await this.$axios.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.$message.success(res._RejMes)
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色的对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
  created() {
    // 获取用户列表
    this.getUserList()
  }
}
</script>

<style lang="scss" >
.adduser-dialog {
  .el-dialog {
    min-width: 520px;
  }
  .el-dialog__body {
    padding-left: 100px;
    padding-right: 100px;
  }
}
</style>
