<template>
	<el-dialog title="标绘灌溉" v-if="flag" :visible.sync="dialogVisible" width="1300px" @close="handleClose">
		<el-tabs v-model="activeName" @tab-click="handleClick">
			<el-tab-pane label="标绘影像地图" name="first">
				<mineMap v-if="ownership=='mine'" :id='row.id'/>
				<allMap v-if="ownership=='all'" :id="row.id"/>
			</el-tab-pane>
			<el-tab-pane label="标绘数据列表" name="second">
				<List ref="list" :id='row.id'/>
			</el-tab-pane>
			<el-tab-pane label="标绘数据截图" name="third">
				<Img ref="img" :id="row.id"/>
			</el-tab-pane>
		</el-tabs>
	</el-dialog>
</template>

<script>
import mineMap from "../editor/comp/map"
import allMap from "../resource/comp/map"
import List from "./list"
import Img from "./img"
  export default {
	  props:["ownership"],
	  components:{
		  allMap,
		  mineMap,
		  List,
		  Img,
	  },
    data() {
      return {
		dialogVisible: false,
		activeName:"first",
		row:{},
		flag:false,
      };
    },
    methods: {
		openWindow(data){
			this.flag=true;
			setTimeout(()=>{
				this.dialogVisible=true;
				this.row=data;
			},100)
		},
		handleClick({name}){
			if(name=="third"){
				this.$refs.img.shot()
			}else if(name=="second"){
				this.$refs.list.getList()
			}
		},
      handleClose(done) {
		  this.activeName="first";
		  setTimeout(()=>{
			  this.flag=false;
		  },600)
      }
    }
  };
</script>
<style>
.el-dialog__body{
	padding-top: 0px;
}
</style>