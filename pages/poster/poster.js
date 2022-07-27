/**
 * add by king-fine
 * 海报生成页面
 */
import ImageSynthesis from '../../utils/image-synthesis.js';
import service from '../../utils/service.js';
import { staticUrl } from '../../utils/config'

const app = getApp();
Page({
  data: {
    loading: false,
    posterSrc: null,
    imageurl: null,
    qrcode: '../../images/icon/mini.png',
    fonts: 'normal bold 100px NSimSun',
    titles1: '',
    titles2: '来给图像加节日标签吧',
    title: '',
    type: 0,
    backImageUrls: [],
    backIndex: 0,
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const cacheImageUrl = wx.getStorageSync('imageurl');
    if (cacheImageUrl == void 0) {
      const userInfo = app.globalData.userInfo;
      this.setData({
        imageurl: userInfo.highAvatarUrl == null ? userInfo.avatarUrl : userInfo.highAvatarUrl
      });
    } else {
      this.setData({
        imageurl: cacheImageUrl
      });
    }
    wx.setNavigationBarTitle({
      title: '节日海报',
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    wx.showLoading({
      title: '制作中...',
    });
    let { backImageUrls } = this.data
    const tp = new Date().getTime()
    wx.request({
      url: staticUrl + '/poster-bg.json?tp=' + tp,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        backImageUrls = res.data
        that.setData({ backImageUrls })
        setTimeout(() => {
          that._makePosterImage();
        }, 500);
      }
    })
  },

  // 滑动海报
  swiperChange: function (e) {
    this.setData({
      backIndex: e.detail.current
    })
    const { backImageUrls } = this.data
    if (!backImageUrls[e.detail.current].posterSrc) {
      this._makePosterImage();
    }
  },

  // 关闭当前页面
  closeMask: function () {
    wx.navigateBack({
      delta: 0,
    })
  },

  // 先下载网络图片
  _makePosterImage: function () {
    wx.showLoading({
      title: '制作中...',
      mask: true
    });
    let { backImageUrls, backIndex } = this.data;
    let url = backImageUrls[backIndex].imgUrl
    if (url.indexOf('wxfile') != -1) {
      backImageUrls[backIndex].imgUrl = url;
      this.setData({ backImageUrls })
      this.startMakeImage()
    } else {
      wx.downloadFile({
        url: backImageUrls[backIndex].imgUrl,
        success: (res) => {
          backImageUrls[backIndex].imgUrl = res.tempFilePath;
          this.setData({ backImageUrls })
          this.startMakeImage()
        },
        fail: (res) => {
          console.log(res);
          wx.showToast({
            title: '制作海报失败！',
            icon: 'none'
          });
        },
      });
    }
  },
  // 开始生成海报
  startMakeImage: function () {
    if (this.data.loading) {
      return;
    }
    const {
      imageurl = null,
      titles1,
      qrcode,
      backImageUrls,
      backIndex,
      fonts,
    } = this.data;

    this.data.loading = true;
    const width = 600;
    const height = 1066;
    const imageSynthesis = new ImageSynthesis(this, 'festivalCanvas', width, height);
    imageSynthesis.addImage({
      path: backImageUrls[backIndex].imgUrl,
      x: 0,
      y: 0,
      w: 600,
      h: 1066
    }).addText({
      text: titles1,
      x: 0,
      y: 150,
      font: fonts,
      align: 'center',
      fontSize: 100,
      color: (() => {
        switch (backIndex) {
          case 1:
          case 5:
            return '#99335A';
          case 4:
            return '#000';
          default:
            return '#fff';
        }
      })(),
    }).addImage({
      path: imageurl ? imageurl : qrcode,
      x: width - 80 - 30,
      y: height - 80 - 30,
      w: imageurl ? 80 : 1,
      h: imageurl ? 80 : 1,
    }).addImage({
      path: qrcode,
      x: 30,
      y: height - 120 - 30,
      w: 120,
      h: 120,
      radius: 250 / 2.0,
    }).addText({
      text: '迎国庆，换新颜',
      x: 180,
      y: height - 80,
      align: 'left',
      fontSize: 20,
      color: (() => {
        return '#fff';
      })(),
    }).addText({
      text: '',
      x: 180,
      y: height - 40,
      align: 'left',
      fontSize: 20,
      color: (() => {
        return '#fff';
      })(),
    }).startCompound((imgurl) => {
      wx.hideLoading();
      this.data.loading = false;
      const { backImageUrls, backIndex } = this.data
      backImageUrls[backIndex].posterSrc = imgurl
      this.setData({
        backImageUrls
      });
    });
  },

  // 更换海报背景
  clickChangeBackImage: function (e) {
    if (this.data.loading) {
      return;
    }
    const {
      backIndex,
      backImageUrls,
    } = this.data;
    this.data.backIndex = (backIndex + 1) % backImageUrls.length;
    this._makePosterImage();
  },

  // 保存图片到本地
  clickSavePhoto: function (e) {
    if (this.data.loading) {
      return;
    }
    const { backImageUrls, backIndex } = this.data
    const { posterSrc } = backImageUrls[backIndex];
    backImageUrls[backIndex].posterSrc
    if (posterSrc) {
      wx.showLoading({
        title: '正在保存...',
      });
      this.data.loading = true;
      wx.saveImageToPhotosAlbum({
        filePath: posterSrc,
        success: (res) => {
          this.data.loading = false;
          wx.hideLoading();
          wx.showToast({
            title: '保存到相册成功',
          });
          service.clickIcs({
            title: '保存节日海报',
            type: this.data.backIndex
          })
        },
        fail: (res) => {
          this.data.loading = false;
          wx.hideLoading();
          wx.showToast({
            title: '保存失败',
            icon: 'none',
          });
        }
      });
    } else {
      wx.showToast({
        title: '海报生成异常，请稍后重试',
        icon: 'none'
      });
    }
  },
})