// pages/award/award.js
const app = getApp();
const util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _num: 0,
    toView: 'first',
    scrollTop: 0,
    award: [],
    order: ['first', 'second', 'third', 'forth'],
    match: ["个人赛", "挑战赛", "多人赛", "团队赛"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      award: app.getAward(),
    })
    if(options.num){
      this.setData({
        _num: options.num,
        toView: this.data.order[options.num]
      })
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

  changeTap: function (e) {
    this.setData({
      _num: e.currentTarget.dataset.num,
      toView: this.data.order[e.currentTarget.dataset.num]
    })
  },

  upper: function () {

  },

  lower: function () {

  },

  scroll: function (res) {
    if(res.detail.scrollTop<300)
    {
      this.setData({
        _num:0
      })
      return;
    }else if(res.detail.scrollTop<670){
      this.setData({
        _num: 1
      })
      return;
    } else if (res.detail.scrollTop < 960) {
      this.setData({
        _num: 2
      })
      return;
    }else{
      this.setData({
        _num: 3
      })
      return;
    }
    
  }


})