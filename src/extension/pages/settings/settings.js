// pages/settings/settings.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: { "title": "", "text": "", "bottom": "" },
    settings: { "music":"", "push":"" },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //设置页面中的音效和推送服务是否开启，会保存到缓存中
      //settings: { "music":"", "push":"" },
      this.setData({
        settings: app.globalData.settings
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
  close:function(){
    wx.navigateBack({
      
    })
  },

  //音效开关绑定事件
  musicSwitchChange:function(e){
    if (e.detail.value){
      this.data.message.text = "已打开音效";
      this.data.settings.music=true;
    }
    else{
      this.data.message.text = "已关闭音效";
      this.data.settings.music=false;
    }
    this.setMessage();
    this.setSettings();
  },

  //推送开关绑定事件
  pushSwitchChange:function(e){
    if (e.detail.value) {
      this.data.message.text = "已打开推送";
      this.data.settings.push = true;
    }
    else {
      this.data.message.text = "已关闭推送";
      this.data.settings.push = false;
    }
    this.setMessage();
    this.setSettings();
  },




  //提示框，1秒后消失
  setMessage: function () {
    var that = this;
    this.setData({
      messageFlag: true,
      message: this.data.message
    })
    setTimeout(function () {
      that.setData({
        messageFlag: false,
      })
    }, 1000)
  },

  //保存用户的settings
  setSettings:function(){
      this.setData({
        settings:this.data.settings
      })
      app.globalData.settings=this.data.settings;
      wx.setStorageSync('settings', this.data.settings);
  }
})