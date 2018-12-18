// pages/arena/arena.js
const util = require('../../../utils/util.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userList: { "yearWinner": [], "monthWinner": [],"programWinner":[]},
    totalUserList: { "yearWinner": [], "monthWinner": [], "programWinner": [] },
    userType:["年度擂主","月度擂主","节目擂主"]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getYearWinners();
    this.getMonthWinners();
    this.getProgramWinners();
    
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

  getYearWinners:function(){
    var that=this;
    //年度擂台赛擂主
    wx.request({
      url: 'https://www.njrzzk.com/weixin/arena/getWinnerListByType?type=' + 0,//仅为示例，并非真实的接口地址
      data: {

      },
      header: {
      },
      success: function (res) {
        var totalUserList=that.data.totalUserList;
        totalUserList.yearWinner=res.data.winnerList;
        that.setData({
          totalUserList:totalUserList
        })
        var userList=that.data.userList;
        userList.yearWinner = that.data.totalUserList.yearWinner.slice(0, 3);     
        that.setData({
          userList:userList
        })

      }
    })

  },

  getMonthWinners: function () {
    var that=this;
    //月度擂台赛擂主
    wx.request({
      url: 'https://www.njrzzk.com/weixin/arena/getWinnerListByType?type=' + 1,//仅为示例，并非真实的接口地址
      data: {
      },
      header: {
      },
      success: function (res) {
        var totalUserList = that.data.totalUserList;
        totalUserList.monthWinner = res.data.winnerList;
        that.setData({
          totalUserList: totalUserList
        })
        var userList = that.data.userList;
        userList.monthWinner = that.data.totalUserList.monthWinner.slice(0, 3);
        that.setData({
          userList: userList
        })

      }
    })

  },

  getProgramWinners: function () {
    var that=this;
    //活动擂台赛擂主
    wx.request({
      url: 'https://www.njrzzk.com/weixin/arena/getWinnerListByType?type=' + 2,//仅为示例，并非真实的接口地址
      data: {
      },
      header: {
      },
      success: function (res) {
        var totalUserList = that.data.totalUserList;
        totalUserList.programWinner = res.data.winnerList;
        that.setData({
          totalUserList: totalUserList
        })
        var userList = that.data.userList;
        userList.programWinner = that.data.totalUserList.programWinner.slice(0, 3);
        that.setData({
          userList: userList
        })
      }
    })

  },


  bindViewTap: function (e) {
    var index=e.currentTarget.dataset.num;
    var userType = e.currentTarget.dataset.usertype;
    var openid;
    var aid;
    var title;
    if(userType==1){
      openid = this.data.userList.yearWinner[index].winner;
      aid = this.data.userList.yearWinner[index].id;
      title = this.data.userList.yearWinner[index].title;
    } else if (userType == 2){
      openid = this.data.userList.monthWinner[index].winner;
      aid = this.data.userList.monthWinner[index].id;
      title = this.data.userList.monthWinner[index].title;
    } else if (userType == 3){
      openid = this.data.userList.programWinner[index].winner;
      aid = this.data.userList.programWinner[index].id;
      title = this.data.userList.programWinner[index].title;
    }
    wx: wx.navigateTo({
      url: '../challenger/challenger?aid='+aid+"&openid="+openid+"&title="+title,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }


})