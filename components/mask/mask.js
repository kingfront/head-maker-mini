// components/mask/mask.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function () {
        let newVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        console.log(newVal);
      }
    },
    opacity: {
      type: String,
      value: '.9'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationMask: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showMask: function (show) {
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease',
      })
      animation.scale(show ? '1' : '0').opacity(show ? '1' : '0').step()
      this.setData({
        animationMask: animation.export()
      })
    },
    closeMask: function () {
      this.triggerEvent('closeMask');
      this.showMask(false)
    }
  }
})
