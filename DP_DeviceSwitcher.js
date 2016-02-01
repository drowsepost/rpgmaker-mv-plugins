//=============================================================================
// drowsepost Plugins - Device Switcher
// DP_DeviceSwitcher.js
// Version: 0.1
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_DeviceSwitcher = true;

//=============================================================================
 /*:
 * @plugindesc 入力デバイスを制限します ver0.1(201602012157)
 * @author drowsepost
 *
 * @param MouseInput
 * @desc マウス入力を有効にします
 * Default: true
 * @default true
 *
 * @param TouchInput
 * @desc タッチ入力を有効にします
 * Default: true
 * @default true
 *
 * @param PadInput
 * @desc ゲームパッド入力を有効にします
 * Default: true
 * @default true
 *
 * @param KeyboadInput
 * @desc キーボード入力を有効にします
 * Default: true
 * @default true
 *
 * @param UseSwitch
 * @desc プラグインの有効/無効をスイッチで制御します。
 * 空もしくは0以下にすると常に有効になります。
 * @default 
 *
 * @help
 * falseに設定した入力用デバイスが無効になります
 * 
 * ===
 * このプラグインは試作品です。
 * いくつかのプライベートプロパティーを参照しているため、
 * 今後の本体アップデートで動作しなくなる可能性があります。
 * ご利用によって生じたいかなる問題の責任も負いかねます。
 * ===
 * 
 * ライセンス: MIT
 * 
 */
(function() {
    "use strict";
    var parameters = PluginManager.parameters('DP_DeviceSwitcher');
    var user_use_mouse = Boolean(parameters['MouseInput'] === 'true' || false);
    var user_use_touch = Boolean(parameters['TouchInput'] === 'true' || false);
    var user_use_gamepad = Boolean(parameters['PadInput'] === 'true' || false);
    var user_use_keyboad = Boolean(parameters['KeyboadInput'] === 'true' || false);
    var user_switch = Number(parameters['UseSwitch'] || -1);
    
    var isUsePlugin = (function(){
        if(user_switch < 1) return true;
        if(!$gameSwitches) return false;
        if(!('value' in $gameSwitches)) return false;
        
        return $gameSwitches.value(user_switch);
    });
    
    /*
    rpg_core: Input
    ==========================================================================================
    */
    var _Input_onKeyDown = Input._onKeyDown;
    Input._onKeyDown = function(event) {
        if (isUsePlugin() && !user_use_keyboad) {
            this.clear();
            event.preventDefault();
            return;
        }
        
        _Input_onKeyDown.call(this, event);
    };
    
    var _Input_pollGamepads = Input._pollGamepads;
    Input._pollGamepads = function() {
        if (isUsePlugin() && !user_use_gamepad) {
            return;
        }
        
        _Input_pollGamepads.call(this);
    }
    
    /*
    rpg_core: TouchInput
    ==========================================================================================
    */
    var MouseInputFactory = function(_function){
        var __function = _function;
        return function(_arg){
            if (isUsePlugin() && !user_use_mouse) {
                return;
            }
            __function.call(this, _arg);
        };
    };
    
    var TouchInputFactory = function(_function){
        var __function = _function;
        return function(_arg){
            if (isUsePlugin() && !user_use_touch) {
                return;
            }
            __function.call(this, _arg);
        };
    };
    
    TouchInput._onMouseDown = MouseInputFactory(TouchInput._onMouseDown);
    TouchInput._onLeftButtonDown = MouseInputFactory(TouchInput._onLeftButtonDown);
    TouchInput._onMiddleButtonDown = MouseInputFactory(TouchInput._onMouseDown);
    TouchInput._onRightButtonDown = MouseInputFactory(TouchInput._onRightButtonDown);
    TouchInput._onMouseMove = MouseInputFactory(TouchInput._onMouseMove);
    TouchInput._onMouseUp = MouseInputFactory(TouchInput._onMouseUp);
    TouchInput._onWheel = MouseInputFactory(TouchInput._onWheel);
    
    TouchInput._onTouchStart = TouchInputFactory(TouchInput._onTouchStart);
    TouchInput._onTouchMove = TouchInputFactory(TouchInput._onTouchMove);
    TouchInput._onTouchEnd = TouchInputFactory(TouchInput._onTouchEnd);
    TouchInput._onTouchCancel = TouchInputFactory(TouchInput._onTouchCancel);
    TouchInput._onPointerDown = TouchInputFactory(TouchInput._onPointerDown);
    
}());
