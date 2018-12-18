// pages/base/team/selectQuestions/selectQuestions.js
var common = require('../../../../common/common.js');
var util = require('../../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moduleFlag:false,
    team: {},
    memberKnowlegeMap: {},
    bossFlag: 0,
    messageFlag: false,
    message: { "title": "", "text": "", "bottom": "" },
    all:{
      totalCount: 0, // 题总数
      zlCount:0,
      bpCount:0,
      cdCount:0
    },
    memberKnowlegeDetailMap: {},
    
    _currOpenid: "",
    assignmentFlag:false,

    nameIndex:0,
    items: [
      { id: "zl", title: "智力题", count: 0, switch: true, disabled: false }, // 智力题
      { id: "bp", title: "奔跑题", count: 0, switch: true, disabled: false }, // 奔跑题
      { id: "cd", title: "穿戴题", count: 0, switch: true, disabled: false }  // 穿戴题
    ]
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    common.init.apply(this, []); // 不加这句模板动画不起作用
      
    this.data.team = app.getTeam();
    
    // 拿来之后还要做题型分拣
    this.statisticMemberKnowlegeDetailMap();   

    this.setData({
      team: this.data.team,
      all: this.data.all,
      bossFlag: app.getBossFlag()
    });
  },

  statisticMemberKnowlegeDetailMap:function(){
    this.data.memberKnowlegeMap = app.getPrevPage().data.memberKnowlegeMap;

    this.data.all.zlCount = this.data.team.knowledgeList.zl.length;
    this.data.all.bpCount = this.data.team.knowledgeList.bp.length;
    this.data.all.cdCount = this.data.team.knowledgeList.cd.length;

    this.data.all.totalCount = this.data.all.zlCount + this.data.all.bpCount + this.data.all.cdCount;
    if (!util.isBlank(this.data.memberKnowlegeMap)){
      for (var key in this.data.memberKnowlegeMap) {      
        this.data.memberKnowlegeDetailMap[key] = this.helpStatistic(this.data.memberKnowlegeMap[key]);      
      };
    }else{ // 初始化
      for (var i=0;i< this.data.team.memberList.length; i++) {
        var key = this.data.team.memberList[i].openid;
        this.data.memberKnowlegeDetailMap[key] = {zl: 0, bp: 0,cd: 0};
      };
    }

    this.setData({
      memberKnowlegeDetailMap: this.data.memberKnowlegeDetailMap
    });
  },
  // 分拣
  helpStatistic:function(knowledges){
    var zl=0,bp=0,cd=0;
    for(var i=0; i<knowledges.length; i++){
      if (knowledges[i].type == "0"){
        zl++;
      } else if (knowledges[i].type == "1") {
        bp++;
      } else if (knowledges[i].type == "2") {
        cd++;
      }
    }
    this.data.all.zlCount -= zl;
    this.data.all.bpCount -= bp;
    this.data.all.cdCount -= cd;

    this.data.all.totalCount = this.data.all.zlCount + this.data.all.bpCount + this.data.all.cdCount;
    this.setData({
      all: this.data.all
    });

    return {
      zl: zl, 
      bp: bp, 
      cd: cd
    };
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

  finish:function(e){
    if (this.data.all.totalCount > 0){
      this.setMsg("仍有未派完的题");
      return;
    }
    app.getPrevPage().assignByhand(this.data.memberKnowlegeDetailMap);
    wx.navigateBack({
      delta: 1
    })
  },

  randomAssignment:function(e){
    app.getPrevPage().random();
    // 拿来之后还要做题型分拣
    this.statisticMemberKnowlegeDetailMap();
  },

  //点击派题保存num
  assignment:function(e){
    var openid = e.currentTarget.dataset.openid;
    var member = this.data.memberKnowlegeDetailMap[openid];

    this.data.items[0].count = member.zl;
    this.data.items[0].switch = true;
    this.data.items[0].disabled = false;
    this.data.items[1].count = member.bp;
    this.data.items[1].switch = true;
    this.data.items[1].disabled = false;
    this.data.items[2].count = member.cd;
    this.data.items[2].switch = true;
    this.data.items[2].disabled = false;

    this.setData({
      assignmentFlag:true,
      items: this.data.items,
      _currOpenid: openid,
      moduleFlag:true
    })
  },

  addNumber: function (e) {
    var id = e.currentTarget.dataset.id;
    for (var i = 0; i < this.data.items.length; i++) {
      if (id === this.data.items[i].id) {
        if (this.data.items[i].switch == false) {
          this.data.message.text = "请先打开该类型选项";
          this.setMessage();
          return;
        }
        var upRange = 0;
        if(id=="zl"){
          upRange = this.data.all.zlCount;
        } else if (id == "bp") {
          upRange = this.data.all.bpCount;
        } else if (id == "cd") {
          upRange = this.data.all.cdCount;
        }
        if (upRange <= 0) { // 超限
          this.data.message.text = "已经大于规定的题数啦";
          this.setMessage();
          return;
        }

        if (id == "zl") {
          this.data.all.zlCount--;
        } else if (id == "bp") {
          this.data.all.bpCount--;
        } else if (id == "cd") {
          this.data.all.cdCount--;
        }

        this.data.items[i].count++;
      }
    }
    this.data.all.totalCount = this.data.all.zlCount + this.data.all.bpCount + this.data.all.cdCount;
    this.setData({
      items: this.data.items,
      all: this.data.all
    })
  },

  minusNumber: function (e) {
    var id = e.currentTarget.dataset.id;
    for (var i = 0; i < this.data.items.length; i++) {
      if (id === this.data.items[i].id) {
        if (this.data.items[i].switch == false) {
          this.data.message.text = "请先打开该类型选项";
          this.setMessage();
          return;
        }
        if (this.data.items[i].count <= 0) {
          this.data.message.text = "已经减至最小啦";
          this.setMessage();
          return;
        }

        if (id == "zl") {
          this.data.all.zlCount++;
        } else if (id == "bp") {
          this.data.all.bpCount++;
        } else if (id == "cd") {
          this.data.all.cdCount++;
        }
        this.data.items[i].count--;
      }
    }
    this.data.all.totalCount = this.data.all.zlCount + this.data.all.bpCount + this.data.all.cdCount;
    this.setData({
      items: this.data.items,
      all: this.data.all
    })
  },

  toggle: function (e) {
    var id = e.currentTarget.dataset.id;
    var curr, other = [], o = 0;

    for (var i = 0; i < this.data.items.length; i++) {
      if (id === this.data.items[i].id) {
        curr = this.data.items[i].switch
      } else {
        other[o] = this.data.items[i].switch;
        o++;
      }
    }
    if (curr == true && other[0] == false && other[1] == false) {
      return;
    }

    for (var i = 0; i < this.data.items.length; i++) {
      if (id === this.data.items[i].id) {
        this.data.items[i].switch = !this.data.items[i].switch;
        if (this.data.items[i].switch) {
        } else {
          if (id == "zl") {
            this.data.all.zlCount += this.data.items[i].count;
          } else if (id == "bp") {
            this.data.all.bpCount += this.data.items[i].count;
          } else if (id == "cd") {
            this.data.all.cdCount += this.data.items[i].count;
          }
          this.data.items[i].count = 0;          
        }
      }
    }

    if (this.data.items[0].switch == false && this.data.items[1].switch == false) {
      this.data.items[2].disabled = true;
    } else if (this.data.items[1].switch == false && this.data.items[2].switch == false) {
      this.data.items[0].disabled = true;
    } else if (this.data.items[0].switch == false && this.data.items[2].switch == false) {
      this.data.items[1].disabled = true;
    } else {
      this.data.items[0].disabled = false;
      this.data.items[1].disabled = false;
      this.data.items[2].disabled = false;
    }
    this.data.all.totalCount = this.data.all.zlCount + this.data.all.bpCount + this.data.all.cdCount;
    this.setData({
      items: this.data.items,
      all: this.data.all
    })
  },

  //确认
  sureModify:function(e){
    var currOpenid = this.data._currOpenid;
    this.data.memberKnowlegeDetailMap[currOpenid].zl = this.data.items[0].count;
    this.data.memberKnowlegeDetailMap[currOpenid].bp = this.data.items[1].count;
    this.data.memberKnowlegeDetailMap[currOpenid].cd = this.data.items[2].count;

    this.setData({
      memberKnowlegeDetailMap: this.data.memberKnowlegeDetailMap,
      assignmentFlag:false,
      moduleFlag:false
    })
  },

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
  }
})