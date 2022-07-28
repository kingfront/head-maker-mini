// components/paster/paster.js
import { staticUrl } from '../../utils/config'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconNum: 24,
    icons: [],
    animationIconPop: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
    // 初始化icon
    makeInit: function () {
      let that = this
      const tp = new Date().getTime()
      const url = staticUrl + '/paster-icon.json?tp=' + tp
      wx.request({
        url: url,
        header: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          that.setData({ icons: res.data })
        }
      })
    },

    // 点击icon
    clickFestivalImage: function (e) {
      const index = e.currentTarget.dataset.index;
      let { icons } = this.data;
      icons = icons.map((v, i) => {
        v.isselected = i == index;
        return v;
      });
      this.setData({
        icons,
        festivalSrc: icons[index].src,
      });
      
      this.triggerEvent('chooseIcon',icons[index]);
    },

    // 展示贴纸浮框
    showPasterPop: function () {
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      let { show } = this.data
      animation.height(show ? '0' : '600rpx').step()
      this.setData({
        animationIconPop: animation.export()
      })
      this.setData({
        show: !show
      })
      this.makeInit()
    },
  }
})
