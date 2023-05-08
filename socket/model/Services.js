const mongoose = require('mongoose')
const Schema = mongoose.Schema

var Services = new Schema({
    userRequestID: { type: String },
    userSitterID: { type: String },
    status: { type: String },
    addressRequest: { type: String },
    addressSitter: { type: String }
})
  
module.exports = mongoose.model('Services', Services)