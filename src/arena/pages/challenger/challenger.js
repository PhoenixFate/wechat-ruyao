// pages/arena/challenger/challenger.js

const app=getApp();
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    user:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getChallenger(options);
    

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

  getChallenger:function(options){
    var that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/arena/getArenaUserDetail?aid=' + options.aid + "&openid=" + options.openid,//仅为示例，并非真实的接口地址
      data: {

      },
      header: {
      },
      success: function (res) {
        if(res.data.user){
          if (res.data.user.score) {
            res.data.user.score = util.formatScore3(res.data.user.score);
          }
          if (res.data.user.createDate) {
            res.data.user.createDate = util.mySplit(res.data.user.createDate);
          }

          that.setData({
            user: res.data.user
          })
        }
      
      }
    });

  },

  start:function(){
      wx:wx.navigateTo({
        url: '../../individual/individual',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
  }


})