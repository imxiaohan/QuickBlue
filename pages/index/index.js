//index.js

//获取应用实例
const app = getApp();

Page({
  data: {
    msg: '',
    count: '',
    devices: [],
  },

  /*
   * onLoad
   */
  onLoad: function () {
    var that = this;

    console.log("Page Load");
    that.startScan();
  },

  /*
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    var that = this;

    that.setData({
      devices: []
    });

    that.startScan();

    wx.stopPullDownRefresh ({
      complete: function(res) {}
    });
  },

  /*
   * 用户点击
   */
  btnViewTap: function (e) {
    console.log(e);
    var deviceId = e.currentTarget.dataset.deviceid;
    var deviceName = e.currentTarget.dataset.devicename;
    wx.navigateTo({
      url: '../device/device?id=' + deviceId + '&name=' + deviceName
    });
  },

  /*
   * 开启连接
   */
  startScan: function () {
    var that = this;

    wx.openBluetoothAdapter ({
      success: function(res) {
        console.log('初始化蓝牙适配器');
        console.log(res);
        that.getBluetoothAdapterState();
      },
      fail: function (err) {
        console.log(err);
        wx.showToast ({
          title: '蓝牙初始化失败',
          icon: 'success',
          duration: 2000
        });
        setTimeout(function() {
          wx.hideToast();
        }, 2000);
      }
    });

    // 开始监听蓝牙状态变化
    wx.onBluetoothAdapterStateChange(function(res) {
      var available = res.available;
      if (available){
        that.getBluetoothAdapterState();
      }
    });
  },

  /*
   * 获取本机蓝牙状态
   */
  getBluetoothAdapterState: function () {
    var that = this;

    wx.getBluetoothAdapterState({
      success: function(res) {
        var available = res.available;
        var discovering = res.discovering;

        if (!available) {
          wx.showToast( {
            title: '设备无法开启蓝牙连接',
            icon: 'success',
            duration: 2000
          });
          setTimeout(function() {
            wx.hideToast();
          }, 2000);
        } else {
          if (!discovering) {
            that.startBluetoothDevicesDiscovery();
            //that.getConnectedBluetoothDevices();
          }
          that.setData({
            msg: '蓝牙可用'
          });
        }
      },
      fail: function(res) {
        console.log(res);
      },
    });
  },

  /*
   * 开始搜索新设备
   */
  startBluetoothDevicesDiscovery: function () {
    var that = this;

    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      interval: 1000,
      success: function(res) {
        if(!res.isDiscovering) {
          that.getBluetoothAdapterState();
        } else {
          that.onBluetoothDeviceFound();
        }
      },
      fail: function(res) {
        console.log(res);
      },
    });
  },

  /*
   * 监听蓝牙是否搜索到
   */
  onBluetoothDeviceFound: function () {
    var that = this;

    console.log('onBluetoothDeviceFound');

    wx.onBluetoothDeviceFound(function(res) {
      console.log('new device list has founded');
      console.log(res.devices);

      wx.getBluetoothDevices({
        complete: function(res) {
          //console.log(res.devices.length);
          that.setData({
            devices: res.devices,
            count: res.devices.length
          });
        }
      });
    });
  },
});
