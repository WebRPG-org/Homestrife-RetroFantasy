//=============================================================================
// RPG Maker MZ - Pixel Perfect
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjustments and options for different resolutions.
 * @author Jonathan "Darlos9D" Royal
 *
 * @help PixelPerfect.js
 *
 * PLUGIN DESCRIPTION HERE
 *
 * This plugin does not provide plugin commands.
 * 
 * @param tileWidth
 * @text Tile Width
 * @desc The width of tiles in the game, measured in pixels. Impacts character/event movement and dimensions as well.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
 * 
 * @param tileHeight
 * @text Tile Height
 * @desc The height of tiles in the game, measured in pixels. Impacts character/event movement and dimensions as well.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
 *
 * @param imageFileTag
 * @text Image File Tag
 * @desc The tag to be added to the ends of the names of image files, that represent runtime graphics and are scaled to the tile size.
 * @type string
 * @default _RUNTIME
 *
 * @param useTextImages
 * @text Use Text Images
 * @desc Use image files instead of fonts, for text. The best way to get pixel-accurate text.
 * @type boolean
 * @default false
 *
 * @param textImages
 * @text Text Images
 * @desc An array of text image files and their specifications.
 * @type struct<textImageInfo>[]
 * @parent useTextImages
 *
 * @param balloonW
 * @text Balloon Width
 * @desc The width of balloons, measured in pixels.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
 *
 * @param balloonH
 * @text Balloon Height
 * @desc The height of balloons, measured in pixels.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
 *
 * @param buttonW
 * @text Button Width
 * @desc The width of touch screen buttons, measured in pixels.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
 *
 * @param buttonH
 * @text Button Height
 * @desc The hidth of touch screen buttons, measured in pixels.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
 *
 * @param buttonAreaH
 * @text Button Area Height
 * @desc The hidth of touch screen buttons area, measured in pixels.
 * @type number
 * @default 52
 * @min 1
 * @decimals 0
 *
 * @param iconW
 * @text Icon Width
 * @desc The width of icons, measured in pixels.
 * @type number
 * @default 32
 * @min 1
 * @decimals 0
 *
 * @param iconH
 * @text Icon Height
 * @desc The height of icons, measured in pixels.
 * @type number
 * @default 32
 * @min 1
 * @decimals 0
 *
 * @param stateW
 * @text State Width
 * @desc The width of battle state graphics, measured in pixels.
 * @type number
 * @default 96
 * @min 1
 * @decimals 0
 *
 * @param stateH
 * @text State Height
 * @desc The height of battle state graphics, measured in pixels.
 * @type number
 * @default 96
 * @min 1
 * @decimals 0
 *
 * @param weaponW
 * @text Weapon Width
 * @desc The width of battle weapon graphics, measured in pixels.
 * @type number
 * @default 96
 * @min 1
 * @decimals 0
 *
 * @param weaponH
 * @text Weapon Height
 * @desc The height of battle weapon graphics, measured in pixels.
 * @type number
 * @default 64
 * @min 1
 * @decimals 0
 *
 * @param windowFileW
 * @text Window File Width
 * @desc The width of the window file, measured in pixels.
 * @type number
 * @default 192
 * @min 1
 * @decimals 0
 *
 * @param windowFileH
 * @text Window File Height
 * @desc The height of the window file, measured in pixels.
 * @type number
 * @default 192
 * @min 1
 * @decimals 0
 *
 * @param mainCommandW
 * @text Main Command Width
 * @desc The width of the main command area, measured in pixels.
 * @type number
 * @default 240
 * @min 1
 * @decimals 0
 *
 * @param sideViewActorW
 * @text Side View Actor Width
 * @desc The width of side view battle actors, measured in pixels.
 * @type number
 * @default 64
 * @min 1
 * @decimals 0
 *
 * @param sideViewActorH
 * @text Side View Actor Height
 * @desc The height of side view battle actors, measured in pixels.
 * @type number
 * @default 64
 * @min 1
 * @decimals 0
 *
 * @param battleFieldOffsetY
 * @text Battle Field Offset Y
 * @desc The Y offset of the battle field, measured in pixels.
 * @type number
 * @default 24
 * @decimals 0
 */
 
