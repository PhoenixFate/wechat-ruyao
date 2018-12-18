const app = getApp();
const util = require('../../../utils/util.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    //存储计时器
    setInter: '',
    //计时器的num
    num: -1,
    //role三行三列
    row: [1, 2, 3],
    column: [1, 2, 3],
    rolesUrl: [],
    rolesHoverUrl:[],
    rolesBig: [false, false, false, false, false, false, false, false, false],
    roles: ["指挥人员", "目标防护人员", "医疗救护人员", "消防人员", "物资保障人员", "疏散组织人员", "防化防疫人员", "普通民众"],
    modifyTeamNameFlag: false,
    roleName: "",
    role: -1,
    virtualRole:-1,
  },
    
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.openid != null) {
      console.log(options);
      app.globalData.formid=options.formid;
      app.globalData.challengeAccepterFlag = true;
      app.globalData.matchFlag = 1;
      app.globalData.challengeOpenid = options.openid;
      app.globalData.challengeTimestamp = options.timeStamp;
      app.globalData.challengeNickname = options.nickname;
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      num: -1,
      role:-1,
      virtualRole: -1,
    })
    this.initRole();

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },


  startSetInter: function() {
    var that = this;
    if (this.data.setInter != '') {
      that.endSetInter();
    }
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function() {
        var numVal = that.data.num + 1;
        that.setData({
          num: numVal
        });
        that.initRole();
        var sequence = [1, 2, 3, 6, 9, 8, 7, 4];
        if (numVal > that.data.randomNumber) {
          that.endSetInter();
          var role = sequence[(that.data.randomNumber + 1) % 8];
          that.setData({
            virtualRole: role
          })
          if (role > 5) {
            role -= 1;
          }
          that.setData({
            modifyTeamNameFlag: true,
            role:role,
            roleName: that.data.roles[role - 1]
          })
        }
        that.data.rolesBig[sequence[numVal % 8] - 1] = true;
        that.data.rolesUrl[sequence[numVal % 8] - 1] = that.data.rolesHoverUrl[sequence[numVal % 8] - 1];
        that.setData({
          rolesUrl: that.data.rolesUrl,
          rolesBig: that.data.rolesBig
        })
      }, 80);
  },

  endSetInter: function() {
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
    that.setData({
      num: -1,
      role:-1
    })
  },

  detailClick: function(e) {
    this.data.rolesUrl[e.target.dataset.num - 1] = this.data.rolesHoverUrl[e.target.dataset.num - 1];
    this.data.rolesBig[e.target.dataset.num - 1] = true;
    this.setData({
      rolesUrl: this.data.rolesUrl,
      rolesBig: this.data.rolesBig
    })
    var role = e.target.dataset.num;
    if (role > 5) {
      role -= 1;
    }
    setTimeout(function() {
      wx: wx.navigateTo({
        url: '../round/round?num=' + role,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }, 500)

  },


  selectRole: function(e) {
    this.data.rolesBig[4] = true;
    this.data.rolesUrl[4] = this.data.rolesHoverUrl[4];
    this.setData({
      rolesUrl: this.data.rolesUrl,
      rolesBig: this.data.rolesBig
    })
    var randomNumber = Math.ceil(Math.random() * 30 + 10);
    this.data.randomNumber = randomNumber;
    var that = this;
    setTimeout(function () {
      that.startSetInter();
    }, 50)
  },

  // 确定修改
  sureModify: function(e) {
    var that=this;
    this.setData({
      modifyTeamNameFlag: false,
    })
    setTimeout(function() {
      wx: wx.navigateTo({
        url: '../round/round?num=' + that.data.role,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }, 600)
  },

  cancleModify: function(e) { 
    this.setData({
      modifyTeamNameFlag: false,
      role:-1
    })
    this.initRole();
  },


  initRole: function () {
    this.setData({
      rolesUrl: ["../../../images/1.png", "../../../images/2.png", "../../../images/3.png", "../../../images/4.png", "../../../images/5.png", "../../../images/6.png", "../../../images/7.png", "../../../images/8.png", "../../../images/9.png", ],
      //本来有点击图片切换，图片放不下，后续可以添加
      rolesHoverUrl: ["../../../images/1hover.png", "../../../images/2hover.png", "../../../images/3hover.png", "../../../images/4hover.png", "../../../images/5hover.png", "../../../images/6hover.png", "../../../images/7hover.png", "../../../images/8hover.png", "../../../images/9hover.png", ],
      rolesBig: [false, false, false, false, false, false, false, false, false],
    })
  },

})