// pages/arena/index/index.js
const app = getApp();
const util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arenaList: [],
    nextArena: [],
    openingArena: [],
    lastArena: [],
    nextFlag: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getArenaList()
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

  getArenaList: function () {
    var that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/arena/getArenaList',//仅为示例，并非真实的接口地址m
      data: {

      },
      header: {
      },
      success: function (res) {
        that.setData({
          arenaList: res.data.arenaList
        })
        var nextArena = [];
        var openingArena = [];
        var lastArena = [];
        for (var i = 0; i < that.data.arenaList.length; i++) {
          //根据状态把获得的擂台赛分为：即将开始的擂台赛，正在进行的擂台赛，已经结束的擂台赛
          if (that.data.arenaList[i].status == 0) {
            lastArena.push(that.data.arenaList[i])
          }
          else if (that.data.arenaList[i].status == 1) {
            nextArena.push(that.data.arenaList[i])
          }
          else if (that.data.arenaList[i].status == 2) {
            openingArena.push(that.data.arenaList[i])
          }
        }
        //即将开始的擂台赛，有则显示，没有则正模块不显示
        if (nextArena.length > 0) {
          that.setData({
            nextFlag: true
          })
        }
        that.setData({
          nextArena: nextArena,
          openingArena: openingArena,
          lastArena: lastArena
        })
      
      }
    })
  },


  detailNextArena: function (e) {
    var num = e.currentTarget.dataset.num;
    var aid = this.data.nextArena[num].id;
    wx.navigateTo({
      url: '../detailArena/detailArena?aid=' + aid + '&isOpening=' + false,
    })
  },

  detailOpeningArena: function (e) {
    var num = e.currentTarget.dataset.num;
    var aid = this.data.openingArena[num].id;
    wx.navigateTo({
      url: '../detailArena/detailArena?aid=' + aid + '&isOpening=' + true,
    })
  },


  rank: function (e) {
    wx.navigateTo({
      url: '../winners/winners',
    })
  },

  nextArena: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../nextArena/nextArena'
    })
  },

  lastArena: function (e) {
    wx.navigateTo({
      url: '../lastArena/lastArena'
    })
  }
})