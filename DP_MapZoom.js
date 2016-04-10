//=============================================================================
// drowsepost Plugins - Map Zooming Controller
// DP_MapZoom.js
// Version: 0.452
// https://github.com/drowsepost/rpgmaker-mv-plugins
//=============================================================================

var Imported = Imported || {};
Imported.DP_MapZoom = true;

var drowsepost = drowsepost || {};

//=============================================================================
 /*:
 * @plugindesc マップの拡大率を制御します。v0.452(20160410)
 * @author drowsepost
 *
 * @param Base Scale
 * @desc 基本の拡大率を設定します。(0以上)
 * Default: 1
 * @default 1
 *
 * @param Encount Effect
 * @desc エンカウントエフェクトに拡大率を反映
 * Default: true (ON: true / OFF: false)
 * @default true
 *
 * @param Camera Controll
 * @desc 拡大処理中のカメラ制御をこのプラグインが行う
 * Default: true (ON: true / OFF: false)
 * @default true
 *
 * @param Use Hack
 * @desc 画面拡大率変更時に画面にゴミが残る問題への対応を行う。
 * Default: true (ON: true / OFF: false)
 * @default true
 *
 * @help
 * ============================================================================
 * About
 * ============================================================================
 * 各種座標処理に拡大率の計算を反映し
 * マップシーンの拡大率を制御します。
 * 
 * ============================================================================
 * Attention
 * ============================================================================
 * このプラグインは試作品です。
 * いくつかのプライベートプロパティーを参照しているため、
 * 今後の本体アップデートで動作しなくなる可能性があります。
 * また、各種APIや名称が予告なく変更される場合があります。
 * ご利用によって生じたいかなる問題の責任も負いかねます。
 * 
 * ============================================================================
 * How To Use
 * ============================================================================
 * マップのメモ欄に対して
 * <zoomScale:0.5>
 * などと記述すると、マップごとに基準になる拡大率を指定することが出来ます。
 * 
 * プラグインコマンドにて
 * mapSetZoom {倍率} {変更にかけるフレーム数} {対象イベントID / this / player}
 * 
 * もしくは
 * 
 * スクリプトコマンドにて
 * drowsepost.setZoom({倍率}, {変更にかけるフレーム数}, {対象イベント / ID})
 * 
 * を呼ぶと、
 * 指定したイベントの位置を中心にゲーム中で画面の拡大率を変更できます。
 * 
 * 例)
 * プラグインコマンドにおいて対象イベントの部分に
 * 「this」もしくは「このイベント」と指定すると、
 * イベント実行中のオブジェクトを指定します。
 * mapSetZoom 2 360 this
 * たとえば上記はそのイベントを中心にして6秒かけて2倍の拡大率に変化します。
 * 
 * ============================================================================
 * Settings
 * ============================================================================
 * Base Scale
 * ゲーム開始時の拡大倍率を指定します。
 * 倍率には0以上を指定してください。
 * 
 * Encount Effect
 * エンカウントエフェクトを置き換えるかどうかを指定します。
 * オリジナルのエフェクトで置き換えている場合はこちらをfalseにしてください。
 * しかしその場合、画面の拡大率をそれぞれ反映できるように調整する必要があります。
 * 
 * Camera Controll
 * falseの場合はイベントを指定した拡大を含む拡大中のカメラ制御は動作しません。
 * 別プラグインでカメラ制御を行う場合にご利用ください。
 * 
 * Use Hack
 * trueの場合マップサイズ変更時に古いオブジェクトが画面に残ってしまうバグを解決します。
 * Tilemap内のBitmapを使いまわす変更をしている場合はfalseにしてください。
 * 
 * ============================================================================
 * Technical information
 * ============================================================================
 * 現在の画面の拡大率は$gameScreen.zoomScale()で取得できます。
 * これはプラグインの利用に関わらず元から存在する関数です。
 * 
 * 指定された拡大率設定は$gameMap._dp_scaleが保持します。
 * シーン離脱時のスクロール量は$gameMap._dp_panが保持します。
 * 
 * 他のプラグインで利用する「screenX」や「screenY」がずれる場合は、
 * 「screenX」や「screenY」にそれぞれ$gameScreen.zoomScale()を掛けて下さい。
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 0.452:
 *  -プラグインコマンドの修正
 *  -プラグインコマンドに明示的に「このイベント」と「プレイヤー」を指定する機能を追加
 * 
 * Version 0.451:
 *  -Yanfly Engine Plugins Core Engine との親和性向上
 *  
 * Version 0.45:
 *  -動作の高速化
 *  -Galv's Cam Control ver1.7 に対応。
 *  -Yanfly Engine Plugins Core Engine ver1.13 に対応。
 * 
 * ライセンス: MIT
 * 
 * 一部コードを参考にさせていただきました。
 * http://yanfly.moe/
 * 
 */
