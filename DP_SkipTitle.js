//=============================================================================
// drowsepost Plugins - SkipTitle
// DP_SkipTitle.js
// Version: 0.1
// canotun
//=============================================================================

var Imported = Imported || {};
Imported.DP_SkipTitle = true;

//=============================================================================
 /*:
 * @plugindesc タイトルシーンにおいて自動的にニューゲームコマンドを選択します
 * @author drowsepost
 *
 * @param SelectWait
 * @desc ニューゲームコマンドが選択されるまでのフレーム数を指定します
 * Default: 0
 * @default 0
 *
 * @param HideWindow
 * @desc タイトルのウィンドウを非表示にします。
 * Default: true
 * @default true
 *
 * @help
 * タイトルシーンにおいて自動的にニューゲームコマンドを選択します。
 * 一度タイトルシーンを読み込み、コマンドを選ぶ挙動をとるため、
 * 競合を回避できる場合があります。
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
    var parameters = PluginManager.parameters('DP_SkipTitle');
    var user_wait = Number(parameters['SelectWait'] || 1);
    var user_hidewindow = Boolean(parameters['HideWindow'] === 'true' || false);
    
    var title_wait = 0;
    var title_started = false;
    
    /*
    Scene_Title
    */
    var Scene_Title_commandNewGame = Scene_Title.prototype.commandNewGame;
    var Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        title_wait = 0;
        title_started = false;
        Scene_Title_start.call(this);
    };

    var Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        title_wait++;
        if(title_wait >= user_wait){
            if(!title_started) Scene_Title_commandNewGame.call(this);
            title_started = true;
        }
        
        if(!user_hidewindow) {
            Scene_Title_update.call(this);
        } else {
            Scene_Base.prototype.update.call(this);
        }
    };
    
}());
