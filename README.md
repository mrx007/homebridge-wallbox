<span align="center">

# homebridge-wallbox

</span>

## About
This is a plugin for [Homebridge](https://homebridge.io/), allowing you to control Wallbox EV Charger.   

## Installation
### Plugin installation
1. Install [Homebridge](https://homebridge.io/) using: `npm install -g homebridge`
2. Install homebridge-wallbox using: `npm install -g homebridge-wallbox`
3. Configure homebridge-wallbox by editing your `~/.homebridge/config.json` file, or use [config-ui-x](https://www.npmjs.com/package/homebridge-config-ui-x). See example below:
## Configuration
### Configuration Example:
``` json
{
    "accessory": "WallboxCharger",
    "name": "My Wallbox",
    "serial": 12345,
    "token": "YOUR_WALLBOX_TOKEN",
    "autoLock": true,
    "autoLockDelay": 60,
    "debug": true,
}
```
### Configuration Parameters:
- `name`: Required string. Name of the accessory. Siri uses this parameter for identifying your Wallbox.
- `serial`: Required string. wallbox serial number. You'll find it in the Wallbox offical App or on the box itself.
- `token`: Required string. wallbox account token. To get a Token, open Terminal and type the following command : `curl -u YOUR_WALLBOX_ACCOUNT_EMAIL https://api.wall-box.com/auth/token/user`
- `autoLock`: Optional boolean (default: `false`)
- `autoLockDelay`: Optional number (default: `60`). Delay in seconds before automaticaly locking your Wallbox.  
- `debug`: Optional boolean (default: `false`)


## Supported Device
- [Wallbox Pulsar Plus](https://wallbox.com)
- Should work with other Wallbox model but can't certify (can't test ;) ) 

## Known issues / To Do list
### ToDo next
- [ ] Update device status in iOS home app (to refresh the status on load)
- [ ] GET device model and firmware to populate Homekit accessory
- [ ] ADD "change max voltage" Switch
- [ ] ADD "Pause/Resume Charge" Switch
### Warning
If you enable `autoLock` with the plugin, please **DISABLE** the "offical" autolock function from Wallbox (in the App). There is no "status" polling and you may desynchronize your homekit accessory.

## Acknowledgment
- Plugin based on [homebridge-http-lock-ultimate](https://github.com/TheRealSimonMlr/homebridge-http-lock-ultimate)
- Unofficial Wallbox API by [cliviu74](https://github.com/cliviu74/wallbox)