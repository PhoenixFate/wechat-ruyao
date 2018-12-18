// pages/multiplayer/multiplayer.js
const util = require('../../../utils/util.js');
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue:null,
    messageFlag:false,
    messagee:null,
    inputFlag: false,
    display:'none',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    if(options.route && options.route=="team"){//从团队赛入口进入，需要将标题修改
      wx.setNavigationBarTitle({
        title: "团队赛"
      })
    }
    // 多人赛类型
    app.setMatchFlag(app.constData.MATCH.MULTIPLAYER);
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

  showView: function (e) {
    this.setData({
      display:''
    })
  },

  hiddenView: function (e) {
    this.setData({
      display: 'none'
    })
  },


  bindInput:function(e){    
    this.setData({
      inputValue:e.detail.value
    })    
  },

  join:function(e){
    let n = this.data.inputValue;
    if (n == null) { //是否为空
      this.setMessage("输入的代号不能为空");      
    } else if (util.isNumber(n) == false){ // 是否为数字
      this.setMessage("代号只能为数字"); 
    }else{
      var that = this;
      wx.request({ // 检查团队代号是否有效
        url: 'https://www.njrzzk.com/weixin/isExistTeamCode',
        data: {"code": n},
        header: {},
        success: function (res) {
          if(res && res.data && res.data.result == true){
            app.setBossFlag(app.constData.BOSS.NORMAL); // 参与者     
            wx.reLaunch({
              url: '/multiAndTeam/pages/house/house?code=' + n,
            })
          }else{
            that.setMessage("输入的代号不存在"); 
          }
        }
      })      
    }
  },

  create:function(e){
    var that=this;
    wx.request({
      url: 'https://www.njrzzk.com/weixin/radomTeamCode', 
      data: {},
      header: {},
      success: function (res) {
        if (res && res.data && res.data.teamCode){
          that.setMessage("创建的房间号为: " + res.data.teamCode); 
          app.setBossFlag(app.constData.BOSS.MULTIPLAYER); // 组织者
          wx.reLaunch({
            url: '/multiAndTeam/pages/house/house?code=' + res.data.teamCode,
          })
        }
      }
    })
  },
  // 设置message
  setMessage: function(msg){
    this.setData({
      messageFlag: true,
      message: msg
    })
    let that = this;
    setTimeout(function () {
      that.setData({
        messageFlag: false,
      })
    }, 1000)  
  }

})