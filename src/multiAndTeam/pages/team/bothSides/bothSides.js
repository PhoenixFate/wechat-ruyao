
const app = getApp();
var common = require('../../../../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamA: { code: 0, organiser: null, avatar: null, teamName: null, memberList: [] },
    teamB: { code: 0, organiser: "-", avatar:"", teamName: "等待方法应战", memberList: [] },

    roles: [],
    toggle:true, // 双方切换标志
    bIsReady:false,

    isB:false, // 角色区分 true:我为应战方，false:我为挑战方

    messageFlag: false,
    
    message: { "title": "", "text": "", "bottom": "" },
    rolesUrl: ["../../../images/1.png", "../../../images/2.png", "../../../images/3.png", "../../../images/4.png", "../../../images/6.png", "../../../images/7.png", "../../../images/8.png", "../../../images/9.png",],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var amemberList = app.getMemberList(false);
    var a = app.getTeam();
    a.memberList = amemberList;
    a.count = amemberList.length;

    common.init.apply(this, []); // 不加这句模板动画不起作用

    var b = { code: options.code}
    this.setData({
      teamA: a,
      teamB: b,
      roles: app.globalData.roles,
      userInfo:app.globalData.userInfo
    })

    // 发送挑战通知，等待对方同意
    app.setWsHandler(this);
    if(options.isB && options.isB == "true"){
      this.setData({ isB : true});
      app.setMatchFlag(app.constData.MATCH.TEAM);
      this.ajaxTeamDeatail(this.data.teamB);
      this.ajaxMemberList(this.data.teamB);
    }else{
      app.wsSend({ "type": "3", "otherTeamid": this.data.teamB.code});    
    }
    
    this.data.teamA.count = this.data.teamA.memberList.length;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  mine:function(e){
    this.setData({
      toggle:true
    })
  },

  another:function(e){
    this.setData({
      toggle:false
    })
  },

  assignment:function(e){
    if (!this.data.bIsReady){
      this.setMsg("等待对方应战");
      return;
    }
    // 全局保存对抗信息
    var tc = {
      a: this.data.teamA,
      b: this.data.teamB
    }
    app.setTc(tc);
    wx.navigateTo({
      url: '../assignment/assignment',
    })
  },
  // 供socket人员增加时使用  暂不支持，会影响到对方派题
  // addMemberBySocket: function (member, teamid) {
  //   app.addMember(member);
  //   this.refreshData()
  // },
  // 收到对方的应战消息
  challengResultBySocket: function(op){
    if(op === "1"){//接受
      this.data.bIsReady = true;
      this.ajaxTeamDeatail(this.data.teamB);
      this.ajaxMemberList(this.data.teamB);

      app.setBossFlag(app.constData.BOSS.TEAM);
      app.setMatchFlag(app.constData.MATCH.TEAM);
    }else{      
      setTimeout(function () {
        wx.navigateBack({
          delta: 2
        })
      }, 2000)
    }
  },
  // 获取服务端赛事详情
  ajaxTeamDeatail: function (team) {
    let that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getTeam',
      data: { "code": team.code },
      header: {},
      success: function (res) {
        if(res && res.data && res.data.team){
          team.teamName = res.data.team.title;
          team.organiser = res.data.team.createBy.nickname;
          team.avatar = res.data.team.createBy.avatar;
          that.setData({
            teamB: team
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
  ajaxMemberList: function (team) {
    let that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getTeamMemberList',
      data: { "teamid": team.code },
      header: {},
      success: function (res) {
        if (res && res.data && res.data.teamMemberList) {
          team.memberList = res.data.teamMemberList;
          team.count = team.memberList.length;
          that.setData({
            teamB: team
          });
        }
      },
      fail: function (res) {
        console.log(res);
        console.log('请求错误')
      }
    })
  },

})