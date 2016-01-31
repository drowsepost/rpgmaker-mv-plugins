//=============================================================================
// drowsepost Plugins - Center Shift
// DP_CenterShift.js
// Version: 0.1
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_CenterShift = true;

//=============================================================================
 /*:
 * @plugindesc 画面内におけるプレイヤーの基準位置を変更します ver0.1(201601312217)
 * @author drowsepost
 *
 * @param X
 * @desc 横方向のずらし位置(マス)を設定します。
 * Default: 0
 * @default 0
 *
 * @param Y
 * @desc 縦方向のずらし位置(マス)を設定します。
 * Default: 0
 * @default 0
 *
 * @help
 * 通常は画面中央にプレイヤーが表示されるように
 * マップがコントロールされますが、
 * 本プラグインを設定することで基準になるプレイヤーの位置を
 * 任意のマスの数分画面をずらすことが出来ます
 * 
 * X: 横方向のずらし位置です。正の値で右へ、負の値で左にずらします。
 * Y: 縦方向のずらし位置です。正の値で下へ、負の値で上にずらします。
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
    var parameters = PluginManager.parameters('DP_CenterShift');
    var user_shiftX = Number(parameters['X'] || 0);
    var user_shiftY = Number(parameters['Y'] || 0);
    
    /*
    Game Player
    */
    var _Game_Player_centerX = Game_Player.prototype.centerX;
    Game_Player.prototype.centerX = function() {
        return _Game_Player_centerX.call(this) + user_shiftX;
    };
    
    var _Game_Player_centerY = Game_Player.prototype.centerY;
    Game_Player.prototype.centerY = function() {
        return _Game_Player_centerY.call(this) + user_shiftY;
    };
    
}());
