var express = require('express');
var router = express.Router();
var path = require('path');
var roomId = 'default';
//Database begin
var debug = require('debug')('liveroom');
var express = require('express');
// set up the RethinkDB database
db = require('../lib/db');
db.setup();

// var mongoose = database.mongoose;
// var Chatroom = database.Chatroom;
// var User = database.User;
// var Message = database.Message;
// var Log = database.Log;
//Database end

/* GET users listing. */
// 1. https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
// 2. https://segmentfault.com/a/1190000000438604 分组数据传输
// route middleware to validate :name
router.param('id', function(req, res, next, id) {
    // // // ==============Save Log DEMO=================
    // // var log = new Log;
    // // log.type = 'notice';
    // // // log.user_id = new mongoose.Types.ObjectId;
    // // // log.room_id = new mongoose.Types.ObjectId;
    // // // log.message_id = new mongoose.Types.ObjectId;
    // // log.content = 'notice: a room quest begin!';
    // // log.save(function(err) {if (err) {console.log(err);}});
    // // console.log('============a room quest begin!===============>>>');
    // // // ==============Save Log DEMO=================

    // // once validation is done save the new item in the req
    // req.room_id = req.namespace + '/' + id;
    // // TOdo validation on name here

    debug('============a room quest begin!===============');
    req.room_id = id;
    var roomId = id;
    // go to the next thing
    next();
});

var users = [];//all users in all rooms /:id
var connections = [];//all connections in all rooms

