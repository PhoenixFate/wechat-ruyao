module.exports = function (msg, page) { // page -> index page
  const app = getApp();
  page = app.getWsHandler();
  
  msg = JSON.parse(msg);
  var type = msg && msg.type;
  if (typeof page.setMsg == "function" && type !== '10' && type !== '3') {// 正常答题不需要消息
    page.setMsg(msg.msg);
  }
  if (type === '0') { // 加入赛事
    var member = { "openid": msg.openid, "nickname": msg.nickname, "avatar": msg.avatar, "role": msg.role};
    if (msg.openid === app.getOpenid()) {
      app.setMemberRole(msg.openid, member.role);
    }
    page.addMemberBySocket(member, msg.teamid);
  } else if (type === '1') { // 解除赛事
    app.clearGlobalVariables();
    app.wsClose();
    setTimeout(function () {
      wx.reLaunch({
        url: '/pages/index/index', // 跳出赛事界面
      })
    }, 2000)    
  } else if (type === '2') { // 更改赛事名称
    // page => house
    page.modifyTeamTitleBySocket(msg.title);
  } else if (type === '3') { // 发起挑战
    if (msg.otherTeamList){
      // page => selectTeam
      page.initTeamListBySocket(msg.otherTeamList);
    } else if (msg){ // 弹框出来接受应战
      page.setConfirmMsg(msg);
    }
  } else if (type === '4') { // 接受挑战
    // page => bothSides
    page.challengResultBySocket(msg.op, msg.otherTeamid);
  } else if (type === '5') { // 指派角色
    app.setMemberRole(msg.memberOpenid, msg.roleid);
    if (page && page.route === "multiAndTeam/pages/house/house"){
     page.refreshData();
    }
  } else if (type === '6') { // 踢出成员
    if (msg.memberOpenid === app.getOpenid()){
      app.clearGlobalVariables();
      app.wsClose();
      if (page && page.route !== "pages/index/index") {
        setTimeout(function () {
          wx.reLaunch({
            url: '/pages/index/index', // 跳出赛事界面
          })
        }, 800) 
      }     
    }
    if (msg.side && msg.side === "b") {
      var index = 0;
      for (var m of app.getTeam().b.memberList) {
        if (msg.memberOpenid === m.openid) {
          break;
        }
        index++;
      }
      app.getTeam().b.memberList.splice(index, 1);
    } else {
      app.removeMember(msg.memberOpenid);
    }    
    if (page && page.route === "multiAndTeam/pages/house/house") {
      page.refreshData();
    }
  } else if (type === '7') { // 派题
    if (msg.knowledgeList){ // 总体派题
      var team = app.getTeam();
      var knowList = {
        zl: msg.knowledgeList.zl,
        bp: msg.knowledgeList.bp,
        cd: msg.knowledgeList.cd
      }
      team.knowledgeList = knowList;
      app.setTeam(team);      
    } else if (msg.memberOpenid){ // 组织者给member派题
      if (msg.memberOpenid === app.getUserInfo().openid){
        app.setKnowledgeList(msg.knowledgeIds);
      }
      // page => pie
      page.showKnowledgeDetailForMember(msg.memberOpenid, msg.knowledgeIds);
    }
    // 跳转到派题页面
    if (page && page.route != "multiAndTeam/pages/team/pie/pie") {
      console.log(page);
      console.log(page.route);
      wx.reLaunch({
        url: '/multiAndTeam/pages/team/pie/pie',
      })
    }

  } else if (type === '8') { // 接受方准备
    // page => pie
    page.doReady();

  } else if (type === '9') { // 赛事开始
    // page => pie
    page.doStart();
  } else if (type === '10') { // 赛事(答题)进度
    // page => question
    page.progressBySocket(msg);
  } else if (type === '11') { // 相互激励
    //page.setMsg(msg.msg);
  } else if (type === '12') { // 冲锋号
    //播放冲锋号音效
    page.playChargeNumberMusic();
  } else if (type === '100') {  // 赛事完成
    page.successBySocket(msg);
    // 如果就组织者，等10秒断开
    if (app.getBossFlag() > app.constData.BOSS.NORMAL){
      setTimeout(function () {
        app.clearGlobalVariables();
        app.wsClose();
      }, 10000)
    }else{
      app.clearGlobalVariables();
      app.wsClose();
    }
  } else if (type === '405') {  // 重连
    var member = { "openid": msg.openid, "nickname": msg.nickname, "avatar": msg.avatar, "role": msg.role };
    if(msg.side === "b"){
      app.getTeam().b.memberList.push(member);
    } else {
      app.addMember(member);
    }
    if (page && page.route === "multiAndTeam/pages/house/house") {
      page.refreshData();
    }
  }


}