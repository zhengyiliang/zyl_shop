<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <template v-if="row.children.length">
              <el-row
                type="flex"
                align="middle"
                :class="['bdbottom', l1 === 0 ? 'bdtop' : '']"
                v-for="(level1, l1) in row.children"
                :key="level1.id"
              >
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(row, level1.id)">{{level1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                  <!-- 通过 for 循环 嵌套渲染二级权限 -->
                  <el-row
                    type="flex"
                    align="middle"
                    v-for="(level2, l2) in level1.children"
                    :key="level2.id"
                    :class="[l2 === 0 ? '' : 'bdtop']"
                  >
                    <!-- 二级权限列表渲染 -->
                    <el-col :span="6">
                      <el-tag
                        closable
                        type="success"
                        @close="removeRightById(row, level2.id)"
                      >{{level2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        closable
                        type="warning"
                        v-for="level3 in level2.children"
                        :key="level3.id"
                        @close="removeRightById(row, level3.id)"
                      >{{level3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
            <template v-else>
              <div class="no-Rights">暂未分配权限</div>
            </template>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template #default="{ row }">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delRole(row.id)">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <!-- 默认展开所有节点属性 -->
      <!-- default-expand-all -->
      <el-tree
        accordion
        ref="treeRef"
        :data="rightsList"
        :props="treetProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称：" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="editRoleForm"
        :rules="editRoleRules"
        ref="editRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称：" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleConf">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限弹框显示隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treetProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配的权限的角色id
      roleId: '',
      // 控制添加角色弹框的显示与隐藏
      addRoleDialogVisible: false,
      // 控制编辑角色弹框的显示与隐藏
      editRoleDialogVisible: false,
      // 添加角色表单数据
      addRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色表单校验
      addRoleRules: {
        // 角色名称表单校验
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        // 角色描述表单校验
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 编辑角色表单数据
      editRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 编辑角色表单校验
      editRoleRules: {
        // 角色名称表单校验
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        // 角色描述表单校验
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const res = await this.$axios.get('roles')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.rolesList = res.data
    },
    // 根据id删除对应的权限
    async removeRightById(row, rightId) {
      // 弹框提示用户是否确认删除
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
      const delRes = await this.$axios.delete(
        `roles/${row.id}/rights/${rightId}`
      )
      if (delRes._RejCode !== 200) return this.$message.error(delRes._RejMes)
      // 如果用户取消了删除，则返回值为字符串 cancel
      this.$message.success(delRes._RejMes)
      row.children = delRes.data
    },
    // 显示分配权限弹框
    async showSetRightDialog(row) {
      this.roleId = row.id
      // 获取所有权限数据
      const res = await this.$axios.get('rights/tree')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.rightsList = res.data
      this.getLeafKeys(row, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归形式，获取角色下所有三级权限的id，并保存到 defkeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击确定为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const res = await this.$axios.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.getRolesList()
      this.$message.success(res._RejMes)
      this.setRightDialogVisible = false
    },
    // 监听添加角色对话框的关闭事件
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击确定按钮添加角色
    async addRoles() {
      const res = await this.$axios.post('roles', this.addRoleForm)
      if (res._RejCode !== 201) return this.$message.error(res._RejMes)
      this.$message.success(res._RejMes)
      this.getRolesList()
      this.addRoleDialogVisible = false
    },
    // 编辑角色
    async editRole(row) {
      const res = await this.$axios.get(`roles/${row.id}`)
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 点击编辑角色对话框确定按钮修改角色信息
    async editRoleConf() {
      const res = await this.$axios.put(`roles/${this.editRoleForm.roleId}`, {
        roleName: this.editRoleForm.roleName,
        roleDesc: this.editRoleForm.roleDesc
      })
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      this.$message.success(res._RejMes)
      this.getRolesList()
      this.editRoleDialogVisible = false
    },
    // 监听编辑角色对话框的关闭事件
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 删除角色
    async delRole(id) {
      // 弹框提示用户是否确认删除
      const confirmRes = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
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
      const delRes = await this.$axios.delete(`roles/${id}`)
      if (delRes._RejCode !== 200) return this.$message.error(delRes._RejMes)
      // 如果用户取消了删除，则返回值为字符串 cancel
      this.$message.success(delRes._RejMes)
      this.getRolesList()
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>
<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.no-Rights {
  text-align: center;
}
</style>
