/**
 * add by king-fine
 * 图片裁剪页面
 */
import ImageSynthesis from '../../utils/image-synthesis.js';
import Notification from '../../utils/react-whc-notification.js';
const app = getApp();
Page({
  data: {
    imageurl: null,
    imageTop: 0,
    imageLeft: 0,
    spoint: {
      x: 0, 
      y: 0,
    },
    isvol: true,
    imageWidth: 250,
    imageHeight: 250,
    imageSize: {
      w: 0,
      h: 0,
    },
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '裁剪图片',
    });
    if (options.imageurl == void 0) {
      const userInfo = app.globalData.userInfo;
      this.setData({
        imageurl: userInfo.highAvatarUrl == null ? userInfo.avatarUrl : userInfo.highAvatarUrl,
      });
    }else {
      this.setData({
        imageurl: options.imageurl
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const {
      imageurl
    } = this.data;
    if (imageurl == void 0) {
      wx.showToast({
        title: '请传入图片url',
        icon: 'none',
      });
    } else {
      wx.getImageInfo({
        src: imageurl,
        success: (res) => {
          if (Math.min(res.width, res.height) < 200) {
            wx.navigateBack();
            Notification.post('cutimagenotify', null);
          } else {
            const isvol = res.height >= res.width;
            this.setData({
              isvol,
              imageTop: isvol ? -(Math.max(250, 250 * res.height / res.width) - 250) / 2.0 : 0,
              imageLeft: isvol ? 0 : -(Math.max(250, 250 * res.width / res.height) - 250) / 2.0,
              imageHeight: isvol ? 250 * res.height / res.width : 250,
              imageWidth: isvol ? 250 : 250 * res.width / res.height,
              imageSize: {
                w: res.width,
                h: res.height,
              },
            });
          }
        },
      });
    }
  },

  /**
   * 点击裁剪
   */
  clickClip: function(e) {
    const {
      imageSize,
      imageLeft,
      imageHeight,
      imageWidth,
      imageTop,
      loading,
      imageurl,
    } = this.data;
    if (loading) {
      return;
    }
    wx.showLoading({
      title: '正在裁剪...',
    });
    const imageSynthesis = new ImageSynthesis(this, 'festivalCanvas', imageSize.w, imageSize.h);
    const size = Math.min(imageSize.w, imageSize.h);
    const x = Math.abs(imageLeft) * imageSize.w / imageWidth;
    const y = Math.abs(imageTop) * imageSize.h / imageHeight;
    imageSynthesis.addImage({
      path: imageurl,
      x:0,
      y:0,
      w: imageSize.w,
      h: imageSize.h,
    }).startCut({
      x,
      y,
      w: size,
      h: size,
    }, (img) => {
      wx.hideLoading();
      if (img != void 0) {
        Notification.post('cutimagenotify', img);
        wx.navigateBack();
      }else {
        this.data.loading = false;
        wx.showToast({
          title: '裁剪图片失败',
          icon: 'none',
        });
      }
    });
  },

  touchStartImage: function(e) {
    if (e.touches.length > 0) {
      const x = e.touches[0].pageX;
      const y = e.touches[0].pageY;
      this.data.spoint = {
        x,
        y,
      };
    }
  },
  touchMoveImage: function(e) {
    this._handleTouchMove(e);
  },
  touchEndImage: function(e) {
    this._handleTouchMove(e);
  },
  _handleTouchMove: function(e) {
    if (e.touches.length > 0) {
      const {
        spoint,
        imageTop,
        imageLeft,
        imageSize,
        isvol,
      } = this.data;
      const x = e.touches[0].pageX;
      const y = e.touches[0].pageY;
      let ydis = 0;
      let xdis = 0;
      if (isvol) {
        ydis = y - spoint.y + imageTop;
        const maxy = Math.max(250, 250 * imageSize.h / imageSize.w) - 250;
        if (ydis < -maxy) {
          ydis = -maxy;
        } else if (ydis > 0) {
          ydis = 0;
        }
      }else {
        xdis = x - spoint.x + imageLeft;
        const maxx = Math.max(250, 250 * imageSize.w / imageSize.h) - 250;
        if (xdis < -maxx) {
          xdis = -maxx;
        } else if (xdis > 0) {
          xdis = 0;
        }
      }
      this.setData({
        spoint: { x, y },
        imageTop: ydis,
        imageLeft: xdis,
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '小程序头像制作',
      desc: '国旗头像、卡通头像等',
      path: '/pages/index/index',
      imageUrl: getApp().globalData.userInfo.highAvatarUrl,
    };
  }
})