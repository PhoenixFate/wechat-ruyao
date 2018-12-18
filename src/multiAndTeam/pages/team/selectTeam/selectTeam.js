// pages/base/team/selectTeam/selectTeam.js
var common = require('../../../../common/common.js');
const util = require('../../../../utils/util.js');
const app = getApp();
//biu时音效对象
const biuAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamList:[],
    chatFlag: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    common.init.apply(this, []); // 不加这句模板动画不起作用
    app.setWsHandler(this);
    // 发送挑战通知，获取其他团队列表
    app.wsSend({ "type": "3" });
  },
  // 接收socket给出的teamList
  initTeamListBySocket: function(tList){
    this.setData({
      teamList: tList
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
    app.setWsHandler(app.getPrevPage());
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

  selectTeam:function(e){
    this.setData({
      codeB: e.target.dataset.code,
      _num:e.target.dataset.num
    })
  },

  challenge:function(e){
    //点击挑战按钮，播放biu音效
    this.playBiuMusic();
    var param = "?code=" + this.data.codeB;
    wx.navigateTo({
      url: '../bothSides/bothSides' + param
    })
  },

  //开始播放biu音效
  playBiuMusic: function () {
    var biuSrc = ["https://www.njrzzk.com/mp3/biu.mp3"];
    util.playMusic(app, biuAudioContext, biuSrc, false);
  },
  
})