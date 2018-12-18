// pages/arena/detailArena/detailArena.js
const util = require('../../../utils/util.js')
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailArena:[],
    users:[],
    count:0,
    isOpening:false,
    arenaFlag:true,
    aid:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init(options);
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

  init:function(options){
    if (options.isOpening == "true") {
      //隐藏和显示打雷按钮
      this.setData({
        isOpening: true,
      })
    }
    this.setData({
      aid: options.aid
    })
    this.getArenaDetail(options.aid);
  },

  getArenaDetail:function(aid){
    var that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/arena/getArenaDetail?aid=' + aid,//仅为示例，并非真实的接口地址
      data: {

      },
      header: {
      },
      success: function (res) {
        var temp = [];
        temp.push(res.data.arena);
        temp.map(item => {
          item.awardImage = util.addPictureHead2(item.awardImage);
          item.startDate = util.formatTime3(item.startDate);
          item.endDate = util.formatTime3(item.endDate);
        })
        if (res.data.code == 1) {
          that.setData({
            detailArena: res.data.arena,
          })
          if (res.data.arena.userList) {
            that.setData({
              users: res.data.arena.userList.map(item => {
                item.score = util.formatScore(item.score);
                return item
              }),
              count: res.data.arena.userList.length
            })
          }

        }

      }
    })
  },

  startArena: function () {
    if (!this.data.aid){
      return;
    }
    //其他页面用此aid
    app.globalData.aid=this.data.aid;
    wx.navigateTo({
      url: '/base/pages/selectRole/selectRole',
    })
  }
})