<template>
  <div style="height:100%" class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="报告名称" prop="reportName">
        <el-input
          v-model="queryParams.reportName"
          placeholder="请输入报告名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="灌溉季度" prop="quarter">
        <el-select clearable v-model="queryParams.quarter" placeholder="请选择灌溉季度">
          <el-option
            v-for="item in quarter"
            :key="item.value"
            :label="item.dictLabel"
            size="small"
            :value="item.dictValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!--<el-row :gutter="10" class="mb8">
       <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['report:editor:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['report:editor:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:editor:remove']"
        >删除</el-button> -->
      <!-- </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:editor:export']"
        >导出</el-button>
      </el-col> 
    </el-row>-->
    <el-row>
      <div class="item" v-for="(v,i) in editorList" :key=i>
        <el-card shadow="hover" :body-style="{ padding: '0px',width:'300px' }">
     <div @click="draw(v)" style="width: 100%; height: 250px;overflow:hidden">
        <img style="width:100%;margin-left:50%;transform: translateX(-50%);height:250px;cursor: pointer;"
    :src="v.screenshot" />
     </div>
      <div>
        <span class="_title">{{v.report_name}}</span>
        <div class="clearfix">
          <time class="time">{{v.creat_time}}</time>
          <div class="bottom">
            <span>发布人：{{v.creat_user}}</span>
            <el-button icon="el-icon-download" type="text" class="button">下载</el-button>
          </div>
        </div>
      </div>
    </el-card>
      </div>
    </el-row>
    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      :isShowSize="true"
      @pagination="getList"
    /> -->
    <el-row style="position:relative">
      <el-pagination
      style="position:absolute;right:0"
    background
    v-show="total>0"
    layout="prev, pager, next"
    :page-size="queryParams.pageSize"
    :current-page="queryParams.pageNum"
    @current-change="pageChange"
    :total="total">
  </el-pagination>
    </el-row>

    <!-- 添加或修改报告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form class="from" ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="航拍影像" prop="imageUrl">
            <el-select clearable v-model="form.imageUrl">
              <el-option label="123" size="small" value="123"></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="灌溉日期" prop="irrigationDate"  :rules="[{ required: true, message: '请选择灌溉日期', trigger: 'blur' }]">
            <el-date-picker value-format="yyyy-MM-dd" clearable v-model="form.irrigationDate" type="date" placeholder="请选择灌溉日期"></el-date-picker>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="灌溉季度" prop="quarter" :rules="[{ required: true, message: '请选择灌溉季度', trigger: 'blur' }]">
            <el-select clearable v-model="form.quarter" placeholder="请选择灌溉季度">
              <el-option
                v-for="item in quarter"
                :key="item.value"
                :label="item.dictLabel"
                size="small"
                :value="item.dictValue"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <Dialog ownership="all" ref="dialog"/>
  </div>
</template>

<script>
import Dialog from "../comp/dialog"
import {
listTwo
} from "@/api/report/resource";
import { getItem } from "@/api/select.js";
export default {
  components:{
    Dialog
  },
  name: "Editor",
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
      // 报告表格数据
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 8,
        releaseState: 2,
        quarter: undefined,
        queryType:2,
      },
      select: ["quarter"],
      releaseState: [],
      quarter: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      editorList:[],
    };
  },
  created() {
    this.getSelectItem(() => this.getList());
  },
  methods: {
    draw(row){
      this.showOrUpdate="all";
      this.$refs.dialog.openWindow(row)
    },
    getSelectItem(callBack, arr = this.select, index = 0) {
      if (index == arr.length) {
        callBack();
        return;
      }
      getItem(arr[index]).then(res => {
        this[arr[index]] = res.data;
        this.getSelectItem(callBack, arr, index + 1);
      });
    },
    /** 查询报告列表 */
    getList() {
      this.loading = true;
      listTwo(this.queryParams).then(response => {
        let list = response.rows;
        let select = this.select;
        for (let i = 0; i < list.length; i++) {
          for (let key in list[i]) {
            if (select.indexOf(key) > -1) {
              let data = list[i][key];
              let index = this[key].findIndex(item => item.dictValue == data);
              if (index == -1) {
                continue;
              }
              list[i][key] = this[key][index].dictLabel;
            }
          }
        }
        this.editorList=list
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
        reportName: undefined,
        irrigationDate: undefined,
        year: undefined,
        month: undefined,
        day: undefined,
        releaseState: undefined,
        quarter: undefined,
        delFlag: undefined,
        creatTime: undefined,
        creatUser: undefined,
        updateTime: undefined,
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
      this.title = "添加报告";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getEditor(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改报告";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let {irrigationDate,quarter}=this.form;
          let [year,month,day]=irrigationDate.split("-");
          let newFrom={...this.form,
            year,
            month,
            day,
            reportName:`${year}年度-${quarter}-${irrigationDate}`
          };
          if (this.form.id != undefined) {
            updateEditor(newFrom).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addEditor(newFrom).then(response => {
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
      this.$confirm('是否确认删除报告编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return delEditor(ids);
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
      this.$confirm("是否确认导出所有报告数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportEditor(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    },
    pageChange(num){
      this.queryParams.pageNum=num;
      this.getList()
    }
  }
};
</script>
<style scoped>
.from input{
  width: 250px;
}
._title{
  font-size: 15px;
  color: #333;
  padding: 8px 10px;
  display: block;
}
.time{
  color: #afafaf;
  font-size: 12px;
  display: block;
   padding: 0 10px;
   margin-bottom: 14px;
}
.bottom{
  color: #000;
  font-size: 14px;
  border-top: 1px solid #e1e0e0;
   padding: 0 10px;
   display: flex;
   justify-content: space-between;
   align-items: center;
}
.from .el-date-editor {
  width: 196px;
}
.app-container{
  min-width: 1400px;
  overflow: auto;
}
.item{
  width: 25%;
  float: left;
  padding: 0 10px 10px;
}
.image{
  width: 100%;
  height: 250px;
  
}

</style>
<style>
.el-card__body{
  width: 100% !important;
}
</style>