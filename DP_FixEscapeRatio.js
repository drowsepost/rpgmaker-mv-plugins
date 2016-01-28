//=============================================================================
// drowsepost Plugins - Fix Escape Ratio
// DP_FixEscapeRatio.js
// Version: 1.00
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_FixEscapeRatio = true;

var drowsepost = drowsepost || {};

//=============================================================================
 /*:
 * @plugindesc 逃走の成功確率を設定できます。v1.00
 * @author drowsepost
 *
 * @param Use Param
 * @desc 逃走確率を変動値にする。trueの場合標準の計算が適用されます。
 * Default: true
 * true => ON       false => OFF
 * @default true
 *
 * @param Ratio
 * @desc 逃走確率の中央値(％)。
 * Default: 50
 * @default 50
 *
 * @help
 * 逃走の成功確率を設定できます。
 * Use Paramがtrueの場合、確率にパーティーの俊敏性の平均を掛けた値を敵の俊敏性の平均で割った数値で逃走の成功判定を行います。
 * 例: 0.5 * $gameParty.agility() / $gameTroop.agility();
 * Use Paramがfalseの場合、固定のパーセンテージで逃走判定が行われます。
 * 例: 0.5;
 * 
 * このプラグインはBattleManager.makeEscapeRatioを置き換えます。
 * 
 * 通常、逃走の成功確率は1回失敗するごとに10%増加します。
 * 増加値を変更する場合はBattleManager.processEscapeを置き換えてください。
 */
(function(){
	"use strict";
	var parameters = PluginManager.parameters('DP_FixEscapeRatio');
	
	drowsepost.EscapeRatio = drowsepost.EscapeRatio || {};
	drowsepost.EscapeRatio.useParam = Boolean(parameters['Use Param'] === 'true' || false);
	drowsepost.EscapeRatio.ratio = (Number(parameters['Ratio'] || 50) / 100);
	
	BattleManager.makeEscapeRatio = function() {
		if(drowsepost.EscapeRatio.useParam) {
			this._escapeRatio = drowsepost.EscapeRatio.ratio * $gameParty.agility() / $gameTroop.agility();
		} else {
			this._escapeRatio = drowsepost.EscapeRatio.ratio;
		}
		console.log('escapeRatio:' + this._escapeRatio, {'party': $gameParty, 'troop': $gameTroop});
	};

}());
//=============================================================================
// End of File
//=============================================================================
