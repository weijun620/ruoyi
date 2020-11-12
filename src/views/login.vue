<template>
  <div class="login">
    <div class="content">
      <div class="decoration">
        <div class="row1">
          <img src="../assets/image/logo.png" alt="">
          <span>杭锦旗水利局</span>
        </div>
        <div class="row2">
          <span>灌溉成效无人机监管系统</span>
          <span>IRRIGATION EFFECTIVENESS DRINE MONITORING SYSTEM</span>
        </div>
        <img class="row3" src="../assets/image/mengwen.png" alt="">
      </div>
      <div class="form">
        <el-form style="width:100%;height:100%;background: rgba(255,255,255,0)" ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">登录</h3>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;"><span style="color:#bdb9b9">记住密码</span></el-checkbox>
        <div
          class="loginIn"
          :loading="loading"
          @click="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </div>
    </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: "Login",
  data() {
    return {
      codeUrl: "",
      cookiePassword: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" }
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" }
        ],
        code: [{ required: true, trigger: "change", message: "验证码不能为空" }]
      },
      loading: false,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCode();
    this.getCookie();
    this.$store.commit("app/selectedRoute", 0);
    this.$store.commit("app/setChildRouter", "");
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.loginForm.uuid = res.uuid;
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove('rememberMe');
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
            })
            .catch(() => {
              this.loading = false;
              this.getCode();
            });
        }
      });
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.login .el-checkbox__input.is-checked .el-checkbox__inner{
  background-color: #ff5379;
}
.login .el-checkbox__input.is-focus .el-checkbox__inner,.login .el-checkbox__input.is-checked .el-checkbox__inner,.el-checkbox__inner:hover{
  border-color: #ff5f5f;
}
.loginIn{
  background: #ff5379;
  width: 100%;
  height: 40px;
  border-radius: 6px;
  color: #eee;
  text-align: center;
  font-size: 18px;
  line-height: 40px;
  cursor: pointer;
  transition: all .3s;
}
.loginIn:hover{
  background: #ff6b79;
  color: #fff;
}
.content{
  width: 70%;
  margin: 0 auto;
  height: 430px;
  background: url("../assets/image/img_denglu_bg.png") ;
  background-size: 100% 100%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.decoration{
  width: 60%;
    margin-left: 3.6%;
    height: 332px;
}
.form{
  height: 428px;
  width: 31.7%;
  margin-right: .13%;
}
.row1{
  padding: 30px 0 0 30px;
}
.row1 img,.row1 span{
  vertical-align: middle;
}
.row1 span{
  font-size: 40px;
  color: #fff;
  margin-left: 30px;
  font-family: "楷体";
}
.row2{
  display: flex;
  flex-direction: column;
  color: #fff;
  padding: 10px 0 0 142px;
}
.row2 span:first-child{
  font-weight: 600;
  font-size: 42px;
}
.row2 span:last-child{
  font-size: 14px;
  margin-top: 3px;
  letter-spacing: 1.26px;
}
.row3{
  margin: 30px 0 0 142px;
  width: 466px;
  height:75px
}
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/image/login-background.jpg");
  background-size: cover;
  min-width: 1632px;
  overflow: auto;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #fff;
  font-weight: normal;
  font-size: 24px;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}
</style>
