/**
 * add by king-fine
 * 制作头像 首页
 */
import ImageSynthesis from '../../utils/image-synthesis.js';
import Notification from '../../utils/react-whc-notification.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isTouchScale: false,
    makePosterImage: false,
    festivalSrc: '',
    topTip: true,
    oldx: 0,
    oldy: 0,
    startx: 0,
    starty: 0,
    initRotate: 0,
    rotate: 0,
    logoPath: null,
    userInfo: {},
    olduserInfo: {},
    hasScale: false,
    hasRotate: false,
    hasUserInfo: false,
    festivalCenterX: 0,
    festivalCenterY: 0,
    festivalLeft: 0,
    festivalTop: 0,
    offsetx: 0,
    offsety: 0,
    festivalSize: 80,
    hasUserInfo: false,
    previewUrl: '',
    previewFlg: false,
    handFlg: false,
    sendTipFlg: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this
    wx.setNavigationBarTitle({
      title: '小依助手'
    })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    setTimeout(() => {
      that.setData({ sendTipFlg: true })
    }, 60 * 1000);
  },
  /**
   * 展示贴纸弹框
   */
  clickIconPop: function () {
    let paster = this.selectComponent(`#paster`)
    paster.showPasterPop()
    this.setData({ handFlg: false })
  },
  // 选择贴纸icon
  choosePasterIcon: function (e) {
    this.setData({
      festivalSize: e.detail.size,
      festivalSrc: e.detail.src
    })
    if (e.detail.size == 320) {
      this.setData({
        festivalLeft: 0,
        festivalTop: 0
      })
    }
  },

  /**
   * 展示头像弹框
   */
  clickHeaderPop: function () {
    let header = this.selectComponent(`#header`)
    header.showHeaderPop()
  },

  /**
   * 选择头像icon
   */
  chooseHeaderIcon: function (e) {
    const { detail } = e
    const { userInfo } = this.data
    userInfo.highAvatarUrl = detail;
    userInfo.avatarUrl = detail;
    this.setData({
      logoPath: null,
      userInfo,
      hasUserInfo: true,
      handFlg: true
    });
  },

  /**
   * 获取昵称授权
   */
  getUserInfo: function (e) {
    wx.showLoading({ title: '获取中...' })
    wx.getUserProfile({
      desc: "获取你的昵称、头像等信息",
      success: res => {
        wx.hideLoading()
        this._saveUserInfo(res.userInfo)
      },
      fail: res => {
        wx.showToast({
          icon: 'none',
          title: '请先授权头像信息！',
        })
        return;
      }
    })
  },

  /**
   * 保存头像
   */
  _saveUserInfo: function (userInfo = {}) {
    if (userInfo.avatarUrl) {
      const index = userInfo.avatarUrl.lastIndexOf('/132');
      if (index != -1) {
        userInfo.highAvatarUrl = userInfo.avatarUrl.substring(0, index) + '/0';
      } else {
        userInfo.highAvatarUrl = userInfo.avatarUrl;
      }
    }
    getApp().globalData.userInfo = userInfo;
    this.setData({
      olduserInfo: { ...userInfo },
      userInfo: userInfo,
      hasUserInfo: userInfo != null,
      festivalSrc: '',
      handFlg: true
    });
  },

  /**
   * 开始生成图片
   */
  async clickMakeNewImage(e) {
    if (!this.data.userInfo.highAvatarUrl) { return }
    wx.showLoading({
      title: '生成中...',
    });
    this.data.logoPath = await this.makeDownloadFile(this.data.userInfo.highAvatarUrl);
    if (this.data.festivalSrc) {
      this.data.festivalSrc = await this.makeDownloadFile(this.data.festivalSrc);
    }
    this._saveImage();
  },

  /**
   * 同步下载网络图片
   */
  makeDownloadFile: function (url) {
    return new Promise((reslove, reject) => {
      if (url.indexOf('wxfile') != -1) {
        reslove(url)
      } else {
        wx.downloadFile({
          url: url,
          success: (res) => {
            reslove(res.tempFilePath)
          },
          fail: (res) => {
            console.error(res)
            reject(null);
          },
        });
      }
    })
  },

  /**
   * 开始绘制图片
   */
  _saveImage: function () {
    const {
      makePosterImage,
      festivalLeft,
      festivalTop,
      festivalSize,
      festivalSrc = '',
      rotate,
      logoPath = '',
    } = this.data;
    if (logoPath == '') {
      wx.showToast({
        title: '请先授权头像信息！',
        icon: 'none',
      });
      return;
    }
    const imageSynthesis = new ImageSynthesis(this, 'festivalCanvas', 320, 320);
    imageSynthesis.addImage({
      path: logoPath,
      x: 0,
      y: 0,
      w: 320,
      h: 320
    });
    const rc = imageSynthesis.switchRect({
      x: festivalLeft,
      y: festivalTop,
      w: festivalSize,
      h: festivalSize,
    });
    if (festivalSize == 320) {
      rc.x = 0
      rc.y = 0
    }
    console.log(rc);
    imageSynthesis.addImage({
      path: festivalSrc,
      x: rc.x,
      y: rc.y,
      w: rc.w,
      h: rc.h,
      deg: rotate
    });
    imageSynthesis.startCompound((img) => {
      if (img != void 0) {
        wx.hideLoading();
        if (makePosterImage) {
          this.data.makePosterImage = false;
          wx.setStorageSync('imageurl', img);
          wx.navigateTo({
            url: `../poster/poster`
          });
        } else {
          this.setData({
            previewFlg: true,
            previewUrl: img
          })
          let mask = this.selectComponent(`#previewMask`)
          mask.showMask(true)
        }
      }
    });
  },

  /**
   * 保存图片到本地相册
   */
  saveImgToLocal: function () {
    const { previewUrl } = this.data
    wx.saveImageToPhotosAlbum({
      filePath: previewUrl,
      success: (res) => {
        wx.hideLoading()
        wx.showToast({
          title: '保存到相册成功',
        });
      },
      fail: (res) => {
        wx.hideLoading()
        wx.showToast({
          title: '保存失败',
          icon: 'none',
        });
      }
    });
  },

  /**
   * 上传抖音头像
   */
  douyinUp: function () {
    let that = this
    wx.showModal({
      title: '制作抖音中国红头像',
      content: '1.前往抖音保存头像到手机相册\r\n 2.选择手机相册抖音头像进行制作\r\n 3.前往抖音去设置制作好的头像',
      cancelText: '取消',
      confirmText: '选择头像',
      success (res) {
        if (res.confirm) {
          that.clickChangeAvatarImage()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },

  /**
   * 上传本地图片头像
   */
  clickChangeAvatarImage: function (e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const {
          userInfo
        } = this.data;
        if (res.tempFilePaths.length > 0) {
          Notification.addObserver(this, 'cutimagenotify', (img) => {
            if (img != void 0) {
              userInfo.highAvatarUrl = img;
              userInfo.avatarUrl = img;
              this.setData({
                logoPath: null,
                userInfo,
                hasUserInfo: true,
                handFlg: true
              });
            } else {
              wx.showToast({
                title: '请选择高清图像尺寸至少200x200以上！',
                icon: 'none',
              });
            }
          });
          wx.navigateTo({
            url: `../imgCut/imgCut?imageurl=${res.tempFilePaths[0]}`,
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            icon: 'none'
          });
        }
      }
    });
  },


  /**
   * 前往节日海报
   */
  makePoster: function (e) {
    const { userInfo } = this.data
    if (userInfo && userInfo.highAvatarUrl) {
      this.data.makePosterImage = true;
      this.clickMakeNewImage(e);
    } else {
      wx.navigateTo({
        url: `../poster/poster`
      });
    }
  },

  _getCurrentPointXiangxian: function (x = 0, y = 0) {
    const {
      festivalCenterX = 0,
      festivalCenterY = 0,
    } = this.data;
    if (x >= festivalCenterX && y <= festivalCenterY) {
      return 1;
    }
    if (x <= festivalCenterX && y <= festivalCenterY) {
      return 2;
    }
    if (x <= festivalCenterX && y >= festivalCenterY) {
      return 3;
    }
    if (x >= festivalCenterX && y >= festivalCenterY) {
      return 4;
    }
  },

  _switchPoint: function (x = 0, y = 0) {
    const xx = this._getCurrentPointXiangxian(x, y);
    const {
      festivalCenterX,
      festivalCenterY,
    } = this.data;
    switch (xx) {
      case 1:
        return {
          x: x - festivalCenterX,
          y: festivalCenterY - y,
        };
      case 2:
        return {
          x: x - festivalCenterX,
          y: festivalCenterY - y,
        };
      case 3:
        return {
          x: x - festivalCenterX,
          y: festivalCenterY - y,
        };
      case 4:
        return {
          x: x - festivalCenterX,
          y: festivalCenterY - y,
        };
      default:
        return null;
    }
  },

  _handlefestivalImageMoveScale: function (e) {
    if (e.touches.length > 0) {
      const {
        oldx = 0,
        oldy = 0,
        festivalCenterX = 0,
        festivalCenterY = 0,
        startx = 0,
        starty = 0,
        initRotate = 0,
        hasRotate,
        hasScale,
        offsety,
        offsetx,
        rotate,
      } = this.data;
      const x = e.touches[0].pageX;
      const y = e.touches[0].pageY;
      if (hasRotate || hasScale) {
        const a = Math.sqrt(Math.pow(Math.abs(x - festivalCenterX), 2) + Math.pow(Math.abs(y - festivalCenterY), 2));
        const b = Math.sqrt(Math.pow(Math.abs(oldx - festivalCenterX), 2) + Math.pow(Math.abs(oldy - festivalCenterY), 2));
        const c = Math.sqrt(Math.pow(Math.abs(oldx - x), 2) + Math.pow(Math.abs(oldy - y), 2));
        const cosa = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);
        const ra = Math.abs(Math.acos(cosa) / (Math.PI / 180));
        const a1 = this._switchPoint(oldx, oldy);
        const b1 = this._switchPoint(x, y);
        const sunshi = a1.x * b1.y - a1.y * b1.x;
        const newsize = Math.sqrt(Math.pow(a * 2, 2) / 2);
        if (sunshi != 0) {
          const rotateSshi = sunshi < 0;
          this.setData({
            festivalTop: festivalCenterY - newsize / 2.0,
            festivalLeft: festivalCenterX - newsize / 2.0,
            festivalSize: newsize,
            rotate: rotate + (rotateSshi ? ra : -ra),
            oldx: x,
            oldy: y,
          });
        } else {
          this.setData({
            festivalTop: festivalCenterY - newsize / 2.0,
            festivalLeft: festivalCenterX - newsize / 2.0,
            festivalSize: newsize,
            oldx: x,
            oldy: y,
          });
        }
      } else {
        this.setData({
          festivalTop: y - offsety,
          festivalLeft: x - offsetx,
          oldx: x,
          oldy: y,
        });
      }
    }
  },

  festivalImageTouchStart: function (e) {
    if (this.data.isTouchScale) {
      return;
    }
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    this.data.startx = x;
    this.data.starty = y;
    this.data.oldx = x;
    this.data.oldy = y;
    this.data.festivalCenterX = this.data.festivalLeft + this.data.festivalSize / 2.0;
    this.data.festivalCenterY = this.data.festivalTop + this.data.festivalSize / 2.0;
    this.data.hasRotate = false;
    this.data.hasScale = false;
    this.data.offsetx = x - this.data.festivalLeft;
    this.data.offsety = y - this.data.festivalTop;
  },

  festivalImageTouchMove: function (e) {
    if (this.data.isTouchScale) {
      return;
    }
    this._handlefestivalImageMoveScale(e);
  },

  festivalImageTouchEnd: function (e) {
    if (this.data.isTouchScale) {
      return;
    }
    this._handlefestivalImageMoveScale(e);
  },

  festivalImageRaoteTouchStart: function (e) {
    this.data.isTouchScale = true;
    this.data.initRotate = this.data.rotate;
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    this.data.startx = x;
    this.data.starty = y;
    this.data.oldx = x;
    this.data.oldy = y;
    this.data.festivalCenterX = this.data.festivalLeft + this.data.festivalSize / 2.0;
    this.data.festivalCenterY = this.data.festivalTop + this.data.festivalSize / 2.0;
    this.data.hasRotate = true;
    this.data.hasScale = true;
    this.data.offsetx = x - this.data.festivalLeft;
    this.data.offsety = y - this.data.festivalTop;
  },

  festivalImageRaoteTouchMove: function (e) {
    this._handlefestivalImageMoveScale(e);
  },

  festivalImageRaoteTouchEnd: function (e) {
    this._handlefestivalImageMoveScale(e);
    this.data.isTouchScale = false;
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '小依助手头像制作',
      desc: '国旗头像、卡通头像等',
      path: '/pages/index/index',
      imageUrl: getApp().globalData.userInfo.highAvatarUrl,
    };
  }
})