<template>
  <div v-loading="loading"
    element-loading-text="请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)" class="AMap">
    <div id="map"></div>
    <div class="header">
      <div class="search">
        <el-input style="width:300px" v-model="keyWorld" placeholder="请输入地块编码查询">
          <i class="iconfont icon-sousuo"></i>
        </el-input>
        <div class="search-btn">查询</div>
        <el-card style="position:absolute;top:40px;left:20px;width:387px;padding:0" class="box-card">
          <div class="search-title">查询到7个结果，点击查看位置<i class="iconfont icon-guanbi"></i></div>
          <el-table height="250px" :data="tableData" stripe style="width: 100%;margin-top:37px">
            <el-table-column prop="date" label="日期"></el-table-column>
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column prop="address" label="地址"></el-table-column>
          </el-table>
          <el-pagination
          style="margin-top:8px"
            small
            layout="prev, pager, next"
            :total="50">
          </el-pagination>
        </el-card>
      </div>
      <div class="contrast">
        <div>横向对比</div>
        <div>卷帘对比</div>
      </div>
      <div class="tools">
        <img class="icon_fd" @click="tools.scale(map,1)" src="../../assets/image/icon_fd.png" alt />
        <img class="icon_sx" @click="tools.scale(map,-1)" src="../../assets/image/icon_sx.png" alt />
        <img
          class="icon_cl"
          @click="tools.drawPolyline(map)"
          src="../../assets/image/icon_cl.png"
          alt
        />
        <img
          class="icon_mj"
          @click="tools.drawPolygon(map)"
          src="../../assets/image/icon_mj.png"
          alt
        />
        <img class="icon_qc" @click="tools.clearplot(map)" src="../../assets/image/icon_qc.png" alt />
        <img class="icon_qp" @click="fullScreen" src="../../assets/image/icon_qp.png" alt />
      </div>
    </div>
    <div class="switch-layers">
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
    <div class="switch">
      <div @click="polygon" class="polygon" :class="polygonActive?'polygon-active':''"></div>
      <div @click="draw" class="draw" :class="drawActive?'draw-active':''"></div>
    </div>
  </div>
