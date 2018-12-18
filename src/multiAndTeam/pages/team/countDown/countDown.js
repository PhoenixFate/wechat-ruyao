// pages/base/team/countDown/countDown.js
var app = getApp()
const util = require('../../../../utils/util.js');

var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');

function drawArc(s, e) {
  ctx.setFillStyle('white');
  ctx.clearRect(0, 0, 200, 200);
  ctx.draw();
  var x = 100, y = 100, radius = 96;
  ctx.setLineWidth(6);
  ctx.setStrokeStyle('#e7eeff');
  ctx.setLineCap('round');
  ctx.beginPath();
  ctx.arc(x, y, radius, s, e, false);
  ctx.stroke();
  ctx.draw()
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    downCount: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //播放倒计时音效：
    this.playCountDownMusic();
    //开始10秒倒计时：
    this.initCountDown();
  },



  initCountDown:function(){
    var cxt_arc = wx.createCanvasContext('canvasCircle');
    cxt_arc.setLineWidth(6);
    cxt_arc.setStrokeStyle('#00fcff');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(100, 100, 96, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();

    clearInterval(varName);
    var page = this;

    this.ajaxGetKnowledgeList();

    var step = 1, startAngle = 1.5 * Math.PI, endAngle = 0;
    var animation_interval = 1000, n = 10;
    var animation = function () {
      if (step <= n) {
        endAngle = step * 2 * Math.PI / n + 1.5 * Math.PI;
        drawArc(startAngle, endAngle);
        page.setData({
          downCount: (n - step)
        })
        if (step == 10) {
          wx.reLaunch({
            url: '/base/pages/question/question',
          })
        }
        step++;
      } else {
        clearInterval(varName);
      }
    };
    varName = setInterval(animation, animation_interval);

  },


  // 为团队赛加载题目
  ajaxGetKnowledgeList: function(){
    if (app.getMatchFlag() == app.constData.MATCH.TEAM) {
      var kList = app.getKnowledgeList();
      // 这些list只有id，没有具体内容，需要拉取详情
      var param = "?ids=";
      for (var i = 0; i < kList.length; i++) {
        if (i > 0) {
          param += ",";
        }
        param += kList[i].id;
      }
      wx.request({
        url: 'https://www.njrzzk.com/weixin/getKnowledgeByIds' + param,
        data: {},
        header: {},
        success: function (res) {
          //将返回的数据保存一份到全局变量
          //全局变量的题目的数据用于挑战回顾项目
          //修改数据的图片的链接地址，统一加上https://www.njrzzk.com
          var tmpList = util.addUrlPrefix(res.data.knowledgeList);
          
          //同时将一份修改后的数据放到全局变量中，以便其他页面使用
          app.setKnowledgeList(tmpList);
        }
      })
    } else if (app.getMatchFlag() == app.constData.MATCH.MULTIPLAYER){
      var role = app.getUserInfo().role;
      wx.request({
        url: 'https://www.njrzzk.com/weixin/assignAnswerByRole?role=' + role,
        data: {},
        header: {},
        success: function (res) {
          //将返回的数据保存一份到全局变量
          //全局变量的题目的数据用于挑战回顾项目
          //修改数据的图片的链接地址，统一加上https://www.njrzzk.com
          var tmpList = util.addUrlPrefix(res.data.knowledgeList);

          //同时将一份修改后的数据放到全局变量中，以便其他页面使用
          app.setKnowledgeList(tmpList);
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

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
    //停止播放音乐
    this.countDownAudioContext.stop();
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

  //开始播放倒计时音乐
  playCountDownMusic: function () {
    //倒计时音效对象
    this.countDownAudioContext = wx.createInnerAudioContext();
    var countDownMusicSrc = ["https://www.njrzzk.com/mp3/countDown.mp3", "https://www.njrzzk.com/mp3/heartbeat.mp3"];
    util.playMusic(app, this.countDownAudioContext, countDownMusicSrc, false);
  },

})