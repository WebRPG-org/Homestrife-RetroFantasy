//=============================================================================
// RPG Maker MZ - Darlos9D's Pixel Perfect
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjustments and options for different resolutions.
 * @author Jonathan "Darlos9D" Royal
 *
 * @help D9D_PixelPerfect.js
 *
 * PLUGIN DESCRIPTION HERE
 *
 * This plugin does not provide plugin commands.
 *
 * @param renderPixelated
 * @text Render Pixelated
 * @desc Enlarged graphics will render pixelated rather than blurred.
 * @type boolean
 * @default false
 *
 * @param forceWholeResolution
 * @text Force Whole Resolution
 * @desc Only allow resolutions that are whole multiples of the base screen width, when resizing the game window.
 * @type boolean
 * @default false
 * 
 * @param screenWidth
 * @text Screen Width
 * @desc The width of the main game area, measured in pixels. Leave System 2 setting alone and use this instead.
 * @type number
 * @default 816
 * @min 1
 * @decimals 0
 * 
 * @param screenHeight
 * @text Screen Height
 * @desc The height of the main game area, measured in pixels. Leave System 2 setting alone and use this instead.
 * @type number
 * @default 624
 * @min 1
 * @decimals 0
 * 
 * @param uiAreaWidth
 * @text UI Area Width
 * @desc The width of the game UI space, measured in pixels. Leave System 2 setting alone and use this instead.
 * @type number
 * @default 816
 * @min 1
 * @decimals 0
 * 
 * @param uiAreaHeight
 * @text UI Area Height
 * @desc The height of the game UI space, measured in pixels. Leave System 2 setting alone and use this instead.
 * @type number
 * @default 624
 * @min 1
 * @decimals 0
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
 * @param faceW
 * @text Face Width
 * @desc The width of face images, measured in pixels.
 * @type number
 * @default 144
 * @min 1
 * @decimals 0
 *
 * @param faceH
 * @text Face Height
 * @desc The height of face images, measured in pixels.
 * @type number
 * @default 144
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
 * @param windowFileSize
 * @text Window File Size
 * @desc The width and height of the system window file, measured in pixels.
 * @type number
 * @default 192
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
	const ppParams = PluginManager.parameters('D9D_PixelPerfect');
	parsePPParameters();
	
	// plugin variables
	let curTextImage = 0;
	
	// helper functions
	function parsePPParameters() {
		ppParams.renderPixelated = ppParams.renderPixelated === 'true';
		ppParams.forceWholeResolution = ppParams.forceWholeResolution === 'true';
		ppParams.screenWidth = parsePPInt(ppParams.screenWidth, 816, 1);
		ppParams.screenHeight = parsePPInt(ppParams.screenHeight, 624, 1);
		ppParams.uiAreaWidth = parsePPInt(ppParams.uiAreaWidth, 816, 1);
		ppParams.uiAreaHeight = parsePPInt(ppParams.uiAreaHeight, 624, 1);
		ppParams.tileWidth = parsePPInt(ppParams.tileWidth, 48, 1);
		ppParams.tileHeight = parsePPInt(ppParams.tileHeight, 48, 1);
		
		ppParams.balloonW = parsePPInt(ppParams.balloonW, 48, 1);
		ppParams.balloonH = parsePPInt(ppParams.balloonH, 48, 1);
		ppParams.buttonW = parsePPInt(ppParams.buttonW, 48, 1);
		ppParams.buttonH = parsePPInt(ppParams.buttonH, 48, 1);
		ppParams.iconW = parsePPInt(ppParams.iconW, 32, 1);
		ppParams.iconH = parsePPInt(ppParams.iconH, 32, 1);
		ppParams.faceW = parsePPInt(ppParams.faceW, 144, 1);
		ppParams.faceH = parsePPInt(ppParams.faceH, 144, 1);
		ppParams.stateW = parsePPInt(ppParams.stateW, 96, 1);
		ppParams.stateH = parsePPInt(ppParams.stateH, 96, 1);
		ppParams.weaponW = parsePPInt(ppParams.weaponW, 96, 1);
		ppParams.weaponH = parsePPInt(ppParams.weaponH, 64, 1);
		ppParams.windowFileSize = parsePPInt(ppParams.windowFileSize, 192, 1);
		
		ppParams.sideViewActorW = parsePPInt(ppParams.sideViewActorW, 64, 1);
		ppParams.sideViewActorH = parsePPInt(ppParams.sideViewActorH, 64, 1);
		
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
	
	function ResScaleX() {
		return ppParams.screenWidth / 816;
	}
	
	function ResScaleY() {
		return ppParams.screenHeight / 624;
	}
	
	function ScaleResX(pixels) {
		return Math.round(pixels * ResScaleX());
	}
	
	function ScaleResY(pixels) {
		return Math.round(pixels * ResScaleY());
	}
	
	function UIScaleX() {
		return ppParams.uiAreaWidth / 816;
	}
	
	function UIScaleY() {
		return ppParams.uiAreaHeight / 624;
	}
	
	function ScaleUIX(pixels) {
		return Math.round(pixels * UIScaleX());
	}
	
	function ScaleUIY(pixels) {
		return Math.round(pixels * UIScaleY());
	}
	
	function WindowImageScale(pixels) {
		return ppParams.windowFileSize / 192;
	}
	
	function ScaleWindowImage(pixels) {
		return Math.round(pixels * WindowImageScale(pixels));
	}
	
	// Graphics
	Graphics._updateRealScale = function() {
		if (this._stretchEnabled && this._width > 0 && this._height > 0) {
			const h = this._stretchWidth() / this._width;
			const v = this._stretchHeight() / this._height;
			this._realScale = Math.min(h, v);
			if(ppParams.forceWholeResolution) {
				this._realScale = Math.floor(this._realScale);
			}
			window.scrollTo(0, 0);
		} else {
			this._realScale = this._defaultScale;
		}
	};
	
	const _Graphics__updateCanvas = Graphics._updateCanvas;
	Graphics._updateCanvas = function() {
		_Graphics__updateCanvas.call(this);
		this._canvas.style.imageRendering = ppParams.renderPixelated ? 'pixelated' : '';
	};
	
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
	
	const _Bitmap_measureTextWidth = Bitmap.prototype.measureTextWidth;
	Bitmap.prototype.measureTextWidth = function(text) {
		if(ppParams.useTextImages && ppParams.textImages.length > 0) {
			return this.measureTextWidthFromImage(text);
		} else {
			return _Bitmap_measureTextWidth.call(this, text);
		}
	};
	
	Bitmap.prototype.measureTextWidthFromImage = function(text) {
		const textImage = ppParams.textImages[curTextImage] === undefined ? ppParams.textImages[0] : ppParams.textImages[curTextImage];
		return text.length * textImage.characterW;
	};
	
	// Tilemap
	const _Tilemap_initialize = Tilemap.prototype.initialize;
	Tilemap.prototype.initialize = function() {
		_Tilemap_initialize.apply(this);
		this._tileWidth = ppParams.tileWidth;
		this._tileHeight = ppParams.tileHeight;
	};
	
	// Window
	const _Window_initialize = Window.prototype.initialize;
	Window.prototype.initialize = function() {
		_Window_initialize.call(this);
		this._padding = ScaleUIY(12);
		this._margin = ScaleUIY(4);
	}
	
	Window.prototype._refreshBack = function() {
		const m = this._margin;
		const w = Math.max(0, this._width - m * 2);
		const h = Math.max(0, this._height - m * 2);
		const sprite = this._backSprite;
		const tilingSprite = sprite.children[0];
		// [Note] We use 95 instead of 96 here to avoid blurring edges.
		sprite.bitmap = this._windowskin;
		sprite.setFrame(0, 0, ScaleWindowImage(95), ScaleWindowImage(95));
		sprite.move(m, m);
		sprite.scale.x = w / ScaleWindowImage(95);
		sprite.scale.y = h / ScaleWindowImage(95);
		tilingSprite.bitmap = this._windowskin;
		tilingSprite.setFrame(0, ScaleWindowImage(96), ScaleWindowImage(96), ScaleWindowImage(96));
		tilingSprite.move(0, 0, w, h);
		tilingSprite.scale.x = 1 / sprite.scale.x;
		tilingSprite.scale.y = 1 / sprite.scale.y;
		sprite.setColorTone(this._colorTone);
	};
	
	Window.prototype._refreshFrame = function() {
		const drect = { x: 0, y: 0, width: this._width, height: this._height };
		const srect = { x: ScaleWindowImage(96), y: 0, width: ScaleWindowImage(96), height: ScaleWindowImage(96) };
		const m = ScaleWindowImage(24);
		for (const child of this._frameSprite.children) {
			child.bitmap = this._windowskin;
		}
		this._setRectPartsGeometry(this._frameSprite, srect, drect, m);
	};

	Window.prototype._refreshCursor = function() {
		const drect = this._cursorRect.clone();
		const srect = { x: ScaleWindowImage(96), y: ScaleWindowImage(96), width: ScaleWindowImage(48), height: ScaleWindowImage(48) };
		const m = ScaleWindowImage(4);
		for (const child of this._cursorSprite.children) {
			child.bitmap = this._windowskin;
		}
		this._setRectPartsGeometry(this._cursorSprite, srect, drect, m);
	};
	
	Window.prototype._refreshArrows = function() {
		const w = this._width;
		const h = this._height;
		const p = ScaleWindowImage(24);
		const q = p / 2;
		const sx = ScaleWindowImage(96) + p;
		const sy = 0 + p;
		this._downArrowSprite.bitmap = this._windowskin;
		this._downArrowSprite.anchor.x = 0.5;
		this._downArrowSprite.anchor.y = 0.5;
		this._downArrowSprite.setFrame(sx + q, sy + q + p, p, q);
		this._downArrowSprite.move(w / 2, h - q);
		this._upArrowSprite.bitmap = this._windowskin;
		this._upArrowSprite.anchor.x = 0.5;
		this._upArrowSprite.anchor.y = 0.5;
		this._upArrowSprite.setFrame(sx + q, sy, p, q);
		this._upArrowSprite.move(w / 2, q);
	};

	Window.prototype._refreshPauseSign = function() {
		const sx = ScaleWindowImage(144);
		const sy = ScaleWindowImage(96);
		const p = ScaleWindowImage(24);
		this._pauseSignSprite.bitmap = this._windowskin;
		this._pauseSignSprite.anchor.x = 0.5;
		this._pauseSignSprite.anchor.y = 1;
		this._pauseSignSprite.move(this._width / 2, this._height);
		this._pauseSignSprite.setFrame(sx, sy, p, p);
		this._pauseSignSprite.alpha = 0;
	};
	
	Window.prototype._updatePauseSign = function() {
		const sprite = this._pauseSignSprite;
		const x = Math.floor(this._animationCount / 16) % 2;
		const y = Math.floor(this._animationCount / 16 / 2) % 2;
		const sx = ScaleWindowImage(144);
		const sy = ScaleWindowImage(96);
		const p = ScaleWindowImage(24);
		if (!this.pause) {
			sprite.alpha = 0;
		} else if (sprite.alpha < 1) {
			sprite.alpha = Math.min(sprite.alpha + 0.1, 1);
		}
		sprite.setFrame(sx + x * p, sy + y * p, p, p);
		sprite.visible = this.isOpen();
	};
	
	// Image Manager
	ImageManager.iconWidth = ppParams.iconW;
	ImageManager.iconHeight = ppParams.iconH;
	ImageManager.faceWidth = ppParams.faceW;
	ImageManager.faceHeight = ppParams.faceH;
	
	const _ImageManager_loadBitmap = ImageManager.loadBitmap;
	ImageManager.loadBitmap = function(folder, filename) {
		const runtimeFilename = filename + ppParams.imageFileTag;
		const fs = require("fs");
		return _ImageManager_loadBitmap.call(this, folder, fs.existsSync(directoryPath(folder) + runtimeFilename + ".png") ? runtimeFilename : filename);
	};
	
	// Game System
	const _Game_System_windowPadding = Game_System.prototype.windowPadding;
	Game_System.prototype.windowPadding = function() {
		return ScaleUIX(_Game_System_windowPadding.call(this));
	};
	
	// Game Map
	Game_Map.prototype.tileWidth = function() {
		return ppParams.tileWidth;;
	};

	Game_Map.prototype.tileHeight = function() {
		return ppParams.tileHeight;;
	};
	
	// Scene Base
	const _Scene_Base_mainCommandWidth = Scene_Base.prototype.mainCommandWidth;
	Scene_Base.prototype.mainCommandWidth = function() {
		return ScaleUIX(_Scene_Base_mainCommandWidth.call(this));
	};
	
	const _Scene_Base_buttonAreaHeight = Scene_Base.prototype.buttonAreaHeight;
	Scene_Base.prototype.buttonAreaHeight = function() {
		return ScaleUIY(_Scene_Base_buttonAreaHeight.call(this));
	};
	
	Scene_Base.prototype.buttonY = function() {
		const offsetY = Math.floor((this.buttonAreaHeight() - ScaleUIY(48)) / 2);
		return this.buttonAreaTop() + offsetY;
	};
	
	// Scene Boot
	Scene_Boot.prototype.resizeScreen = function() {
		const screenWidth = ppParams.screenWidth;
		const screenHeight = ppParams.screenHeight;
		Graphics.resize(screenWidth, screenHeight);
		this.adjustBoxSize();
		this.adjustWindow();
	};
	
	Scene_Boot.prototype.adjustBoxSize = function() {
		const uiAreaWidth = ppParams.uiAreaWidth;
		const uiAreaHeight = ppParams.uiAreaHeight;
		const boxMargin = 4;
		Graphics.boxWidth = uiAreaWidth - ScaleUIX(boxMargin) * 2;
		Graphics.boxHeight = uiAreaHeight - ScaleUIY(boxMargin) * 2;
	};
	
	// Scene Title
	Scene_Title.prototype.drawGameTitle = function() {
		const x = ScaleUIX(20);
		const y = Graphics.height / 4;
		const maxWidth = Graphics.width - x * 2;
		const text = $dataSystem.gameTitle;
		const bitmap = this._gameTitleSprite.bitmap;
		bitmap.fontFace = $gameSystem.mainFontFace();
		bitmap.outlineColor = "black";
		bitmap.outlineWidth = ScaleUIX(8);
		bitmap.fontSize = ScaleUIY(72);
		bitmap.drawText(text, x, y, maxWidth, ScaleUIY(48), "center");
	};
	
	Scene_Title.prototype.commandWindowRect = function() {
		const offsetX = $dataSystem.titleCommandWindow.offsetX;
		const offsetY = $dataSystem.titleCommandWindow.offsetY;
		const ww = this.mainCommandWidth();
		const wh = this.calcWindowHeight(3, true);
		const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
		const wy = Graphics.boxHeight - wh - ScaleUIY(96) + offsetY;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Message
	Scene_Message.prototype.messageWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = this.calcWindowHeight(4, false) + ScaleUIY(8);
		const wx = (Graphics.boxWidth - ww) / 2;
		const wy = 0;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Map
	Scene_Map.prototype.mapNameWindowRect = function() {
		const wx = 0;
		const wy = 0;
		const ww = ScaleUIX(360);
		const wh = this.calcWindowHeight(1, false);
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Map.prototype.createMenuButton = function() {
		this._menuButton = new Sprite_Button("menu");
		this._menuButton.x = Graphics.boxWidth - this._menuButton.width - ScaleUIX(4);
		this._menuButton.y = this.buttonY();
		this._menuButton.visible = false;
		this.addWindow(this._menuButton);
	};
	
	// Scene Menu Base
	Scene_MenuBase.prototype.createCancelButton = function() {
		this._cancelButton = new Sprite_Button("cancel");
		this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - ScaleUIX(4);
		this._cancelButton.y = this.buttonY();
		this.addWindow(this._cancelButton);
	};
	
	Scene_MenuBase.prototype.createPageButtons = function() {
		this._pageupButton = new Sprite_Button("pageup");
		this._pageupButton.x = ScaleUIX(4);
		this._pageupButton.y = this.buttonY();
		const pageupRight = this._pageupButton.x + this._pageupButton.width;
		this._pagedownButton = new Sprite_Button("pagedown");
		this._pagedownButton.x = pageupRight + ScaleUIX(4);
		this._pagedownButton.y = this.buttonY();
		this.addWindow(this._pageupButton);
		this.addWindow(this._pagedownButton);
		this._pageupButton.setClickHandler(this.previousActor.bind(this));
		this._pagedownButton.setClickHandler(this.nextActor.bind(this));
	};
	
	// Scene Equip
	const _Scene_Equip_statusWidth = Scene_Equip.prototype.statusWidth;
	Scene_Equip.prototype.statusWidth = function() {
		return ScaleUIX(_Scene_Equip_statusWidth.call(this));
	};
	
	// Scene Status
	const _Scene_Status_statusParamsWidth = Scene_Status.prototype.statusParamsWidth;
	Scene_Status.prototype.statusParamsWidth = function() {
		return ScaleUIX(_Scene_Status_statusParamsWidth.call(this));
	};
	
	// Scene Options
	Scene_Options.prototype.optionsWindowRect = function() {
		const n = Math.min(this.maxCommands(), this.maxVisibleCommands());
		const ww = ScaleUIX(400);
		const wh = this.calcWindowHeight(n, true);
		const wx = (Graphics.boxWidth - ww) / 2;
		const wy = (Graphics.boxHeight - wh) / 2;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Shop
	const _Scene_Shop_statusWidth = Scene_Shop.prototype.statusWidth;
	Scene_Shop.prototype.statusWidth = function() {
		return ScaleUIX(_Scene_Shop_statusWidth.call(this));
	};
	
	// Scene Name
	Scene_Name.prototype.editWindowRect = function() {
		const inputWindowHeight = this.calcWindowHeight(9, true);
		const padding = $gameSystem.windowPadding();
		const ww = ScaleUIX(600);
		const wh = ImageManager.faceHeight + padding * 2;
		const wx = (Graphics.boxWidth - ww) / 2;
		const wy = (Graphics.boxHeight - (wh + inputWindowHeight + ScaleUIY(8))) / 2;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Name.prototype.inputWindowRect = function() {
		const wx = this._editWindow.x;
		const wy = this._editWindow.y + this._editWindow.height + ScaleUIY(8);
		const ww = this._editWindow.width;
		const wh = this.calcWindowHeight(9, true);
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Debug
	Scene_Debug.prototype.rangeWindowRect = function() {
		const wx = 0;
		const wy = 0;
		const ww = ScaleUIX(246);
		const wh = Graphics.boxHeight;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Battle
	Scene_Battle.prototype.updateStatusWindowPosition = function() {
		const statusWindow = this._statusWindow;
		const targetX = this.statusWindowX();
		if (statusWindow.x < targetX) {
			statusWindow.x = Math.min(statusWindow.x + ScaleUIX(16), targetX);
		}
		if (statusWindow.x > targetX) {
			statusWindow.x = Math.max(statusWindow.x - ScaleUIX(16), targetX);
		}
	};
	
	Scene_Battle.prototype.statusWindowRect = function() {
		const extra = ScaleUIY(10);
		const ww = Graphics.boxWidth - ScaleUIX(192);
		const wh = this.windowAreaHeight() + extra;
		const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh + extra - ScaleUIY(4);
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.partyCommandWindowRect = function() {
		const ww = ScaleUIX(192);
		const wh = this.windowAreaHeight();
		const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.actorCommandWindowRect = function() {
		const ww = ScaleUIX(192);
		const wh = this.windowAreaHeight();
		const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.createCancelButton = function() {
		this._cancelButton = new Sprite_Button("cancel");
		this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - ScaleUIX(4);
		this._cancelButton.y = this.buttonY();
		this.addWindow(this._cancelButton);
	};
	
	// Sprite Button
	Sprite_Button.prototype.blockWidth = function() {
		return ppParams.buttonW;
	};

	Sprite_Button.prototype.blockHeight = function() {
		return ppParams.buttonH;
	};
	
	// Sprite Battler
	Sprite_Battler.prototype.createDamageSprite = function() {
		const last = this._damages[this._damages.length - 1];
		const sprite = new Sprite_Damage();
		if (last) {
			sprite.x = last.x + ScaleResX(8);
			sprite.y = last.y - ScaleResY(16);
		} else {
			sprite.x = this.x + this.damageOffsetX();
			sprite.y = this.y + this.damageOffsetY();
		}
		sprite.setup(this._battler);
		this._damages.push(sprite);
		this.parent.addChild(sprite);
	};
	
	// Sprite Actor
	Sprite_Actor.prototype.createShadowSprite = function() {
		this._shadowSprite = new Sprite();
		this._shadowSprite.bitmap = ImageManager.loadSystem("Shadow2");
		this._shadowSprite.anchor.x = 0.5;
		this._shadowSprite.anchor.y = 0.5;
		this._shadowSprite.y = ScaleResY(-2);
		this.addChild(this._shadowSprite);
	};
	
	Sprite_Actor.prototype.moveToStartPosition = function() {
		this.startMove(ScaleResX(300), 0, 0);
	};
	
	Sprite_Actor.prototype.setActorHome = function(index) {
		this.setHome(ScaleResX(600) + index * ScaleResX(32), ScaleResY(280) + index * ScaleResY(48));
	};
	
	Sprite_Actor.prototype.stepForward = function() {
		this.startMove(ScaleResX(-48), 0, 12);
	};
	
	Sprite_Actor.prototype.retreat = function() {
		this.startMove(ScaleResX(300), 0, 30);
	};
	
	Sprite_Actor.prototype.damageOffsetX = function() {
		return Sprite_Battler.prototype.damageOffsetX.call(this) - ScaleResX(32);
	};
	
	// Sprite Enemy
	Sprite_Enemy.prototype.setBattler = function(battler) {
		Sprite_Battler.prototype.setBattler.call(this, battler);
		this._enemy = battler;
		this.setHome(ScaleResX(battler.screenX()), ScaleResY(battler.screenY()));
		this._stateIconSprite.setup(battler);
	};
	
	Sprite_Enemy.prototype.updateStateSprite = function() {
		this._stateIconSprite.y = -Math.round((this.bitmap.height + ScaleResY(40)) * 0.9);
		if (this._stateIconSprite.y < ScaleResY(20) - this.y) {
			this._stateIconSprite.y = ScaleResY(20) - this.y;
		}
	};
	
	Sprite_Enemy.prototype.updateBossCollapse = function() {
		this._shake = ScaleResX((this._effectDuration % 2) * 4 - 2);
		this.blendMode = 1;
		this.opacity *= this._effectDuration / (this._effectDuration + 1);
		this.setBlendColor([255, 255, 255, 255 - this.opacity]);
		if (this._effectDuration % 20 === 19) {
			SoundManager.playBossCollapse2();
		}
	};
	
	Sprite_Enemy.prototype.damageOffsetY = function() {
		return Sprite_Battler.prototype.damageOffsetY.call(this) - ScaleResY(8);
	};
	
	// Sprite Damage
	Sprite_Damage.prototype.createChildSprite = function(width, height) {
		const sprite = new Sprite();
		sprite.bitmap = this.createBitmap(width, height);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 1;
		sprite.y = ScaleResY(-40);
		sprite.ry = sprite.y;
		this.addChild(sprite);
		return sprite;
	};
	
	// Sprite Gauge
	Sprite_Gauge.prototype.bitmapWidth = function() {
		return ScaleUIX(128);
	};

	Sprite_Gauge.prototype.bitmapHeight = function() {
		return ScaleUIY(32);
	};

	Sprite_Gauge.prototype.textHeight = function() {
		return ScaleUIY(24);
	};

	Sprite_Gauge.prototype.gaugeHeight = function() {
		return ScaleUIY(12);
	};
	
	Sprite_Gauge.prototype.gaugeX = function() {
		if (this._statusType === "time") {
			return 0;
		} else {
			return this.measureLabelWidth() + ScaleUIX(6);
		}
	};
	
	Sprite_Gauge.prototype.drawGaugeRect = function(x, y, width, height) {
		const rate = this.gaugeRate();
		const fillW = Math.floor((width - ScaleUIX(2)) * rate);
		const fillH = height - ScaleUIY(2);
		const color0 = this.gaugeBackColor();
		const color1 = this.gaugeColor1();
		const color2 = this.gaugeColor2();
		this.bitmap.fillRect(x, y, width, height, color0);
		this.bitmap.gradientFillRect(x + ScaleUIX(1), y + ScaleUIY(1), fillW, fillH, color1, color2);
	};
	
	// Sprite Name
	Sprite_Name.prototype.bitmapWidth = function() {
		return ScaleUIX(128);
	};

	Sprite_Name.prototype.bitmapHeight = function() {
		return ScaleUIY(24);
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
	
	// Sprite Weapon
	Sprite_Weapon.prototype.initMembers = function() {
		this._weaponImageId = 0;
		this._animationCount = 0;
		this._pattern = 0;
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this.x = ScaleResX(-16);
	};

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
	
	// Sprite Balloon
	Sprite_Balloon.prototype.updateFrame = function() {
		const w = ppParams.balloonW;
		const h = ppParams.balloonH;
		const sx = this.frameIndex() * w;
		const sy = (this._balloonId - 1) * h;
		this.setFrame(sx, sy, w, h);
	};
	
	// Sprite Timer
	Sprite_Timer.prototype.createBitmap = function() {
		this.bitmap = new Bitmap(ScaleUIX(96), ScaleUIY(48));
		this.bitmap.fontFace = this.fontFace();
		this.bitmap.fontSize = this.fontSize();
		this.bitmap.outlineColor = ColorManager.outlineColor();
	};
	
	// Spriteset Battle
	const _Spriteset_Battle_battleFieldOffsetY = Spriteset_Battle.prototype.battleFieldOffsetY;
	Spriteset_Battle.prototype.battleFieldOffsetY = function() {
		return ScaleResY(_Spriteset_Battle_battleFieldOffsetY.call(this));
	};
	
	// Window Base
	const _Window_Base_lineHeight = Window_Base.prototype.lineHeight;
	Window_Base.prototype.lineHeight = function() {
		return ScaleUIY(_Window_Base_lineHeight.call(this));
	};
	
	const _Window_Base_itemPadding = Window_Base.prototype.itemPadding;
	Window_Base.prototype.itemPadding = function() {
		return ScaleUIX(_Window_Base_itemPadding.call(this));
	};
	
	Window_Base.prototype.fittingHeight = function(numLines) {
		return numLines * this.itemHeight() + $gameSystem.windowPadding() * 2;
	};
	
	Window_Base.prototype.drawItemName = function(item, x, y, width) {
		if (item) {
			const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
			const textMargin = ImageManager.iconWidth + ScaleUIX(4);
			const itemWidth = Math.max(0, width - textMargin);
			this.resetTextColor();
			this.drawIcon(item.iconIndex, x, iconY);
			this.drawText(item.name, x + textMargin, y, itemWidth);
		}
	};

	Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
		const unitWidth = Math.min(ScaleUIX(80), this.textWidth(unit));
		this.resetTextColor();
		this.drawText(value, x, y, width - unitWidth - ScaleUIX(4), "right");
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(unit, x + width - unitWidth, y, unitWidth, "right");
	};
	
	Window_Base.prototype.refreshDimmerBitmap = function() {
		if (this._dimmerSprite) {
			const bitmap = this._dimmerSprite.bitmap;
			const w = this.width > 0 ? this.width + ScaleUIX(8) : 0;
			const h = this.height;
			const m = this.padding;
			const c1 = ColorManager.dimColor1();
			const c2 = ColorManager.dimColor2();
			bitmap.resize(w, h);
			bitmap.gradientFillRect(0, 0, w, m, c2, c1, true);
			bitmap.fillRect(0, m, w, h - m * 2, c1);
			bitmap.gradientFillRect(0, h - m, w, m, c1, c2, true);
			this._dimmerSprite.setFrame(0, 0, w, h);
		}
	};
	
	// Window Selectable
	const _Window_Selectable_colSpacing = Window_Selectable.prototype.colSpacing;
	Window_Selectable.prototype.colSpacing = function() {
		return ScaleUIX(_Window_Selectable_colSpacing.call(this));
	};

	const _Window_Selectable_rowSpacing = Window_Selectable.prototype.rowSpacing;
	Window_Selectable.prototype.rowSpacing = function() {
		return ScaleUIY(_Window_Selectable_rowSpacing.call(this));
	};

	// Window Status Base
	const _Window_StatusBase_gaugeLineHeight = Window_StatusBase.prototype.gaugeLineHeight;
	Window_StatusBase.prototype.gaugeLineHeight = function() {
		return ScaleUIY(_Window_StatusBase_gaugeLineHeight.call(this));
	};
	
	Window_StatusBase.prototype.drawActorLevel = function(actor, x, y) {
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(TextManager.levelA, x, y, ScaleUIX(48));
		this.resetTextColor();
		this.drawText(actor.level, x + ScaleUIX(84), y, ScaleUIX(36), "right");
	};
	
	Window_StatusBase.prototype.drawActorIcons = function(actor, x, y, width) {
		width = width || 144;
		const iconWidth = ImageManager.iconWidth;
		const icons = actor.allIcons().slice(0, Math.floor(width / iconWidth));
		let iconX = x;
		for (const icon of icons) {
			this.drawIcon(icon, iconX, y + ScaleUIY(2));
			iconX += iconWidth;
		}
	};
	
	Window_StatusBase.prototype.drawActorSimpleStatus = function(actor, x, y) {
		const lineHeight = this.lineHeight();
		const x2 = x + ScaleUIX(180);
		this.drawActorName(actor, x, y);
		this.drawActorLevel(actor, x, y + lineHeight * 1);
		this.drawActorIcons(actor, x, y + lineHeight * 2);
		this.drawActorClass(actor, x2, y);
		this.placeBasicGauges(actor, x2, y + lineHeight);
	};
	
	
	// Window Menu Status
	Window_MenuStatus.prototype.drawItemImage = function(index) {
		const actor = this.actor(index);
		const rect = this.itemRect(index);
		const width = ImageManager.faceWidth;
		const height = rect.height - ScaleUIY(2);
		this.changePaintOpacity(actor.isBattleMember());
		this.drawActorFace(actor, rect.x + ScaleUIX(1), rect.y + ScaleUIY(1), width, height);
		this.changePaintOpacity(true);
	};
	
	Window_MenuStatus.prototype.drawItemStatus = function(index) {
		const actor = this.actor(index);
		const rect = this.itemRect(index);
		const x = rect.x + ScaleUIX(180);
		const y = rect.y + Math.floor(rect.height / 2 - this.lineHeight() * 1.5);
		this.drawActorSimpleStatus(actor, x, y);
	};
	
	// Window Item List
	const _Window_ItemList_colSpacing = Window_ItemList.prototype.colSpacing;
	Window_ItemList.prototype.colSpacing = function() {
		return ScaleUIX(_Window_ItemList_colSpacing.call(this));
	};
	
	// Window Skill Status
	Window_SkillStatus.prototype.refresh = function() {
		Window_StatusBase.prototype.refresh.call(this);
		if (this._actor) {
			const x = this.colSpacing() / 2;
			const h = this.innerHeight;
			const y = h / 2 - this.lineHeight() * 1.5;
			this.drawActorFace(this._actor, x + ScaleUIX(1), 0, ScaleUIX(144), h);
			this.drawActorSimpleStatus(this._actor, x + ScaleUIX(180), y);
		}
	};
	
	// Window Skill List
	const _Window_SkillList_colSpacing = Window_SkillList.prototype.colSpacing;
	Window_SkillList.prototype.colSpacing = function() {
		return ScaleUIX(_Window_SkillList_colSpacing.call(this));
	};
	
	// Window Equip Status
	const _Window_EquipStatus_rightArrowWidth = Window_EquipStatus.prototype.rightArrowWidth;
	Window_EquipStatus.prototype.rightArrowWidth = function() {
		return ScaleUIX(_Window_EquipStatus_rightArrowWidth.call(this));
	};

	const _Window_EquipStatus_paramWidth = Window_EquipStatus.prototype.paramWidth;
	Window_EquipStatus.prototype.paramWidth = function() {
		return ScaleUIX(_Window_EquipStatus_paramWidth.call(this));
	};
	
	// Window Equip Slot
	const _Window_EquipSlot_slotNameWidth = Window_EquipSlot.prototype.slotNameWidth;
	Window_EquipSlot.prototype.slotNameWidth = function() {
		return ScaleUIX(_Window_EquipSlot_slotNameWidth.call(this));
	};
	
	// Window Equip Item
	const _Window_EquipItem_colSpacing = Window_EquipItem.prototype.colSpacing;
	Window_EquipItem.prototype.colSpacing = function() {
		return ScaleUIX(_Window_EquipItem_colSpacing.call(this));
	};
	
	// Window Status
	Window_Status.prototype.drawBlock2 = function() {
		const y = this.block2Y();
		this.drawActorFace(this._actor, ScaleUIX(12), y);
		this.drawBasicInfo(ScaleUIX(204), y);
		this.drawExpInfo(ScaleUIX(456), y);
	};
	
	Window_Status.prototype.drawExpInfo = function(x, y) {
		const lineHeight = this.lineHeight();
		const expTotal = TextManager.expTotal.format(TextManager.exp);
		const expNext = TextManager.expNext.format(TextManager.level);
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(expTotal, x, y + lineHeight * 0, ScaleUIX(270));
		this.drawText(expNext, x, y + lineHeight * 2, ScaleUIX(270));
		this.resetTextColor();
		this.drawText(this.expTotalValue(), x, y + lineHeight * 1, ScaleUIX(270), "right");
		this.drawText(this.expNextValue(), x, y + lineHeight * 3, ScaleUIX(270), "right");
	};
	
	// Window Status Params
	Window_StatusParams.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		const paramId = index + 2;
		const name = TextManager.param(paramId);
		const value = this._actor.param(paramId);
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(name, rect.x, rect.y, ScaleUIX(160));
		this.resetTextColor();
		this.drawText(value, rect.x + ScaleUIX(160), rect.y, ScaleUIX(60), "right");
	};
	
	// Window Status Equip
	Window_StatusEquip.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		const equips = this._actor.equips();
		const item = equips[index];
		const slotName = this.actorSlotName(this._actor, index);
		const sw = ScaleUIX(138);
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(slotName, rect.x, rect.y, sw, rect.height);
		this.drawItemName(item, rect.x + sw, rect.y, rect.width - sw);
	};
	
	// Window Options
	const _Window_Options_statusWidth = Window_Options.prototype.statusWidth;
	Window_Options.prototype.statusWidth = function() {
		return ScaleUIX(_Window_Options_statusWidth.call(this));
	};
	
	// Window Savefile List
	Window_SavefileList.prototype.drawTitle = function(savefileId, x, y) {
		if (savefileId === 0) {
			this.drawText(TextManager.autosave, x, y, ScaleUIX(180));
		} else {
			this.drawText(TextManager.file + " " + savefileId, x, y, ScaleUIX(180));
		}
	};

	Window_SavefileList.prototype.drawContents = function(info, rect) {
		const bottom = rect.y + rect.height;
		if (rect.width >= ScaleUIX(420)) {
			this.drawPartyCharacters(info, rect.x + ScaleUIX(220), bottom - ScaleUIY(8));
		}
		const lineHeight = this.lineHeight();
		const y2 = bottom - lineHeight - ScaleUIY(4);
		if (y2 >= lineHeight) {
			this.drawPlaytime(info, rect.x, y2, rect.width);
		}
	};

	Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y) {
		if (info.characters) {
			let characterX = x;
			for (const data of info.characters) {
				this.drawCharacter(data[0], data[1], characterX, y);
				characterX += ScaleUIX(48);
			}
		}
	};
	
	// Window Shop Buy
	const _Window_ShopBuy_priceWidth = Window_ShopBuy.prototype.priceWidth;
	Window_ShopBuy.prototype.priceWidth = function() {
		return ScaleUIX(_Window_ShopBuy_priceWidth.call(this));
	};
	
	// Window Shop Number
	const _Window_ShopNumber_buttonSpacing = Window_ShopNumber.prototype.buttonSpacing;
	Window_ShopNumber.prototype.buttonSpacing = function() {
		return ScaleUIX(_Window_ShopNumber_buttonSpacing.call(this));
	};
	
	Window_ShopNumber.prototype.drawHorzLine = function() {
		const padding = this.itemPadding();
		const lineHeight = this.lineHeight();
		const itemY = this.itemNameY();
		const totalY = this.totalPriceY();
		const x = padding;
		const y = Math.floor((itemY + totalY + lineHeight) / 2);
		const width = this.innerWidth - padding * 2;
		this.drawRect(x, y, width, ScaleUIY(5));
	};
	
	// Window Name Edit
	Window_NameEdit.prototype.faceWidth = function() {
		return ImageManager.faceWidth;
	};
	
	Window_NameEdit.prototype.left = function() {
		const nameCenter = (this.innerWidth + this.faceWidth()) / 2;
		const nameWidth = (this._maxLength + ScaleUIX(1)) * this.charWidth();
		return Math.min(nameCenter - nameWidth / 2, this.innerWidth - nameWidth);
	};
	
	Window_NameEdit.prototype.itemRect = function(index) {
		const x = this.left() + index * this.charWidth();
		const y = ScaleUIY(54);
		const width = this.charWidth();
		const height = this.lineHeight();
		return new Rectangle(x, y, width, height);
	};
	
	Window_NameEdit.prototype.underlineRect = function(index) {
		const rect = this.itemRect(index);
		rect.x++;
		rect.y += rect.height - ScaleUIY(4);
		rect.width -= ScaleUIX(2);
		rect.height = ScaleUIY(2);
		return rect;
	};
	
	// Window Name Input
	const _Window_NameInput_groupSpacing = Window_NameInput.prototype.groupSpacing;
	Window_NameInput.prototype.groupSpacing = function() {
		return ScaleUIX(_Window_NameInput_groupSpacing.call(this));
	};
	
	// Window Number Input
	Window_NumberInput.prototype.updatePlacement = function() {
		const messageY = this._messageWindow.y;
		const spacing = ScaleUIY(8);
		this.width = this.windowWidth();
		this.height = this.windowHeight();
		this.x = (Graphics.boxWidth - this.width) / 2;
		if (messageY >= Graphics.boxHeight / 2) {
			this.y = messageY - this.height - spacing;
		} else {
			this.y = messageY + this._messageWindow.height + spacing;
		}
	};
	
	Window_NumberInput.prototype.windowHeight = function() {
		if (ConfigManager.touchUI) {
			return this.fittingHeight(1) + this.buttonSpacing() + ScaleUIY(48);
		} else {
			return this.fittingHeight(1);
		}
	};
	
	const _Window_NumberInput_itemWidth = Window_NumberInput.prototype.itemWidth;
	Window_NumberInput.prototype.itemWidth = function() {
		return ScaleUIX(_Window_NumberInput_itemWidth.call(this));
	};
	
	const _Window_NumberInput_buttonSpacing = Window_NumberInput.prototype.buttonSpacing;
	Window_NumberInput.prototype.buttonSpacing = function() {
		return ScaleUIY(_Window_NumberInput_buttonSpacing.call(this));
	};
	
	// Window Event Item
	Window_EventItem.prototype.placeCancelButton = function() {
		if (this._cancelButton) {
			const spacing = ScaleUIY(8);
			const button = this._cancelButton;
			if (this.y === 0) {
				button.y = this.height + spacing;
			} else if (this._messageWindow.y >= Graphics.boxHeight / 4) {
				const distance = this.y - this._messageWindow.y;
				button.y = -button.height - spacing - distance;
			} else {
				button.y = -button.height - spacing;
			}
			button.x = this.width - button.width - spacing;
		}
	};
	
	// Window Message
	Window_Message.prototype.newLineX = function(textState) {
		const faceExists = $gameMessage.faceName() !== "";
		const faceWidth = ImageManager.faceWidth;
		const spacing = ScaleUIX(20);
		const margin = faceExists ? faceWidth + spacing : ScaleUIX(4);
		return textState.rtl ? this.innerWidth - margin : margin;
	};
	
	// Window Battle Status
	const _Window_BattleStatus_extraHeight = Window_BattleStatus.prototype.extraHeight;
	Window_BattleStatus.prototype.extraHeight = function() {
		return ScaleUIY(_Window_BattleStatus_extraHeight.call(this));
	};
	
	Window_BattleStatus.prototype.updatePadding = function() {
		this.padding = ScaleUIX(8);
	};
	
	Window_BattleStatus.prototype.stateIconY = function(rect) {
		return rect.y + ImageManager.iconHeight / 2 + ScaleUIY(4);
	};
})();
