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
 * @param tileSize
 * @text Tile Size
 * @desc The size of tiles in the game, measured in pixels. Impacts character/event movement and dimensions as well.
 * @type number
 * @default 48
 * @min 1
 * @decimals 0
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
	const rpParams = PluginManager.parameters('RetroPixels');
	parseRPParameters();
	
	// plugin variables
	let curTextImage = 0;
	
	// helper functions
	function parseRPParameters() {
		rpParams.tileSize = parseRPInt(rpParams.tileSize, 48, 1);
		rpParams.iconW = parseRPInt(rpParams.iconW, 32, 1);
		rpParams.iconH = parseRPInt(rpParams.iconH, 32, 1);
		rpParams.useTextImages = rpParams.useTextImages === 'true';
		rpParams.textImages = JSON.parse(rpParams.textImages);
		for(const textImageInfoStringIndex in rpParams.textImages) {
			const textImageInfo = JSON.parse(rpParams.textImages[textImageInfoStringIndex]);
			textImageInfo.characterW = parseRPInt(textImageInfo.characterW, 32, 1);
			textImageInfo.characterH = parseRPInt(textImageInfo.characterH, 32, 1);
			rpParams.textImages[textImageInfoStringIndex] = textImageInfo;
		}
	}
	
	function parseRPInt(string, defaultValue, min, max) {
		let parsedValue = parseInt(string);
		if(parsedValue === NaN) { return defaultValue; }
		if(min !== undefined) { parsedValue = Math.max(min, parsedValue); }
		if(max !== undefined) { parsedValue = Math.min(max, parsedValue); }
		return parsedValue;
	}
	
	// Bitmap
	Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
		if(rpParams.useTextImages && rpParams.textImages.length > 0) {
			this.drawTextFromImage(text, x, y, maxWidth, lineHeight, align);
		} else {
			this.drawTextFromFont(text, x, y, maxWidth, lineHeight, align);
		}
	};
	
	Bitmap.prototype.drawTextFromFont = function(text, x, y, maxWidth, lineHeight, align) {
		// [Note] Different browser makes different rendering with
		//   textBaseline == 'top'. So we use 'alphabetic' here.
		const context = this.context;
		const alpha = context.globalAlpha;
		maxWidth = maxWidth || 0xffffffff;
		let tx = x;
		let ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);
		if (align === "center") {
			tx += maxWidth / 2;
		}
		if (align === "right") {
			tx += maxWidth;
		}
		context.save();
		context.font = this._makeFontNameText();
		context.textAlign = align;
		context.textBaseline = "alphabetic";
		context.globalAlpha = 1;
		this._drawTextOutline(text, tx, ty, maxWidth);
		context.globalAlpha = alpha;
		this._drawTextBody(text, tx, ty, maxWidth);
		context.restore();
		this._baseTexture.update();
	};
	
	Bitmap.prototype.drawTextFromImage = function(text, x, y, maxWidth, lineHeight, align) {
		const context = this.context;
		maxWidth = maxWidth || 0xffffffff;
		const textImage = rpParams.textImages[curTextImage] === undefined ? rpParams.textImages[0] : rpParams.textImages[curTextImage];
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
})();