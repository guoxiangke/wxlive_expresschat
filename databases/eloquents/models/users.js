// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  // _id: String,
  drupal_uid: Number,
  show_name: String,
  username: String,
  password: String,
  is_admin: Boolean,//客服管理！
  is_leader: Boolean,//客服坐席！
  is_system: Boolean,//超级管理员！uid=1;
  navigator:{
    appCodeName : String,
    appName : String,
    appVersion: String,
    platform: String,
    product:String,
    productSub:String,
    vendor:String,
    language: String,
    userAgent: String,
  },
  platform: { //https://github.com/bestiejs/platform.js#readme
    name:String,
    version:String,
    product:String,
    manufacturer:String,
    layout:String,
    os:String,//platform.os; // 'iOS 5.0'
    description:String,
  },
  ip: String,
  geoip2:{
    country:String,
    region:String,
    city:String,
    timezone:String,
    // Latitude / Longitude
    // ISP / Organization
  },
  meta: {
    email:String,
    phone:String,
    location: String,
    avatar: String
  },
  tags: [String],
  created_at:  { type: Date, default: Date.now },//First seen
  last_active_at:  { type: Date, default: Date.now },
  last_hear_from: Schema.Types.ObjectId, //最后一次被回复人员！
  last_hear_at: Date,
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
