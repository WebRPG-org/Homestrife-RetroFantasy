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
 * @desc The tag to be added to image files that represent ingame graphics and are scaled to the tile size.
 * @type string
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
 * @param iconW
 * @text Icon width
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
		ppParams.iconW = parsePPInt(ppParams.iconW, 32, 1);
		ppParams.iconH = parsePPInt(ppParams.iconH, 32, 1);
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
	
	// Game Map
	Game_Map.prototype.tileWidth = function() {
		return ppParams.tileWidth;;
	};

	Game_Map.prototype.tileHeight = function() {
		return ppParams.tileHeight;;
	};
})();