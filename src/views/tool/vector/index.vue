<template>
  <div class="vector">
    <el-row style="padding:10px 0px" :gutter="24">
      <el-col :offset="1" :span="10">
        <el-input
          clearable
          v-model="condition"
          style="width:60%"
          placeholder="请输入关键字查询"
          size="small"
        />
        <el-button size="small" @click="initTable()" type="primary">查询</el-button>
        <el-button size="small" @click="reset()">重置</el-button>
      </el-col>
    </el-row>
    <el-row style="margin:0;padding:0 10px;height:calc(100% - 31px)" :gutter="24">
      <vxe-grid
        :loading="loading"
        height="100%"
        stripe
        border
        round
        resizable
        keep-source
        ref="xGrid"
        :pager-config="tablePage"
        :columns="tableColumn"
        :data="tableData"
        :seq-config="{startIndex: (tablePage.currentPage - 1) * tablePage.pageSize}"
        @page-change="handlePageChange"
      >
        <template v-slot:operate="{ row }">
          <template>
            <el-button size="mini" title="详情" @click="info(row)">详情</el-button>
          </template>
        </template>
      </vxe-grid>
    </el-row>
  </div>
</template>

<script>
import { getVextorData, getTaleInfo } from "@/api/vector";
export default {
  computed: {
    requestParams: function () {
      return {
        pageNum: this.tablePage.currentPage,
        pageSize: this.tablePage.pageSize,
        condition: this.condition,
      };
    },
  },
  mounted() {
    this.initTable();
  },
  data() {
    return {
      loading: false,
      tableData: [],
      condition: "",
      tablePage: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100, 200, 500],
        layouts: [
          "Sizes",
          "PrevJump",
          "PrevPage",
          "Number",
          "NextPage",
          "NextJump",
          "FullJump",
          "Total",
        ],
        perfect: true,
      },
      tableColumn: [
        { type: "seq", title: "序号", width: 60 },
        { field: "tablename", title: "数据表名称", showOverflow: true },
        { field: "describe", title: "描述", showOverflow: true },
        { field: "total", title: "记录数", showOverflow: true },
        { title: "操作", width: 100, slots: { default: "operate" } },
      ],
    };
  },
  methods: {
    initTable() {
      // console.log(this.requestParams)
      this.loading = true;
      getVextorData(this.requestParams).then(({ rows, total }) => {
        this.tableData = rows;
        this.tablePage.total = total;
        // console.log(rows)
        this.loading = false;
      });
    },
    handlePageChange({ currentPage, pageSize }) {
      this.tablePage = { ...this.tablePage, currentPage, pageSize };
      this.initTable();
    },
    info({ tablename }) {
      this.$router.push("/baseData/vector/dataInfo?tablename=" + tablename);
    },
    reset() {
      this.condition = "";
      this.tablePage = { ...this.tablePage, currentPage: 1, pageSize: 10 };
      this.initTable();
    },
  },
};
</script>
<style scoped>
.vector {
  background-color: #ffffff;
  height: 100%;
}
</style>
