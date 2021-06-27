const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    balance: "Number",
    cursorLvl: "Number",
    videoLvl: "Number",
    videoCellsLvl: "Number"
})

module.exports = mongoose.model('users', userSchema);