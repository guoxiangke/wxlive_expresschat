// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var chatroomSchema = new Schema({
  // _id: Number, //room_id
  room_name: { type: String, required: true, unique: true }, //room_name:company1/1001
  is_private:  { type: Boolean, default: false },//默认都是 公开 TODO:暂无该聊天室，请联系管理员添加！
  join_key: String, //加入密码
  created_uid: Schema.Types.ObjectId,//创建者
  participants:[Schema.Types.ObjectId],//当前参与者！都有谁来过，通过message获得！ m.array.push(1);
  created_at:  { type: Date, default: Date.now },
  last_active_at:  { type: Date, default: Date.now },//last active time!
});

// the schema is useless so far
// we need to create a model using it
var Chatroom = mongoose.model('Chatroom', chatroomSchema);

// make this available to our users in our Node applications
module.exports = Chatroom;
