//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    userInfo: {},
    modalFlag: true,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

  },
  //事件处理函数
  modalHide: function() {
    this.setData({
      modalFlag: true
    })
  },
  onLoad: function () {
    //重新设定参数
    app.globalData.challengeSenderFlag = false;
    app.globalData.challengeAccepterFlag = false;
    app.globalData.matchFlag = 0;
    let ui = app.getUserInfo();
    if (ui && ui.openid) {
      this.setData({
        userInfo: app.getUserInfo(),
        hasUserInfo: true
      })
    } else {
      // 获取用户信息
      var that = this;
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              lang: "zh_CN",
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                app.setUserInfo(res.userInfo);
                that.setData({
                  userInfo: app.getUserInfo(),
                  hasUserInfo: true
                })
                
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (app.userInfoReadyCallback) {
                  app.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      })
    }    
  },

  onHide(){

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },

  /**
    * 生命周期函数--监听页面卸载
    */
  onUnload: function () {

  },


  onShow(){

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
      var formid=app.globalData.formid;
      console.log("formid:"+formid);
      app.globalData.challengeTimestamp = timeStamp;
      app.globalData.challengeSenderFlag = true;
      //挑战者发送方把自己的时间戳，昵称，openid一并发送给对方
      shareObj.path = '/base/pages/selectRole/selectRole?openid=' + openid + "&timeStamp=" + timeStamp + "&nickname=" + nickname + "&formid=" + formid;
    }
　　// 返回shareObj
　　return shareObj;
  },

  
  //游戏说明及思想
  introductionClick:function(e){
    wx: wx.navigateTo({
      url: '/extension/pages/introduction/introduction',
      success: function (res) {

      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  //个人赛
   individualClick: function (e) {
     if (!this.data.hasUserInfo) {
       this.setData({
         modalFlag: false
       })
       return;
     }
     app.setMatchFlag(app.constData.MATCH.INDIVIDUAL);
     wx.navigateTo({
       url: '/base/pages/selectRole/selectRole',
       success: function (res) {
       },
       fail: function (res) { },
       complete: function (res) { },
     })    
  },

  //奖品介绍
  awardClick:function(e){
    wx.navigateTo({
      url: '/extension/pages/award/award',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  //挑战赛
  challengeClick:function(e){
    console.log(e.detail.formId);
    app.globalData.formid=e.detail.formId;
    if (!this.data.hasUserInfo) {
      this.setData({
        modalFlag: false
      })
      return;
    }
    wx.navigateTo({
      url: '/extension/pages/flow/flow',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  //排行榜
  rankingListClick:function(e){
    wx.navigateTo({
      url: '/extension/pages/rankingList/rankingList',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  //多人赛
  multiplayerClick:function(e){
    if (!this.data.hasUserInfo) {
      this.setData({
        modalFlag: false
      })
      return;
    }
    wx.navigateTo({
      url: '/multiAndTeam/pages/entry/entry',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  //团队赛
  teamClick: function (e) {
    if (!this.data.hasUserInfo) {
      this.setData({
        modalFlag: false
      })
      return;
    }
    // 不需要设置matchFLag，因为multiplayer中会设置
    wx.navigateTo({
      url: '/multiAndTeam/pages/entry/entry?route=team'
    })
  },

  //历史记录
  historyClick:function(e){
    wx.navigateTo({
      url: '/extension/pages/history/history',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  //擂台赛
  arenaClick:function(e){
    if (!this.data.hasUserInfo) {
      this.setData({
        modalFlag: false
      })
      return;
    }
    app.setMatchFlag(app.constData.MATCH.ARENA);
    wx.navigateTo({
      url: '/arena/pages/arenaIndex/arenaIndex',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },


  //设置
  settingsClick:function(e){
    wx.navigateTo({
      url: '/extension/pages/settings/settings',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  getUserInfo: function (e) {
    if (e.detail.userInfo) { // 授权成功
      app.login(); // 调用app.login解析用户openid
      app.setUserInfo(e.detail.userInfo)
      this.setData({
        userInfo: app.getUserInfo(),
        hasUserInfo: true,
        modalFlag: true
      })
    }
    
  },

  scan:function(e){
    wx.scanCode({
      success: (res) => {
        console.log(res);
        if (res.result.startWith("https://www.njrzzk.com")){
          app.globalData.path=res.result;
        }
        wx.navigateTo({
          url: '/extension/pages/web/web',
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    })

  }

})


