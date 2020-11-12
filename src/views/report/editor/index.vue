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
      <el-form-item label="发布状态" prop="releaseState">
        <el-select clearable v-model="queryParams.releaseState" placeholder="请选择发布状态">
          <el-option
            v-for="item in release_state"
            :key="item.value"
            :label="item.dictLabel"
            size="small"
            :value="item.dictValue"
          ></el-option>
        </el-select>
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

    <el-row :gutter="10" class="mb8">
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
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['report:editor:export']"
        >导出</el-button>
      </el-col>
    </el-row>
    <el-table
      height="calc(100% - 157px)"
      v-loading="loading"
      :data="editorList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="报告名称" align="center" prop="report_name" />
      <el-table-column label="航拍影像" show-overflow-tooltip align="center" prop="image_id">
        <template slot-scope="scope">
          {{scope.row|label(that)}}
        </template>
      </el-table-column>
      <el-table-column label="灌溉日期" align="center" prop="irrigation_date" />
      <el-table-column label="航拍年份" align="center" prop="year" />
      <el-table-column label="发布状态" align="center" prop="release_state" />
      <el-table-column label="灌溉季度" align="center" prop="quarter" />
      <el-table-column label="创建时间" align="center" prop="creat_time" />
      <el-table-column
        label="操作"
        align="center"
        width="400px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.release_state=='未发布'">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit-outline"
              @click="draw(scope.row)"
              v-hasPermi="['report:editor:edit']"
            >标绘灌溉</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-upload2"
              @click="release(scope.row)"
              v-hasPermi="['report:editor:edit']"
            >发布报告</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['report:editor:edit']"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['report:editor:remove']"
            >删除</el-button>
          </div>
          <div v-else>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="show(scope.row)"
              v-hasPermi="['report:editor:edit']"
            >查看报告</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-folder-delete"
              @click="recall(scope.row)"
              v-hasPermi="['report:editor:remove']"
            >撤回发布</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改报告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form class="from" ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="航拍影像" prop="image_id">
            <el-select clearable v-model="form.image_id">
              <el-option
                v-for="v in image"
                :key="v.id"
                :label="v.label"
                size="small"
                :value="v.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item
            label="灌溉日期"
            prop="irrigation_date"
            :rules="[{ required: true, message: '请选择灌溉日期', trigger: 'blur' }]"
          >
            <el-date-picker
              value-format="yyyy-MM-dd"
              clearable
              v-model="form.irrigation_date"
              type="date"
              placeholder="请选择灌溉日期"
            ></el-date-picker>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item
            label="灌溉季度"
            prop="quarter"
            :rules="[{ required: true, message: '请选择灌溉季度', trigger: 'blur' }]"
          >
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
    <Dialog :ownership="showOrUpdate" ref="dialog" />
  </div>
</template>

<script>
import Dialog from "../comp/dialog";
import {
  listEditor,
  getEditor,
  delEditor,
  addEditor,
  updateEditor,
  exportEditor
} from "@/api/report/editor";
import { listImage,listTwo } from "@/api/image";
import { getItem } from "@/api/select.js";
export default {
  components: {
    Dialog
  },
  name: "Editor",
  data() {
    return {
      that:this,
      image: [],
      showOrUpdate: "",
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
      editorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        reportName: undefined,
        irrigationDate: undefined,
        year: undefined,
        month: undefined,
        day: undefined,
        releaseState: undefined,
        quarter: undefined,
        creatTime: undefined,
        creatUser: undefined,
        updateUser: undefined,
        lay1: undefined,
        lay2: undefined,
        lay3: undefined,
        lay4: undefined,
        lay5: undefined,
        queryType: 1
      },
      select: ["release_state", "quarter"],
      release_state: [],
      quarter: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    listImage().then(res => {
      res.rows.forEach(item=>{
        item.label=item.remarks+"-"+item.name
      })
      this.image = res.rows;
      this.getSelectItem(() => this.getList());
    });
  },
  filters:{
    label({image_id},that){
      for(let i of that.image){
        if(image_id==i.id){
          return i.remarks+"-"+i.name;
        }
        }
      }
  },
  methods: {
    draw(row) {
      this.showOrUpdate = "mine";
      this.$refs.dialog.openWindow(row);
    },
    show(row) {
      this.showOrUpdate = "all";
      this.$refs.dialog.openWindow(row);
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
      listEditor(this.queryParams).then(response => {
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
        this.editorList = list;
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
        id: "",
        report_name: "",
        irrigation_date: "",
        year: "",
        month: "",
        day: "",
        release_state: "",
        quarter: "",
        del_flag: "",
        creat_time: "",
        creat_user: "",
        update_user: "",
        image_id: ""
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
          let formCopy = JSON.parse(JSON.stringify(this.form));
          for (let key in formCopy) {
            let list = key.split("_");
            if (list.length > 1) {
              let temp = formCopy[key];
              delete formCopy[key];
              for (let i in list) {
                if (i > 0) {
                  list[i] = list[i].charAt(0).toUpperCase() + list[i].slice(1);
                }
              }
              formCopy[list.join().replace(/,/g, "")] = temp;
            }
          }
          let { irrigationDate, quarter } = formCopy;
          let [year, month, day] = irrigationDate.split("-");
          let newFrom = {
            ...formCopy,
            year,
            month,
            day,
            reportName: `${year}年度-${quarter}-${irrigationDate}`,
          };
          console.log(this.form.id!=undefined)
          if (this.form.id) {
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
    release({ id }) {
      this.$confirm('是否确认发布报告编号为"' + id + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          updateEditor({
            releaseState: 2,
            id
          }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "发布成功"
              });
              this.setReleaseState("已发布", id);
            }
          });
        })
        .catch(function() {});
    },
    recall({ id }) {
      this.$confirm('是否确认撤回报告编号为"' + id + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          updateEditor({
            releaseState: 1,
            id
          }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "撤回成功"
              });
              this.setReleaseState("未发布", id);
            }
          });
        })
        .catch(function() {});
    },
    setReleaseState(state, id) {
      for (let i of this.editorList) {
        if (i.id == id) {
          i.release_state = state;
        }
      }
    }
  }
};
</script>
<style scoped>
.from input {
  width: 250px;
}
.from .el-date-editor {
  width: 196px;
}
</style>