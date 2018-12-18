// common.js
const app = getApp();
const util = require('../utils/util.js');

function init() {
  var that = this;
  //common中相应的数据
  that.setData({
    anima: null,
    msg: "",
    hide: true,

    chatFlag: true,
    bindInputMessage: "",

    confirmAnima: null,
    confirmDialogFlag: true,
    confirmMsg: "",
    teamid:"",
    inputValue:"",
  });

  //common中相应的 操作
  // that.onShow = function (event) {
  // };

  that.setMsg = function (msg) {
    this.setData({
      anima: {},
      msg: msg,
      hide: false
    });

    this.startAnima();
  },

  that.setConfirmMsg = function (msg) {
    this.setData({
      confirmAnima: {},
      confirmMsg: msg.msg,
      confirmDialogFlag: false,
      teamid: msg.teamid
    });

    this.startConfirmAnima();
  },
  // 接受挑战信息动画效果
  that.startConfirmAnima = function () {
    var confirmAnima = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })

    confirmAnima.scale(2, 2).step()

    this.setData({
      confirmAnima: confirmAnima.export()
    })
  },
  // 接受挑战
  that.bindAcceptChallenge = function(){
    //播放biu音效
    that.playBiuMusic();
    // 发送socket通知
    app.wsSend({ "type": "4", "otherTeamid": that.data.teamid, "op":"1" });
    that.vanishConfirmDialog();

    // var param = "?code=" + that.data.teamid + "&isB=true";
    // wx.reLaunch({
    //   url: '../team/bothSides/bothSides' + param
    // })
  },
  // 拒绝挑战
  that.bindRefuseChallenge = function () {
    // 发送socket通知
    app.wsSend({ "type": "4", "otherTeamid": that.data.teamid, "op": "0" });
    that.vanishConfirmDialog();
  },
  // 使对话框消失
  that.vanishConfirmDialog = function () {
    setTimeout(function () {
      //that.data.confirmAnima.scale(1, 1).step()
      that.setData({
        //confirmAnima: that.data.confirmAnima.export(),
        confirmMsg: "",
        confirmDialogFlag: true
      })
    }.bind(this), 110)
  },
  // 普通提示信息动画效果
  that.startAnima = function () {      
    var anima = wx.createAnimation({
      duration: 2500,
      timingFunction: 'liner',
    })

    anima.top(10).opacity(1).step()

    this.setData({
      anima: anima.export()
    })

    setTimeout(function () {
      anima.top(150).opacity(100).step()
      that.setData({
        anima: anima.export(),
        msg: "",
        hide: true
      })
    }.bind(this), 2600)
  },

  that.showChat = function() {
    that.setData({
      chatFlag: !that.data.chatFlag,
      inputValue: ""
    })
  },

  that.bindInputMsg = function (e) {
    that.setData({
      bindInputMessage: e.detail.value
    }) 
  },

  that.bindSendMessage = function () {
    if (that.data.bindInputMessage) {
      // 发送socket通知
      app.wsSend({ "type": "11", "content": that.data.bindInputMessage });
    }
    that.setData({
      chatFlag: !that.data.chatFlag,
      inputValue:""
    })
  },

    //点击“冲锋号”按钮，发送消息
    that.bindChargeNumber=function(){
        // 发送socket通知
        app.wsSend({ "type": "12" });
    }

    //接收type=12时，播放冲锋号音效
    that.playChargeNumberMusic=function(){
      //冲锋号音效对象
      var chargeNumberAudioContext = wx.createInnerAudioContext();
      var chargeNumberSrc = ["https://www.njrzzk.com/mp3/chargeNumber.mp3"];
      util.playMusic(app, chargeNumberAudioContext, chargeNumberSrc, false);
    },

    //开始播放biu音效
    that.playBiuMusic=function () {
      //biu时音效对象
      var biuAudioContext = wx.createInnerAudioContext();
      var biuSrc = ["https://www.njrzzk.com/mp3/biu.mp3"];
      util.playMusic(app, biuAudioContext, biuSrc, false);
    }
    
};
module.exports = {
  init: init
};
