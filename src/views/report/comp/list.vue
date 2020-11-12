<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="权属人" prop="owner">
        <el-input
          v-model="queryParams.owner"
          placeholder="请输入权属人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地块编号" prop="elementsNum">
        <el-input
          v-model="queryParams.elementsNum"
          placeholder="请输入地块编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['plotting:elements:export']"
        >导出</el-button>
      </el-col>
       <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['plotting:elements:remove']"
        >删除</el-button>
      </el-col>
    </el-row>
    <el-table height="486px" v-loading="loading" :data="elementsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="地块编号" align="center" prop="elementsNum" />
      <el-table-column label="地块名称" align="center" prop="elementsName" />
      <el-table-column label="坐落位置描述" align="center" prop="locationDescription" />
      <el-table-column label="权属人" align="center" prop="owner" />
      <el-table-column label="地块面积" align="center" prop="plotArea">
        <template slot-scope="scope">{{scope.row.plotArea|fixed}}</template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="creatTime" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {
  listElements,
  getElements,
  delElements,
  addElements,
  updateElements,
  exportElements
} from "@/api/plotting/elements";

export default {
  props:["id"],
  name: "Elements",
  filters:{
    fixed(val){
      return val.toFixed(2)
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 报告标绘元素
      elementsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        plottingId: undefined,
        reportId: this.id,
        elementsType: undefined,
        massifId: undefined,
        elementsName: undefined,
        location: undefined,
        locationDescription: undefined,
        centralPoint: undefined,
        owner: undefined,
        plotArea: undefined,
        creatTime: undefined,
        creatUser: undefined,
        updateUser: undefined,
        lay1: undefined,
        lay2: undefined,
        lay3: undefined,
        lay4: undefined,
        lay5: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询报告标绘元素
列表 */
    getList() {
      this.loading = true;
      listElements(this.queryParams).then(response => {
        this.elementsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        plottingId: undefined,
        reportId: this.id,
        elementsType: undefined,
        massifId: undefined,
        elementsName: undefined,
        location: undefined,
        locationDescription: undefined,
        centralPoint: undefined,
        owner: undefined,
        plotArea: undefined,
        creatTime: undefined,
        updateTime: undefined,
        creatUser: undefined,
        updateUser: undefined,
        lay1: undefined,
        lay2: undefined,
        lay3: undefined,
        lay4: undefined,
        lay5: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加报告标绘元素";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getElements(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改报告标绘元素";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateElements(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addElements(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除报告标绘元素编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delElements(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有报告标绘元素数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportElements(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>