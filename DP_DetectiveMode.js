//=============================================================================
// drowsepost Plugins - Detective Mode Plugin
// DP_DetectiveMode.js
// Version: 0.1
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_DetectiveMode = true;

//=============================================================================
 /*:
 * @plugindesc イベントをタップして直接実行できるようにします ver 0.1
 * @author drowsepost
 *
 * @param Switch Number
 * @desc このプラグインのオンオフを切り替えるスイッチID
 * Default: 3
 * @default 3
 *
 * @param Stop Trigger Input
 * @desc 有効時ボタンデバイスによる隣接イベントの実行をストップするか
 * Default: true
 * @default true
 *
 * @param Stop Move Tap
 * @desc 有効時タップ操作をストップするか
 * Default: true
 * @default true
 *
 * @param Stop Move
 * @desc 有効時プレイヤーの移動をすべてキャンセルするか
 * Default: false
 * @default false
 *
 * @help
 * 指定したスイッチID(Switch Number)がオンのとき、
 * イベントをクリックすると移動できる出来ないに関わらず直接イベントを実行します。
 * 「決定キー」をそのイベントに対して押したのと同じ振る舞いになります。
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
    var parameters = PluginManager.parameters('DP_DetectiveMode');
    var user_switch = Number(parameters['Switch Number'] || 3);
    
    var user_stop = Boolean(parameters['Stop Move'] === 'true' || false);
    var user_stop_tap_move = Boolean(parameters['Stop Move Tap'] === 'true' || false);
    
    var user_stop_input = Boolean(parameters['Stop Trigger Input'] === 'true' || false);
    
    var isDirectMode = (function(){
        return $gameSwitches.value(user_switch);
    });
    
    var startEventOnMap = (function(x, y){
        /*
        指定座標のイベントを実行
        */
        var isFind = false;
        if (!$gamePlayer.canStartLocalEvents()) return;
        if ($gameMap.isEventRunning()) return;
        
        $gameMap.eventsXy(x, y).forEach(function(event) {
            console.log('find event', event);
            if (event.isTriggerIn([0])) {
                //event.isNormalPriority();←「通常キャラクターと同じ」であるかどうかを返します。
                event.start();
                isFind = true;
            }
        });
        return isFind;
    });
    
    var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        
        if(isDirectMode() && user_stop) return;
        _Game_Player_moveByInput.call(this);
        
    };
    
    var _Game_Player_triggerButtonAction = Game_Player.prototype.triggerButtonAction;
    Game_Player.prototype.triggerButtonAction = function() {
        
        if(isDirectMode() && user_stop_input) return false;
        return _Game_Player_triggerButtonAction.call(this);
        
    };

    var _Game_Player_triggerTouchAction = Game_Player.prototype.triggerTouchAction;
    Game_Player.prototype.triggerTouchAction = function() {
        
        if(isDirectMode() && user_stop_tap_move) return false;
        return _Game_Player_triggerTouchAction.call(this);
        
    };
    
    var _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        (function(_self){
            /*
            マップがタッチされたら座標を取り出してイベント実行
            */
            if(!isDirectMode()) return;
            
            if (!TouchInput.isTriggered() && _self._touchCount <= 0) return;
            if (!TouchInput.isPressed()) return;
            if (_self._touchCount !== 0 && _self._touchCount > 5) return;
            
            var x = $gameMap.canvasToMapX(TouchInput.x);
            var y = $gameMap.canvasToMapY(TouchInput.y);
            startEventOnMap(x, y);
            
        }(this));
        
        
        if(!(isDirectMode() && user_stop_tap_move)) {
            _Scene_Map_processMapTouch.call(this);
        }
        
    };
    
}());
