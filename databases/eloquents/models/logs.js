//用户Id joined in roomID
// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
  // _id: Number, //logID
  type: String, //warning! error! notice!
  user_id: Schema.Types.ObjectId,
  room_id: Schema.Types.ObjectId,
  message_id: Schema.Types.ObjectId,
  content: String,
  created_at:  { type: Date, default: Date.now }
});

// the schema is useless so far
// we need to create a model using it
var Log = mongoose.model('Log', logSchema);

// make this available to our users in our Node applications
module.exports = Log;
