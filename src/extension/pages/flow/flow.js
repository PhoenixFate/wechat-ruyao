// pages/flow/flow.js
const app = getApp()
const util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  onShareAppMessage: function (options) {
    var that = this;
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      imageUrl: '../../images/tzhsaifx.png',//自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      title: "我在乳瑶人防宝中向你发起了挑战，敢不敢来应战!",// 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index',// 默认是当前页面，必须是以‘/’开头的完整路径

      success: function (res) {
        console.log(res);
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          app.setMatchFlag(app.constData.MATCH.INDIVIDUAL);
          //挑战赛转发成功后跳转到相应的页面
          wx.navigateTo({
            url: '/base/pages/selectRole/selectRole',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })

        }
      },
      fail: function (res) {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          console.log("用户取消");
          // 用户取消转发
        }
        else if (res.errMsg == 'shareAppMessage:fail') {
          console.log("转发失败 ");
          // 转发失败，其中 detail message 为详细失败信息
        }
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      },
    };
    // 来自页面内的按钮的转发
    if (options.from == 'button') {
      var openid = app.globalData.openid;
      var timeStamp = util.formatTime2(new Date());
      var nickname = app.globalData.userInfo.nickName;
      var formid = app.globalData.formid;
      console.log("formid:" + formid);
      app.globalData.challengeTimestamp = timeStamp;
      app.globalData.challengeSenderFlag = true;
      //挑战者发送方把自己的时间戳，昵称，openid一并发送给对方
      shareObj.path = '/base/pages/selectRole/selectRole?openid=' + openid + "&timeStamp=" + timeStamp + "&nickname=" + nickname + "&formid=" + formid;
    }
    　　// 返回shareObj
    　　return shareObj;
  },

  selectFriend:function(){
    
  }



})