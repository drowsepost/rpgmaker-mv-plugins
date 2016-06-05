//=============================================================================
// drowsepost Plugins - EventRegion
// DP_EventRegion.js
// Version: 0.1
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_EventRegion = true;

if(!('drowsepost' in window)) {
    window.drowsepost = {};
}

//=============================================================================
 /*:
 * @plugindesc イベントの重なりと移動範囲を設定します
 * @author drowsepost
 *
 * @param EventOverlap
 * @desc trueでイベント同士の重なりを許可します
 * Default: true
 * @default true
 *
 * @param BlockRegion
 * @desc イベントが移動できないリージョン番号を指定します。0で無効
 * Default: 0
 * @default 0
 *
 * @help
 * 通常、イベントはそのプライオリティーに関係なく
 * イベント同士重ならないように移動します。
 * 
 * EventOverlapをtrueに指定すると、イベントはプレイヤーと同じように
 * プライオリティーとマップの通行設定に従って移動し、
 * 通行不可設定のタイルでない限りイベント同士の重なりを許容します。
 * 
 * BlockRegionに任意のリージョン番号を指定すると、
 * イベントはそのリージョンを通行出来ないものとして扱います。
 * 文字列で"auto"を指定すると、イベントは生成された時点の座標のリージョンと
 * 同じ範囲でのみ移動するようになります。
 * 
 * DP_EVENT_BLOCKERコマンドないし、
 * drowsepost.event.blockregeon変数にリージョン番号ないし"auto"を指定すると
 * BlockRegionの指定値を変更することが出来ます。
 * 
 * (注意)BlockRegionの設定に関して、
 * セーブされるオブジェクトに専用の変数を追記します。
 * $gameMap._dp_event_block_region
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
    var user_region = (parameters['BlockRegion'] == 'auto')? 'auto' : Number(parameters['BlockRegion'] || 0);
    
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
        var map_region = $gameMap.regionId(x, y);
        var data_region = $gameMap._dp_event_block_region;
        
        if(data_region === 'auto') {
            if(map_region != this._originalRegionId) return true;
        } else if(data_region > 0) {
            if(map_region == data_region) return true;
        }
        
        if((!user_overlap) || ('YEP_CoreEngine' in Imported)){
            return _Game_Event_isCollidedWithEvents.call(this, x, y);
        }
        
        if(!Game_CharacterBase.prototype.isCollidedWithEvents.call(this, x, y)){
            return false;
        }
        
        return this.isNormalPriority();
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
        if(region_data === 'auto'){
            $gameMap._dp_event_block_region = 'auto';
        } else if(!isNaN(region_data)) {
            $gameMap._dp_event_block_region = Number(region_data);
        }
    };
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        (function(_s, _c, _a){
            if (_c !== 'DP_EVENT_BLOCKER') return;
            drowsepost.event.blockregeon(_a[0]);
        }(this, command, args));
        
    }
    
}());
