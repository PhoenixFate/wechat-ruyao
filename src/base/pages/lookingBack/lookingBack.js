// pages/individual/question/question.js

var app = getApp();
const util = require('../../../utils/util.js');



Page({

  /**
   * 页面的初始数据
   */
  data: {

    answerFlag: true,
    scannerFlag: true,
    messageFlag:false,
    noteName:[],
    abcd: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],

    knowledgeList: [],
    answer: {
      bingo: "",                     //保存正确答案
      linkImages: [],                //保存图片链接数组
      linkText: [],                  //保存知识补充内容文本
      optionList: [],                 //保存每道题目具体的选项列表
      node: 0,                      //对象中的节点 1-8
      title: "",                      //当前题目
      type: 0,         //题目类型：选项，扫码，穿戴
    },

    answerTextType: ["选项", "扫码", "穿戴"], 
    currNode:0,
    personalAnswer: [],
    //点击切换图片
    clickUrl: { "left": "../../images/left.png", "right":"../../images/right.png"},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
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

  init:function(){
    this.setData({
      knowledgeList: app.globalData.knowledgeList,
      personalAnswer: app.getPersonalAnswer().answers,
      noteName: app.globalData.noteName
    })
    this.changeList();
  },

    changeList:function(){
      var that=this;
      that.setData({
        answer: that.data.knowledgeList[that.data.currNode],
      })
      that.changeAnswerType();  
    },

    //封装选项，扫码，穿戴类型的相关显示信息，及显示flag
    changeAnswerType :function(){
      var that=this;
      if(that.data.answer && that.data.answer.type) {
      that.setData({
        answerFlag: that.data.answer.type != 0,
        scannerFlag: that.data.answer.type == 0
      })
    }
  },

  backClick:function(e){
    wx.navigateBack({
      
    })
  },

  //上一题
  last:function(e){
    var that=this;
    //点击效果
    this.setData({
      clickUrl: { "left": "../../images/left_hover.png", "right": "../../images/right.png" }
    })
    setTimeout(function(){
      that.setData({
        clickUrl: { "left": "../../images/left.png", "right": "../../images/right.png" }
      })
    },200)
    if(this.data.currNode>0){
      this.setData({
        currNode:this.data.currNode-1
      })
      this.changeList();
    }
    else{
        this.setData({
          message:"已经是第一题了",
          messageFlag:true
        })
        //提示框1秒后消失
        setTimeout(function(){
            that.setData({
              messageFlag: false
            })
        },1000)
    }
  },

  //下一题
  next:function(e){
    var that=this;
    //点击效果
    this.setData({
      clickUrl: { "left": "../../images/left.png", "right": "../../images/right_hover.png" }
    })
    setTimeout(function () {
      that.setData({
        clickUrl: { "left": "../../images/left.png", "right": "../../images/right.png" }
      })
    }, 200)
    if (this.data.currNode < this.data.knowledgeList.length-1){
      this.setData({
        currNode: this.data.currNode+1
      })
      this.changeList();
    }
    else{
      this.setData({
        message: "已经是最后一题了",
        messageFlag: true
      })
      //提示框1秒后消失
      setTimeout(function () {
        that.setData({
          messageFlag: false
        })
      }, 1000)
    }
  }
})