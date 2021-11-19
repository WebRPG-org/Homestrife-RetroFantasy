//=============================================================================
// RPG Maker MZ - Darlos9D's Orc Fantasy
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Features for Orc Fantasy.
 * @author Jonathan "Darlos9D" Royal
 *
 * @help D9D_OrcFantasy.js
 *
 * PLUGIN DESCRIPTION HERE.
 *
 * The text images feature allows you to use text character graphics taken from
 * a png, rather than using RMMZ's default behavior of using a font. You may
 * want to use this feature if pixel perfect crispness is desired, such as when
 * working with lower resolutions. The png must contain, starting from the
 * left, monospaced character graphics, starting with ASCII character code 33
 * (!) and increasing in ASCII character code moving to the right. The height
 * of the png should be the character height you provide to the plugin, and
 * each character should have a width of the character width you provide to the
 * plugin. While you can provide more than one png to the plugin, only the
 * first one will be used. The others require manual modification to use,
 * through altering the curTextImage variable to the desired index. I hesitate
 * to expand upon this further in this plugin, as such a feature probably
 * belongs in a plugin focused more on text options.
 *
 * @param textImages
 * @text Text Images
 * @desc An array of text image files and their specifications.
 * @type struct<textImageInfo>[]
 * @parent useTextImages
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
 * @desc The width of an individual text character.
 * @type number
 * @default 8
 * @min 1
 * @decimals 0
 *
 * @param characterH
 * @text Character Height
 * @desc The height of an individual text character.
 * @type number
 * @default 8
 * @min 1
 * @decimals 0
 */

