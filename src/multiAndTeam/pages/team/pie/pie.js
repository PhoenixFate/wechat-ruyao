 // pages/base/team/pie/pie.js
import chartWrap from '../../canvas/chartWrap.js'
import getConfig from './getConfig'
var common = require('../../../../common/common.js');
var util = require('../../../../utils/util.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modelFlag: { "view1": true, "view2": false },
    team: {},
    memberKnowlegeMap: {},
    status: 1,   // 1派题中 2等待对方准备/准备 3开始
    readyFlag: false, // 专为对方准备状态用
    actionLabel: "向成员推送",

    params:{},
    bossFlag:0,
    step: { "step1": true, "step2": false},//用于设置按钮先变大后变小
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    let pageThis = this
    app.setWsHandler(this);

    common.init.apply(this, []); // 不加这句模板动画不起作用

    var team = app.getTeam();
    var params = {zl:0,bp:0,cd:0};
    if (team.knowledgeList){
      params.zl = team.knowledgeList.zl.length;
      params.bp = team.knowledgeList.bp.length;
      params.cd = team.knowledgeList.cd.length;
    }

    this.setData({
      team: team,
      params: params,
      bossFlag: app.getBossFlag(),
    });

    app.deviceInfo.then(function (deviceInfo) {
      console.log('设备信息', deviceInfo)
      let width = Math.floor((deviceInfo.windowWidth - (deviceInfo.windowWidth / 750) * 10 * 2)*0.85)//canvas宽度
      let height = width
      let canvasId = 'myCanvas'
      let canvasConfig = {
        width: width,
        height: height,
        id: canvasId
      }
      let config = getConfig(canvasConfig, params)
      chartWrap.bind(pageThis)(config)
    })
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
  // 收到对方准备后的动作
  doReady: function(){
    this.setData({
      readyFlag: true
    });   
  },
  doStart: function(){
    wx.reLaunch({
      url: '../countDown/countDown',
    })
  },
  // 普通成员收到已派的题目显示
  showKnowledgeDetailForMember(openid, knowleges) {
    this.data.memberKnowlegeMap[openid] = knowleges;
    this.setData({
      memberKnowlegeMap: this.data.memberKnowlegeMap
    });
    var nextPage = app.getCurrPage();
    if (nextPage && nextPage.route == "/multiAndTeam/pages/team/selectQuestions/selectQuestions"){
      nextPage.statisticMemberKnowlegeDetailMap();
    }
  },
  // 还原 和selectQuestion中的分拣对应
  revert: function (detail, knowleges){
    var memberKnowledge = [];
    var index = 0;

    assemKnowledge(detail.zl, "0");
    assemKnowledge(detail.bp, "1");
    assemKnowledge(detail.cd, "2");

    function assemKnowledge(count, type){
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < knowleges.length; j++) {
          if (knowleges[j].type == type) {
            memberKnowledge[index] = knowleges.splice(j, 1)[0];
            index++;
            break;
          }
        }
      }
    }
    
    return memberKnowledge;
  },

  // 手动分配给成员
  assignByhand: function (detailMap) { // from selectQuestions
    var knowleges = this.data.team.knowledgeList.zl;
    knowleges = knowleges.concat(this.data.team.knowledgeList.bp);
    knowleges = knowleges.concat(this.data.team.knowledgeList.cd);
    for (var key in detailMap) {      
      this.data.memberKnowlegeMap[key] = this.revert(detailMap[key], knowleges);
    };
  },

  // 随机给成员派题
  random: function(){
    var knowleges = this.data.team.knowledgeList.zl;
    knowleges = knowleges.concat(this.data.team.knowledgeList.bp);
    knowleges = knowleges.concat(this.data.team.knowledgeList.cd);
    // 将题目按人数等分
    var memberCount = this.data.team.memberList.length;
    // 一人几道
    var memberKnowlegeMap = {};
    var seg = Math.round(knowleges.length / memberCount);
    for (var i = 0; i < this.data.team.memberList.length; i++){      
      memberKnowlegeMap[this.data.team.memberList[i].openid] = knowleges.splice(0, seg);      
    }
    this.setData({
      memberKnowlegeMap: memberKnowlegeMap,
      step: { "step1": false, "step2": true }
    });
  },

  start:function(e){
    this.setData({
      step: { "step1": false, "step2": false }
    })
    if (this.data.bossFlag === app.constData.BOSS.MULTIPLAYER){
      if (this.data.status == 1) {
        this.setData({
          status: 2,
          actionLabel: "准备"
        });
        this.broadCastKnowledge();
      } else if (this.data.status == 2){
        this.data.status = 3; // 防止多点
        // 发送准备socket通知
        app.wsSend({ "type": "8", "xx": "" + this.data.team.knowledgeList.zl.length + "", "sm": "" + this.data.team.knowledgeList.bp.length + "", "cd": "" + this.data.team.knowledgeList.cd.length + "" });
      }
    } else if (this.data.bossFlag === app.constData.BOSS.TEAM){
      if (this.data.status == 1) {
        this.setData({
          status: 2,
          actionLabel: "开始"
        });
        this.broadCastKnowledge();
      }
      if (this.data.status == 2 && this.data.readyFlag) {
        this.data.status = 3; // 防止多点
        // 发送开始socket通知
        app.wsSend({ "type": "9", "xx": "" + this.data.team.knowledgeList.zl.length + "", "sm": "" + this.data.team.knowledgeList.bp.length + "", "cd": "" + this.data.team.knowledgeList.cd.length + "" });
      }else{
        this.setMsg("等待对方准备");
      }
    }
  },

  broadCastKnowledge: function(){
    for (var key in this.data.memberKnowlegeMap) {
      // 发送socket通知
      app.wsSend({ "type": "7", "memberOpenid": key, "knowledgeCount": "" + this.data.memberKnowlegeMap[key].length + "" ,"knowledgeIds": this.data.memberKnowlegeMap[key] });
    };
  },


  showView1:function(){
    this.setData({
      modelFlag: { "view1": true, "view2": false }
    })
  },

   showView2: function () {
    this.setData({
      modelFlag: { "view1": false, "view2": true }
    })
  }

})