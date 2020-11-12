<template>
  <div>
	  <div v-if="!url" class="el-image__error" style="width: 100%; height: 500px">
		  暂无截图
	  </div>
    <el-image v-else style="width: 100%; height: 500px" :src="url" :preview-src-list="[url]"></el-image>
  </div>
</template>
<script>
import {getImage} from "@/api/plotting/image";
export default {
	props:["id"],
	data(){
		return{
			url:""
		}
	},
	methods:{
		shot(){
			getImage(this.id).then(res=>{
				this.url=res.rows[0].screenshot
			})
		}
	}
}
</script>
<style scoped>
</style>