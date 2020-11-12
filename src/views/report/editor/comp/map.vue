<template>
  <div class="map" style="position:relative">
    <div v-if="shutter" class="shade"></div>
    <div
      id="map"
      v-loading="loading"
      element-loading-text="请稍候..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    ></div>
    <div :class="upload?'upload':''" class="header">
      <div class="search">
        <el-input @focus="isHasData" style="width:300px" v-model="keyWorld" placeholder="请输入地块编码查询">
          <i class="iconfont icon-sousuo"></i>
        </el-input>
        <div class="search-btn" @click="search">查询</div>
        <el-card
          :class="openResult?'open-result':''"
          style="position:absolute;top:40px;left:20px;width:300px;padding:0;"
          class="box-card"
        >
          <div class="search-title">
            查询到7个结果，点击查看位置
            <i class="iconfont icon-guanbi"></i>
          </div>
          <el-table height="250px" :data="searchResult" stripe style="width: 100%;margin-top:37px">
            <el-table-column prop="code" label="地块编码"></el-table-column>
            <el-table-column prop="name" label="位置坐落"></el-table-column>
            <el-table-column prop="address" label="面积"></el-table-column>
          </el-table>
          <el-pagination style="margin-top:8px" small layout="prev, pager, next" :total="50"></el-pagination>
        </el-card>
      </div>
      <div :class="upload?'upload':''" class="contrast">
        <div @click="boxToChoose" :class="isBoxToChoose?'box-to-choose':''">自选区域覆盖标绘</div>
        <div>对比影像</div>
      </div>
    </div>
    <div :id="polygonActive?'show-child':''" :class="upload?'upload':''" class="switch">
      <div @click="polygon" class="polygon" :class="polygonActive?'polygon-active':''"></div>
      <div @click="draw" class="draw" :class="drawActive?'draw-active':''"></div>
    </div>
    <div :class="upload?'upload':''" class="data">
      <div class="area">
        <span>{{area|fixed}}</span>
        <span>标绘面积(亩)</span>
      </div>
      <div class="num">
        <span>{{num|isNull}}</span>
        <span>标绘数量(块)</span>
      </div>
    </div>
    <div :class="upload?'upload':''" class="operation">
      <div @click="shot">当前地图比例截图</div>
      <div @click="submit">保存/更新标绘数据</div>
    </div>
    <div :class="upload?'upload':''" class="switch-layers">
      <div
        class="vector"
        :class="layers=='vector'?'active-layers':'layer'"
        @click="switchLayers('vector')"
      >
        <span>矢量</span>
      </div>
      <div
        class="satellite"
        :class="layers=='satellite'?'active-layers':'layer'"
        @click="switchLayers('satellite')"
      >
        <span>影像</span>
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import { massif } from "@/api/aMap.js";
import wkt from "terraformer-wkt-parser";
import "@geoman-io/leaflet-geoman-free";
import maptool from "../../utils/mesure";
import domtoimage from "dom-to-image";
import { uploadFile, plotting } from "@/api/report/editor.js";
import {getImage} from "@/api/plotting/image";
import {
  listElements,
} from "@/api/plotting/elements";
export default {
  props: ["id"],
  filters:{
    fixed(val){
      if(!val) return "-"
      return val.toFixed(2)
    },
    isNull(val){
      if(!val) return "-";
      return val
    }
  },
  data() {
    return {
      openResult:false,
      layers:"",
      shutter: false,
      map: null,
      selectedPolygon: [],
      selectedPolygonId: [],
      polygonActive: false,
      polygonData: [],
      polygonList: [],
      lock: false,
      drawActive: false,
      keyWorld: "",
      loading: false,
      tableData: [
        {
          date: "123",
          name: "王小虎",
          address: "1518 弄"
        },
        {
          date: "32",
          name: "王小虎",
          address: "1517 弄"
        },
        {
          date: "321",
          name: "王小虎",
          address: "1519 弄"
        },
        {
          date: "321",
          name: "王小虎",
          address: "1516 弄"
        },
        {
          date: "123",
          name: "王小虎",
          address: "1518 弄"
        },
        {
          date: "32",
          name: "王小虎",
          address: "1517 弄"
        },
        {
          date: "321",
          name: "王小虎",
          address: "1519 弄"
        },
        {
          date: "321",
          name: "王小虎",
          address: "1516 弄"
        }
      ],
      isBoxToChoose: false,
      upload: false,
      imgUrl: "",
      mapZoom: "",
      mapCenter: "",
      boudns: [],
      num:0,
      area:0,
      searchResult:[]
    };
  },
  mounted() {
    this.initMap();
    this.getList();
    this.getCenter();
    this.map.on("click", (e) => {
      this.isBoxToChoose = false;
    });
  },
  methods: {
    isHasData(){
      if(!this.polygonActive){
        this.$message({
          type:"warning",
          message:"请先开启地块"
        });
        return true;
      };
      return false
    },
    search(){
      if(this.isHasData()) return;
      for(let i of this.polygonList){
        if(i.options.code==this.keyWorld){
          this.map.fitBounds(i.getLatLngs())
          break;
        }
      }
    },
    getCenter(submit){
       getImage(this.id).then((res)=>{
        let data=res.rows[0];
      let {zoom_level,central_point,already_irrigation_num,already_irrigation_area}=data;
      this.num=already_irrigation_num;
      this.area=already_irrigation_area;
      if(submit) return;
      this.addWms( `http://192.168.124.75:8443/geoserver/hjq-tif-workspace/wms`,data.workspace+":"+data.name)
        if(zoom_level&&central_point){
          let center = central_point.match(/\d+\.\d+/g);
          this.map.setZoom(zoom_level);
          this.map.flyTo([center[1],center[0]],zoom_level);
        }
      })
    },
    getList(){
      listElements({reportId:this.id}).then(res=>{
        res.rows.forEach(item=>{
          this.selectedPolygonId.push(item.massifId);
        })
      })
    },
    addWms(url,name){
      var nexrad = L.tileLayer.wms(url, {
        layers: name,
        format: 'image/png',
        transparent: true,
        zIndex:20,
      });
      nexrad.addTo(this.map)
    },
    initMap() {
      this.map = L.map("map", {
        minZoom: 3,
        maxZoom: 18,
        center: [40.809188797670444,107.94067382812501],
        zoom: 14,
        zoomControl: false,
        preferCanvas: true
      });
      this.switchLayers("vector");
    },
    polygon() {
      if (this.lock) return;
      this.aiction();
    },
    aiction() {
      this.polygonActive = !this.polygonActive;
      if (this.polygonActive) {
        this.loading = true;
        if (this.polygonData.length == 0) {
          this.lock = true;
          massif().then(res => {
            console.log(res)
            this.polygonData = res.rows.map(({ geom, gid,dkbh}) => ({
              path: wkt
                .parse(geom)
                .coordinates[0][0].map(
                  ([lng, lat]) => ([lng, lat] = [lat, lng])
                ),
              id: gid,
              code:dkbh
            }));
            this.drawPolygon(this.polygonData);
            this.lock = false;
            this.loading = false;
          });
        } else {
          setTimeout(() => {
            this.drawPolygon(this.polygonData);
            this.loading = false;
          }, 100);
        }
      } else {
        this.clearPolyon(this.polygonList);
        this.drawActive=false;
      }
    },
    clearPolyon(data) {
      data.forEach(item => {
        item.remove();
      });
    },
    drawPolygon(data) {
      data.forEach(({ path, id,code}) => {
        var polygon = L.polygon(path, {
          color: "#5159ea",
          weight: 1,
          fillColor:"#ffffff00",
          id,
          code
        }).addTo(this.map);
        if(this.selectedPolygonId.indexOf(id)>-1){
          polygon.setStyle({
            fillColor:"#04f42e"
          });
          this.selectedPolygon.push(polygon)
        }
        polygon.on("click", e => {
          this.selectPolygon(e.target);
        });
        this.polygonList.push(polygon);
      });
    },
    draw() {
      this.drawActive = !this.drawActive;
      if(this.drawActive){
        if(this.selectedPolygonId.length==0){
          this.$message("您还未标绘任何地块")
        }
        this.polygonList.forEach(item=>{
          if(this.selectedPolygonId.indexOf(item.options.id)==-1){
            item.remove();
          }
        })
      }else{
        this.polygonList.forEach(item=>{
          if(this.selectedPolygonId.indexOf(item.options.id)==-1){
            item.addTo(this.map)
          }
        })
      }
    },
    switchLayers(type) {
      this.layers = type;
      this.map.eachLayer(layers => {
        if (layers.options.type === "baseMap") {
          layers.remove();
        }
      });
      switch (type) {
        case "vector":
          L.tileLayer(
            "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
            {
              attribution: "&copy; 高德地图",
              subdomains: "1234",
              type: "baseMap",
              zIndex:10,
            }
          ).addTo(this.map);
          //   L.tileLayer("http://t4.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb").addTo(this.map);
          //   L.tileLayer("http://t4.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb").addTo(this.map);
          break;
        case "satellite":
          L.tileLayer(
            "http://t4.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb",
            { type: "baseMap",
            zIndex:10, }
          ).addTo(this.map);
          L.tileLayer(
            "http://t4.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb",
            { type: "baseMap",
            zIndex:10, }
          ).addTo(this.map);
          break;
      }
    },
    boxToChoose() {
      if (!this.polygonActive) {
        this.$message({
          type: "warning",
          message: "请先打开右侧地块显示开关"
        });
        return;
      } else if (this.lock) {
        this.$message({
          type: "warning",
          message: "请稍候..."
        });
        return;
      }else if(this.drawActive){
        this.$message({
          type: "warning",
          message: "请先关闭标绘区域过滤开关"
        });
        return;
      }
      this.isBoxToChoose = true;
      maptool.drawRectangle(this.map, null, path => {
        this.isBoxToChoose = false;
        this.loading = true;
        massif(path).then(({ rows }) => {
          if (rows.length == 0) {
            this.$message("该区域暂无地块");
          } else {
            for (let { gid } of rows) {
              if (this.selectedPolygonId.indexOf(gid) == -1) {
                for (let item of this.polygonList) {
                  if (item.options.id == gid) {
                    item.setStyle({
                      fillColor: "#04f42e"
                    });
                    this.selectedPolygonId.push(gid);
                    this.selectedPolygon.push(item);
                  }
                }
              }
            }
          }
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.clear();
          }, 10);
        });
      });
    },
    clear() {
      maptool.clearPolygon();
    },
    selectPolygon(polygon) {
      for (let i in this.selectedPolygon) {
        if (polygon.options.id == this.selectedPolygon[i].options.id) {
          polygon.setStyle({
            fillColor: "#ffffff00"
          });
          this.selectedPolygon.splice(i, 1);
          this.selectedPolygonId.splice(i, 1);
          return;
        }
      }
      polygon.setStyle({
        fillColor: "#04f42e"
      });
      this.selectedPolygon.push(polygon);
      this.selectedPolygonId.push(polygon.options.id);
    },
    shot() {
      this.upload = true;
      setTimeout(() => {
        this.shutter = true;
      }, 510);
      setTimeout(() => {
        domtoimage
          .toJpeg(document.getElementsByClassName("map")[0], { quality: 1 })
          .then(dataUrl => {
            let a = this.convertBase64UrlToBlob(dataUrl);
            uploadFile(a).then(res => {
              this.shutter = false;
              setTimeout(() => {
                if (res.code == 200) {
                  this.$message({
                    type: "success",
                    message: "截图成功"
                  });
                  this.mapZoom = this.map.getZoom();
                  this.mapCenter = this.map.getCenter();
                  this.imgUrl = res.msg;
                } else {
                  this.$message({
                    type: "error",
                    message: "网络异常,截图失败"
                  });
                }
              }, 100);
            });
            this.upload = false;
          });
      }, 1000);
    },
    convertBase64UrlToBlob(urlData) {
      var bytes = window.atob(urlData.split(",")[1]);
      var array = [];
      for (var i = 0; i < bytes.length; i++) {
        array.push(bytes.charCodeAt(i));
      }
      var blob = new Blob([new Uint8Array(array)], { type: "image/jpeg" });
      var fd = new FormData();
      fd.append("file", blob, Date.now() + ".jpg");
      return fd;
    },
    submit() {
      if (this.imgUrl == "") {
        this.$message({
          message: "请先对标绘区域截图再上传",
          type: "warning"
        });
      } else {
        let params = [
          {
            plotting_image: {
              reportId: this.id,
              screenshot: this.imgUrl,
              centralPoint: `POINT(${this.mapCenter.lng} ${this.mapCenter.lat})`,
              zoomLevel: this.mapZoom
            }
          }
        ];
        let land = { plotting_elements: [] };
        this.selectedPolygonId.forEach(item => {
          land.plotting_elements.push({
            massifId: item,
            reportId: this.id
          });
        });
        params.push(land);
        plotting(params).then(res => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "保存成功"
            });
            this.imgUrl="";
            this.getCenter()
          } else {
            this.$message({
              type: "error",
              message: "保存失败"
            });
          }
        });
      }
    }
  }
};
</script>
<style scoped>
.vector {
  background: url(../../../../assets/image/gaodeMap.png);
}
.vector span {
  color: #000;
}
.satellite {
  background: url(../../../../assets/image/yingxiang.png);
  left: 0;
}
.satellite span {
  color: #fff;
}
.active-layers {
  border: 1px solid #1d63ae;
  z-index: 1;
}
.active-layers span {
  color: #fff !important;
  background: #1d63ae;
}
.switch-layers {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 600;
  width: 120px;
  display: flex;
  justify-content: space-between;
  height: 70px;
}

