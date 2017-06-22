// getting-started.js
var debug = require('debug')('database');
var mongoose = require('mongoose');
var connect_str = 'mongodb://localhost:27017/db';
if(process.env.MONGO_PORT_27017_TCP_ADDR){
  var connect_str = 'mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+':'+process.env.MONGO_PORT_27017_TCP_PORT+'/'+process.env.MONGO_INSTANCE_NAME;
}
mongoose.connect(connect_str);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	debug(connect_str+' : connected!');
});
// var mongo = require('./databases/database');

var Chatroom = require('./eloquents/models/chatrooms');
var User = require('./eloquents/models/users');
var Message = require('./eloquents/models/messages');
var Log = require('./eloquents/models/logs');

module.exports = {
  // db: db,
  mongoose: mongoose,
  Chatroom:Chatroom,
  User:User,
  Message:Message,
  Log:Log
};
