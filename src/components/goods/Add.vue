<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert center show-icon title="添加商品信息" type="info" :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        align-center
        class="mgtb-20"
        :space="200"
        :active="activeIndex*1"
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        class="add-goods-form"
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-tabs
          @tab-click="tabClicked"
          :before-leave="beforeTabLeave"
          v-model="activeIndex"
          tab-position="left"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                @change="cateChanged"
                clearable
                filterable
                popper-class="cascader-height"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              label-width="100%"
              class="many-form-item"
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <template v-for="(cb,i) in item.attr_vals">
                  <el-checkbox size="mini" border :label="cb" v-if="cb" :key="i"></el-checkbox>
                </template>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              label-width="30%"
              :label="`${item.attr_name}：`"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="ajaxHeader"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="mgtp-20" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" />
      <span slot="footer" class="previewImg">
        <el-button @click="previewDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="previewDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条当前激活index
      activeIndex: '0',
      // 添加商品表单
      addForm: {
        // 商品名称
        goods_name: '',
        // 商品价格
        goods_price: '',
        // 商品重量
        goods_weight: '',
        // 商品数量
        goods_number: '',
        // 商品分类
        goods_cat: [],
        // 图片上传的临时路径
        pics: [],
        // 商品描述
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单校验
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/upload',
      // 图片上传组件的headers请求头对象
      ajaxHeader: {
        Authorization: window.sessionStorage.getItem('_tokenName')
      },
      // 图片预览地址
      previewPath: '',
      // 图片预览框显示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    // 获取所有商品分类数据
    this.getCateList()
  },
  computed: {
    // 分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      // get 请求上送字段是 params!!!
      const res = await this.$axios.get('categories')
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      console.log(res.data)
      // 把数据列表给 cateList
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择事件
    cateChanged() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    validPromise(prop) {
      return new Promise((resolve) => {
        this.$refs.addFormRef.validateField(prop, (valid) => {
          if (!valid) {
            resolve(true)
          }
        })
      })
    },
    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。s
    async beforeTabLeave(activeName, oldActiveName) {
      console.log('即将离开的标签页名字是：', oldActiveName)
      console.log('即将进入的标签页名字是：', activeName)
      // var shiftTab = false
      const pArray = []
      pArray.push(await this.validPromise('goods_name'))
      pArray.push(await this.validPromise('goods_price'))
      pArray.push(await this.validPromise('goods_weight'))
      pArray.push(await this.validPromise('goods_number'))
      pArray.push(await this.validPromise('goods_cat'))
      // return pArray.every((item) => item)
    },
    // 获取动态参数静态属性
    async getParamsData(params) {
      const res = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: params }
        }
      )
      if (res._RejCode !== 200) return this.$message.error(res._RejMes)
      return Promise.resolve(res.data)
    },
    // 点击商品参数面板
    async tabClicked() {
      console.log(this.activeIndex)
      // 证明访问动态参数面板
      if (this.activeIndex === '1') {
        console.log('动态参数面板')
        const many = await this.getParamsData('many')
        console.log(many)
        many.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = many
      } else if (this.activeIndex === '2') {
        // 静态属性面板
        const only = await this.getParamsData('only')
        console.log(only)
        this.onlyTableData = only
      }
    },
    // 处理上传图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file, fileList) {
      console.log(file)
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex((item) => {
        return item.pic === filePath
      })
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 文件上传成功的钩子
    handleSuccess(response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      // 2. 将图片信息对象，push到pics数组
      this.addForm.pics.push({ pic: response.data.tmp_path })
      console.log(this.addForm.pics)
    },
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        console.log('添加成功')
        // 深拷贝
        const obj = _.cloneDeep(this.addForm)
        obj.goods_cat = obj.goods_cat.join(',')
        // this.$axios.post('goods')
        console.log(this.addForm)
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          obj.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          obj.attrs.push(newInfo)
        })
        console.log(this.addForm, obj)
        // 发起请求，添加商品
        const res = await this.$axios.post('goods', obj)
        if (res._RejCode !== 201) return this.$message.error(res._RejMes)
        this.$message.success(res._RejMes)
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang="scss" >
.add-goods-form {
  .el-input {
    width: 380px;
  }
  .many-form-item {
    display: flex;
    flex-direction: column;
    .el-form-item__label {
      text-align: left !important;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .el-checkbox {
      margin: 0 10px 0 0 !important;
    }
  }
}
.previewImg {
  width: 100%;
}
</style>
