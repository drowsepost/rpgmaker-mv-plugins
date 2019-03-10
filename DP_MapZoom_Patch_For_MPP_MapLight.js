//=============================================================================
// 🏤drowsepost Plugins - DP_MapZoom.js Patch for MPP_MapLight.js incompatibility
// DP_MapZoom_Patch_For_MPP_MapLight
// Version: 0.02
// 
// Copyright (c) 2019 canotun
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//=============================================================================

//=============================================================================
/*:
 * @plugindesc Resolve incompatibility between DP_MapZoom.js and MPP_MapLight.js
 * @author drowsepost
 * @help
 * ============================================================================
 * About
 * ============================================================================
 * Resolve incompatibility between DP_MapZoom.js and MPP_MapLight.js
 * this patch after patch DP_MapZoom.js And MPP_MapLight.js
 * 
 */
/*:ja
 * @plugindesc DP_MapZoom.jsとMPP_MapLight.jsの非互換性に対するパッチ
 * @author drowsepost
 * @help
 * ============================================================================
 * About
 * ============================================================================
 * DP_MapZoom.jsとMPP_MapLight.jsの非互換性に対するパッチです。
 * DP_MapZoom.jsとMPP_MapLight.jsのの後に配置することで、
 * MPP_MapLight.jsが多重にかかることを防止します
 */
(function() {
    "use strict";
    
    if(!('Game_Mpp_MapLight' in window)) {
    	console.log('DP_MapZoom.js MPP_MapLight patch : Please place this patch after patch MPP_MapLight.js');
    	return;
    }
	
	Tilemap.prototype._resizeDarknessLayer = function() {
	    var size = Tilemap._darknessTileSize;
	    
	    var tileCols = Math.ceil(this._width / this._tileWidth) + 1;
	    var tileRows = Math.ceil(this._height / this._tileHeight) + 1;
	    
	    var layerWidth = tileCols * size;
	    var layerHeight = tileRows * size;
	    
	    this._darknessLayer.bitmap.resize(layerWidth, layerHeight);
		this._darknessLayer.bitmap.fillAll();
		
	    this._darknessLayer.width = layerWidth;
		this._darknessLayer.height = layerHeight;
		
	    this._darknessBitmap.resize(tileCols, tileRows);
	}

	var Tilemap__createDarknessLayer = Tilemap.prototype._createDarknessLayer;
	Tilemap.prototype._createDarknessLayer = function() {
	    if(this._darknessBitmap instanceof Bitmap) {
		    this._resizeDarknessLayer();
	    } else {
	    	Tilemap__createDarknessLayer.call(this);
		}
	}

	ShaderTilemap.prototype._createDarknessLayer = function() {
		Tilemap.prototype._createDarknessLayer.call(this);
	};
    
}());
