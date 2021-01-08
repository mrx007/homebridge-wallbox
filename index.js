var Service, Characteristic
const request = require('request')
const packageJson = require('./package.json')

module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-wallbox-charger', 'WallboxCharger' , WallboxEVCharger)
}

function WallboxEVCharger (log, config) {
  this.log = log

  this.name = config.name

  this.manufacturer = 'Wallbox Chargers'
  this.serial = config.serial // conf Required
  this.model = config.model || 'Charging Device'
  this.firmware = config.firmware || 'Not Defined'

  this.username = config.username || null
  this.password = config.password || null
  this.timeout = (config.timeout * 1000) || 5000

  this.http_method = 'PUT'
  this.token = 'Bearer ' + config.token // conf Required
  this.header = { "Authorization": this.token }

  this.openURL = 'https://api.wall-box.com/v2/charger/' + this.serial + '?locked=0'
  this.closeURL = 'https://api.wall-box.com/v2/charger/' + this.serial + '?locked=1'
  this.statusURL = 'https://api.wall-box.com/chargers/status/' + this.serial
  
  this.autoLock = config.autoLock || false // conf Optional
  this.autoLockDelay = config.autoLockDelay // conf Optional

  this.debug = config.debug || false  // conf Optional

  if (this.username != null && this.password != null) {
    this.auth = {
      user: this.username,
      pass: this.password
    }
  }

  this.log(this.name)

  this.service = new Service.LockMechanism(this.name)
}

WallboxEVCharger.prototype = {

  identify: function (callback) {
    this.log('Identify requested!')
    callback()
  },

  _httpRequest: function (url, headers, body, method, callback) {
    request({
      url: url,
      headers: headers,
      body: body,
      method: this.http_method,
      timeout: this.timeout,
      rejectUnauthorized: false,
      auth: this.auth
    },
    function (error, response, body) {
      callback(error, response, body)
    })
  },

  setLockTargetState: function (value, callback) {
    var url
    var method = 'PUT'
    var body = ''
    var headers = this.header
    var debug = this.debug

    this.log('[+] Setting Wallbox State to %s', value)
    if (value === 1) {
      url = this.closeURL
    } else {
      url = this.openURL
    }
    this._httpRequest(url, headers, body, method, function (error, response, responseBody) {
      if (error) {
        this.log('[!] Error setting Wallbox State: %s', error.message)
        callback(error)
      } else {
        if (value === 1) {
          this.service.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED)
          this.log('[*] Wallbox locked')
            if (this.debug) {
            this.log('[API CALL] ' + method + ' ' + url)
            this.log('[API RESPONSE] ' + responseBody)
            }
        } else {
          this.log('[*] Wallbox unlocked')
            if (this.debug) {
              this.log('[API CALL] ' + method + ' ' + url)
              this.log('[API RESPONSE] ' + responseBody)
              }
          this.service.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED)
          if (this.autoLock) {
            this.autoLockFunction()
          }
		  /* else if (this.resetLock) {
			  this.resetLockFunction()
		  } */
        }
        callback()
      }
    }.bind(this))
  },

  autoLockFunction: function () {
    this.log('[+] Waiting %s seconds for autolock', this.autoLockDelay)
    setTimeout(() => {
      this.service.setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED)
      this.log('[*] Autolocking')
    }, this.autoLockDelay * 1000)
  },

  
  /*
  
  resetLockFunction: function () {
    this.log('[+] Waiting %s seconds for resetting lock state to locked', this.resetLockTime)
    setTimeout(() => {
	  this.service.getCharacteristic(Characteristic.LockCurrentState).updateValue(1)
	  this.service.getCharacteristic(Characteristic.LockTargetState).updateValue(1)
      this.log('[*] Lock State resetted')
    }, this.resetLockTime * 1000)
  },

  */

  getServices: function () {
    this.service.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED)
    this.service.setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED)

    this.informationService = new Service.AccessoryInformation()
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware)

    this.service
      .getCharacteristic(Characteristic.LockTargetState)
      .on('set', this.setLockTargetState.bind(this))

    return [this.informationService, this.service]
  }
}