</template>
<script>
import L from "leaflet";
import tools from "./utils/tools";
import { massif } from "@/api/aMap.js";
import wkt from "terraformer-wkt-parser";
export default {
  computed: {
    tools: () => tools
  },
  data: () => ({
    map: null,
    layers: "",
    isFullScreen: false,
    isPlot: false,
    polygonActive: false,
    drawActive: false,
    keyWorld: "",
    polygonData: [],
    polygonList: [],
    lock: false,
    loading:false,
    tableData: [{
          date: '123',
          name: '王小虎',
          address: '1518 弄'
        }, {
          date: '32',
          name: '王小虎',
          address: '1517 弄'
        }, {
          date: '321',
          name: '王小虎',
          address: '1519 弄'
        }, {
          date: '321',
          name: '王小虎',
          address: '1516 弄'
        },{
          date: '123',
          name: '王小虎',
          address: '1518 弄'
        }, {
          date: '32',
          name: '王小虎',
          address: '1517 弄'
        }, {
          date: '321',
          name: '王小虎',
          address: '1519 弄'
        }, {
          date: '321',
          name: '王小虎',
          address: '1516 弄'
        }]
  }),
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.map = L.map("map", {
        minZoom: 3,
        maxZoom: 18,
        center: [39.831789, 108.736324],
        zoom: 14,
        zoomControl: false,
        preferCanvas: true
      });
      this.switchLayers("vector");
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
              type: "baseMap"
            }
          ).addTo(this.map);
          //   L.tileLayer("http://t4.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb").addTo(this.map);
          //   L.tileLayer("http://t4.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb").addTo(this.map);
          break;
        case "satellite":
          L.tileLayer(
            "http://t4.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb",
            { type: "baseMap" }
          ).addTo(this.map);
          L.tileLayer(
            "http://t4.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=f158a610971a85d9f1961cca00e2bacb",
            { type: "baseMap" }
          ).addTo(this.map);
          break;
      }
    },
    fullScreen() {
      this.isFullScreen = !this.isFullScreen;
    },
    plot() {
      this.isPlot = !this.isPlot;
    },
    polygon() {
      if (this.lock) return;
      this.polygonActive = !this.polygonActive;
      if (this.polygonActive) {
        this.loading=true;
        if (this.polygonData.length == 0) {
          this.lock = true;
          massif().then(res => {
            this.polygonData = res.rows.map(({ geom }) =>
              wkt
                .parse(geom)
                .coordinates[0][0].map(
                  ([lng, lat]) => ([lng, lat] = [lat, lng])
                )
            );
            this.drawPolygon(this.polygonData);
            this.lock = false;
            this.loading=false;
          });
        } else {
          setTimeout(() => {
            this.drawPolygon(this.polygonData);
            this.loading=false
          }, 100);
        }
      } else {
        this.clearPolyon(this.polygonList);
      }
    },
    clearPolyon(data) {
      data.forEach(item => {
        item.remove();
      });
    },
    drawPolygon(data) {
      data.forEach(item => {
        var polygon = L.polygon(item, {
          color: "#5159ea",
          weight: 1,
          fillColor: "#1c7ddb"
        }).addTo(this.map);
        this.polygonList.push(polygon);
      });
      this.map.fitBounds(data);
    },
    draw() {
      this.drawActive = !this.drawActive;
    }
  }
};
</script>
<style scoped>
.search {
  padding-left: 20px;
  display: flex;
  align-items: center;
  position: relative;
}
.icon-guanbi{
  position: absolute;
  right: 17px;
  font-size: 20px;
  cursor: pointer;
  transition: color .3s;
}
.icon-guanbi:hover{
  color: #0047ff;
}
#map,
.AMap {
  height: 100%;
  width: 100%;
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
.contrast div {
  background: url(../../assets/image/but-duibi.png);
  width: 102px;
  height: 35px;
  background-size: cover;
  color: #f9fafe;
  text-align: center;
  line-height: 39px;
  font-size: 14px;
  margin-right: 20px;
}
.search-btn:hover {
  background: linear-gradient(#30a9ff, #746ff4);
}
.search-title{
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
.full-screen {
  background: pink;
}
.plot {
  background: pink;
}
.tools-item {
  transition: all 0.3s;
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
.active-layers {
  border: 1px solid #1d63ae;
  z-index: 1;
}
.active-layers span {
  color: #fff !important;
  background: #1d63ae;
}
.vector span {
  color: #000;
}
.switch {
  width: 30px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  right: 39px;
  position: absolute;
  top: 100px;
  z-index: 601;
}
.satellite span {
  color: #fff;
}
.switch .polygon,
.switch .draw {
  width: 30px;
  height: 30px;
}
.draw {
  background: url(../../assets/image/icon_biaohui.png);
  cursor: pointer;
  background-size: cover;
}
.draw-active {
  background: url(../../assets/image/icon_biaohui_Highlight.png);
  background-size: cover;
}
.vector {
  background: url(../../assets/image/gaodeMap.png);
}
.satellite {
  background: url(../../assets/image/yingxiang.png);
  left: 0;
}
.polygon {
  background: url(../../assets/image/icon_dikuai.png);
  cursor: pointer;
  background-size: cover;
}
.polygon-active {
  background: url(../../assets/image/icon_dikuai_Highlight.png);
  background-size: cover;
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
.tools {
  position: absolute;
  right: 40px;
  display: flex;
  width: 310px;
  justify-content: space-between;
}
.tools img {
  width: 34px;
  cursor: pointer;
}
.icon_fd:hover {
}
.icon_sx:hover {
}
.icon_cl:hover {
}
.icon_mj:hover {
}
.icon_qc:hover {
}
.icon_qp:hover {
}
</style>
<style>
  .AMap .el-card__body{
    padding: 0 !important;
  }
</style>