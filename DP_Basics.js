//=============================================================================
// 🏤drowsepost Plugins - Basics
// DP_Basics.js
// Version: 0.11
// 
// Copyright (c) 2017 - 2019 canotun
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//=============================================================================

var Imported = Imported || {};
Imported.DP_Basics = true;

var drowsepost = drowsepost || {};

//=============================================================================
 /*:
 * @plugindesc 基礎スクリプトと小品の詰め合わせ
 * @author drowsepost
 *
 * @param MovingSpeed
 * @desc キャラクター移動速度の変更
 * Default: 1
 * @default 1
 *
 * @param EventTouchToStart
 * @desc タッチ操作でイベントを起動するかどうか。移動中の誤爆防止
 * Default: true
 * @default true
 * @type boolean
 *
 * @param PointType
 * @desc タップ位置の見た目。falseで無効
 * Default: false (四角グラデ: square / 丸: circle / 非表示: hidden)
 * @default false
 * @type select
 * @option 標準
 * @value false
 * @option 四角
 * @value square
 * @option 丸
 * @value circle
 * @option 非表示
 * @value hidden
 * 
 * @param PointColor
 * @desc タップ位置の色
 * Default: white (色書式。 | で区切って2つまで指定)
 * @default white
 * 
 * @param WASD Move
 * @desc キー移動をWASD方式で行うQ/WはQ/Eに変更
 * Default: false (ON: true / OFF: false)
 * @default false
 * @type boolean
 *
 * @param SkipTitleWait
 * @desc タイトルでニューゲームが自動選択されるまでのフレーム数。
 * Default: -1 (-1で無効)
 * @default -1
 *
 * @param SkipTitleHideWindow
 * @desc タイトルのウィンドウを非表示にします。
 * Default: false
 * @default false
 * @type boolean
 * 
 * @help
 * 共通して利用可能なユーティリティーを提供します。
 * 
 * drowsepost.marge(obj1, obj2);
 * obj1にobj2を結合します。重複するキーは上書きします。
 * 
 * drowsepost.indexOf(obj, value);
 * objのなかからvalueに等しい値を持つkeyを配列にして返します。
 * 
 * drowsepost.objectLerp(ratio, from, to);
 * オブジェクトの数値を比率で遷移させたものを返します。
 * 
 * drowsepost.keycode
 * キー入力を制御するオブジェクトです
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
    var parameters = PluginManager.parameters('DP_Basics');
    var user_point_type = (parameters['PointType'] || 'square').toLowerCase();
    var user_point_color = (parameters['PointColor'] || 'white').split("|");
    var user_move_wasd = Boolean(parameters['WASD Move'] == 'true' || false);
    var user_title_wait = Number(parameters['SkipTitleWait'] || 1);
    var user_title_hidewindow = Boolean(parameters['SkipTitleHideWindow'] === 'true' || false);
    var user_moving_speed = Number(parameters['MovingSpeed'] || 1);
    var user_event_touchstart = Boolean(parameters['EventTouchToStart'] == 'true' || false);
    
    var _dp_ = {};
    
    /**
     * オブジェクトAにオブジェクトBを結合します。
     * 重複する場合、オブジェクトBが優先されます。
     * オブジェクトAへの参照を戻します。
     * @param {object} obj1
     * @param {object} obj2
     */
    _dp_.marge = (function (obj1, obj2) {
        if (!obj2) obj2 = {};
        
        for (var attrname in obj2) {
            if (obj2.hasOwnProperty(attrname)) {
                obj1[attrname] = obj2[attrname];
            }
        }
        
        return obj1;
    });
    
    /**
     * オブジェクトの内容がvalueに一致するもののキーを返します
     * 型も一致する必要があります
     * @param {object} obj
     * @param {any} value
     */
    _dp_.indexOf = (function(obj, value) {
        return obj.filter(function(v, i){
            if (v === value) return i;
        });
    });
    
    /**
     * 数値を比率で遷移させたものを返します。
     * @param {number} ratio 0 to 1 
     * @param {number} from 
     * @param {number} to 
     * @return {number}
     */
    _dp_.lerp = (function(ratio, from, to){
        return from + (to - from) * ratio;
    });
    
    /**
     * オブジェクトの数値を比率で遷移させたものを返します。
     * @param {number} ratio 0 to 1 
     * @param {object} from 
     * @param {object} to 
     * @param {boolian} is_real
     * @return {object}
     */
    _dp_.objectLerp = (function(ratio, from, to, is_real){
        var r = {};
        
        var c;
        for (var key in from) {
            if (!(key in to)) continue;
            if (typeof from[key] !== 'number') continue;
            if (typeof to[key] !== 'number') continue;
            
            r[key] = _dp_.lerp(ratio, from[key], to[key]);
            
            if(is_real) {
                from[key] = r[key];
            }
        }
        
        return r;
    });
    
    /*
    Key Utility
    */
    (function(){
        var keycode = {};
        
        keycode.roles = [
            'tab',
            'control',
            'ok',
            'escape',
            'shift',
            'left',
            'up',
            'right',
            'down',
            'pageup',
            'pagedown',
            'debug',
        ];
        
        keycode.keys = {
            'backspace' : 8,
            'tab' : 9,
            'enter' : 13,
            'shift' : 16,
            'ctrl' : 17,
            'alt' : 18,
            'pause' : 19,
            'caps lock' : 20,
            'escape' : 27,
            'pageup' : 33,
            'pagedown' : 34,
            'end' : 35,
            'home' : 36,
            'left' : 37,
            'up' : 38,
            'right' : 39,
            'down' : 40,
            'insert' : 45,
            'delete' : 46,
            '0' : 48,
            '1' : 49,
            '2' : 50,
            '3' : 51,
            '4' : 52,
            '5' : 53,
            '6' : 54,
            '7' : 55,
            '8' : 56,
            '9' : 57,
            'a' : 65,
            'b' : 66,
            'c' : 67,
            'd' : 68,
            'e' : 69,
            'f' : 70,
            'g' : 71,
            'h' : 72,
            'i' : 73,
            'j' : 74,
            'k' : 75,
            'l' : 76,
            'm' : 77,
            'n' : 78,
            'o' : 79,
            'p' : 80,
            'q' : 81,
            'r' : 82,
            's' : 83,
            't' : 84,
            'u' : 85,
            'v' : 86,
            'w' : 87,
            'x' : 88,
            'y' : 89,
            'z' : 90,
            'leftwindow' : 91,
            'rightwindow' : 92,
            'select' : 93,
            'numpad0' : 96,
            'numpad1' : 97,
            'numpad2' : 98,
            'numpad3' : 99,
            'numpad4' : 100,
            'numpad5' : 101,
            'numpad6' : 102,
            'numpad7' : 103,
            'numpad8' : 104,
            'numpad9' : 105,
            'multiply' : 106,
            'add' : 107,
            'subtract' : 109,
            'decimalpoint' : 110,
            'divide' : 111,
            'f1' : 112,
            'f2' : 113,
            'f3' : 114,
            'f4' : 115,
            'f5' : 116,
            'f6' : 117,
            'f7' : 118,
            'f8' : 119,
            'f9' : 120,
            'f10' : 121,
            'f11' : 122,
            'f12' : 123,
            'numlock' : 144,
            'scrolllock' : 145,
            'semicolon' : 186,
            'equalsign' : 187,
            'comma' : 188,
            'dash' : 189,
            'period' : 190,
            'slash' : 191,
            'graveaccent' : 192,
            'openbracket' : 219,
            'backslash' : 220,
            'closebraket' : 221,
            'singlequote' : 222,
        };
        
        keycode.number = (function(_name){
            var _n = _name.toLowerCase();
            if(_n in keycode.keys) {
                return keycode.keys[_n];
            } else {
                return -1;
            }
        });
        
        keycode.name = (function(_code){
            var r = _dp_.indexOf(keycode.keys, _code);
            if(r.length < 1) return '';
            return r[0];
        });
        
        keycode.originalMapper = _dp_.marge({}, Input.keyMapper);
        
        keycode.getMapper = (function(){
            return _dp_.marge({}, Input.keyMapper);
        });
        
        keycode.updateMapper = (function(number, role){
            var t1 = (typeof number);
            var t2 = (typeof role);
            
            switch(t1){
                case 'undefined':
                    Input.keyMapper = _dp_.marge({}, keycode.originalMapper);
                    return;
                case 'object':
                    _dp_.marge(Input.keyMapper, number);
                    return;
                case 'string':
                    number = keycode.number(number);
                    if(number < 0) return;
                default:
                    break;
            }
            
            var r = {};
            if(t2 === 'undefined') {
                r[number] = '';
            }
            
            if(t2 === 'string') {
                r[number] = role;
            }
            
            _dp_.marge(Input.keyMapper, r);
        });
        
        keycode.resetMapper = (function(){
            keycode.updateMapper();
        });
        
        keycode.saveMapper = (function(){
            keycode.originalMapper = _dp_.marge({}, Input.keyMapper);
        });
        
        Object.defineProperty(keycode, 'mapper', {
            get: function() {
                return this.getMapper;
            },
            set: function(val) {
                this.updateMapper(val);
            }
        });
        
        _dp_.keycode = _dp_.keycord = _dp_.keycode || keycode;
    }());
    
    /*
    Export
    */
    drowsepost = _dp_.marge(drowsepost, _dp_);
    drowsepost.fn = drowsepost.fn || {};
    
    
    /*
    Game_Interpreter
    ===================================================================================
    コマンドパーサーの追加
    */
    (function(){
        //@override
        var _parent_pluginCommand = Game_Interpreter.prototype.pluginCommand;
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            _parent_pluginCommand.call(this, command, args);
            
            if(!(command in drowsepost.fn)) return;
            if(typeof drowsepost.fn[command] === 'function') {
                drowsepost.fn[command].call(this, args);
            }
        };
        
    }());
    
    /*
    Game_CharacterBase
    ===================================================================================
    移動速度の変更
    */
    (function(){
        //@override
        var _Game_CharacterBase_distancePerFrame = Game_CharacterBase.prototype.distancePerFrame;
        Game_CharacterBase.prototype.distancePerFrame = function() {
            return _Game_CharacterBase_distancePerFrame.apply(this, arguments) * user_moving_speed;
        };
        
    }());
    
    /*
    Game_Player
    ===================================================================================
    タッチによるイベント起動を無効化
    */
    (function(){
        //@override
        var _parent_triggerTouchActionD2 = Game_Player.prototype.triggerTouchActionD2;
        Game_Player.prototype.triggerTouchActionD2 = function(x2, y2) {
            if ($gameMap.boat().pos(x2, y2) || $gameMap.ship().pos(x2, y2)) {
                if (TouchInput.isTriggered() && this.getOnVehicle()) {
                    return true;
                }
            }
            if (this.isInBoat() || this.isInShip()) {
                if (TouchInput.isTriggered() && this.getOffVehicle()) {
                    return true;
                }
            }
            
            if(!user_event_touchstart) return false;
            return _parent_triggerTouchActionD2.call(this, x2, y2);
        };

        //@override
        var _parent_triggerTouchActionD3 = Game_Player.prototype.triggerTouchActionD3;
        Game_Player.prototype.triggerTouchActionD3 = function(x2, y2) {
            if(!user_event_touchstart) return false;
            return _parent_triggerTouchActionD3.call(this, x2, y2);
        };
    }());
    
    /*
    Sprite_Destination
    ===================================================================================
    移動指示スプライトの表示変更
    */
    (function(){
        if(user_point_type === 'false') return;
        
        var _parent_createBitmap = Sprite_Destination.prototype.createBitmap;
        Sprite_Destination.prototype.createBitmap = function() {
            _parent_createBitmap.call(this);
            this.bitmap.clear();
            
            var tileWidth = $gameMap.tileWidth();
            var tileHeight = $gameMap.tileHeight();
            
            var c1 = user_point_color[0].trim();
            var c2 = (user_point_color.length > 1) ? user_point_color[1].trim() : undefined;
            
            if(c1 == '') c1 = 'rgba(255, 255, 255, 0.5)';
            
            switch(user_point_type){
                case 'hidden':
                    break;
                case 'circle':
                    this.bitmap.drawCircle(tileWidth/2 , tileHeight/2 , tileWidth/2 , c1);
                    break;
                case 'square':
                    this.bitmap.gradientFillRect(0, 0, tileWidth, tileHeight, c1, (c2 || c1), true)
                    break;
                default:
                    this.bitmap.textColor = c1;
                    this.bitmap.outlineColor = c2 || 'rgba(0, 0, 0, 0)';
                    this.bitmap.drawText(user_point_type, 0 , 0, tileWidth, tileHeight, 'center');
                    break;
            }
        };
        
    }());
    
    
    /*
    Scene_Title
    ===================================================================================
    タイトルスキップ機能の追加
    */
    (function(){
        if(user_title_wait < 0) return;
        
        var title_wait = 0;
        var title_started = false;
        
        var Scene_Title_start = Scene_Title.prototype.start;
        Scene_Title.prototype.start = function() {
            title_wait = 0;
            title_started = false;
            Scene_Title_start.call(this);
        };
        
        var Scene_Title_commandNewGame = Scene_Title.prototype.commandNewGame;
        var Scene_Title_update = Scene_Title.prototype.update;
        Scene_Title.prototype.update = function() {
            title_wait++;
            if(title_wait >= user_title_wait){
                if(!title_started) Scene_Title_commandNewGame.call(this);
                title_started = true;
            }
            
            if(!user_title_hidewindow) {
                Scene_Title_update.call(this);
            } else {
                Scene_Base.prototype.update.call(this);
            }
        };
    })
    
    /*
    Input
    ===================================================================================
    WASDキーバインドの追加
    */
    (function(_d_){
        if(!user_move_wasd) return;
        _d_.keycode.updateMapper('w', 'up');
        _d_.keycode.updateMapper('a', 'left');
        _d_.keycode.updateMapper('s', 'down');
        _d_.keycode.updateMapper('d', 'right');
        _d_.keycode.updateMapper('e', 'pagedown');
    }(drowsepost));
    
}());
