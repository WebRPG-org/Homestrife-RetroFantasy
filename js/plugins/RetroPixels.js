//=============================================================================
// RPG Maker MZ - Retro Pixels
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjustments and options for retro-style graphics
 * @author Jonathan "Darlos9D" Royal
 *
 * @help RetroPixels.js
 *
 * A plugin that helps emulate retro graphics found in early generation video
 * game consoles. Aids in UI window sizing and positioning, cursor handling,
 * screen scrolling, image-based text, audio channels, and on-the-fly color
 * shifting.
 *
 * The plugin's features are dependent on "retro pixel size." This parameter
 * allows for consistent handling of graphics that appear low-resolution.
 * Graphics should be designed with this size in mind. For instance, with a
 * retro pixel size of 3, graphics should be designed with an artifically
 * pixelated appearance, where each 'pixel' is a 3x3 square of real pixels. A
 * retro pixel size of 1 will effectively disable this feature and allow a
 * plugin developer to handle resolution in their own way, but this will result
 * in very small graphics in the RPG Maker editor interface, possibly making
 * graphics difficult to see and position. Conveniently, a retro pixel size of
 * 3 plays nicely with the default game resolution of 816x624, and 17x13 tiles.
 * It results in a virtual resolution of 272x208, and each tile measuring 16x16
 * virtual pixels. This is very similar to actual retro console specifications.
 *
 * This plugin does not provide plugin commands.
 * 
 * @param retroPixelSize
 * @text Retro Pixel Size
 * @desc The size of retro pixels, measured in real image pixels. Affects size/position/scroll/movement logic.
 * @type number
 * @default 3
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
 * @desc The width of icons, in retro pixels.
 * @type number
 * @default 8
 * @min 1
 * @decimals 0
 *
 * @param iconH
 * @text Icon Height
 * @desc The height of icons, in retro pixels.
 * @type number
 * @default 8
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
 * @desc The width of an individual text character, in retro pixels.
 * @type number
 * @default 8
 * @min 1
 * @decimals 0
 *
 * @param characterH
 * @text Character Height
 * @desc The height of an individual text character, in retro pixels.
 * @type number
 * @default 8
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
		rpParams.retroPixelSize = parseRPInt(rpParams.retroPixelSize, 3, 1);
		rpParams.iconW = parseRPInt(rpParams.iconW, 8, 1)*rpParams.retroPixelSize;
		rpParams.iconH = parseRPInt(rpParams.iconH, 8, 1)*rpParams.retroPixelSize;
		rpParams.useTextImages = rpParams.useTextImages === 'true';
		rpParams.textImages = JSON.parse(rpParams.textImages);
		for(const textImageInfoStringIndex in rpParams.textImages) {
			const textImageInfo = JSON.parse(rpParams.textImages[textImageInfoStringIndex]);
			textImageInfo.characterW = parseRPInt(textImageInfo.characterW, 8, 1)*rpParams.retroPixelSize;
			textImageInfo.characterH = parseRPInt(textImageInfo.characterH, 8, 1)*rpParams.retroPixelSize;
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