(function() {
    "use strict";
    var parameters = PluginManager.parameters('DP_MapZoom');
    var user_scale = Number(parameters['Base Scale'] || 1);
    var user_fix_encount = Boolean(parameters['Encount Effect'] === 'true' || false);
    var user_fix_deephack = Boolean(parameters['Use Hack'] === 'true' || false);
    var user_use_camera = Boolean(parameters['Camera Controll'] === 'true' || false);

    /*
    Bug fix
    */
    var _Tilemap_createLayers = Tilemap.prototype._createLayers;
    Tilemap.prototype._createLayers = function() {
        /*
        TilemapのwidthやtileWidthを変更するたびにセッターにより_createLayersが呼ばれるが
        addChildした_lowerLayerおよび_upperLayerがremoveされないため
        参照できないゴミオブジェクトがcanvasに増えてゆくのでお掃除
        */
        if(user_fix_deephack){
            if('_lowerLayer' in this) this.removeChild(this._lowerLayer);
            if('_upperLayer' in this) this.removeChild(this._upperLayer);
        }
        _Tilemap_createLayers.call(this);
    };
    
    /*
    renderSize
    =============================================================================
    タイル拡大率を保持および仮想的なレンダリング範囲を算出します。
    */
    var renderSize = {
        _scale : 1,
        width: Graphics.boxWidth,
        height: Graphics.boxHeight,
    };
    
    Object.defineProperty(renderSize, 'scale', {
        get: function() {
            return this._scale;
        },
        set: function(val) {
            if(val != this._scale) {
                this._scale = Number(val);
                this.width = Math.ceil(Graphics.boxWidth / this._scale);
                this.height = Math.ceil(Graphics.boxHeight / this._scale);
            }
        }
    });
    
    /*
    Game Map
    =============================================================================
    @use $gameScreen.zoomScale();
    拡大率の反映
    */
    (function(){
        var _Game_Map_initialize = Game_Map.prototype.initialize;
        Game_Map.prototype.initialize = function() {
            _Game_Map_initialize.call(this);
            
            //保存用変数エントリー
            this._dp_scale = user_scale;
            this._dp_pan = {'x': 0, 'y': 0};
        };
        
        Game_Map.prototype.screenTileX = function() {
            return Graphics.width / (this.tileWidth() * this._dp_scale);
        };
        
        Game_Map.prototype.screenTileY = function() {
            return Graphics.height / (this.tileHeight() * this._dp_scale);
        };
        
        Game_Map.prototype.canvasToMapX = function(x) {
            var tileWidth = this.tileWidth() * $gameScreen.zoomScale();
            var originX = this._displayX * tileWidth;
            var mapX = Math.floor((originX + x) / tileWidth);
            return this.roundX(mapX);
        };

        Game_Map.prototype.canvasToMapY = function(y) {
            var tileHeight = this.tileHeight() * $gameScreen.zoomScale();
            var originY = this._displayY * tileHeight;
            var mapY = Math.floor((originY + y) / tileHeight);
            return this.roundY(mapY);
        };
        
    }());
    
    /*
    Game Player
    =============================================================================
    @use $gameScreen.zoomScale();
    @use $gameMap.setDisplayPos();
    拡大率の反映
    */
    (function(){
        
        Game_Player.prototype.centerX = function() {
            return (Graphics.width / ($gameMap.tileWidth() * $gameScreen.zoomScale()) - 1) / 2.0;
        };
        
        Game_Player.prototype.centerY = function() {
            return (Graphics.height / ($gameMap.tileHeight() * $gameScreen.zoomScale()) - 1) / 2.0;
        };
        
        Game_Player.prototype.center = function(x, y) {
            if(typeof x !== 'number') x = this._realX;
            if(typeof y !== 'number') y = this._realY;
            return $gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
        };
        
    }());
    
    /*
    ScreenSprite
    =============================================================================
    描画反映変更に伴うスクリーンスプライトのプライオリティー調整(YEP_CoreEngine互換)
    */
    var _ScreenSprite_initialize = ScreenSprite.prototype.initialize;
    ScreenSprite.prototype.initialize = function() {
        _ScreenSprite_initialize.call(this);
        if('YEP_CoreEngine' in Imported) return;
        this.scale.x = Graphics.boxWidth * 10;
        this.scale.y = Graphics.boxHeight * 10;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = 0;
        this.y = 0;
    };
    
    /*
    Spriteset
    =============================================================================
    描画反映変更機能の追加
    */
    (function(){
        var _Spriteset_Map_createWeather = Spriteset_Map.prototype.createWeather;
        Spriteset_Map.prototype.createWeather = function() {
            _Spriteset_Map_createWeather.call(this);
            this._weather._rebornSprite = function(sprite) {
                sprite.ax = Math.randomInt(renderSize.width + 100) - 50 + this.origin.x;
                sprite.ay = Math.randomInt(renderSize.height + 200) - 100 + this.origin.y;
                sprite.opacity = 160 + Math.randomInt(60);
            };
        };
        
        Spriteset_Map.prototype._dp_Resize = function(zoom) {
            /*
            実体スクリーンサイズを算出
            */
            renderSize.scale = zoom;
            
            /*
            拡大率からレンダリングするべきマップのサイズを設定します。
            */
            this._tilemap.width = Math.ceil((Graphics.width + this._tilemap._margin) * 2 / zoom);
            this._tilemap.height = Math.ceil((Graphics.height + this._tilemap._margin) * 2 / zoom);
            this._tilemap.refresh();
            
            //パララックスサイズ変更
            this._parallax.move(0, 0, Math.round(Graphics.width / zoom), Math.round(Graphics.height / zoom));
        };
    }());
    
    /*
    Scene_Map
    =============================================================================
    @use $gameMap._dp_scale;
    @use $gameMap._dp_pan;
    @use _setZoom();
    拡大率の引継ぎ
    */
    (function(){
        var _Scene_Map_start = Scene_Map.prototype.start;
        Scene_Map.prototype.start = function() {
            _Scene_Map_start.call(this);
            
            //移動後処理
            if(this._transfer) {
                //マップ設定情報で拡大率変更
                $gameMap._dp_scale =  Number($dataMap.meta.zoomScale || $gameMap._dp_scale);
            }
            
            //マップシーン開始時に拡大率変更をフック。
            _pan = $gameMap._dp_pan;
            _setZoom($gameMap._dp_scale);
            
            if(this._transfer) {
                $gamePlayer.center($gamePlayer._realX + _pan.x, $gamePlayer._realY + _pan.y);
            }
        };
        
        var _Scene_Map_terminate = Scene_Map.prototype.terminate;
        Scene_Map.prototype.terminate = function() {
            //マップシーン終了時に拡大率情報を保存。
            _animateEnd();
            $gameMap._dp_pan = _getPan();
            
            _Scene_Map_terminate.call(this);
        };
        
        if(!user_fix_encount) return;
        Scene_Map.prototype.updateEncounterEffect = function() {
            if (this._encounterEffectDuration <= 0) return;
            
            this._encounterEffectDuration--;
            var speed = this.encounterEffectSpeed();
            var n = speed - this._encounterEffectDuration;
            var p = n / speed;
            
            var q = (p * 20 * p + 5) * p + $gameMap._dp_scale;//変更部分。エンカウントエフェクトにオリジナル拡大率反映
            var zoomX = $gamePlayer.screenX();
            var zoomY = $gamePlayer.screenY() - Math.round($gameMap.tileHeight() / 2);//変更部分。タイルサイズ指定反映
            
            if (n === 2) {
                $gameScreen.setZoom(zoomX, zoomY, $gameMap._dp_scale);
                this.snapForBattleBackground();
                this.startFlashForEncounter(speed / 2);
            }
            $gameScreen.setZoom(zoomX, zoomY, q);
            if (n === Math.floor(speed / 6)) {
                this.startFlashForEncounter(speed / 2);
            }
            if (n === Math.floor(speed / 2)) {
                BattleManager.playBattleBgm();
                this.startFadeOut(this.fadeSpeed());
            }
            
        };
    }());
    
    /*
    Game_Screen
    =============================================================================
    @use $gamePlayer.center();
    @use_animateEnd();
    */
    var _Game_Screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function() {
        _Game_Screen_update.call(this);
        if(this._zoomScaleTarget === this._zoomScale) this._zoomDuration = 0;
        
        if(_isanimation) {
            if (this._zoomDuration > 0) {
                if(user_use_camera) $gamePlayer.center($gamePlayer._realX + _pan.x, $gamePlayer._realY + _pan.y);
            }
            if (this._zoomDuration == 0) _animateEnd();
        }
    };
    
    /*
    Main Functions
    =============================================================================
    実際の拡大処理
    */
    var _isanimation = false;
    var _pan = {};
    
    var _getPan = function() {
        var centerPosX = (($gameMap.screenTileX() - 1) / 2);
        var centerPosY = (($gameMap.screenTileY() - 1) / 2);
        return {
            'x': ($gameMap.displayX()+ centerPosX) - $gamePlayer._realX,
            'y': ($gameMap.displayY() + centerPosY) - $gamePlayer._realY,
        };
    };
    
    var _changeRenderSize = function(scale) {
        if(!('_spriteset' in SceneManager._scene)) return;
        SceneManager._scene._spriteset._dp_Resize(scale);
    };
    
    var _setZoom = function(scale) {
        _changeRenderSize(scale);
        $gameScreen._zoomScaleTarget = scale;
        $gameScreen.setZoom(0, 0, scale);
        if(user_use_camera) $gamePlayer.center($gamePlayer._realX + _pan.x, $gamePlayer._realY + _pan.y);
    };
    
    var _animateStart = function(scale, duration) {
        if($gameMap._dp_scale > scale) _changeRenderSize(scale);
        
        _isanimation = true;
        $gameScreen.startZoom(0, 0, scale, duration);
    };
    
    var _animateEnd = function() {
        if(!_isanimation) return;
        _isanimation = false;
        _setZoom($gameMap._dp_scale);
    };
    
    var camera = {};
    camera.zoom = function(ratio, duration) {
        if(typeof ratio !== 'number') return;
        if(_isanimation) _animateEnd();
        
        _pan = _getPan($gameMap._dp_scale);
        
        if(duration > 0){
            _animateStart(ratio, duration);
        } else {
            _setZoom(ratio);
        }
        
        $gameMap._dp_scale = ratio;
    };
    
    camera.center = function(event) {
        var _target;
        if(typeof event === 'object') {
            if('_eventId' in event) _target = $gameMap.event(event._eventId);
        }
        
        if(typeof event === 'number') {
            _target = $gameMap.event(event);
        }
        
        if(!(_target instanceof Game_CharacterBase)) {
            //console.log('drowsepost.camera.center: not support target', event);
            _target = $gamePlayer;
        }
        
        $gamePlayer.center(_target._realX, _target._realY);
    };
    
    /*
    Interface Entry
    ===================================================================================
    */
    drowsepost.camera = camera;
    
    drowsepost.setZoom = function(ratio, duration, target) {
        if(typeof target !== 'undefined') {
            camera.center(target);
        }
        camera.zoom(ratio, duration);
    };
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        (function(_s, _c, _a){
            if (_c !== 'mapSetZoom') return;
            
            var _target;
            if(_a.length > 2) {
                if((_a[2] === 'this') || (_a[2] === 'このイベント')) _target = _s;
                else if((_a[2] === 'player') || (_a[2] === 'プレイヤー')) _target = $gamePlayer;
                else _target = Number(_a[2]);
            }
            
            drowsepost.setZoom(Number(_a[0]), Number(_a[1]), _target);
        }(this, command, args));
        
    }
    
}());
