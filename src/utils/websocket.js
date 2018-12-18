module.exports = (function () {
  var webSocketUrl = 'wss://www.njrzzk.com/ws/',
    socketOpened = false, // 标记websocket是否已经打开
    socketMsgQueue = [],
    connCallback = null,
    msgReceived = {};

  var heartCheck = {
    timeout: 60000,//60ms
    timeoutObj: null,
    reset: function () {
      clearTimeout(this.timeoutObj);
      this.start();
    },
    start: function () {
      var self = this;
      this.timeoutObj = setTimeout(function () {
        if (socketOpened) {
          wx.sendSocketMessage({
            data: "@heart"
          });
        }
      }, this.timeout)
    },
  }

  function connect(teamid,openid,isBoss,callback) { // 发起链接
    if (socketOpened){
      return;
    }
    var bossParam = "";
    if(isBoss){
      bossParam = "?isBoss=1";
    }
    wx.connectSocket({
      url: webSocketUrl + teamid + '/' + openid + bossParam
    });
    connCallback = callback;
  }

  function initEvent() { // 初始化一些webSocket事件
    wx.onSocketOpen(function (res) { // webSocket打开事件处理
      socketOpened = true;
      console.log('websocket opened.');
      // 处理一下没发出去的消息
      while (socketMsgQueue.length > 0) {
        var msg = socketMsgQueue.pop();
        sendSocketMessage(msg);
      }
      // sendSocketMessage('after');
      heartCheck.start();
      // connection callback
      connCallback && connCallback.call(null);
    });
    wx.onSocketMessage(function (res) { // 收到服务器消息时的处理
      console.log('received msg: ' + res.data);
      heartCheck.reset();
      if ("@heart" != res.data){
        msgReceived.callback && msgReceived.callback.call(null, res.data, ...msgReceived.params);
      }
    });
    wx.onSocketError(function (res) { // 链接出错时的处理
      console.log('webSocket fail' + res);
    });
    wx.onSocketClose(function (res) {
      socketOpened = false;
      if(res && res.code && res.code === 1000){
        console.log('WebSocket 正常关闭！' + res.code)
      }else{
        console.log('WebSocket 非正常关闭！'+ res.code);
      }
    })
  }

  function sendSocketMessage(msg) {
    if (typeof (msg) === 'object') {
      // 从根源解决对象值类型不为字符的问题
      for(var key in msg){
        if (typeof msg[key] === "number" || typeof msg[key] === "boolean" || typeof msg[key] === "undefined") {
          msg[key] = "" + msg[key];
        }
      }
      msg = JSON.stringify(msg);
    }
    if (socketOpened) {
      wx.sendSocketMessage({
        data: msg
      });
      console.log('webSocket sended:' + msg);
    } else { // 发送的时候，链接还没建立 
      socketMsgQueue.push(msg);
    }
  }

  function closeSocket() {
    if (socketOpened) {
      wx.closeSocket(function (res) {
        console.log('WebSocket 已关闭！')
      })
    }
  }

  function setReceiveCallback(callback, ...params) {
    if (callback) {
      msgReceived.callback = callback;
      msgReceived.params = params;
    }
  }

  function init() {
    initEvent();
  }

  init();
  return {
    connect: connect,
    send: sendSocketMessage,
    setReceiveCallback: setReceiveCallback,
    socketOpened: socketOpened,
    closeSocket: closeSocket
  };
})();