.switch-layers > div {
  width: 120px;
  height: 70px;
  border-radius: 4px;
  background-size: cover;
  position: absolute;
  cursor: pointer;
  transition: all 0.4s;
}
.switch-layers > div span {
  position: absolute;
  right: 0px;
  bottom: 0px;
  font-size: 14px;
  padding: 2px;
}
.switch-layers:hover > .satellite {
  left: 130px;
}
.switch-layers:hover {
  width: 150px;
}
#map,
.shade {
  width: 100%;
  height: 700px;
}
.shade {
  position: absolute;
  z-index: -1;
  background: #fff;
  opacity: 0;
}
.shade {
  animation: flash 0.8s;
}
@keyframes flash {
  0% {
    opacity: 1;
    z-index: 1000;
  }
  100% {
    opacity: 0;
    z-index: 1000;
  }
}
.data{
 position: absolute;
    z-index: 711;
    bottom: 70px;
    right: 19px;
    width: 131px;
    height: 92px;
    background: linear-gradient(rgba(28,125,129,.9), rgba(81,89,234,.9));
    border-radius: 6px;
    display: flex;
    flex-direction: column;
}
.data>div{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.area{
  border-bottom: 1px solid #b4b3b3;
}
.num>span:first-child,.area>span:first-child{
  color: #fff;
  font-size: 16px;
  margin: 4px 0;
}
.num>span:last-child,.area>span:last-child{
  color: #fff;
  font-size: 12px;
}
.num>span:first-child{
  color: #1bffa5;
}
.area>span:first-child{
  color: #ffd80e;
}
.num,.area{
  height: 50%;
}
.header {
  position: absolute;
  top: 0;
  width: 100%;
  height: 50px;
  background: linear-gradient(to bottom, #939393, transparent);
  display: flex;
  align-items: center;
  z-index: 600;
}
.search {
  padding-left: 20px;
  display: flex;
  align-items: center;
  position: relative;
}
.box-card{
  opacity: 0;
  height: 0px;
  overflow: hidden;
  transition: all .3s;
}
.open-result{
  opacity: 1;
  height: auto;
  overflow: hidden
}
.icon-guanbi {
  position: absolute;
  right: 17px;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}
.icon-guanbi:hover {
  color: #0047ff;
}
.upload {
  opacity: 0;
  transition: opacity 0.5s;
}
.search-btn {
  width: 70px;
  height: 33px;
  margin-left: 15px;
  font-size: 14px;
  text-align: center;
  line-height: 35px;
  border-radius: 10px;
  color: #f9fafe;
  background: linear-gradient(#1c7ddb, #5159ea);
  cursor: pointer;
}
.contrast {
  display: flex;
  position: absolute;
  right: 400px;
}
.operation {
  display: flex;
  position: absolute;
  right: 0px;
  bottom: 10px;
  z-index: 600;
}
.search-btn:hover {
  background: linear-gradient(#30a9ff, #746ff4);
}
.search-title {
  background: #edf5ff;
  width: 100%;
  position: absolute;
  color: #197fda;
  font-size: 14px;
  top: 0;
  left: 0;
  right: 0;
  height: 35px;
  line-height: 35px;
  text-indent: 10px;
}
.contrast div,
.operation div {
  background: url(../../../../assets/image/but-duibi.png);
  padding: 0 20px;
  height: 35px;
  background-size: 100% 100%;
  color: #f9fafe;
  text-align: center;
  line-height: 39px;
  font-size: 14px;
  margin-right: 20px;
  cursor: pointer;
}
.contrast div:hover,
.operation div:hover {
  background-image: url(../../../../assets/image/but-duibi_Highlight.png);
}
.box-to-choose {
  background-image: url(../../../../assets/image/but-duibi_Highlight.png) !important;
}
.switch{
  width: 30px;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  right: 39px;
  position: absolute;
  top: 100px;
  z-index: 601;
  height: 30px;
}
.satellite span {
  color: #fff;
}
.switch .polygon,
.switch .draw {
  width: 30px;
  height: 30px;
}
.polygon {
  background: url(../../../../assets/image/icon_dikuai.png);
  cursor: pointer;
  background-size: cover;
  position: absolute;
  right: 0;
  border-radius: 6px;
}
.polygon-active{
  box-shadow: -3px 0px 1px 1px #3333337a, -7px 0px 1px 1px #33333333;
}
#show-child:hover{
  width: 100px;
}
#show-child:hover>.draw{
  right: 40px;
  transform: scale(.7);
 
}
#show-child:hover>.polygon{
   box-shadow: -3px 0px 1px 1px transparent, -7px 0px 1px 1px transparent;
 
}
.polygon-active {
  background: url(../../../../assets/image/icon_dikuai_Highlight.png);
  background-size: cover;
}
.draw {
  background: url(../../../../assets/image/icon_biaohui.png);
  cursor: pointer;
  background-size: cover;
  position: absolute;
  top: 0;
  z-index: -1;
  right: 0;
  transition: all .3s;
  transform: scale(1);
}
.draw-active {
  background: url(../../../../assets/image/icon_biaohui_Highlight.png);
  background-size: cover;
}
</style>
<style>
.map .el-card__body {
  padding: 0 !important;
}
.leaflet-control-attribution {
  display: none !important;
}
.leaflet-control-container {
  height: 100%;
}
</style>