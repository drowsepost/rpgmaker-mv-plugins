//=============================================================================
// drowsepost Plugins - EventRegion
//=============================================================================

var Imported = Imported || {};
Imported.DP_EventRegion = true;

if(!('drowsepost' in window)) {
    window.drowsepost = {};
}

//=============================================================================
 /*:
 * @plugindesc イベントの重なりと移動範囲を設定します
 * Version: 0.3.0
 * @author drowsepost (canotun)
 * @url https://github.com/drowsepost/rpgmaker-mv-plugins/blob/master/DP_EventRegion.js
 *
 * @param EventOverlap
 * @text イベント同士の重なり
 * @desc trueでプライオリティの異なるイベント同士の重なりを許可します
 * Default: true
 * @default true
 * @type boolean
 *
 * @param BlockRegion
 * @text 通行不能リージョンID
 * @desc イベントが移動できないリージョン番号。0で無効。カンマ区切り
 * 例: 10,11,12 Default: 0
 * @default 0
 * @type text
 *
 * @param PassOverride
 * @text すり抜け時リージョン判定
 * @desc イベントがすり抜けモードになっていてもリージョン判定を優先
 * Default: false
 * @default false
 * @type boolean
 *
 * @help
 * 通常、イベントはそのプライオリティーに関係なく
 * イベント同士重ならないように移動します。
 * 本プラグインはこの制限を無効化したり、
 * リージョンを参照して移動範囲を設定できるように機能追加します。
 * 
 * (注意)BlockRegionの設定に関して
 * 以下のオブジェクトがセーブファイルに追加されます。
 * $gameMap._dp_event_block_region
 * 
 * ◆EventOverlap (on/off)
 * true(ON)に指定すると、イベントはプレイヤーと同じように
 * プライオリティーとマップの通行設定に従って移動し、
 * 通行不可設定のタイルでない限りイベント同士の重なりを許容します。
 * 
 * ◆PassOverride (on/off)
 * true(ON)に設定することでイベントのすり抜け設定がされていても
 * リージョンの通行判定を優先します。
 * false(OFF)にすることですり抜け設定時にリージョンの通行判定を無視します
 * 
 * ◆BlockRegion (string)
 * 任意のリージョン番号をカンマ区切り(,)で指定すると、
 * イベントはそのリージョンを通行出来ないものとして扱います。
 * 文字列で"auto"を指定すると、イベントは生成された時点の座標のリージョンと
 * 同じ範囲でのみ移動するようになります。
 * 0を指定すると上記機能は無効になります。
 * 
 * ◆コマンド
 * DP_EVENT_BLOCKERコマンドないし、
 * drowsepost.event.blockregeon変数にリージョン番号ないし"auto"を指定すると
 * BlockRegionの指定値を変更することが出来ます。
 * 
 * ◆メモ欄タグ
 * イベントごとのメモ欄に<blockRegion>タグを指定することで
 * イベントごとに通行不能なリージョンを追加します。
 * メモ欄は判定ごとにパースされるため、書き換えプラグインと併用可能です。
 * 
 * <blockRegion:10,11,12>
 * 上記の記述の場合、そのイベントは10,11,12のリージョンを通行できません。
 * 
 * <blockRegion:auto>
 * autoを指定した場合、全体設定を無視して
 * イベント生成位置のリージョン内のみ移動します。
 * 
 * <blockRegion:0>
 * 0を指定した場合、全体設定を無視してリージョン制限が無効化されます。
 * 
 * ===
 * このプラグインは試作品です。
 * いくつかのプライベートプロパティーを参照しているため、
 * 今後の本体アップデートや同時に利用するプラグインとの競合で
 * 動作しなくなる可能性があります。
 * ご利用によって生じたいかなる問題の責任も負いかねます。
 * ===
 * 
 * ライセンス: MIT
 * 
 */
(function() {
    "use strict";
    var parameters = PluginManager.parameters('DP_EventRegion');
    var user_overlap = Boolean(parameters['EventOverlap'] === 'true' || false);
    var user_region = parameters['BlockRegion'] || 0;
    var user_override = Boolean(parameters['PassOverride'] === 'true' || false);
    
    var strArrCheck = function(targetString, checkRegion) {
        var event_region = String(targetString).split(',');
        for(let i = 0; i < event_region.length; i++) {
            if(checkRegion == parseInt(event_region[i])) return true;
        }
        return false;
    };
    
    var isRegionBlocked = function(x, y, originalRegionId, meta) {
        var map_region = $gameMap.regionId(x, y);
        var data_region = $gameMap._dp_event_block_region;
        
        if('blockRegion' in meta) {
            if(meta.blockRegion == 0) {
                return false;
            }
            
            if(meta.blockRegion.indexOf('auto') > -1) {
                if(map_region !== originalRegionId) return true;
            } else if(strArrCheck(meta.blockRegion, map_region)) {
                return true;
            }
        }
        
        if(data_region == 0) {
            return false;
        }
        
        if(data_region.indexOf('auto') > -1) {
            if(map_region !== originalRegionId) return true;
        } else if(strArrCheck(data_region, map_region)) {
            return true;
        }
        
        return false;
    };
    
    /*
    Game Event
    =============================================================================
    生成時リージョンの記憶と通行判定
    */
    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.call(this, mapId, eventId);
        this._originalRegionId = $gameMap.regionId(this.event().x, this.event().y);
    };
    
    var _Game_Event_isCollidedWithEvents = Game_Event.prototype.isCollidedWithEvents;
    Game_Event.prototype.isCollidedWithEvents = function(x, y) {
        if(isRegionBlocked(x, y, this._originalRegionId, this.event().meta)) {
            return true;
        }
        
        if((!user_overlap) || ('YEP_CoreEngine' in Imported)){
            return _Game_Event_isCollidedWithEvents.call(this, x, y);
        }
        
        if(!Game_CharacterBase.prototype.isCollidedWithEvents.call(this, x, y)){
            return false;
        }
        
        return this.isNormalPriority();
    };
    
    var _Game_Event_canPass = Game_Event.prototype.canPass;
    Game_Event.prototype.canPass = function(x, y, d) {
        var r = _Game_Event_canPass.call(this, x, y, d);
        
        if(user_override && r) {
            var x2 = $gameMap.roundXWithDirection(x, d);
            var y2 = $gameMap.roundYWithDirection(y, d);
            
            if(isRegionBlocked(x2, y2, this._originalRegionId, this.event().meta)) {
                return false;
            } else {
                return true;
            }
            
        } else {
            return r;
        }
    };
    
    /*
    Game Map
    =============================================================================
    BlockRegion設定の保存用変数エントリー
    */
    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function() {
        _Game_Map_setupEvents.call(this);
        
        //保存用変数エントリー
        if(!('_dp_event_block_region' in this)) {
            this._dp_event_block_region = user_region;
        }
    };
    
    /*
    Interface Entry
    ===================================================================================
    */
    if(!('event' in drowsepost)){
        drowsepost.event = {};
    }
    
    drowsepost.event.blockregeon = function(region_data) {
        $gameMap._dp_event_block_region = region_data;
    };
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        (function(_s, _c, _a){
            if (_c !== 'DP_EVENT_BLOCKER') return;
            drowsepost.event.blockregeon(_a[0]);
        }(this, command, args));
        
    };
    
}());
