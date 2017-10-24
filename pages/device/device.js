//logs.js

Page({
  data: {
    deviceId: '',
    deviceName: '',
    serviceId: '',
    services: [],
    msg: '----',
    FF01: '',
    FF02: '',
    characteristics01: null,
    characteristics02: null
  },

  //onload
  onLoad: function (opt) {
    var that = this;

    //获取页面参数
    that.setData({
      deviceId: opt.id,
      deviceName: opt.name
    });

    this.startConnect();
  },

  //onShow
  onShow: function () {
    var that = this;
    this.startConnect();
  },

  //onHide
  onHide: function () {
    this.closeConnection();
  },

  //onUnload
  onUnload: function () {
    this.closeConnection();
  },

  //监听页面事件
  btnViewTap: function () {
    var that = this;
    var hex = 'CC0102C7C7EE';

    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    }));

    console.log(typedArray);
    //console.log([0xAA, 0x55, 0x04, 0xB1, 0x00, 0x00, 0xB5])

    var buffer1 = typedArray.buffer;
    console.log(buffer1);

    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.FF01,
      value: buffer1,

      success: function (res) {
        // success
        console.log("FF02 success  指令发送成功");
        console.log(res);
      },
      fail: function (res) {
        // fail
        console.log(res);
      },
      complete: function (res) {
        // complete
      }
    });
  },

  //StartConnect
  startConnect: function () {
    var that = this;

    wx.createBLEConnection({
      deviceId: that.data.deviceId,

      success: function (res) {
        console.log(res);

        //连接成功后开始获取设备的服务列表
        wx.getBLEDeviceServices({
          deviceId: that.data.deviceId,

          success: function (res) {
            console.log('device services:', res.services);

            that.setData({
              services: res.services,
              serviceId: res.services[1].uuid,
              msg: '已连接'
            });
            // console.log('device services:', that.data.services[1].uuid);
            // that.setData({ serviceId: that.data.services[1].uuid });
            // console.log('--------------------------------------');
            // console.log('device设备的id:', that.data.deviceId);
            // console.log('device设备的服务id:', that.data.serviceId);

            //延时3s开始获取特征
            setTimeout(function () {
              wx.getBLEDeviceCharacteristics({
                deviceId: that.data.deviceId,
                serviceId: that.data.serviceId,

                success: function (res) {
                  console.log('device getBLEDeviceCharacteristics:', res.characteristics);

                  for (var i = 0; i < 5; i++) {
                    if (res.characteristics[i].uuid.indexOf("FF01") != -1) {
                      that.setData({
                        FF01: res.characteristics[i].uuid,
                        characteristics01: res.characteristics[i]
                      });
                    }
                    if (res.characteristics[i].uuid.indexOf("FF02") != -1) {
                      that.setData({
                        FF02: res.characteristics[i].uuid,
                        characteristics02: res.characteristics[i]
                      });
                    }
                  }

                  //监听结果
                  wx.onBLECharacteristicValueChange(function (characteristic) {
                    if (characteristic.characteristicId.indexOf("FF02") != -1) {
                      let result = characteristic.value;
                      let hex = that.buf2hex(result);
                      console.log('FF02:');
                      console.log(hex);
                    }
                  });

                  //启用Notify功能
                  wx.notifyBLECharacteristicValueChanged({
                    deviceId: that.data.deviceId,
                    serviceId: that.data.serviceId,
                    characteristicId: that.data.FF02,
                    state: true,
                    success: function (res) {
                      console.log('notifyBLECharacteristicValueChanged success', res);
                    }
                  });
                }
              });
            }, 3000);
          }
        });
      }
    });
  },

  //CloseConnection
  closeConnection: function(){
    var that = this;

    wx.closeBLEConnection({
      deviceId: that.data.deviceId,
      success: function (res) {
        console.log(res);
      }
    });
  },

  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }
});
