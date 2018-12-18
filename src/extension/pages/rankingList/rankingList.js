const app=getApp();
const util = require('../../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    modelFlag: { "view1": true, "view2": false },
    userList:[],
    oppositeUserList:[],
    rank: -1,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
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

  init:function(){
    var that = this;
    var openid = app.getOpenid();
    var matchFlag = app.getMatchFlag();
    this.setData({
      matchFlag: matchFlag
    })

    var matchResult = app.getMatchResult();
    //多人赛
    if (matchFlag == app.constData.MATCH.MULTIPLAYER
      && matchResult && matchResult.ourside && matchResult.ourside.detail) {      
      this.setData({
        matchResult: matchResult,
        userList: matchResult.ourside.detail,
        count: matchResult.ourside.detail.length
      })
      this.setRank();
    }
    //团队赛
    else if (matchFlag == app.constData.MATCH.TEAM
      && matchResult && matchResult.ourside && matchResult.ourside.detail
      && matchResult.opposite && matchResult.opposite.detail) {
      this.setData({
        matchResult: matchResult,
        userList: matchResult.ourside.detail,
        oppositeUserList: matchResult.opposite.detail,
        count: matchResult.ourside.detail.length
      })
      this.setRank();
    }
    else {
      this.getRank(openid);
      this.getUserList();
    }
  },

  getRank: function (openid){
    var that=this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getUserRank?openid=' + openid, //仅为示例，并非真实的接口地址m
      data: {
      },
      header: {
      },
      success: function (res) {
        that.setData({
          rank: res.data.rank.rank,
        })
      }
    })
  },

  getUserList:function(){
    var that=this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/getUserList', //仅为示例，并非真实的接口地址m
      data: {
      },
      header: {
      },
      success: function (res) {
        that.setData({
          userList: res.data.page.list.map(item => {
            item.bestScore = util.formatScore(item.bestScore);
            return item
          })
        })
      }
    })
  },

  showView1: function () {
    this.setData({
      modelFlag: { "view1": true, "view2": false }
    })
  },

  showView2: function () {
    this.setData({
      modelFlag: { "view1": false, "view2": true }
    })
  },

  setRank:function(){
    for (var i = 0; i < this.data.matchResult.ourside.detail.length; i++) {
      if (app.globalData.openid == this.data.matchResult.ourside.detail[i].openid) {
        this.setData({
          rank: i + 1
        })
        break;
      }
    }
  }
})