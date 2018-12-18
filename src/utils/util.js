const winHeight = wx.getSystemInfoSync().windowHeight;
// const app=getApp();//无效
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatTime3 = num => {
  var date=new Date(num);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-')
  // return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const isNumber = n => {
  var patrn = /^(-)?\d+(\.\d+)?$/;
  if (patrn.exec(n) == null || n == "") {
    return false
  } else {
    return true
  }
}

/**
 * 用于判断空，Undefined String Array Object
 */
function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') {//空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }
}

String.prototype.startWith = function (str) {
  if (str == null || str == "" || this.length == 0 || str.length > this.length)
    return false;
  if (this.substr(0, str.length) == str)
    return true;
  else
    return false;
  return true;
}

function awardRuleTranslate(rule){
  var str = "";
  if(rule && rule.length && rule.length > 0){
    for(var i=0; i<rule.length; i++){
      if (rule[i].operator === "result"){
        str += ";";
        if (rule[i].factor == 1){
          str += "获胜方";
        }else{
          str += "失败方";
        }
      } else if (rule[i].operator === "rank") {
        str += ";排名第" + rule[i].factor + "名";
      } else if (rule[i].operator === "less_time") {
        str += ";时间" + rule[i].factor + "分钟以内";
      } else {
        // 暂不支持的规则
      }
    }
  }
  return str.substring(1); // 去除第一个;
}

function determinSuccess(rule, matchResult) {
  if (rule && rule.length && rule.length > 0 
    && matchResult) {
    for (var i = 0; i < rule.length; i++) {
      if (rule[i].operator === "result") {
        // 获胜规则公式 用时、准确率matchResult.ourside.correntCount / matchResult.ourside.total、罚时punishTime 三者平均值
        var aScore = (matchResult.ourside.useTime + (matchResult.ourside.correntCount / matchResult.ourside.total) + matchResult.ourside.punishTime) / 3;
        var bScore = (matchResult.opposite.useTime + (matchResult.opposite.correntCount / matchResult.opposite.total) + matchResult.opposite.punishTime) / 3;
        if (aScore < bScore) {
          // 我方为winner
          matchResult.ourside.winner = true;
          matchResult.opposite.winner = false;
        } else if (aScore > bScore) {
          matchResult.ourside.winner = false;
          matchResult.opposite.winner = true;
        } else { // 双赢
          matchResult.ourside.winner = true;
          matchResult.opposite.winner = true;
        }        
      } else if (rule[i].operator === "rank") {
        // 有点乱，后边需要重新设计
      } else if (rule[i].operator === "less_time") {
        if (matchResult.useTime && matchResult.useTime <= rule[i].factor * 60) {
          matchResult.winner = true;
        }else{
          matchResult.winner = false;
        }
      } else {
        // 暂不支持的规则
      }
    }
  }
  return matchResult;
}

/**
 * 为所以图片增加url前缀
 */
function addUrlPrefix(list){
  for (var i = 0; i < list.length; i++) {
    var tempLinkImages = list[i].linkImages
    for (var j = 0; j < tempLinkImages.length; j++) {
      if (!tempLinkImages[j].startWith("https://www.njrzzk.com")) {
        tempLinkImages[j] = "https://www.njrzzk.com" + tempLinkImages[j];
      }
    }
    list[i].linkImages = tempLinkImages;
  }
  return list;
}

const formatArray = s => {
  var arr=s.split(",")
  return arr
}

const formatMatchType=matchType=>{
  if(matchType==0){
    return "个人赛"
  }else if(matchType==1){
    return "挑战赛"
  }else if(matchType==2){
    return "多人赛"
  }else if(matchType==3){
    return "团队赛"
  }else{
    return matchType
  }
}

const dateFriendly = date =>{
  date = date.replace(/-/g, "/");
  date = new Date(date).getTime();
  //获取js 时间戳
  var time = new Date().getTime();
  time = parseInt((time - date) / 1000);

  //存储转换值 
  var s;
  if (time < 60 * 10) {//十分钟内
    return '刚刚';
  } else if ((time < 60 * 60) && (time >= 60 * 10)) {
    //超过十分钟少于1小时
    s = Math.floor(time / 60);
    return s + "分钟前";
  } else if ((time < 60 * 60 * 24) && (time >= 60 * 60)) {
    //超过1小时少于24小时
    s = Math.floor(time / 60 / 60);
    return s + "小时前";
  } else if ((time < 60 * 60 * 24 * 3) && (time >= 60 * 60 * 24)) {
    //超过1天少于3天内
    s = Math.floor(time / 60 / 60 / 24);
    return s + "天前";
  } else {
    //超过3天
    var date = new Date(parseInt(date));
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
  }
}