(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('D9D_OrcFantasy');
	parsePluginParameters();
	
	// plugin variables
	let curTextImage = 0;
	
	// helper functions
	function parsePluginParameters() {
		pluginParams.useTextImages = true;
		pluginParams.textImages = parsePluginJSON(pluginParams.textImages, []);
		for(const textImageInfoStringIndex in pluginParams.textImages) {
			const textImageInfo = JSON.parse(pluginParams.textImages[textImageInfoStringIndex]);
			textImageInfo.characterW = parsePluginInt(textImageInfo.characterW, 32, 1);
			textImageInfo.characterH = parsePluginInt(textImageInfo.characterH, 32, 1);
			pluginParams.textImages[textImageInfoStringIndex] = textImageInfo;
		}
	}
	
	function parsePluginInt(string, defaultValue, min, max) {
		let parsedValue = parseInt(string);
		if(parsedValue === NaN) { return defaultValue; }
		if(min !== undefined) { parsedValue = Math.max(min, parsedValue); }
		if(max !== undefined) { parsedValue = Math.min(max, parsedValue); }
		return parsedValue;
	}
	
	function parsePluginJSON(string, defaultValue) {
		if(string && string.length > 0) { return JSON.parse(string); }
		return defaultValue;
	}
	
	// Bitmap
	const _Bitmap_drawText = Bitmap.prototype.drawText;
	Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
		if(pluginParams.useTextImages && pluginParams.textImages.length > 0) {
			this.drawTextFromImage(text, x, y, maxWidth, lineHeight, align);
		} else {
			_Bitmap_drawText.call(this, text, x, y, maxWidth, lineHeight, align);
		}
	};
	
	Bitmap.prototype.drawTextFromImage = function(text, x, y, maxWidth, lineHeight, align) {
		const context = this.context;
		maxWidth = maxWidth || 0xffffffff;
		const textImage = pluginParams.textImages[curTextImage] === undefined ? pluginParams.textImages[0] : pluginParams.textImages[curTextImage];
		let tx = x;
		let ty = y;
		if (align === "center") {
			tx += maxWidth / 2 - (text.length*textImage.characterW) / 2;
		}
		if (align === "right") {
			tx += maxWidth - text.length*textImage.characterW;
		}
		const bmp = ImageManager.loadBitmapFromUrl(textImage.file + ".png");
		tx = Math.round(tx);
		ty = Math.round(ty);
		let curTx = tx;
		for(let i = 0; i < text.length; i++) {
			if(curTx + textImage.characterW > maxWidth + x) { break; }
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
	
	const _Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth;
	Bitmap.prototype.measureTextWidth = function(text) {
		if(pluginParams.useTextImages && pluginParams.textImages.length > 0) {
			return this.measureTextWidthFromImage(text);
		} else {
			return _Bitmap_measureTextWidth.call(this, text);
		}
	};
	
	Bitmap.prototype.measureTextWidthFromImage = function(text) {
		const textImage = pluginParams.textImages[curTextImage] === undefined ? pluginParams.textImages[0] : pluginParams.textImages[curTextImage];
		return text.length * textImage.characterW;
	};
	
	// Window
	const _Window_initialize = Window.prototype.initialize;
	Window.prototype.initialize = function() {
		_Window_initialize.call(this);
		this._padding = 4;
		this._margin = 0;
	};
	
	Window.prototype.move = function(x, y, width, height) {
		this.x = x || 0;
		this.y = y || 0;
		const spriteW = $gameMap.tileWidth() / 2;
		const spriteH = $gameMap.tileHeight() / 2;
		this.x = Math.round(this.x / spriteW) * spriteW;
		this.y = Math.round(this.y / spriteH) * spriteH;
		if (this._width !== width || this._height !== height) {
			this._width = width || 0;
			this._height = height || 0;
			this._width = Math.round(this._width / spriteW) * spriteW;
			this._height = Math.round(this._height / spriteH) * spriteH;
			this._refreshAllParts();
		}
	};
	
	// Game System
	Game_System.prototype.windowPadding = function() {
		return 4;
	};
	
	// Game Character Base
	Game_CharacterBase.prototype.shiftY = function() {
		return 0;
	};
	
	Game_CharacterBase.prototype.refreshBushDepth = function() {
		if (
			this.isNormalPriority() &&
			!this.isObjectCharacter() &&
			this.isOnBush() &&
			!this.isJumping()
		) {
			if (!this.isMoving()) {
				this._bushDepth = 8;
			}
		} else {
			this._bushDepth = 0;
		}
	};
	
	// Scene Boot
	Scene_Boot.prototype.adjustBoxSize = function() {
		Graphics.boxWidth = Graphics._width;
		Graphics.boxHeight = Graphics._height;
	};
	
	// Scene Base
	Scene_Base.prototype.mainCommandWidth = function() {
		return $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
	};
	
	Scene_MenuBase.prototype.mainAreaHeight = function() {
		return $gameSystem.windowPadding()*3 + $gameMap.tileHeight()*8;
	};
	
	Scene_MenuBase.prototype.mainAreaTop = function() {
		return $gameMap.tileHeight()/2*8;
	};
	
	Scene_MenuBase.prototype.createBackground = function() {
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		this.addChild(this._backgroundSprite);
		this.setBackgroundOpacity(255);
	};
	
	// Scene Menu
	Scene_Menu.prototype.createCommandWindow = function() {
		const rect = this.commandWindowRect();
		const commandWindow = new Window_MenuCommand(rect);
		commandWindow.setHandler("item", this.commandItem.bind(this));
		commandWindow.setHandler("skill", this.commandPersonal.bind(this));
		commandWindow.setHandler("equip", this.commandPersonal.bind(this));
		commandWindow.setHandler("status", this.commandPersonal.bind(this));
		commandWindow.setHandler("formation", this.commandFormation.bind(this));
		commandWindow.setHandler("options", this.commandOptions.bind(this));
		commandWindow.setHandler("save", this.commandSave.bind(this));
		commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
		commandWindow.setHandler("cancel", this.popScene.bind(this));
		this.addWindow(commandWindow);
		this._commandWindow = commandWindow;
	};
	
	Scene_Menu.prototype.commandWindowRect = function() {
		const ww = this.mainCommandWidth();
		const wh = this.mainAreaHeight();
		const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
		const wy = this.mainAreaTop();
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Menu.prototype.createGoldWindow = function() {
		const rect = this.goldWindowRect();
		this._goldWindow = new Window_Gold(rect);
		this.addWindow(this._goldWindow);
		this._goldWindow.hide();
	};
	
	Scene_Menu.prototype.createStatusWindow = function() {
		const rect = this.statusWindowRect();
		this._statusWindow = new Window_MenuStatus(rect);
		this.addWindow(this._statusWindow);
		this._statusWindow.hide();
	};
	
	// Sprite Character
	Sprite_Character.prototype.updateCharacterFrame = function() {
		const pw = this.patternWidth();
		const ph = this.patternHeight();
		const sx = (this.characterBlockX() + this.characterPatternX()) * pw;
		const sy = (this.characterBlockY() + this.characterPatternY()) * ph;
		this.updateHalfBodySprites();
		if (this._bushDepth > 0) {
			const d = this._bushDepth;
			this._upperBody.setFrame(sx, sy, pw, ph - d);
			this._lowerBody.setFrame(sx, sy + ph - d, pw, d);
			this.setFrame(sx, sy, 0, ph);
		} else {
			this.setFrame(sx, sy, pw, ph);
		}
	};
	
	Sprite_Character.prototype.updateHalfBodySprites = function() {
		if (this._bushDepth > 0) {
			this.createHalfBodySprites();
			this._upperBody.bitmap = this.bitmap;
			this._upperBody.visible = true;
			this._upperBody.y = -this._bushDepth;
			this._lowerBody.visible = false;
			this._upperBody.setBlendColor(this.getBlendColor());
			this._upperBody.setColorTone(this.getColorTone());
			this._upperBody.blendMode = this.blendMode;
		} else if (this._upperBody) {
			this._upperBody.visible = false;
			this._lowerBody.visible = false;
		}
	};
	
	// Window Base
	Window_Base.prototype.lineHeight = function() {
		return $gameMap.tileHeight();
	};
	
	Window_Base.prototype.itemPadding = function() {
		return 4;
	};
	
	// Window Selectable
	Window_Selectable.prototype.colSpacing = function() {
		return 0;
	};

	Window_Selectable.prototype.rowSpacing = function() {
		return 0;
	};
	
	Window_Selectable.prototype.itemHeight = function() {
		return Window_Scrollable.prototype.itemHeight.call(this);
	};
	
	const _Window_Selectable_itemRect = Window_Selectable.prototype.itemRect;
	Window_Selectable.prototype.itemRect = function(index) {
		const rect = _Window_Selectable_itemRect.call(this, index);
		rect.y += $gameSystem.windowPadding()*2;
		return rect;
	};
	
	Window_Selectable.prototype.drawItemBackground = function(index) {
		// do nothing
	};
	
	// Window Command
	Window_Command.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		this.resetTextColor();
		this.changePaintOpacity(this.isCommandEnabled(index));
		this.drawText(this.commandName(index), rect.x, rect.y+$gameSystem.windowPadding(), rect.width);
	};
})();
