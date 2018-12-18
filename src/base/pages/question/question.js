// pages/individual/question/question.js
var app=getApp();
var util = require('../../../utils/util.js');
var common = require('../../../common/common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    matchFlag: 0,      // 赛事类型
    noteName:[],
    totalSeconds:0,   //用totalSeconds
    time: {                //time用于展示
      seconds: 0,
      minutes: 0,
      hours: 0,
    },
    // animas
    nodeAnima:{},
    knowledgeAnima:{},
    optionAnima: {},

    pauseFlag:false,
    extendKnowledgeflag:true,                          //是否显示知识补充具体内容
    _num:-1,
    message:[],
    messageFlag:true,           //是否显示“回答正确/回答错误”等内容
    answerFlag:true,              //是否显示答题模块
    scannerFlag:true,             //是否显示扫码模块
    knowledgeFlag:false,      //是否显示知识补充链接
    helpFlag:false,                  //求助按钮flag
    multiProgress: { flag: false}, // {flag:true,ourside:{isComplete:0,[nickname]:30%,[nickname]:20%,[nickname]:50%}}
    teamProgress: { flag: false},  // {flag:true,ourside:{isComplete:0,xx:30%,sm:20%,cd:50%},opposite:{isComplete:0,xx:30%,sm:20%,cd:50%}}

    abcd:['A','B','C','D','E','F','G'],

    knowledgeList:[],           //保存题目的列表
    answer: {
      bingo: "",                     //保存正确答案
      linkImages: [],                //保存图片链接数组
      linkText: [],                  //保存知识补充内容文本
      optionList: [],                 //保存每道题目具体的选项列表
      node: 0,                      //对象中的节点 1-8
      title: "",                      //当前题目
      type: 0,         //题目类型：选项，扫码，穿戴
    },
    
    isRightArray:[],            //是否答对
    tempUseTimeArray:[],//这个用于计算useTime
    useTimeArray:[],         //用时
    punishTimeArray:[],   //罚时间

    answerTextType: ["选项", "扫码","穿戴"], 
    currNode: 0,                   //当前节点  0-7   用currNode而不是node主要是currNode 和node 可能会不对应，比如说没有第四个节点。。。

    finishedFlag: false,        //个人是否完成赛事
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("question onLoad");
    common.init.apply(this, []); // 不加这句模板动画不起作用
    //设置背景音乐参数
    this.playBackgroundMusic();

    // 设置赛事类型
    this.setData({ matchFlag: app.getMatchFlag()});
    // 设置消息接收
    app.setWsHandler(this); 
    // 初始化题库
    this.initKnowledgeList(options);
    // 计时
    this.countdown();
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("questions onShow");
    //开始播放背景音乐
    this.backgroundAudioContext.play();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("questions onReady");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("questions onHide");

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("questions onUnload");
    //暂停播放背景音乐
    this.backgroundAudioContext.stop();

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

  gotoNextAnima: function () {
    var that = this;    
    var nodeAnima = wx.createAnimation({
      duration: 100,
      timingFunction: 'liner',
    })    
    var scale = 1, zheng = true;
    var nodeAnimaIntever = setInterval(function () {
      this.setData({
        nodeAnima: nodeAnima.scale(scale, scale).opacity(1-scale/40).step().export()
      })   
      scale = zheng?scale+8:scale-8;
      if(scale >= 40){
        zheng = false;
      }
      if(scale <= 0){
        clearInterval(nodeAnimaIntever);
      }

    }.bind(this), 100)
    // setTimeout(function () {
    //   // 答题动画
    //   var knowledgeAnima = wx.createAnimation({
    //     duration: 100,
    //     timingFunction: 'liner',
    //   })
    //   var x = 0;
    //   var knowledgeAnimaIntever = setInterval(function () {
    //     x -= 50;
    //     if (x <= -400) {
    //       x = 400;
    //     }
    //     if (x == 0) {
    //       clearInterval(knowledgeAnimaIntever);
    //     }
    //     this.setData({
    //       knowledgeAnima: knowledgeAnima.left(x).opacity(1 - x / 400).step().export()
    //     })
    //   }.bind(this), 100)
    // }.bind(this), 200)
    // setTimeout(function () {
    //   //选项
    //   var optionAnima = wx.createAnimation({
    //     duration: 100,
    //     timingFunction: 'liner',
    //   })
    //   var t = 0, dir = "down";
    //   var optionAnimaIntever = setInterval(function () {
    //     t = dir === "down" ? t + 50 : t - 50;
    //     if (t >= 650) {
    //       dir = "up";
    //     }
    //     if (dir === "up" && t === 150) {
    //       clearInterval(optionAnimaIntever);
    //     }
    //     this.setData({
    //       optionAnima: optionAnima.top(t).opacity(1 - (t - 150) / 650).step().export()
    //     })
    //   }.bind(this), 50) 
    // }.bind(this), 500)
  },


  // 根据赛事类型，初始化对应题目
  initKnowledgeList: function (options){
    this.setData({
      noteName: app.globalData.noteName
    })
    var that  = this;
    if(this.data.matchFlag == app.constData.MATCH.TEAM
      || this.data.matchFlag == app.constData.MATCH.MULTIPLAYER){
      // 在countdown里已完成取题
      var tmpList = app.getKnowledgeList();
      this.setData({
        knowledgeList: tmpList
      })
      //初始化
      that.setData({
        answer: that.data.knowledgeList[that.data.currNode],
      })
      that.data.tempUseTimeArray.push(0);
      that.changeAnswerType();
    }else{
      //role的值是上一页传参传过来的
      //options.num:即为role的值
      //role的值为1-8
      //通过wx.requset向服务器拉取数据
      var role = options.num || app.getUserInfo().role;
      wx.request({
        url: 'https://www.njrzzk.com/weixin/assignAnswerByRole?role=' + role,
        data: {},
        header: {},
        success: function (res) {
          //修改数据的图片的链接地址，统一加上https://www.njrzzk.com      
          var tmpList = util.addUrlPrefix(res.data.knowledgeList);    
          that.setData({
            knowledgeList: tmpList
          })
          //同时将一份修改后的数据放到全局变量中，以便其他页面使用
          app.setKnowledgeList(tmpList);          
          var knowledgeListId = [];
          for (var i = 0; i < that.data.knowledgeList.length; i++) {
            knowledgeListId.push(that.data.knowledgeList[i].id);
          }
          //保存题目id数组
          app.globalData.knowledgeListId = knowledgeListId;
          
          //初始化
          that.setData({
            answer: that.data.knowledgeList[that.data.currNode],
          })
          that.data.tempUseTimeArray.push(0);
          that.changeAnswerType();
        }
      })
    }
  },

  //点击知识补充按钮
  //修改知识补充的隐藏flag
  knowledge:function(){
    this.setData({
      extendKnowledgeflag: !this.data.extendKnowledgeflag
    })
  },

  //当知识补充显示之后，
  //点击任何地方，隐藏知识补充
  cancel:function(){
    if (this.data.extendKnowledgeflag == false){
      this.setData({
        extendKnowledgeflag: !this.data.extendKnowledgeflag
      })

    }
    if(this.data.helpFlag==true){
      this.setData({
        helpFlag: !this.data.helpFlag
      })
    }
    
  },



  //点击任何一个答案选项
  //触发此功能
  //util.throttle一段时间内只点击一次
  answerClick:util.throttle(function(e) {
    //开始播放点击音效
    this.playAnswerPressMusic();

    this.setData({
      _num: e.target.dataset.num
    })
    
    //记录当前时间点
    this.data.tempUseTimeArray.push(this.data.totalSeconds);
    //bingo==0 代表选择任何一项都为正确的
    //选对了，则为正确
    //修改message显示的flag
    var isCorrent = false;
    var punishTime = 0;
    if (e.target.dataset.num == this.data.answer.bingo || this.data.answer.bingo == '0') {
      this.data.isRightArray.push(true);
      this.data.punishTimeArray.push(0);
      isCorrent = true;
      this.setData({
        message: "回答正确",
        messageFlag: false
      })
    }
    //否则为错误，增加答题时间
    //修改message显示的flag
    else {
      this.data.isRightArray.push(false);
      this.data.punishTimeArray.push(10);
      this.setData({
        message: "回答错误，时间加10秒",
        messageFlag: false,
        totalSeconds: this.data.totalSeconds + 10
      })
      punishTime = 10;
    }
    //同时将个人填写的答案记录下来
    //以便挑战回顾等环节使用
    app.setPersonalAnswer(e.target.dataset.num, isCorrent, punishTime);

    this.changeList();  
  },2000),



  //扫码题，穿戴题调用此方法
  scannerButtonClick: util.throttle(function () {
    //开始播放点击音效
    this.playAnswerPressMusic();
    var that=this;
    wx.scanCode({
      success: (res) => {
        //记录当前时间点
        this.data.tempUseTimeArray.push(this.data.totalSeconds);
        //选对了，则为正确
        //修改message显示的flag
        var isCorrent = true;
        var punishTime = 0;
        if (!this.data.answer.bingo || res.result == this.data.answer.bingo) {
          this.data.isRightArray.push(true);
          this.data.punishTimeArray.push(0);
          this.setData({
            message: "回答正确",
            messageFlag: false
          })
        }
        //否则为错误，增加答题时间
        //修改message显示的flag
        else {
          this.data.isRightArray.push(false);
          this.data.punishTimeArray.push(10);
          this.setData({
            message: "回答错误，时间加10秒",
            messageFlag: false,
            totalSeconds: this.data.totalSeconds + 10
          })
          isCorrent = false;
          punishTime = 10;
        }
        //同时将个人填写的答案记录下来
        //以便挑战回顾等环节使用
        app.setPersonalAnswer(res, isCorrent, punishTime);

        this.changeList();
      }
    })
    
  },2000),

  //点击求助按钮，调用此方法
  //减时，暂停等功能
  //{"time":{"add":"10"}}
  //{"time":{"minus":"10"}}
  //{"option":"pause"}
  //{"option":"resume"}
  help:function(){
    var that=this;
    wx.scanCode({
      success: (res) => {
        if(res.result){
          var result = JSON.parse(res.result)
          if(result.option){
            if (result.option == "pause") {
              that.setData({
                pauseFlag: true
              })
            }
            else if (result.option == "resume") {
              that.setData({
                pauseFlag: false
              })
            }
          }
          if (result.time) {
            if (result.time.add) {
              that.setData({
                totalSeconds: that.data.totalSeconds + parseInt(result.time.add)
              })
            }
            else if (result.time.minus) {
              that.setData({
                totalSeconds: that.data.totalSeconds - parseInt(result.time.minus)
              })
            }
          }

        }

        
      }
    })
  },

  //多人赛其他人的进展
  multiProgress: function (e) {
    this.data.multiProgress.flag = true;
    this.setData({
      multiProgress: this.data.multiProgress
    })
  },

  //显示多人赛其他人的进展结束
  multiProgressTouchEnd: function (e) {
    this.data.multiProgress.flag = false;
    this.setData({
      multiProgress: this.data.multiProgress
    })
  },

  //团队赛进展
  teamProgress: function (e) {
    this.data.teamProgress.flag = true;
    this.setData({
      teamProgress: this.data.teamProgress
    })
  },

 //显示团队赛进展结束
  teamProgressTouchEnd: function (e) {
    this.data.teamProgress.flag = false;
    this.setData({
      teamProgress: this.data.teamProgress
    })
  },
  
  //js:计时功能的方法
  countdown: function () {
    var that = this;
    if (!this.data.pauseFlag && !this.data.finishedFlag ){
    var totalSeconds=parseInt(that.data.totalSeconds)+1;
    var time = { "seconds": totalSeconds % 60, "minutes": Math.floor(totalSeconds / 60 % 60), "hours": Math.floor(totalSeconds / 3600)};
    that.setData({
      time: time,
      totalSeconds:totalSeconds
    });
    }
    setTimeout(function () {
      that.countdown();
    }, 1000)
  },

  // socket推送：收到全部完成信息
  successBySocket: function(msg){
    // 此时是多人赛或团队赛
    var result = {
      ourside: msg.ourside,
      opposite: null
    }
    if (msg.opposite) {
      result.opposite = msg.opposite;
    }
    this.setData({
      finishedFlag: false
    });
    app.setMatchResult(result);
    var that = this;
    setTimeout(function () {
      wx.redirectTo({
        url: '../success/success?totalSeconds=' + that.data.totalSeconds
      })
    }, 1000)
  },
  // 判断我是不是进度完成
  checkProgress: function() {
    if (this.data.currNode == this.data.knowledgeList.length - 1) {
      this.data.finishedFlag = true;
    }
    if (this.data.finishedFlag){
      if (this.data.matchFlag == app.constData.MATCH.MULTIPLAYER
        || this.data.matchFlag == app.constData.MATCH.TEAM) { // 多人赛 或 团队赛
        // 等待其他成员一起结束
        this.setData({
          finishedFlag: this.data.finishedFlag
        });
      }else{ // 个人赛、挑战赛、擂台赛
        var that = this;
        setTimeout(function () {
          wx.redirectTo({
            url: '../success/success?totalSeconds='+that.data.totalSeconds
          })
        }, 1000)
      }
    }

    return this.data.finishedFlag;
  },

  //封装从一题转换到另一题的数据的转换
  changeList: function () {
    //当前节点为最后一个节点时，跳转到success页面
    //并将totalSeconds传过去
    var that = this;
    
    if (this.data.currNode == 0){
      this.data.useTimeArray.push(this.data.tempUseTimeArray[this.data.currNode]);
    }else{
      this.data.useTimeArray.push(this.data.tempUseTimeArray[this.data.currNode] - this.data.tempUseTimeArray[this.data.currNode - 1]);
    }
    
    // 答题进度
    this.progressBroadCast();

    if (this.checkProgress()) { // 完成时不用往下走了
      return;
    }
    // 这个位置很重要，别要乱动
    this.setData({
      currNode: this.data.currNode + 1
    });
   
    //延时两秒设置
    that.gotoNextAnima();
    setTimeout(function () {
      //将所有显示的数据修改为下一个节点的数据
      that.setData({
        answer: that.data.knowledgeList[that.data.currNode],
        messageFlag: true,//一般切换数据，同时将flag修改为默认状态
        _num: -1,
      })
      that.changeAnswerType();
    }, 600)
  },
  //封装选项，扫码，穿戴类型的相关显示信息，及显示flag
  //封装了知识链接的显示flag
  changeAnswerType: function () {
    //类型为0，则表示为选项题目，
    //修改选项显示的flag 和 扫码显示的flag
    //类型为1，则表示为扫码题目，
    //修改选项显示的flag 和 扫码显示的flag
    //类型为2，则表示为穿戴题目，
    //修改选项显示的flag 和 扫码显示的flag
    if (this.data.answer && this.data.answer.type){
      this.setData({
        answerFlag: this.data.answer.type != 0,
        scannerFlag: this.data.answer.type == 0
      })      
    }
    
    //知识链接的flag设置：
    //图片链接为空，文本为空，则不显示知识链接选项
    //否则显示知识链接选项
    if (this.data.answer && 
      ((this.data.answer.linkImages && this.data.answer.linkImages.length && this.data.answer.linkImages.length > 0) || 
      this.data.answer.linkText)) {
      this.setData({
        knowledgeFlag: true
      })
    }else{
      this.setData({
        knowledgeFlag: false
      })
    }
  },

  // 进度通知
  progressBroadCast: function(){     
    // 通知里要有题型、是否正确、答题时间、罚时
    if (this.data.matchFlag == app.constData.MATCH.MULTIPLAYER 
      || this.data.matchFlag == app.constData.MATCH.TEAM) { // 多人赛 团队赛
      // 发送socket通知
      app.wsSend({ 
        "type": "10", 
        "knowledgeType": this.data.answer.type, 
        "isCorrent": this.data.isRightArray[this.data.currNode] + "", 
        "useTime": this.data.useTimeArray[this.data.currNode] + "", 
        "punishTime": this.data.punishTimeArray[this.data.currNode] + ""
      });
    }
  },

  // 收到socket进度通知
  progressBySocket:function(msg){
    if (this.data.matchFlag == app.constData.MATCH.MULTIPLAYER) { // 多人赛
      this.setData({
        multiProgress: { 
          flag: this.data.multiProgress.flag,
          ourside: msg.ourside
        } // {flag:true,ourside:{isComplete:0,[nickname]:30%,[nickname]:20%,[nickname]:50%}}
      });
    }
    if (this.data.matchFlag == app.constData.MATCH.TEAM) { // 团队赛
      this.setData({
        teamProgress: {
          flag: this.data.teamProgress.flag,
          ourside: msg.ourside,
          opposite: msg.opposite
        }  // {flag:true,ourside:{isComplete:0,xx:30%,sm:20%,cd:50%},opposite:{isComplete:0,xx:30%,sm:20%,cd:50%}}
      });
    }
  },

  helpKnowledge:function(){
    this.setData({
      helpFlag:true
    })
  },


  //开始播放背景音乐
  playBackgroundMusic:function(){
    //暂时不能用util中的播放音乐的方法，主要是：调用微信扫码后，声音中断。感觉是个bug。
    //背景音效对象
    this.backgroundAudioContext = wx.createInnerAudioContext();
    if (app.globalData.settings.music) {
      this.backgroundAudioContext.autoplay = true;
      this.backgroundAudioContext.loop = true;
      var backgroundMusicSrc = ["https://www.njrzzk.com/mp3/answerBackground.mp3", "https://www.njrzzk.com/mp3/happy.mp3", "https://www.njrzzk.com/mp3/happy2.mp3"];
      //是否遵循系统静音开关，当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音，默认值 true
      this.backgroundAudioContext.obeyMuteSwitch = false;
      var index = parseInt(Math.random() * (backgroundMusicSrc.length));
      this.backgroundAudioContext.src = backgroundMusicSrc[index];
    } else {
      return;
    }
  },

  //开始播放点击答案音效
  playAnswerPressMusic: function () {
    //点击答案的音效对象
    var answerPressAudioContext = wx.createInnerAudioContext();
    var answerPressSrc = ["https://www.njrzzk.com/mp3/answerPress.mp3"];
    util.playMusic(app,answerPressAudioContext, answerPressSrc, false);
  },


})