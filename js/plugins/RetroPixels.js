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
 */
 
(() => {
	// Bitmap
	Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align, textImageSource) {
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
		if(textImageSource) {
			this._drawTextFromImage(text, tx, ty, maxWidth, textImageSource);
		} else {
			context.save();
			context.font = this._makeFontNameText();
			context.textAlign = align;
			context.textBaseline = "alphabetic";
			context.globalAlpha = 1;
			this._drawTextOutline(text, tx, ty, maxWidth, textImageFile);
			context.globalAlpha = alpha;
			this._drawTextBody(text, tx, ty, maxWidth);
			context.restore();
		}
		this._baseTexture.update();
	};
	
	Bitmap.prototype._drawTextFromImage = function(text, tx, ty, maxWidth, textImageSource) {
		
	};
})();