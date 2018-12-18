
//app.js
let Promise = require('./libs/ES2015ponyfill/promise').Promise;
const util = require('./utils/util.js');
//引入websocket
var websocket = require('./utils/websocket.js');
var msgReceived = require('./utils/msgHandler.js');
//引入缓存
var wc = require('./utils/wcache.js');

App({
  onLaunch: function () {
    wc.clear();
    var that=this;
    this.deviceInfo = this.promise.getDeviceInfo();
    // 登录
    this.login();
    // 异步加载奖品信息
    var awardList = wc.get('awardList');
    if (awardList){
      this.loadAward(awardList);
    }else{
      wx.request({
        url: 'https://www.njrzzk.com/weixin/getAwardList',
        data: {},
        header: {},
        success: function (res) {
          var awardList = res.data.awardList.map(item => {
            item.picture = util.addPictureHead(item.picture);
            return item
          });
          // 缓存半小时
          // wc.put('awardList', awardList, 1800);
          that.loadAward(awardList);
        },
        fail: function (res) {
          console.log(res);
          console.log('请求错误')
        }
      })
    }
    //缓存中获取用户的settings设置
    var settings = wc.get('settings');
    if (settings)
    {
      console.log(settings);
      app.globalData.settings = settings;
    }
  }, 

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     // socket重连
    let team = this.getTeam();
    let ui = this.getUserInfo();
    if (!this.globalData.isOnline && team && team.code && ui && ui.openid){
      this.wsConn(team.code, ui.openid);
      this.globalData.isOnline = true;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // socket掉线
    this.globalData.isOnline = false;
    if (this.getMatchFlag() === this.constData.MATCH.MULTIPLAYER || this.getMatchFlag() === this.constData.MATCH.TEAM){
      this.wsSend({ "type": "404" });
    }
  },
    
  login: function(){
    var that = this;
    //登录
    wx.login({
      success: function (res) {
        var code = res.code;
        if (res.code) {
          wx.getUserInfo({
            lang: "zh_CN",
            // withCredentials: true,
            success: function (res) {
              // userInfo 只存储个人的基础数据
              wc.put('userInfo', res.userInfo);
              that.setUserInfo(res.userInfo);

              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
              // 请求自己的服务器，解密用户信息 获取unionId等加密信息
              that.globalData.encryptInfo = wc.get('encryptInfo');
              that.globalData.openid = wc.get('openid') || wx.request({
                url: 'https://www.njrzzk.com/weixin/decodeUserInfo',//自己的服务接口地址
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  encryptedData: res.encryptedData,
                  iv: res.iv,
                  code: code,
                },
                success: function (data) {
                  //4.解密成功后 获取自己服务器返回的结果
                  if (data.statusCode == 200) {
                    console.log('解密成功');
                    var encryptInfo = data.data.userInfo;
                    wc.put('openid', encryptInfo.openId); // 单独存储openid
                    that.setOpenid(encryptInfo.openId);
                    wc.put('encryptInfo', encryptInfo); // 存储解密之后的数据
                    that.globalData.encryptInfo = encryptInfo;
                  } else {
                    console.log('解密失败')
                  }
                },
                fail: function (res) {
                  console.log(res);
                }
              });

              console.log(that.globalData.encryptInfo);
              console.log(that.globalData);
            },
            fail: function (res) {
              console.log(res);
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },

  //加载奖品信息
  loadAward: function (awardList) {
    var list = [];    
    for (var i = 0; i < awardList.length; i++) {
      // 遍历奖品列表，为小程序多处使用做准备
      var temp = awardList[i];
      var rule = temp.rule;
      for (var j = 0; j < rule.length; j++) {
        var award = {
          name: "", // 奖品名称
          content: "", // 奖品说明
          matchType: this.constData.MATCH.INDIVIDUAL, // 奖品所属的赛事类型
          rule: [], // { operator: "", factor: 0}, // 规则有时间少于n，也有排名在n，等等，比较灵活
          ruleIntro: "", // 对于该规则的说明，主要在奖品介绍中使用
          picture: [] // 奖品图片
        };
        award.name = temp.name;
        award.content = temp.content;
        award.picture = temp.picture;
        for (var key in rule[j]) {
          if (key === "match_type"){
            award.matchType = rule[j][key];
          }else{
            award.rule.push({ operator: key, factor: rule[j][key] });
          }
        } 
        // 将奖品规则翻译成对应文字说明
        award.ruleIntro = util.awardRuleTranslate(award.rule);
        list.push(award);
      }
    }

    this.setAward(list);
  },

  promise: {
    getDeviceInfo: function () {//获取设备信息
      let promise = new Promise((resolve, reject) => {
        wx.getSystemInfo({
          success: function (res) {
            resolve(res)
          },
          fail: function () {
            reject()
          }
        })
      })
      return promise
    }
  },

  wsConn: function (teamid, openid) {
    if (!this.getWsHandler()) { // 未设置消息接收handler
      console.error("未设置消息接收handler");
      reutrn;
    }
    if (!websocket.socketOpened) {
      // setMsgReceiveCallback 
      websocket.setReceiveCallback(msgReceived, this.getWsHandler());
      // connect to the websocket 
      websocket.connect(teamid, openid, this.getBossFlag());
    }
  },

  wsSend: function(jsonMsg){
    if (!this.getWsHandler()){ // 未设置消息接收handler
      console.error("未设置消息接收handler");
      reutrn;
    }
    websocket.send(jsonMsg);
  },

  wsClose: function () {
    websocket.closeSocket();
  },

  getGid: (function () {//全局唯一id
    let id = 0
    return function () {
      id++
      return id
    }
  }),
  getOpenid: function(){
    return this.globalData.openid;
  },
  setOpenid: function(openid){
    this.globalData.openid = openid;
  },
  getUserInfo: function(){
    if (this.globalData.userInfo && util.isBlank(this.globalData.userInfo.openid)){
      this.globalData.userInfo.openid = this.globalData.openid;
    }    
    return this.globalData.userInfo;
  },
  setUserInfo: function (userInfo) {
    if (!util.isBlank(userInfo.nickName)){
      userInfo.nickname = userInfo.nickName;
    }
    userInfo.avatar = userInfo.avatarUrl;
    if(util.isBlank(userInfo.role)){
      userInfo.role = '1';
    }
    this.globalData.userInfo = userInfo;
  },
  getBossFlag: function(){
    return this.globalData.bossFlag;
  },
  setBossFlag: function (bossFlag) {
    this.globalData.bossFlag = bossFlag;
  },
  getMatchFlag: function () {
    return this.globalData.matchFlag;
  },
  setMatchFlag: function (matchFlag) {
    this.globalData.matchFlag = matchFlag;
  },
  getMatchResult: function(){
    return this.globalData.matchResult;
  },
  setMatchResult: function (matchResult) {
    this.globalData.matchResult = matchResult;
  },
  getTeam: function () {
    return this.globalData.team
  },
  setTeam: function (team) {
    this.globalData.team = team
  },
  getTc: function () {
    return this.globalData.tc
  },
  setTc: function (tc) {
    this.globalData.tc = tc
  },
  getWsHandler: function(){
    return this.globalData.wsHandler
  },
  setWsHandler: function (wsHandler) {
    this.globalData.wsHandler = wsHandler
  },
  getMemberList: function(notRemoveSelf){
    if (notRemoveSelf == false){
      this.addMember(this.globalData.userInfo);
    }else{
      // 自己不再memberList中,在userInfo中
      this.removeMember(this.getOpenid());
    }
    return this.globalData.memberList
  },
  setMemberList: function(memberList){
    this.globalData.memberList = memberList;
  },
  addMember: function(member){
    var oldMember = this.getMember(member.openid);
    if(oldMember !== null){
      return;
    }
    this.globalData.memberList.push(member);
  },
  removeMember: function (openid) {
    var index = 0;
    for (var m of this.globalData.memberList) {
      if (openid === m.openid) {
        break;
      }
      index++;
    }
    this.globalData.memberList.splice(index, 1);
  },
  getMember: function (openid) {
    for (var m of this.globalData.memberList){
      if(openid === m.openid){
        return m;
      }
    }
    return null;
  },
  setMemberRole: function (openid, roleid) {
    for (var i = 0; i < this.globalData.memberList.length; i++) {
      if (this.globalData.memberList[i].openid == openid) {
        this.globalData.memberList[i].role = roleid;
      }
    }
    if (this.globalData.userInfo.openid === openid){
      this.globalData.userInfo.role = roleid;
    }
  },
  getKnowledgeList:function(){
    return this.globalData.knowledgeList;
  },
  setKnowledgeList: function (knowledgeList) {
    this.globalData.knowledgeList = knowledgeList;
  },
  getAward:function(){
    return this.globalData.award;
  },
  setAward: function (award) {
    this.globalData.award = award;
  },
  setPersonalAnswers: function (answers) {
    this.globalData.personalAnswer.answers = answers;
  },
  setPersonalAnswer: function(answer, isCorrent, punishTime){
    this.globalData.personalAnswer.answers.push(answer);
    if(isCorrent){
      this.globalData.personalAnswer.correntCount++;
    }
    if(punishTime && punishTime != 0){
      this.globalData.personalAnswer.punishTime += punishTime;
    }
  },
  getPersonalAnswer: function(){
    this.globalData.personalAnswer.rightRate = this.globalData.personalAnswer.correntCount / this.globalData.personalAnswer.answers.length * 100;

    return this.globalData.personalAnswer;
  },
  clearGlobalVariables: function (){
    this.setBossFlag(this.constData.BOSS.NORMAL);
    //断开连接后，不能清空下面两个数值，success页面要用
    // this.setMatchFlag(this.constData.MATCH.INDIVIDUAL);
    // this.setKnowledgeList([]);
    this.setMemberList([]);
    this.setTeam({});
    this.setTc({});
  },
  globalData: {
    userInfo: {},
    openid:null,
    encryptInfo:null,
    time:null,
    timestamp:null,
    //挑战赛挑战方发给接受方的三个数据：
    //openid，timestamp，nickname
    challengeOpenid:null,
    challengeTimestamp:null,
    challengeNickname:null,
    //答题之后自己的答案
    personalAnswer:{
      answers:[],
      rightRate:0,
      correntCount:0,
      punishTime:0
    },
    //挑战赛 挑战方和应战方的标志
    challengeSenderFlag:false,
    challengeAccepterFlag:false,
    //挑战结束后通知被挑战者，模板消息中需要一个formid字段，考虑到小程序的限制，所以需要特殊处理一下
    formid:"",
    personalLessTime:0,
    challengeLessTime:0,
    tip:0,//第一次进入多人赛或团队赛，显示提示
    isOnline: true, // 是否掉线
    //设置页面中的音效和推送服务是否开启，会保存到缓存中
    settings:{"music":"true","push":"true"},
    matchFlag: 0, // 赛事fLag替代personalFlag,multiFlag，teamFlag,arenaFlag等， 使用时用全局常量赋值，如：app.constData.MATCH.INDIVIDUAL: 0, CHALLENGE: 1, MULTIPLAYER: 2, TEAM: 3, ARENA: 4
    matchResult: {}, // 赛事结果明细统计，主要用于团队赛他多人赛，服务端推送的结果保存
    bossFlag:0, // 0普通人 1多人赛组织者 2团队对抗赛组织者
    // 发送websocket时用
    wsHandler:null,
    // 所在team详情
    team:{},
    // 团队对抗信息teamVhallenge
    tc:{}, // {aTeam, bTeam}
    // 多人赛成员列表
    memberList: [],
    aid:null,//擂台赛id
    roles:["选择", "指挥人员","目标防护人员","医疗救护人员","消防人员","物资保障人员","疏散组织人员","防化防疫人员","普通民众"],

    noteName: ['五彩瑶山', '微缩沙盘', '飞夺泸定桥', '泄露沾染', '防化洗消', '文化长廊', '生命复苏', '未来展望'],

    award:[], // 全局奖品列表

    knowledgeList:[],
    knowledgeListId:[],

    nextArena:[],
    lastArena:[],
  },
  constData: {
    BOSS: { // 0普通人 1多人赛组织者 2团队对抗赛组织者
      NORMAL: 0, MULTIPLAYER: 1, TEAM: 2
    },
    MATCH:{
      INDIVIDUAL: 0, CHALLENGE: 1, MULTIPLAYER: 2, TEAM: 3, ARENA: 4
    }
  },
  getPrevPage: function(){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面

    return prevPage;
  },
  getCurrPage: function () {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面

    return currPage;
  }
 
  
})


