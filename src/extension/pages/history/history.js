// pages/history/history.js
const util = require('../../../utils/util.js')
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      historyList:[],
      knowledges:[],
      count:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserHistory();
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

  getUserHistory:function(){
    var that = this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getUserHistory?openid=' + app.globalData.openid,
      data: {
      },
      header: {
      },
      success: function (res) {
        if(res.data.historyList){
            res.data.historyList.map(item => {
              item.knowledges = util.formatArray(item.knowledges);
              item.createDate = util.dateFriendly(item.createDate);
              item.time = util.formatScore(item.time);
              item.answers = util.formatArray(item.answers);
              item.matchType = util.formatMatchType(item.matchType);
              return item
            });
            that.setData({
              historyList: res.data.historyList.slice(0, 100),
              count: res.data.historyList.length
            })
        }
      }

    })
  },


  lookingback:function(e){
      var num=e.currentTarget.dataset.num;
      var historyList=this.data.historyList;
      app.setPersonalAnswers(historyList[num].answers);
      wx.request({
        url: 'https://www.njrzzk.com/weixin/getKnowledgeByIds?ids=' + historyList[num].knowledges, //仅为示例，并非真实的接口地址m
        data: {
        },
        header: {
        },
        success: function (res) {
          app.globalData.obj=res.data;
          app.globalData.knowledgeList=res.data.knowledgeList;
            wx.navigateTo({
              url: '/base/pages/lookingBack/lookingBack',
            })
        }
      })
  }
})