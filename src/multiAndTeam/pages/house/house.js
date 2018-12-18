// pages/base/house/house.js
var common = require('../../../common/common.js');
const util = require('../../../utils/util.js');
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: null, // 团队代号(房间号)
    myDelBtnWidth: 180,//修改按钮宽度单位（rpx）
    delBtnWidth: 360,//修改+删除按钮宽度单位（rpx）
    count:1,
    teamName: null,
    organiser: null,
    avatar: null,
    roles:[],
    memberList: [], // 团队成员列表
    userInfo: {},
    messageFlag:false,
    modifyTeamNameFlag:false,

    message:{"title":"", "text":"","bottom":""},
    bossFlag: 0,
    inputValue:null,
    chatFlag:true,
    tipRight:"right:100rpx",//滑动来修改角色随着一起滑动
    rolesUrl: ["../../images/1.png", "../../images/2.png", "../../images/3.png", "../../images/4.png", "../../images/6.png", "../../images/7.png", "../../images/8.png", "../../images/9.png",],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.userInfo = app.getUserInfo();
    this.setData({
      code: options.code, // 随机房间号
      bossFlag: app.getBossFlag(),
      roles: app.globalData.roles,
      teamName: this.data.userInfo.nickName + "队",      
      organiser: this.data.userInfo.nickName,
      avatar: this.data.userInfo.avatar
    });
    common.init.apply(this, []); // 不加这句模板动画不起作用
    
    // 发送ws通知
    app.setWsHandler(this);
    app.wsConn(this.data.code, this.data.userInfo.openid);

    this.setTeam();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      userInfo: app.getUserInfo(),
      tip:app.globalData.tip+1//第一次进入显示提示
    })
    app.globalData.tip=app.globalData.tip+1;//第一次进入显示提示
    if (this.data.bossFlag > app.constData.BOSS.NORMAL) { // 不是普通群众就行
      this.setData({
        memberList: app.getMemberList()
      })
    } else {
      this.ajaxMemberList();
      this.ajaxTeamDeatail();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 供socket人员增加时使用
  addMemberBySocket: function(member){
    if (member.openid !== app.getOpenid()) {
      app.addMember(member);
    }
    this.refreshData()
  },

  modifyTeamTitleBySocket: function(title){
    this.setData({
      modifyTeamNameFlag: false,
      teamName: title
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //复位滑动参数
    this.resetSlide();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  // 踢出成员
  kick: function (event) {
    var openid = event.currentTarget.dataset.openid;
    app.removeMember(openid);

    this.refreshData();
    // 发送socket通知
    app.wsSend({ "type": "6", "memberOpenid": openid});
  },
  // 刷新页面
  refreshData: function () {
    this.setData({
      memberList: app.getMemberList(),
      count: app.getMemberList().length + 1,
      userInfo: app.getUserInfo(),
    })

    app.setWsHandler(this);  // 控制权要时刻抓在手里
  },

  selectRole:function(e){
    var openid = e.currentTarget.dataset.openid;
    console.log(openid);
    wx.navigateTo({
      url: '../selectRole/selectRole?openid='+openid,
    })
  },
  // 开始赛事
  start:function(e){
    // 多人赛开始socket通知
    app.wsSend({ "type": "9"});    
  },
  // 接受socket开始通知
  doStart:function(){
    wx.reLaunch({
      url: '../team/countDown/countDown',
    })
  },
  // 普通成员收到对方的应战消息
  challengResultBySocket: function (op, code) {
    this.setTeam();
    if (op === "1") {//接受
      var param = "?isB=true&code=" + code;
      wx.reLaunch({
        url: '../team/bothSides/bothSides' + param
      })
    }
  },
  // 解散赛事 -- 组织者
  dismiss: function(e){
    
    this.setData({
      messageSureFlag:true
    })
    // wx.redirectTo({
    //     url: '../../index/index',
    // })

  },

  suredismiss:function(e){
    this.setData({
      messageSureFlag: false
    })
    // socket通知其他成员解散
    app.wsSend({ "type": "1" });
  },

  canceldismiss:function(e){
    this.setData({
      messageSureFlag: false
    })
  },

  // 退出赛事 -- 成员
  quit: function (e) {
    // socket通知其他成员解散
    app.wsClose();
    app.clearGlobalVariables();

    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  //修改赛事名称框绑定
  bindInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  modifyTeamName:function(e){
      this.setData({
        modifyTeamNameFlag:true
      })
  },
  // 确定修改赛事名称
  sureModify:function(e){
    var inputValue=this.data.inputValue;
    this.setData({
      modifyTeamNameFlag: false,
      teamName:inputValue
    })
    // socket通知其他成员
    app.wsSend({ "type": "2", "title": inputValue});
  },

  cancleModify: function (e) {
    this.setData({
      modifyTeamNameFlag: false
    })
  },
  setTeam: function(){
    // 保存全局team信息，未查看双方使用
    app.addMember(app.getUserInfo());
    var team = {
      code: this.data.code,
      organiser: this.data.organiser,
      avatar: this.data.avatar,
      teamName: this.data.teamName,
      memberList: app.getMemberList(true)
    }
    app.setTeam(team);
  },
  // 选择对抗团队
  selectTeam:function(e){
    this.setTeam();
    wx.navigateTo({
      url: '../team/selectTeam/selectTeam'
    })
  },
  // 获取服务端赛事详情
  ajaxTeamDeatail: function(){
    let that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getTeam',
      data: {"code":that.data.code},
      header: {},
      success: function (res) {
        if(res && res.data && res.data.team){
          that.setData({
            teamName: res.data.team.title,
            organiser: res.data.team.createBy.nickname,
            avatar: res.data.team.createBy.avatar
          }) 
        }     
      },
      fail: function (res) {
        console.log(res);
        console.log('请求错误')
      }
    })
  },
  // 获取服务端队员列表
  ajaxMemberList: function () {
    let that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getTeamMemberList',
      data: { "teamid": that.data.code },
      header: {},
      success: function (res) {
        app.setMemberList(res.data.teamMemberList);
        that.refreshData();
      },
      fail: function (res) {
        console.log(res);
        console.log('请求错误')
      }
    })
  },


  //touch start
  touchS: function (e) {
    console.log(e);
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },


  //touch move
  touchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      var tipRight="";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        txtStyle = "left:0rpx";
        tipRight="right:100rpx";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + disX + "rpx";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "rpx";
          tipRight = "right:246rpx";
        }
      }
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index
      var memberList = this.data.memberList;
      memberList[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        memberList: memberList,
        tipRight: tipRight
      });
    }
  },


  //touch end
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "rpx" : "left:0rpx";
      var tipRight = disX > delBtnWidth / 2 ?"right:246rpx":"right:100rpx";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index
      var memberList = this.data.memberList;
      memberList[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        memberList: memberList,
        tipRight: tipRight
      });
    }
  },




  //个人 touch start
  myTouchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        myStartX: e.touches[0].clientX
      });
    }
  },

  //个人 touch move
  myTouchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.myStartX - moveX;
      var delBtnWidth = this.data.myDelBtnWidth;
      var txtStyle = "";
      var tipRight = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        txtStyle = "left:0rpx"; 
        tipRight = "right:100rpx";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + disX + "rpx";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "rpx";
          tipRight = "right:246rpx";
        }
      }
      //更新列表的状态
      this.setData({
        myTxtStyle: txtStyle,
        tipRight: tipRight
      });
    }
  },

  //个人 touch end
  myTouchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.myStartX - endX;
      var delBtnWidth = this.data.myDelBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "rpx" : "left:0rpx";
      var tipRight = disX > delBtnWidth / 2 ? "right:246rpx" : "right:100rpx";
      //获取手指触摸的是哪一项
      //更新列表的状态
      this.setData({
        myTxtStyle: txtStyle,
        tipRight: tipRight
      });
    }
  },


  //重新设置滑动参数
  resetSlide:function(){
    var txtStyle = "left:0rpx";
    //自己
    this.setData({
      myTxtStyle: txtStyle
    })
    //其他人memberList
    if (this.data.memberList) {
      var memberList = this.data.memberList;
      for (var i = 0; i < this.data.memberList.length; i++) {
        memberList[i].txtStyle = txtStyle
      }
      this.setData({
        memberList: memberList
      })
    }
  },

  closeTip:function(){
    this.setData({
      tip: this.data.tip+1
    })
  }


  
})