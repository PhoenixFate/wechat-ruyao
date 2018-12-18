// pages/base/house/house.js

const app = getApp();
var common = require('../../../../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tc: null, // 对抗信息
    knowledgeUpRange: 0, // 总题上限不能超过人数*8
    knowledgeDownRange: 0, // 下限不能低于双方总人数

    messageFlag: false,
    message: { "title": "", "text": "", "bottom": "" },

    totalNumber: 30, // 题总数
    items:[
       { id: "zl", title: "智力题", count: 0, switch: true, disabled: false}, // 智力题
       { id: "bp", title: "奔跑题", count: 0, switch: true, disabled: false}, // 奔跑题
       { id: "cd", title: "穿戴题", count: 0, switch: true, disabled: false}  // 穿戴题
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let tc = app.getTc();
    common.init.apply(this, []); // 不加这句模板动画不起作用
    var totalCount = tc.a.count + tc.b.count;
    tc.a.percent = Math.round((tc.a.count/totalCount)*100);
    tc.b.percent = Math.round((tc.b.count/totalCount)*100);

    this.setData({
      tc: tc,
      knowledgeUpRange: totalCount * 8,
      knowledgeDownRange: totalCount
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
    this.data.items[0].count = Math.floor(this.data.knowledgeUpRange * 0.5); //zl
    this.data.items[1].count = Math.floor(this.data.knowledgeUpRange * 0.4); //bp
    this.data.items[2].count = this.data.knowledgeUpRange - this.data.items[0].count - this.data.items[1].count;//cd
    this.setData({
      items: this.data.items,
      totalNumber: this.data.knowledgeUpRange
    })
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

  addNumber: function (e) {
    var id = e.currentTarget.dataset.id;
    for (var i = 0; i < this.data.items.length; i++){
      if (id === this.data.items[i].id) {
        if (this.data.items[i].switch == false){
          this.data.message.text = "请先打开该类型选项";
          this.setMessage();
          return;
        }
        if (this.data.totalNumber + 1 > this.data.knowledgeUpRange){ // 超限
          this.data.message.text = "已经大于规定的题数啦";
          this.setMessage();
          return;
        }
        
        this.data.items[i].count++;
      }  
    }
    
    this.setData({
      items: this.data.items,
      totalNumber: this.data.totalNumber + 1
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
        if (this.data.totalNumber - 1 < this.data.knowledgeDownRange) { // 超限
          this.data.message.text = "已经小于规定的题数啦";
          this.setMessage();
          return;
        }
        if (this.data.items[i].count <= 0) {
          this.data.message.text = "已经减至最小啦";
          this.setMessage();
          return;
        }

        this.data.items[i].count--;
      }
    }

    this.setData({
      items: this.data.items,
      totalNumber: this.data.totalNumber - 1
    })
  },

  toggle:function(e){
    var id = e.currentTarget.dataset.id;
    var curr,other=[],o=0;

    for (var i = 0; i < this.data.items.length; i++) {
      if (id === this.data.items[i].id) {
        curr = this.data.items[i].switch
      }else{
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
          this.data.totalNumber += this.data.items[i].count;
          if (this.data.totalNumber > this.data.knowledgeUpRange) {
            this.data.totalNumber = this.data.knowledgeUpRange;
          }
        } else {
          this.data.totalNumber -= this.data.items[i].count;
          this.data.items[i].count = 0;
          if (this.data.totalNumber < this.data.knowledgeDownRange) {
            this.data.totalNumber = this.data.knowledgeDownRange;
          }
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

    this.setData({
      items: this.data.items,
      totalNumber: this.data.totalNumber
    })
  },
  
  assignment:function(e){
    this.ajaxAssignAnswer();
  },

  // 派题
  assignAnswer: function(knowledgeList){
    // 按比例划分题目
    var bZlList = knowledgeList.xxList;
    var bBpList = knowledgeList.smList;
    var bCdList = knowledgeList.cdList;

    var percent = this.data.tc.a.percent;

    var aZlList = bZlList.splice(0, Math.floor(bZlList.length * percent / 100));
    var aBpList = bBpList.splice(0, Math.floor(bBpList.length * percent / 100));
    var aCdList = bCdList.splice(0, Math.floor(bCdList.length * percent / 100));
    // 划分我方题库
    var team = app.getTeam();
    var knowList = {
      zl:aZlList,
      bp:aBpList,
      cd:aCdList
    }
    team.knowledgeList = knowList;
    app.setTeam(team);
    // 划分对方题库，并ws通知
    app.wsSend({ "type": "7", "otherTeamid": this.data.tc.a.code, "knowledgeList": { zl: aZlList, bp: aBpList, cd: aCdList } });  
    app.wsSend({ "type": "7", "otherTeamid": this.data.tc.b.code, "knowledgeList": { zl: bZlList, bp: bBpList, cd: bCdList }});  
    // // 主动跳转到派题页面    ----修正by 闫东方 20180604 跳转交给消息
    // wx.navigateTo({
    //   url: '../pie/pie',
    // })
  },
  // 服务端取题
  ajaxAssignAnswer: function () {
    var param = "0" + this.data.items[0].count;
    param += ",1" + this.data.items[1].count;
    param += ",2" + this.data.items[2].count;
    let that = this;

    this.data.message.text = "派题中";
    this.setData({
      messageFlag: true,
      message: this.data.message
    })

    wx.request({
      url: 'https://www.njrzzk.com/weixin/assignAnswerByCountAndType',
      data: { "option": param },
      header: {},
      success: function (res) {
        if(res && res.data && res.data.code === 1){
          that.assignAnswer(res.data.knowledgeList);
        }
        that.setData({
          messageFlag: false
        })
      },
      fail: function (res) {
        console.log(res);
        console.log('请求错误')
      }
    })
  },

  setMessage:function(){
    var that=this;
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