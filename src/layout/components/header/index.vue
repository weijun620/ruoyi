<template>
  <div id="menu" :class="{'has-logo':showLogo}">
    <img src="../../../assets/image/logo.png" alt class="logo" />
    <span class="title">灌溉成效无人机监管系统</span>
    <div class="left">
      <div
        style="display:flex;align-items: center;"
        v-for="(route,index) in newRouter"
        :key="index"
      >
        <div
          :class="routerActive===index?'router-link-active':''"
          class="router"
          @click="initBar(route,index)"
          :to="route.newPath?route.newPath:route.path"
        >
          <i class="iconfont" :class="route.icon"></i>
          {{route.meta.title}}
        </div>
        <img src="../../../assets/image/img_xiegang.png" />
      </div>
    </div>
    <div class="right">
      <div class="time">
        <div class="hour">{{time}}</div>
        <div class="day">
          <div>{{date}}</div>
          <div>{{day}}</div>
        </div>
      </div>
      <div class="user">
        <Navbar />
        <el-dropdown trigger="click" @command="handleCommand">
          <i class="iconfont icon-shezhi"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :command="route"
              v-for="(route,index) in settingRouter"
              :key="index"
            >{{route.meta.title}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Navbar from "./Navbar";
export default {
  mounted() {
    this.initRouter();
    setInterval(() => {
      this.getTime();
    }, 1000);
  },
  components: {
    Navbar
  },
  data() {
    return {
      newRouter: [],
      settingRouter: [],
      time: "",
      date: "",
      day: ""
    };
  },
  created() {
    //在页面加载时读取localStorage里的状态信息
    if (sessionStorage.getItem("data")) {
      //replaceState替换数据 Object.assign合并对象
      this.$store.replaceState(
        Object.assign(
          {},
          this.$store.state,
          JSON.parse(sessionStorage.getItem("data"))
        )
      );
    }
    //在页面刷新时将vuex里的信息保存到localStorage里
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("data", JSON.stringify(this.$store.state));
    });
  },
  computed: {
    routerActive() {
      return this.$store.state.app.routeIndex;
    },
    ...mapState(["settings"]),
    ...mapGetters(["permission_routes", "sidebar"]),
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  },
  methods: {
    initRouter() {
      this.permission_routes.forEach(item => {
        if (!item.hidden && item.meta) {
          if (item.meta.title == "灌溉一张图" || item.muneId == 1063) {
            if (item.muneId == 1063) {
              item.icon = "icon-guanli";
            } else {
              item.icon = "icon-ditu";
            }
            this.newRouter.push(item);
          } else {
            this.settingRouter.push(item);
          }
        }
      });
    },
    getTime() {
      let date = new Date();
      this.date =
        date.getFullYear() +
        "-" +
        toTwo(date.getMonth() + 1) +
        "-" +
        toTwo(date.getDate());
      let Day = [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
      ];
      this.day = Day[date.getDay()];
      let time = `${toTwo(date.getHours())}:${toTwo(date.getMinutes())}:${toTwo(
        date.getSeconds()
      )}`;
      this.time = time;
      function toTwo(num) {
        return num < 10 ? "0" + num : num;
      }
    },
    handleCommand(command) {
      this.$router.push(command.newPath ? command.newPath : command.path);
      this.initBar(command);
    },
    initBar(route, index) {
      if (index !== undefined) {
        this.$store.commit("app/selectedRoute", index);
      }else{
        this.$store.commit("app/selectedRoute", Symbol());
      }
      if (route.children) {
        this.$store.commit("app/setTitle", route.meta.title);
        this.$router.push(route.children[0].path);
        this.$store.commit("app/setChildRouter", route.children);
      } else {
        this.$store.commit("app/setChildRouter", "");
      }
    }
  }
};
</script>
<style>
.el-dropdown-menu {
  top: 52px !important;
}
</style>
<style scoped>
#menu {
  background-image: url(../../../assets/image/top_bg.png);
  background-size: cover;
  overflow: hidden;
  position: relative;
  height: 55px;
}
.user {
  display: flex;
  align-items: center;
  width: 87px;
  justify-content: space-between;
  position: absolute;
  right: 20px;
}
.icon-shezhi {
  color: #eee;
  font-size: 22px;
  cursor: pointer;
}
.router-link-active {
  background-image: url(../../../assets/image/but_Highlight.png);
  background-size: 107% 115%;
  background-position: center -1px;
  background-repeat: no-repeat;
  color: #ff9d3d !important;
}
.router-link-active i {
  color: #ff9d3d !important;
}
.logo {
  width: 45px;
  position: absolute;
  top: 10px;
  left: 18px;
}
.title {
  line-height: 55px;
  color: #fff;
  font-size: 24px;
  position: absolute;
  left: 110px;
}
.right,
.left {
  position: absolute;
  height: 100%;
}
.left {
  right: 460px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.left img {
  width: 12px;
  height: 28px;
}
.left .router {
  white-space: nowrap;
  flex-shrink: 0;
  width: auto !important;
  color: #c5c5c5;
  height: 100%;
  line-height: 55px;
  font-size: 18px;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.26s;
}
.left .router:hover {
  color: #fff;
}
.left i {
  font-size: 22px !important;
  vertical-align: middle;
}
.right {
  right: 0px;
  width: 338px;
  display: flex;
  align-items: center;
}
.time {
  display: flex;
  align-items: center;
  color: #eee;
  height: 100%;
  width: 215px;
}
.time .hour {
  font-size: 30px;
  font-family: 新宋体;
}
.time .day {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
}
.time .day div:first-child {
  font-size: 12px;
  color: #8a8aff;
}
.time .day div:last-child {
  font-size: 12px;
  margin-top: 6px;
  letter-spacing: 13px;
  text-align: center;
  text-indent: 16px;
}
</style>
