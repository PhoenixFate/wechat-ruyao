// pages/success/success.js
const app=getApp();
const util = require('../../../utils/util.js');

//根据score获得排名
function calcRankByScore(that,parameters){
  wx.request({
    url: 'https://www.njrzzk.com/weixin/calcRankByScore?score=' + parameters.totalseconds,
    success: function (res) {
      if(res.data.rank){
        var total = res.data.rank.total;
        var rank = res.data.rank.rank;
        var percent = Math.round((total - rank) / total * 100);
        that.setData({
          percent: percent
        })

        that.data.message.first = "您已挑战完成";
        that.data.message.second = "共用: " + that.data.time.hours + "小时" + that.data.time.minutes + "分钟" + that.data.time.seconds + "秒";
        that.data.message.third = "击败了" + percent + "%的对手";

        that.setData({
          currentAwardFlag: false,
          message: that.data.message
        })
      }      
    }
  })
}

//保存用户比赛信息
function saveUserHistory(that, parameters){
  wx.request({
    url: 'https://www.njrzzk.com/weixin/saveUserHistory?openid=' + parameters.openid + "&matchType=" + parameters.matchType + "&matchCode=" + parameters.matchCode + "&time=" + parameters.totalseconds + "&knowledges=" + parameters.knowledges + "&answers=" + parameters.answers + "&createDate=" + parameters.createDate,
    success: function (res) {
    }
  })
}

//保存用户打擂信息
function saveArenaUser(that,parameters){
  wx.request({
    url: 'https://www.njrzzk.com/weixin/arena/saveArenaUser?aid=' + app.globalData.aid + '&openid=' + parameters.openid + '&score=' + parameters.totalseconds + '&status=' + 1,
    success: function (res) {
    }
  })
}

//获得用户擂台赛排名
function getArenaUserRank(that,parameters){
  wx.request({
    url: 'https://www.njrzzk.com/weixin/arena/getArenaUserRank?aid=' + app.globalData.aid + '&openid=' + parameters.openid,
    success: function (res) {
      if (res.data.rank) {
        that.setData({
          rank: res.data.rank.rank
        })
        var message = {
          "first": "您已完成比赛",
          "second": "共用: " + that.data.time.hours + "小时" + that.data.time.minutes + "分钟" + that.data.time.seconds + "秒",
          "third": "本次擂台赛中排名第" + res.data.rank.rank + "名",
          "forth": "您可实时查看擂台赛情况，守擂成功后工作人员会通知"
        };
        that.setData({
          message: message
        })
      }
    }
  });
}

//挑战赛获得对手的挑战信息
function getUserHistory(that,parameters){
  wx.request({
    url: 'https://www.njrzzk.com/weixin/getUserHistory', 
    data: {
      openid: parameters.anotherOpenid,
      datetime: parameters.timestamp
    },
    success: function (res) {
      if(res.data.history){
        var result = "";
        var memo = "";
        var time = res.data.history.time;
        if (parameters.totalseconds < time) {
          //播放胜利音效
          that.playSuccessMusic();
          that.data.message.first = "恭喜您挑战成功";
          that.data.message.second = "共用: " + that.data.time.hours + "小时" + that.data.time.minutes + "分钟" + that.data.time.seconds + "秒";
          that.data.message.third = "战胜了" + app.globalData.challengeNickname + "，胜出了" + (time - parameters.totalseconds) + "秒";

          result = "挑战成功";
          memo = "略胜您" + (time - parameters.totalseconds) + "秒";
        } else {
          //播放失败音效
          that.playFailureMusic();
          that.data.message.first = "很遗憾您挑战" + app.globalData.challengeNickname + "失败";
          that.data.message.second = "共用: " + that.data.time.hours + "小时" + that.data.time.minutes + "分钟" + that.data.time.seconds + "秒";
          that.data.message.third = "略输给对手" + (parameters.totalseconds - time) + "秒";

          result = "挑战失败";
          memo = "略输您" + (parameters.totalseconds - time) + "秒";
        }

        that.setData({
          currentAwardFlag: false,
          message: that.data.message
        })
        //给发起挑战者发消息
        var both = app.globalData.challengeNickname + " VS " + app.getUserInfo().nickname;
        setMsg2startChallenger(parameters.anotherOpenid, both, result, memo, "");
      }
    }
  })
}