const formatScore = score => {
  var secondTime = parseInt(score);// 秒
  var minuteTime = 0;// 分
  var hourTime = 0;// 小时
  if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
    //获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60);
    //获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60);
    //如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      //获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60);
      //获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60);
    }
  }
  var result = "" + parseInt(secondTime) + "''";

  if (minuteTime > 0) {
    result = "" + parseInt(minuteTime) + "'" + result;
  }
  if (hourTime > 0) {
    result = "" + parseInt(hourTime) + ":" + result;
  }
  return result;
}

const formatScore2 = item => {
  var score=item.user.bestScore
  var secondTime = parseInt(score);// 秒
  var minuteTime = 0;// 分
  var hourTime = 0;// 小时
  if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
    //获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60);
    //获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60);
    //如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      //获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60);
      //获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60);
    }
  }
  var result = "" + parseInt(secondTime) + "''";

  if (minuteTime > 0) {
    result = "" + parseInt(minuteTime) + "'" + result;
  }
  if (hourTime > 0) {
    result = "" + parseInt(hourTime) + ":" + result;
  }
  item.user.bestScore=result;
  return item;
}

function formatScore3(score){
  var secondTime = parseInt(score);// 秒
  var minuteTime = 0;// 分
  var hourTime = 0;// 小时
  if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
    //获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60);
    //获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60);
    //如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      //获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60);
      //获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60);
    }
  }
  var result = "" + parseInt(secondTime) + "''";

  if (minuteTime > 0) {
    result = "" + parseInt(minuteTime) + "'" + result;
  }
  if (hourTime > 0) {
    result = "" + parseInt(hourTime) + ":" + result;
  }
  return result;
}

const addPictureHead=pictures=>{
  for (var i = 0; i < pictures.length; i++) {
    pictures[i] = "https://www.njrzzk.com"+pictures[i];
  }
  return pictures;
}

const addPictureHead2 = pictures => {
    pictures= "https://www.njrzzk.com" + pictures;
  return pictures;
}

function setParameters(that){
  that.setData({
    winH:winHeight,
    opacity: 0,
    zero: 0,
  })
}

//动画：淡入效果
function showSlowly(that,n) {
  //线程最多跑80次
  if (n > 80) {
    return;
  }
  n++;
  var vm = that;
  var interval = setInterval(function () {
    if (vm.data.winH > 0) {
      //清除interval 如果不清除interval会一直往上加
      clearInterval(interval)
      vm.setData({ zero: vm.data.zero + 8, opacity: vm.data.zero / winHeight })
      showSlowly(that,n)
    }
  }, 10);
}

//动画：淡出效果
function hideSlowly(that, n) {
  //线程最多跑80次
  if (n > 80) {
    return;
  }
  n++;
  var vm = that;
  var interval = setInterval(function () {
    console.log(wm.data.winH);
    if (vm.data.winH > 10) {
      //清除interval 如果不清除interval会一直往上加
      clearInterval(interval)
      vm.setData({ winH: vm.data.winH - 10, opacity: vm.data.winH / winHeight })
      hideSlowly(that, n)
    }
  }, 10);
}


//防止多次点击
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1000
  }

  let _lastTime = null
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)
      _lastTime = _nowTime
    }
  }
}

function mySplit(str){
  var arr = str.split(" "); 
  return arr[0];
}


//播放音效
function playMusic(app,audioContext,src,loop){
  if(app && audioContext && src){
    //设置中音效打开
    if (app.globalData.settings.music) {
      //是否自动播放
      audioContext.autoplay = true;
      //是否循环
      audioContext.loop = loop;
      //是否遵循系统静音开关，当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音，默认值 true
      audioContext.obeyMuteSwitch = false;
      var index = parseInt(Math.random() * (src.length));
      audioContext.src = src[index];
    }
    //设置中音效关闭
    else {
      return;
    }
  }
}



module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  formatTime3: formatTime3,
  formatScore: formatScore,
  formatScore2: formatScore2,
  formatScore3: formatScore3,
  formatArray:formatArray,
  dateFriendly: dateFriendly,
  addPictureHead: addPictureHead,
  addPictureHead2: addPictureHead2,
  isNumber: isNumber,
  isBlank: isBlank,
  awardRuleTranslate: awardRuleTranslate,
  determinSuccess: determinSuccess,
  showSlowly: showSlowly,
  // hideSlowly: hideSlowly,
  winHeight: winHeight,
  setParameters: setParameters,
  addUrlPrefix: addUrlPrefix,
  mySplit: mySplit,
  throttle: throttle,
  playMusic: playMusic,
  formatMatchType: formatMatchType
}