/*~struct~textImageInfo:
 *
 * @param file
 * @text File
 * @desc The text image file.
 * @type file
 *
 * @param characterW
 * @text Character width
 * @desc The width of an individual text character, measured in pixels.
 * @type number
 * @default 32
 * @min 1
 * @decimals 0
 *
 * @param characterH
 * @text Character Height
 * @desc The height of an individual text character, measured in pixels.
 * @type number
 * @default 32
 * @min 1
 * @decimals 0
 */
 
(() => {
	// plugin parameters
	const ppParams = PluginManager.parameters('PixelPerfect');
	parsePPParameters();
	
	// plugin variables
	let curTextImage = 0;
	
	// helper functions
	function parsePPParameters() {
		ppParams.tileWidth = parsePPInt(ppParams.tileWidth, 48, 1);
		ppParams.tileHeight = parsePPInt(ppParams.tileHeight, 48, 1);
		ppParams.balloonW = parsePPInt(ppParams.balloonW, 48, 1);
		ppParams.balloonH = parsePPInt(ppParams.balloonH, 48, 1);
		ppParams.buttonW = parsePPInt(ppParams.buttonW, 48, 1);
		ppParams.buttonH = parsePPInt(ppParams.buttonH, 48, 1);
		ppParams.buttonAreaH = parsePPInt(ppParams.buttonAreaH, 52, 1);
		ppParams.iconW = parsePPInt(ppParams.iconW, 32, 1);
		ppParams.iconH = parsePPInt(ppParams.iconH, 32, 1);
		ppParams.stateW = parsePPInt(ppParams.stateW, 96, 1);
		ppParams.stateH = parsePPInt(ppParams.stateH, 96, 1);
		ppParams.weaponW = parsePPInt(ppParams.weaponW, 96, 1);
		ppParams.weaponH = parsePPInt(ppParams.weaponH, 64, 1);
		ppParams.windowFileW = parsePPInt(ppParams.windowFileW, 192, 1);
		ppParams.windowFileH = parsePPInt(ppParams.windowFileH, 192, 1);
		ppParams.mainCommandW = parsePPInt(ppParams.mainCommandW, 240, 1);
		ppParams.sideViewActorW = parsePPInt(ppParams.sideViewActorW, 64, 1);
		ppParams.sideViewActorH = parsePPInt(ppParams.sideViewActorH, 64, 1);
		ppParams.battleFieldOffsetY = parsePPInt(ppParams.battleFieldOffsetY, 24);
		ppParams.useTextImages = ppParams.useTextImages === 'true';
		ppParams.textImages = parsePPJSON(ppParams.textImages, []);
		for(const textImageInfoStringIndex in ppParams.textImages) {
			const textImageInfo = JSON.parse(ppParams.textImages[textImageInfoStringIndex]);
			textImageInfo.characterW = parsePPInt(textImageInfo.characterW, 32, 1);
			textImageInfo.characterH = parsePPInt(textImageInfo.characterH, 32, 1);
			ppParams.textImages[textImageInfoStringIndex] = textImageInfo;
		}
	}
	
	function parsePPInt(string, defaultValue, min, max) {
		let parsedValue = parseInt(string);
		if(parsedValue === NaN) { return defaultValue; }
		if(min !== undefined) { parsedValue = Math.max(min, parsedValue); }
		if(max !== undefined) { parsedValue = Math.min(max, parsedValue); }
		return parsedValue;
	}
	
	function parsePPJSON(string, defaultValue) {
		if(string && string.length > 0) { return JSON.parse(string); }
		return defaultValue;
	}
	
	function directoryPath(dir) {
		const path = require("path");
		const base = path.dirname(process.mainModule.filename);
		return path.join(base, dir);
	}
	
	// Bitmap
	const _Bitmap_drawText = Bitmap.prototype.drawText;
	Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
		if(ppParams.useTextImages && ppParams.textImages.length > 0) {
			this.drawTextFromImage(text, x, y, maxWidth, lineHeight, align);
		} else {
			_Bitmap_drawText.call(this, text, x, y, maxWidth, lineHeight, align);
		}
	};
	
	Bitmap.prototype.drawTextFromImage = function(text, x, y, maxWidth, lineHeight, align) {
		const context = this.context;
		maxWidth = maxWidth || 0xffffffff;
		const textImage = ppParams.textImages[curTextImage] === undefined ? ppParams.textImages[0] : ppParams.textImages[curTextImage];
		let tx = x;
		let ty = y;
		if (align === "center") {
			tx += maxWidth / 2 - (text.length*textImage.characterW) / 2;
		}
		if (align === "right") {
			tx += maxWidth - text.length*textImage.characterW;
		}
		const bmp = ImageManager.loadBitmapFromUrl(textImage.file + ".png");
		let curTx = tx;
		for(let i = 0; i < text.length; i++) {
			if(curTx + textImage.characterW > maxWidth) { break; }
			const c = text.charCodeAt(i);
			this.blt(
				bmp,
				(c-33)*textImage.characterW,
				0,
				textImage.characterW,
				textImage.characterH,
				curTx,
				ty
			);
			curTx += textImage.characterW;
		}
	};
	
	// Tilemap
	const _Tilemap_initialize = Tilemap.prototype.initialize;
	Tilemap.prototype.initialize = function() {
		_Tilemap_initialize.apply(this);
		this._tileWidth = ppParams.tileWidth;
		this._tileHeight = ppParams.tileHeight;
	};
	
	// Image Manager
	const _ImageManager_loadBitmap = ImageManager.loadBitmap;
	ImageManager.loadBitmap = function(folder, filename) {
		const runtimeFilename = filename + ppParams.imageFileTag;
		const fs = require("fs");
		return _ImageManager_loadBitmap.call(this, folder, fs.existsSync(directoryPath(folder) + runtimeFilename + ".png") ? runtimeFilename : filename);
	};
	
	// Game Map
	Game_Map.prototype.tileWidth = function() {
		return ppParams.tileWidth;;
	};

	Game_Map.prototype.tileHeight = function() {
		return ppParams.tileHeight;;
	};
	
	// Scene Base
	Scene_Base.prototype.mainCommandWidth = function() {
		return ppParams.mainCommandW;
	};
	
	Scene_Base.prototype.buttonAreaHeight = function() {
		return ppParams.buttonAreaH;
	};
	
	Scene_Base.prototype.buttonY = function() {
		const offsetY = Math.floor((this.buttonAreaHeight() - ppParams.buttonH) / 2);
		return this.buttonAreaTop() + offsetY;
	};
	
	// Sprite Button
	Sprite_Button.prototype.blockWidth = function() {
		return ppParams.buttonW;
	};

	Sprite_Button.prototype.blockHeight = function() {
		return ppParams.buttonH;
	};
	
	// Sprite Balloon
	Sprite_Balloon.prototype.updateFrame = function() {
		const w = ppParams.balloonW;
		const h = ppParams.balloonH;
		const sx = this.frameIndex() * w;
		const sy = (this._balloonId - 1) * h;
		this.setFrame(sx, sy, w, h);
	};
	
	// Sprite Weapon
	Sprite_Weapon.prototype.updateFrame = function() {
		if (this._weaponImageId > 0) {
			const index = (this._weaponImageId - 1) % 12;
			const w = ppParams.weaponW;
			const h = ppParams.weaponH;
			const sx = (Math.floor(index / 6) * 3 + this._pattern) * w;
			const sy = Math.floor(index % 6) * h;
			this.setFrame(sx, sy, w, h);
		} else {
			this.setFrame(0, 0, 0, 0);
		}
	};
	
	// Sprite State Overlay
	Sprite_StateOverlay.prototype.updateFrame = function() {
		if (this._overlayIndex > 0) {
			const w = ppParams.stateW;
			const h = ppParams.stateH;
			const sx = this._pattern * w;
			const sy = (this._overlayIndex - 1) * h;
			this.setFrame(sx, sy, w, h);
		} else {
			this.setFrame(0, 0, 0, 0);
		}
	};
	
	// Spriteset Battle
	Spriteset_Battle.prototype.battleFieldOffsetY = function() {
		return ppParams.battleFieldOffsetY;
	};
})();