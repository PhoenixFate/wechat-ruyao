// pages/individual/answer/answer.js
 
const app = getApp();
const util = require('../../../utils/util.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
      noteName:[],
     flagArray:[false,false,false,false,false,false,false],
     num:-1,
     matchFlag:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.num)
    if(options.num){
      this.setData({
        num: options.num
      })
    }
    this.setData({
        noteName:app.globalData.noteName,
        matchFlag: app.getMatchFlag(),
    })
    //多人赛时，就直接显示全部，不隐藏了
    if(this.data.matchFlag==2){
      this.setData({
        flagArray: [true, true, true, true, true, true, true]
      })
      setTimeout(function(){
        wx.reLaunch({
          url: '../question/question',
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      },2000)
    }
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

  startChallenge:function(e){
    // console.log(e);
    // if (app.globalData.challengeAccepterFlag){
    //   app.globalData.formid = e.detail.formId;
    // }
    var that=this;
    setTimeout(function(){
      wx.reLaunch({
        url: '../question/question?num=' +that.data.num,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    },600)
    
  },

  whetherShow: function (e) {
    var num=e.currentTarget.dataset.num;
    var flag=this.data.flagArray;
    flag[num]=!flag[num];
    this.setData({
      flagArray:flag
    })
  },


})