router.get('/:id', function(req, res, next) {
  // res.send('respond with a rooms');
  //http://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
  res.sendFile('liveintercom.html', { root: path.join(__dirname, '../public') });
  //https://github.com/onedesign/express-socketio-tutorial
  var io = res.io;
  var roomId = req.params.id;
  var namespace = '/liveintercom';


  // Chatroom
  io.of(namespace).once('connection', function(socket){
    connections.push(socket);
    debug('Connected: %s sockets connected',connections.length);

    db.findMessages(30, function (err, messages) {
      if (!err && messages.length > 0) {
        socket.emit('history', messages);
      }
    });


    //Disconnect
    socket.on('disconnect',function(data){
      connections.splice(connections.indexOf(socket), 1);
      if(!socket.username) {
        debug('error,no name! lne 76');
        return;
      }
      //DB:xxx离开了聊天室
      var msg = {
        fromType: "room_logout",
        messageType: "text",
        message: socket.username+" 离开了直播间",//login 进入房间 logout 离开房间 正常消息 message @消息 at
        NickName: socket.username, //todo 使用uid！ from
        room_id : roomId,
        groupName: "直播吧",
        timestamp: Date.now() / 1000 | 0
      }
      db.saveMessage(msg, function (err, saved) {
        if (err || !saved) {
          debug(saved,err);
          return;
        }
        debug('DB:访客[%s]离开了直播间[%s],%s sockets connected',data.username,data.room,connections.length);
        debug(users,'before users');
        users.splice(users.indexOf(socket.username), 1);
        debug(users,'after users');
        updateUsernames(users);
      });
    })

    //http://stackoverflow.com/questions/33373176/typeerror-io-sockets-clients-is-not-a-function
    // var usersInRoom = io.of(namespace).in(roomId).clients;
    // console.log('usersInRoom');
    // console.log(usersInRoom);
    // console.log('clientsList');
    // var clientsList = io.sockets.adapter.rooms;
    // // var numClients = clientsList.length;
    // console.log(clientsList);
    // console.log('rooms');
    // console.log(io.of(namespace).adapter.rooms);

    // socket.emit('rooms', io.of('/').adapter.rooms);

    // 一个socket是否可以同时存在于几个分组，等效于一个用户会同时在几个聊天室活跃，答案是”可以“，socket.join()添加进去就可以了。官方提供了订阅模式的示例：
    socket.on('subscribe', function(data) {
        socket.join(roomId);
        if(data.username){
          socket.username = data.username;
          // var users = socket.users;
          debug(users,'before users');
          var is_new = true;
          for (var i = users.length - 1; i >= 0; i--) {
            if(users[i].username == data.username && users[i].room == data.room ) {
              var is_new = false;
              break;
            }
          }
          if(is_new || users.length===0 ) {
            users.push({"room" : roomId, 'username':data.username});
          }
        }
        debug(users,'after users');
        io.of(namespace).in(roomId).emit('users init',users);
        debug('访客[%s]进入直播间[%s]',data.username,data.room);
    })

    socket.on('unsubscribe', function(data) { 
        socket.leave(roomId);
        debug('访客离开直播间：'+data.room,users);
        io.of(namespace).in(roomId).emit('users init',users);
        var newusers=[];
        if(data.username){
          for (var i = users.length - 1; i >= 0; i--) {
            if(users[i].username == data.username) continue;
              newusers.push(users[i]);
          }
          users = newusers;
        }
     })

    socket.on('user join', function (data,callback) {
      callback(true);
      // // //====DB user insert==
      // // for(var i=0;i<users.length;i++){
      // //   if(users[i].username == data.username ){
      // //     debug('same user join room：'+data.room,users);
      // //     return;
      // //   }
      // // }
      // socket.username = data.username;
      // socket.room = data.room;
      // users.push(data);//{"username" : username, "room" : roomId}
      // // users.push({"username" : data.username, "room" : roomId});////TODO:所有的live用户！！！
      // var roomuser =[];
      // // users = users.filter(function(item, pos) {
      // //     return users.indexOf(item) == pos;
      // // })
      // for(var i=0;i<users.length;i++){
      //   if(users[i].room == roomId ){
      //     if(users[i].username == data.username ){
      //       debug('same user join room：'+data.room,users);
      //       continue;
      //     }
      //     roomuser.push(users[i]);/////users[i].username
      //   }
      // }
	  //DB username加入了聊天室！2017-12-11
      var msg = {
        fromType: "room_login",
        messageType: "text",
        message: socket.username+" 进入了直播间！",//login 进入房间 logout 离开房间 正常消息 message @消息 at
        NickName: socket.username, //todo 使用uid！ from
        room_id : roomId, //room_id
        groupName: "直播吧",
        timestamp: Date.now() / 1000 | 0,
      }
      db.saveMessage(msg, function (err, saved) {
        if (err || !saved) {
          // socket.emit('new message', {message: util.format("<em>There was an error saving your message (%s)</em>", msg.message), from: msg.from, timestamp: msg.timestamp});
          return;
        }
        // debug('new user join room：'+socket.room,roomuser);
        // socket.roomuser = roomuser;
        // updateUsernames(roomuser);
      });
      //DB end!!!
    });

    function is_db_exsits(username){
      return false;
    }


    function updateUsernames(roomuser){
      // socket.emit('get users',users);//Update only current session! 当前
      // io.sockets.in(roomId).emit('users update',users);//update all!  所有
      io.of(namespace).in(roomId).emit('users update',roomuser);//update all!  所有
      // socket.broadcast.to(roomId).emit('users update',users);//update except current session! 排除当前socket对应的client
      // broadcast方法允许当前socket client不在该分组内。
    }
    // when the client emits 'new message', this listens and executes
    socket.on('send message', function (data) {
      // // we tell the client to execute 'new message'
      // // io.sockets.emit('new message', {//socket.broadcast.emit
      // // io.of(namespace).in(roomId).emit('new message', {//socket.broadcast.emit
      // socket.broadcast.to(roomId).emit('new message', {
      //   username: socket.username,
      //   message: data
      // });
      //DB
      var msg = {
        messageType: "text",
        fromType: "liveroom",
        message: data,
        NickName: socket.username, //todo 使用uid！ from
        room_id : roomId, //room_id
        groupName: "直播吧",
        timestamp: Date.now() / 1000 | 0
      }
      if(!socket.username) {
          debug('No!socket.username',msg);
        return;
      }
      // console.log("[DEBUG][io.sockets][message] New message '%j' from user %s(@%s)", msg, connected_user.username, connected_user.id);

      db.saveMessage(msg, function (err, saved) {
        if (err || !saved) {
          debug(saved,err);
          // socket.emit('new message', {message: util.format("<em>There was an error saving your message (%s)</em>", msg.message), from: msg.from, timestamp: msg.timestamp});
          return;
        }
        // socket.emit('new message', msg);
        socket.broadcast.to(roomId).emit('new message', {
              username: socket.username,
              message: data
        });
        // Send message to everyone.
        // socket.broadcast.emit('new message', msg);
      });
    });

    //TODO: 用户正在输入！
    // when the client emits 'typing', we broadcast it to others
      socket.on('typing', function () {
        socket.broadcast.to(roomId).emit('typing', {
          username: socket.username
        });
      });

    // when the client emits 'stop typing', we broadcast it to others
      socket.on('stop typing', function () {
        socket.broadcast.to(roomId).emit('stop typing', {
          username: socket.username
        });
      });
    });
  });

module.exports = router;