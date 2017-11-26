//=============================================================================
// 🏤drowsepost Plugins - Smooth Settings
// DP_SmoothSettings.js
// Version: 0.1
// https://github.com/drowsepost/rpgmaker-mv-plugins/blob/master/DP_SmoothSettings.js
//=============================================================================

var Imported = Imported || {};
Imported.DP_SmoothSettings = true;

//=============================================================================
/*:
 * @plugindesc Change Smooth Settings for Images
 * @author drowsepost
 * 
 * @param Animation
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Battleback1
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Battleback2
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Enemy
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Character
 * @desc Default: false
 * @default false
 * @type boolean
 * 
 * @param Face
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Parallax
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Picture
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param SvActor
 * @desc Default: false
 * @default false
 * @type boolean
 * 
 * @param SvEnemy
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param System
 * @desc Default: false
 * @default false
 * @type boolean
 * 
 * @param Tileset
 * @desc Default: false
 * @default false
 * @type boolean
 * 
 * @param Title1
 * @desc Default: true
 * @default true
 * @type boolean
 * 
 * @param Title2
 * @desc Default: true
 * @default true
 * @type boolean
 *
 * @help
 * ============================================================================
 * About
 * ============================================================================
 * This plugin sets smoothing of various resources
 * 
 * ============================================================================
 * How To Use
 * ============================================================================
 * Change the parameters for each resource type.
 * If set to true, it will be smoothed when enlarged.
 * When set to false, dot-by-dot expansion
 * 
 * ============================================================================
 * Technical information
 * ============================================================================
 * its change ImageManager.
 * A few routines are added to the loading process
 * 
 * license: MIT
 * 
 */
/*:ja
 * @plugindesc イメージ種類ごとに拡大時のスムージング処理を変更します
 * @author drowsepost
 * 
 * @param Animation
 * @desc 戦闘エフェクトのスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Battleback1
 * @desc 戦闘背景(地面)のスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Battleback2
 * @desc 戦闘背景(壁)のスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Enemy
 * @desc エネミーのスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Character
 * @desc アクター(マップ上のキャラクター)のスムージング
 * Default: false
 * @default false
 * @type boolean
 * 
 * @param Face
 * @desc フェイスのスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Parallax
 * @desc 遠景のスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Picture
 * @desc ピクチャのスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param SvActor
 * @desc サイドビューアクターのスムージング
 * Default: false
 * @default false
 * @type boolean
 * 
 * @param SvEnemy
 * @desc サイドビューエネミーのスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param System
 * @desc システムピクチャのスムージング
 * Default: false
 * @default false
 * @type boolean
 * 
 * @param Tileset
 * @desc マップチップのスムージング
 * Default: false
 * @default false
 * @type boolean
 * 
 * @param Title1
 * @desc タイトル背景のスムージング
 * Default: true
 * @default true
 * @type boolean
 * 
 * @param Title2
 * @desc タイトル枠のスムージング
 * Default: true
 * @default true
 * @type boolean
 *
 * @help
 * ============================================================================
 * About
 * ============================================================================
 * このプラグインを利用するとイメージの種類ごとに
 * 拡大時のスムージング設定を変更することができます
 * 
 * ============================================================================
 * How To Use
 * ============================================================================
 * リソースタイプごとにパラメーターがあります。
 * それぞれtrueにするとスムージングがかかり、
 * falseにするとスムージングが解除されます。
 * 
 * ============================================================================
 * Technical information
 * ============================================================================
 * このプラグインはImageManagerクラスをオーバーライドします。
 * リソースデータロードの処理にほんの少し負荷がかかるかもしれません。
 * 
 * license: MIT
 * 
 */
(function() {
    "use strict";
    var parameters = PluginManager.parameters('DP_SmoothSettings');
    
    var typeList = [
        'Animation',
        'Battleback1',
        'Battleback2',
        'Enemy',
        'Character',
        'Face',
        'Parallax',
        'Picture',
        'SvActor',
        'SvEnemy',
        'System',
        'Tileset',
        'Title1',
        'Title2'
    ];
    
    var funcList = [
        'load',
        'reserve',
        'request'
    ];

    /*
    Update ImageManager
    =============================================================================
    */
    var overrideManager = (function(func, type) {
        if(typeof ImageManager[func + type] !== 'function') {
            console.log("DP_SmoothSettings: can't suport this project. ImageManager." + func + type + " is not a function", ImageManager[func + type]);
            return;
        }
        
        var _parent_fn = ImageManager[func + type];
        ImageManager[func + type] = function() {
            var bmp = _parent_fn.apply(this, arguments);
            if('smooth' in bmp) bmp.smooth = Boolean(parameters[type] === 'true' || false);
            return bmp;
        };
    });
    
    /*
    Boot
    =============================================================================
    */
    for(var i = 0; i < funcList.length;i++) {
        for(var v = 0; v < typeList.length;v++) {
            overrideManager(funcList[i], typeList[v]);
        }
    }
    
    
}());
