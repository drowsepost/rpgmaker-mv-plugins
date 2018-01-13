//=============================================================================
// 🏤drowsepost Plugins - ItemHelper
// DP_ItemHelper.js
// Version: 0.1
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_ItemHelper = true;

var drowsepost = drowsepost || {};

//=============================================================================
 /*:
 * @plugindesc 所持アイテムの管理機能を拡張します
 * @author drowsepost
 *
 * @param itemTypeTag
 * @desc 
 * Default: dpItemType
 * @default dpItemType
 * 
 * @help
 * 
 * アイテムの管理を拡張します。
 * 
 * アイテムの種類
 * secretA, secretB, keyItem, item, weapon, armor
 * 
 * ◆ プラグインコマンド
 * 指定した種類のアイテム・武器・防具・スキルを削除します。
 * 種類はitemTypeTagで指定したタグで拡張できます。
 * 装備品は含みません。
 * 
 * dpClearItems keyItem
 * キーアイテムの削除
 * 
 * dpClearItems item
 * 通常アイテムの削除
 * 
 * dpClearItems secretA
 * 隠しアイテムAの削除
 * 
 * dpClearItems secretB
 * 隠しアイテムBの削除
 * 
 * dpClearItems weapon
 * 武器の削除
 * 
 * dpClearItems armor
 * 防具の削除
 * 
 * dpClearItems {任意の文字列}
 * {任意の文字列}をタグで指定されたアイテムの削除
 * 
 * 例: アイテムのメモ欄に<dpItemType:drink>を指定しておき
 * dpClearItems drinkコマンドを投げると
 * drinkのアイテムのみ消えます。
 * 
 * ◆ スクリプト
 * drowsepost.fn.dpClearItems('keyItem');
 * 指定したカテゴリの所持アイテムを削除したうえで、総数が戻ります。
 * 
 * drowsepost.fn.dpGetItemTypePrice('keyItem');
 * 指定したカテゴリの所持アイテムの総額を戻します。
 * 
 * drowsepost.fn.dpGetItemTypeCount('keyItem');
 * 指定したカテゴリの所持アイテムの総数を戻します。
 * 
 * drowsepost.fn.dpGetItemTypeList();
 * 所持アイテムの所属するカテゴリの一覧を配列で返します。
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
    var parameters = PluginManager.parameters('DP_ItemHelper');
    var user_tag = (parameters['itemTypeTag'] || 'dpItemType');
    
    /*
    Game_Interpreter
    ===================================================================================
    コマンドパーサーの追加
    */
    (function(){
        if("fn" in drowsepost) return;
        drowsepost.fn = {};
        
        //@override
        var _parent_pluginCommand = Game_Interpreter.prototype.pluginCommand;
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            _parent_pluginCommand.call(this, command, args);
            
            if(!(command in drowsepost.fn)) return;
            if('DP_MapZoom' in Imported) return;
            if(typeof drowsepost.fn[command] === 'function') {
                drowsepost.fn[command].apply(this, args);
            }
        };
        
    }());
    
    /*
    drowsepost.fn
    ===================================================================================
    コマンドの追加
    */
    
    /**
     * dpGetItemType
     * 指定されたアイテムオブジェクトの種類を配列で戻す。
     * 
     * @name dpGetItemType
     * @memberof drowsepost.fn
     * @param {Object} item
     * @return {Array} item types
     */
    drowsepost.fn.dpGetItemType = (function(item){
        var r = [];
        if(user_tag in item.meta) {
            r.push(item.meta[user_tag].trim());
        }
        
        if(DataManager.isItem(item)) {
            if(item.itypeId === 4) {
                r.push('secretB');
            } else if(item.itypeId === 3) {
                r.push('secretA');
            } else if(item.itypeId === 2) {
                r.push('keyItem');
            } else if(item.itypeId === 1) {
                r.push('item');
            }
        }
        
        if(DataManager.isWeapon(item)) {
            r.push('weapon');
        }
        
        if(DataManager.isArmor(item)) {
            r.push('armor');
        }
        
        if(DataManager.isSkill(item)) {
            r.push('skill');
        }
        
        return r;
    });
    
    /**
     * dpHasItemType
     * アイテムが指定の種類を持っているか
     * 
     * @name dpHasItemType
     * @memberof drowsepost.fn
     * @param {Object} item
     * @param {String} type
     * @return {Boolien}
     */
    drowsepost.fn.dpHasItemType = (function(item, type){
        return drowsepost.fn.dpGetItemType(item).indexOf(type) >= 0;
    });
    
    /**
     * dpGetItemList
     * 指定のタイプを持った所持アイテムを列挙
     * 
     * @name dpGetItemList
     * @memberof drowsepost.fn
     * @param {String} itemType
     * @return {Array} list of item
     */
    drowsepost.fn.dpGetItemList = (function(itemType){
        return $gameParty.allItems().filter(function(item) {
            return drowsepost.fn.dpHasItemType(item, itemType);
        }, this);
    });
    
    /**
     * dpGetItemTypeList
     * 所持アイテムに含まれるアイテムタイプを列挙
     * 
     * @name dpGetItemTypeList
     * @memberof drowsepost.fn
     * @return {Array} list of item
     */
    drowsepost.fn.dpGetItemTypeList = (function(){
        var data = $gameParty.allItems();
        var r = [];
        for(var i = 0; i < data.length; i++) {
            Array.prototype.push.apply(r, drowsepost.fn.dpGetItemType(data[i]));
        }
        
        return r.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
    });
    
    /**
     * dpGetItemTypeCount
     * 指定の種類のアイテムがいくつあるか
     * 
     * @name dpGetItemTypeCount
     * @memberof drowsepost.fn
     * @param {String} type
     * @return {number}
     */
    drowsepost.fn.dpGetItemTypeCount = (function(type){
        var data = drowsepost.fn.dpGetItemList(itemType);
        var r = 0;
        for(var i = 0; i < data.length; i++) {
            r += $gameParty.numItems(data[i]);
        }
        return r;
    });
    
    /**
     * dpGetItemTypePrice
     * 指定の種類のアイテムの総額
     * 
     * @name dpGetItemTypePrice
     * @memberof drowsepost.fn
     * @param {String} type
     * @return {number}
     */
    drowsepost.fn.dpGetItemTypePrice = (function(type){
        var data = drowsepost.fn.dpGetItemList(itemType);
        var r = 0;
        for(var i = 0; i < data.length; i++) {
            r += $gameParty.numItems(data[i]) * data[i].price;
        }
        return r;
    });
    
    /**
     * dpClearItems
     * 
     * @name dpClearItems
     * @memberof drowsepost.fn
     * @param {String} itemType
     * @return {Number} count of deleted item
     */
    drowsepost.fn.dpClearItems = (function(itemType){
        var releaseItem = (function(item){
            var value = $gameParty.numItems(item);
            $gameParty.loseItem(item, value);
            return value;
        });
        
        var data = drowsepost.fn.dpGetItemList(itemType);
        
        var r = 0;
        for(var i = 0; i < data.length; i++) {
            r += releaseItem(data[i]);
        }
        
        return r;
    });
    
}());