//给发起挑战者发消息
function setMsg2startChallenger(openid, both, result, memo, award){
  console.log("formid:"+app.globalData.formid);
  wx.request({
    url: 'https://www.njrzzk.com/weixin/templateMsg',
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      openid: openid,
      formid: app.globalData.formid,
      both: both,
      result: result,
      memo: memo,
      award: award
    },
    success: function (data) {
      console.log(data);
    },
    fail: function (res) {
      console.log(res);
    }
  });
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    useTime:0,
    time:{
      seconds: 0,
      minutes: 0,
      hours: 0
    },
    matchFlag: 0,
    message: { "first": "", "second": "", "third": "", "forth": "" },

    percent:-1,
    challengeNickname:[],

    //奖项：
    award:[],//以前多项奖项统一用award
    currentAward: [],//个人赛，挑战赛，擂台赛：统一用currentAward来展示奖品
    currentAwardFlag:false,
    rank:0,
    multiRank:-1,
    matchResult:{} // 团队赛多人赛 赛事结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var time = { "seconds": options.totalSeconds % 60, "minutes": Math.floor(options.totalSeconds / 60 % 60), "hours": Math.floor(options.totalSeconds / 3600) };
    this.setData({
      useTime:options.totalSeconds,
      time: time,
      matchFlag:app.getMatchFlag(),
      //奖项参数，统一用award
      award:app.getAward(),
    })
    //调用方法的参数都放在parameters中
    var parameters={};
    parameters.totalseconds = options.totalSeconds;
    parameters.knowledges = app.globalData.knowledgeListId;
    parameters.openid = app.getOpenid();
    parameters.matchType = app.getMatchFlag();
    parameters.matchCode = 0;
    parameters.answers = app.getPersonalAnswer().answers;
    parameters.createDate = new Date();
    if (app.globalData.challengeSenderFlag){
      //挑战赛发送方的创建时间为他发给对手时的时间点
      parameters.createDate = app.globalData.challengeTimestamp;
    }

    //当前类型是擂台赛
    //擂台赛调用保存擂台赛的接口信息
    if (this.data.matchFlag == app.constData.MATCH.ARENA){
      this.setData({
        currentAward: { name: "敬请期待", content: "待擂台赛结束时，如果您已晋级擂主，工作人员会与您取得联系。在此之前请确认您的联系方式是否正确", picture: []}
      })
      getArenaUserRank(that,parameters); 
      saveArenaUser(that,parameters);
    }
    //挑战赛外的其他四个赛事：个人赛，挑战赛，多人赛，团队赛
    else{
      //当前类型是个人赛
      if (this.data.matchFlag == app.constData.MATCH.INDIVIDUAL) {
        //个人赛调用接口获取排名，也就是打败xx%的对手
        calcRankByScore(that, parameters);
        for(var i=0; i<this.data.award.length; i++){
          var aw = this.data.award[i];
          if (aw.matchType === this.data.matchFlag){
            var matchResult = { useTime: this.data.useTime };
            matchResult = util.determinSuccess(aw.rule, matchResult);

            if (matchResult.winner === true) {
              //播放胜利音效
              this.playSuccessMusic();              
              that.data.message.forth = "达到了个人赛标准";
              that.setData({
                currentAwardFlag: false,
                currentAward: aw
              })              
            } else {
              //播放失败音效
              this.playFailureMusic();
              that.data.message.forth = "不过很遗憾未达到个人赛标准！";
              that.setData({
                currentAwardFlag: true,
                currentAward: { name: " ", picture: ["../../images/loser.png"] }
              })
            }
            // 暂且break, 后期需要改动
            break;
          }
        }
      }
      //当前类型是挑战赛
      if (this.data.matchFlag == app.constData.MATCH.CHALLENGE) {
        //获得对手的openid和对手挑战赛的timestamp
        parameters.anotherOpenid = app.globalData.challengeOpenid;
        parameters.timestamp = app.globalData.challengeTimestamp;
        getUserHistory(that, parameters);

        for (var i = 0; i < this.data.award.length; i++) {
          var aw = this.data.award[i];
          if (aw.matchType === this.data.matchFlag) {
            var matchResult = { useTime: this.data.useTime };
            matchResult = util.determinSuccess(aw.rule, matchResult);

            if (matchResult.winner === true) {
              that.data.message.forth = "同时达到了个人赛标准";
              that.setData({
                currentAwardFlag: false,
                currentAward: aw
              })
            } else {
              that.setData({
                currentAwardFlag: true,
                currentAward: { name: " ", picture: ["../../images/loser.png"] }
              })
            }
            // 暂且break, 后期需要改动
            break;
          }
        }
      }

      //当前类型是多人赛
      if (this.data.matchFlag == app.constData.MATCH.MULTIPLAYER) {
        // 从question页面把服务端推送的结果取出
        app.getMatchResult().ourside.detail.map(item => {
          item.useTime = util.formatScore(item.useTime);
          return item
        });
        var matchResult = app.getMatchResult();
        // 暂且在这里绑定奖品，后期要通过规则来实现        
        for (var i = 0; i < this.data.award.length; i++) {
          var aw = this.data.award[i];
          if (aw.matchType === this.data.matchFlag) {            
            for (var j = 0; j < aw.rule.length; j++) {
              if (aw.rule[j].operator === "rank") {
                if (matchResult.ourside.detail[aw.rule[j].factor - 1]){
                  matchResult.ourside.detail[aw.rule[j].factor - 1].award = aw;
                }
                break;
              }
            }
          }
        }
        var multiAwardFlag = [matchResult.ourside.detail.length < 2, matchResult.ourside.detail.length<3];
        this.setData({
          matchResult: matchResult,
          multiAwardFlag: multiAwardFlag
        })
        this.setMultiRank();
      }
      //当前类型是团队赛
      if (this.data.matchFlag == app.constData.MATCH.TEAM) {
        // 从question页面把服务端推送的结果取出
        app.getMatchResult().ourside.detail.map(item => {
          item.useTime = util.formatScore(item.useTime);
          return item
        });
        app.getMatchResult().opposite.detail.map(item => {
          item.useTime = util.formatScore(item.useTime);
          return item
        });
        var matchResult = app.getMatchResult(); 
        //判断那边为我方，那边为对方
        if (app.getTeam()) {
          var teamId = app.getTeam().code;
          if (teamId == matchResult.ourside.teamid) {

          } else {
            var temp = matchResult.ourside;
            matchResult.ourside = matchResult.opposite
            matchResult.opposite=temp;
          }
        }
        
        for (var i = 0; i < this.data.award.length; i++) {
          var aw = this.data.award[i];
          if (aw.matchType === this.data.matchFlag) {
            matchResult = util.determinSuccess(aw.rule, matchResult);
            // 暂且break, 后期需要改动
            break;
          }
        }
        
        //准确率四舍五入
        var oursideRightPercent = (matchResult.ourside.correntCount / matchResult.ourside.total * 100).toFixed(2);
        var oppositeRightPercent = (matchResult.opposite.correntCount / matchResult.opposite.total * 100).toFixed(2);
        this.setData({
          matchResult: matchResult,
          oursideRightPercent: oursideRightPercent,
          oppositeRightPercent: oppositeRightPercent
        })
        //我方为获胜者
        if (this.data.matchResult.ourside.winner){
          //播放胜利音效
          this.playSuccessMusic();    
        }
        else{
          //播放失败音效
          this.playFailureMusic();
        }

      }
      //除擂台赛外的其他赛事调用saveUserHistory保存比赛信息
      saveUserHistory(that,parameters);
    }
  },
  /**
   * 颁发奖品模块，所有赛事的奖品决定都由此模块完成
   * 主要执行服务端的奖品规则
   * param:result{用时useTime、准确率rightPercent} //赛事结果
   * 多人赛时，每个人的用时、准确率
   * 团队赛时，两边所有人的用时、准确率
   */
  issueAward: function(result){
    if (this.data.matchFlag == app.constData.MATCH.INDIVIDUAL) {

    } else if (this.data.matchFlag == app.constData.MATCH.CHALLENGE) {

    } else if (this.data.matchFlag == app.constData.MATCH.MULTIPLAYER) {

    } else if (this.data.matchFlag == app.constData.MATCH.TEAM) {

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
  onShareAppMessage: function (options) {
    var title;
    var imgUrl;
    //个人赛标题
    if (this.data.matchFlag == app.constData.MATCH.INDIVIDUAL){
      title = "我在个人赛中击败了" + this.data.percent + "%的对手，快来体验乳瑶人防宝吧";
      imgUrl ="../../images/grsfenx.png";
    }
    //挑战赛标题
    else if (this.data.matchFlag == app.constData.MATCH.CHALLENGE){
      title = "我在挑战赛中和" + app.globalData.challengeNickname+ "进行了PK，快来体验乳瑶人防宝吧";
      imgUrl = "../../images/tzhsaifx.png";
    }
    //多人赛标题
    else if (this.data.matchFlag == app.constData.MATCH.MULTIPLAYER) {
      title = "我在多人赛中获得了第" + this.data.multiRank+ "名的成绩，快来体验乳瑶人防宝吧";
      imgUrl = "../../images/tdsaifenx.png";
    }
    //团队赛赛标题
    else if (this.data.matchFlag == app.constData.MATCH.TEAM) {
      title = "我在团队赛中和对方大战三百回合，快来体验乳瑶人防宝吧";
      imgUrl = "../../images/tdsaifenx.png";
    }
    //擂台赛标题
    else if (this.data.matchFlag == app.constData.MATCH.ARENA) {
      title = "我在擂台赛中获得了第" + this.data.rank + "名的成绩，快来体验乳瑶人防宝吧";
      imgUrl = "../../images/leitaisaifx.png";
    }

    var that = this;
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index',        // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: imgUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function (res) {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        }
        else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      },
    };
    // 来自页面内的按钮的转发
    if (options.from == 'button') {
      // 此处可以修改 shareObj 中的内容
      shareObj.path = '/pages/index/index';
    }
　　// 返回shareObj
　　return shareObj; 
  },

  lookingBack:function(e){
    wx:wx.navigateTo({
      url: '../lookingBack/lookingBack',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  backToIndex:function(e){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  rankList:function(e){
    wx: wx.navigateTo({
      url: '/extension/pages/rankingList/rankingList',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  setMultiRank:function(){
    for (var i = 0; i < this.data.matchResult.ourside.detail.length; i++) {
      if (app.getOpenid() == this.data.matchResult.ourside.detail[i].openid) {
        this.setData({
          multiRank: i + 1
        })
        //多人赛前三名播放胜利音效，第四名开始播放失败音效
        if(i<3){
          this.playSuccessMusic();
        }else{
          this.playFailureMusic();
        }
        break;
      }
    }
  },

  //点击多人赛奖品，显示具体的奖品内容
  showMultiAward:function(e){
    var num = e.currentTarget.dataset.num;
    wx.navigateTo({
      url: '/extension/pages/award/award?num=' + num
    })
  },


  //开始播放胜利音效  
  playSuccessMusic: function () {
    //赛事结果音效对象
    //resultAudioContext暂时只能是一个局部变量，若是全局变量调用微信扫码后声音中断，感觉是个bug。
    var resultAudioContext = wx.createInnerAudioContext();
    var successSrc = ["https://www.njrzzk.com/mp3/success.mp3"];
    util.playMusic(app, resultAudioContext, successSrc, false);
  }, 

  //开始播放失败音效
  playFailureMusic: function () {
    //赛事结果音效对象
    //resultAudioContext暂时只能是一个局部变量，若是全局变量调用微信扫码后声音中断，感觉是个bug。
    var resultAudioContext = wx.createInnerAudioContext();
    var failureSrc = ["https://www.njrzzk.com/mp3/failure.mp3"];
    util.playMusic(app, resultAudioContext, failureSrc, false);
  },

})