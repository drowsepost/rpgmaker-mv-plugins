//=============================================================================
// drowsepost Plugins - VX format Tiles Utility Plugin
// DP_VXTiles.js
// Version: 0.12
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_VXTiles = true;

var drowsepost = drowsepost || {};

//=============================================================================
 /*:
 * @plugindesc VX規格のタイルチップに簡易に対応させます。 ver 0.12
 * @author drowsepost
 *
 * @param Tile Size
 * @desc マップチップ1枚のタイルサイズを指定します。
 * Default: 32
 * @default 32
 *
 * @param Face Size
 * @desc フェースチップ1枚のタイルサイズを指定します。
 * Default: 96
 * @default 96
 *
 * @param Folder Prefix
 * @desc エディタ用タイルとゲーム内タイルのフォルダを分ける場合、ゲーム内タイルを配置するフォルダの接頭辞を指定します。分けない場合は空白にしてください。
 * Default: vx_
 * @default vx_
 *
 * @param File Prefix
 * @desc エディタ用タイルとゲーム内タイルのファイル名を分ける場合、ゲーム内タイルのファイルの接頭辞を指定します。分けない場合は空白にしてください。
 * Default: なし
 * @default 
 *
 * @param Change Character File
 * @desc 通常キャラクターファイルは1つのファイルへの配置数さえ合っていれば自動でサイズ変更が反映されます。
 * それでもなおエディタとゲーム内で読み込むファイルを変えたい場合はこちらをtrueにしてください。
 * Default: false
 * @default false
 *
 * @help
 * VX規格のタイルチップに対応させます。
 * エディタで利用するMV規格タイルチップと、実際のゲームで利用するタイルチップを切り替えます。
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
    var parameters = PluginManager.parameters('DP_VXTiles');
    var user_tilesize = Number(parameters['Tile Size'] || 32);
    var user_facesize = Number(parameters['Face Size'] || 96);
    
    var user_pass_prefix = String(parameters['Folder Prefix'] || 'vx_');
    var user_file_prefix = String(parameters['File Prefix'] || '');
    var user_is_change_character = Boolean(parameters['Change Character File'] === 'true' || false);
    
    /*
    Game Map
    =============================================================================
    VX規格のマップチップは1マス32px
    */
    (function(){
        Game_Map.prototype.tileWidth = function() {
            return user_tilesize;
        };

        Game_Map.prototype.tileHeight = function() {
            return user_tilesize;
        };
    }());
    
    /*
    Window_Base
    =============================================================================
    VX規格のフェースアイコンは1マス96px
    */
    (function(){
        Window_Base._faceWidth  = user_facesize;
        Window_Base._faceHeight = user_facesize;
    }());
    
    /*
    ImageManager
    =============================================================================
    エディタが対応していない変形マップチップ/フェースアイコンをエディタ用データと分ける
    */
    (function(){
        ImageManager.loadFace = function(filename, hue) {
            return this.loadBitmap('img/' + user_pass_prefix + 'faces/', user_file_prefix + filename, hue, true);
        };
        
        ImageManager.loadTileset = function(filename, hue) {
            return this.loadBitmap('img/' + user_pass_prefix + 'tilesets/', user_file_prefix + filename, hue, false);
        };
        
        if(!user_is_change_character) return;
        //キャラデータはサイズを変えても問題ない
        ImageManager.loadCharacter = function(filename, hue) {
            return this.loadBitmap('img/' + user_pass_prefix + 'characters/', user_file_prefix + filename, hue, false);
        };
    }());
    
    
}());
