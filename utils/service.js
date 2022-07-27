const util = require("./util")

/**
 * api
 */
const service = {
  addUser: function (obj) {
    this.addCollection('userInfo', obj)
  },
  appInit: function (obj) {
    this.addCollection('appInit', obj)
  },
  clickIcs: function (obj) {
    this.addCollection('clickIcs', obj)
  },
  addCollection: function (val, obj) {
    obj.date = util.formatTime(new Date())
    const db = wx.cloud.database();
    db.collection(val).add({
      data: obj,
      success: res => { }
    })
  },
  // 查询字列表
  getCiList: function (word) {
    return new Promise((resolve) => {
      const db = wx.cloud.database()
      db.collection('word').where({ word }).get({
        success: res => {
          resolve(res.data)
        },
        fail: err => {
          console.info(err)
          wx.hideToast();
          resolve(false)
        }
      })
    })
  }
}

module.exports = service