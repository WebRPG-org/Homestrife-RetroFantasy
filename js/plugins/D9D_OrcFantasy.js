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
		this._padding = 4;
		this._margin = 0;
		_Window_initialize.call(this);
	};
	
	Window.prototype.move = function(x, y, width, height) {
		this.x = x || 0;
		this.y = y || 0;
		if (this._width !== width || this._height !== height) {
			this._width = width || 0;
			this._height = height || 0;
			this._refreshAllParts();
		}
	};
	
	Window.prototype._makeCursorAlpha = function() {
		const blinkCount = this._animationCount % 2;
		const baseAlpha = 1;
		if (this.active) {
			if (blinkCount == 0) {
				return baseAlpha;
			} else {
				return 0;
			}
		}
		return baseAlpha;
	};
	
	// Audio Manager
	const _AudioManager_playSe = AudioManager.playSe;
	AudioManager.playSe = function(se) {
		this.stopSe();
		for (const buffer of this._staticBuffers) {
			buffer.stop();
		}
		_AudioManager_playSe.call(this, se);
	}
	
	AudioManager.playStaticSe = function(se) {
		this.stopSe();
		if (se.name) {
			this.loadStaticSe(se);
			for (const buffer of this._staticBuffers) {
				buffer.stop();
				if (buffer.name === se.name) {
					this.updateSeParameters(buffer, se);
					buffer.play(false);
				}
			}
		}
	};
	
	// Game System
	Game_System.prototype.windowPadding = function() {
		return 4;
	};
	
	// Game Battler Base
	const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
	Game_BattlerBase.prototype.initMembers = function() {
		_Game_BattlerBase_initMembers.call(this);
		this._backRow = false;
	};
	
	Game_BattlerBase.prototype.toggleRow = function() {
		this._backRow = !this._backRow;
	};
	
	Game_BattlerBase.prototype.backRow = function() {
		return this._backRow;
	};
	
	// Game Actor
	Game_Actor.prototype.changeExp = function(exp, show) {
		this._exp[this._classId] = Math.max(exp, 0);
		const lastLevel = this._level;
		const lastSkills = this.skills();
		if (show && this._level > lastLevel) {
			this.displayLevelUp(this.findNewSkills(lastSkills));
		}
		this.refresh();
	};
	
	// Game Party
	Game_Party.prototype.swapOrder = function(index1, index2) {
		if(index1 === index2) {
			$gameActors.actor(this._actors[index1]).toggleRow();
		} else {
			const temp = this._actors[index1];
			this._actors[index1] = this._actors[index2];
			this._actors[index2] = temp;
		}
		$gamePlayer.refresh();
	};
	
	// Game Character Base
	Game_CharacterBase.prototype.shiftY = function() {
		return this.isObjectCharacter() ? 0 : 2;
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
	
	// Scene Menu Base
	Scene_MenuBase.prototype.createBackground = function() {
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		this.addChild(this._backgroundSprite);
		this.setBackgroundOpacity(255);
	};
	
	Scene_MenuBase.prototype.helpWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*2;
		const wx = 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Menu
	Scene_Menu.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createGoldWindow();
		this.createCommandWindow();
		this.createStatusWindow();
	};
	
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
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*8;
		const wx = Graphics.boxWidth - ww;
		const wy = this._goldWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Menu.prototype.goldWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight();
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Menu.prototype.statusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*20;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*8;
		const wx = Graphics.boxWidth - ww - this._commandWindow.width;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Item Base
	Scene_ItemBase.prototype.actorWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*20;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*8;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh - Scene_MenuBase.prototype.helpWindowRect().height;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Item
	Scene_Item.prototype.categoryWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*4;
		const wx = Graphics.boxWidth - ww - ($gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22);
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};

	Scene_Item.prototype.itemWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*8;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Skill
	Scene_Skill.prototype.skillTypeWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*3;
		const wx = Graphics.boxWidth - ww - ($gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22);
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Skill.prototype.statusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*20;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*2;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh - ($gameSystem.windowPadding()*4 + $gameMap.tileHeight()*6);
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Skill.prototype.itemWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*6;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Equip
	Scene_Equip.prototype.statusWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*3;
		const wx = 0;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Equip.prototype.commandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*3;
		const wx = Graphics.boxWidth - ww - ($gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*18);
		const wy = this._statusWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Equip.prototype.slotWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*18;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*5;
		const wx = Graphics.boxWidth - ww;
		const wy = this._statusWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Equip.prototype.itemWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*5;
		const wx = Graphics.boxWidth - ww;
		const wy = this._statusWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
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
	
	// Sprite Battler
	Sprite_Battler.prototype.startMove = function(x, y, duration) {
		if (
			this._targetOffsetX !== x || this._targetOffsetY !== y ||
			(duration === 0 && (this._offsetX !== x || this._offsetY !== y))
		) {
			this._targetOffsetX = x;
			this._targetOffsetY = y;
			this._movementDuration = duration;
			if (duration === 0) {
				this._offsetX = x;
				this._offsetY = y;
			}
		}
	};
	
	// Sprite Actor
	Sprite_Actor.prototype.createShadowSprite = function() {
		// do nothing
	};
	
	Sprite_Actor.prototype.updateShadow = function() {
		// do nothing
	};
	
	// Window Base
	Window_Base.prototype.lineHeight = function() {
		return $gameMap.tileHeight();
	};
	
	Window_Base.prototype.itemPadding = function() {
		return 4;
	};
	
	Window_Base.prototype.textWidth = function(text) {
		return this.contents.measureTextWidth(text);
	};
	
	Window_Base.prototype.textWidthFromImage = function(text) {
		return this.contents.measureTextWidthFromImage(text);
	};
	
	Window_Base.prototype.drawItemName = function(item, x, y, width) {
		if (item) {
			const iconY = y;
			const textMargin = ImageManager.iconWidth;
			const itemWidth = Math.max(0, width - textMargin);
			this.resetTextColor();
			this.drawIcon(item.iconIndex, x, iconY);
			this.drawText(item.name, x + textMargin, y, itemWidth);
		}
	};
	
	Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
		const unitWidth = this.textWidthFromImage(unit);
		this.resetTextColor();
		this.drawText(value+"", x, y, width - unitWidth - this.textWidthFromImage("0"), "right");
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(unit, x + width - unitWidth, y, unitWidth, "right");
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
		rect.x -= this.colSpacing() / 2;
		const spriteW = $gameMap.tileWidth()/2;
		rect.x = Math.floor(rect.x / spriteW) * spriteW;
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
	
	// Window Help
	Window_Help.prototype.refresh = function() {
		const rect = this.baseTextRect();
		this.contents.clear();
		this.drawTextEx(this._text, rect.x, rect.y+$gameSystem.windowPadding()*3, rect.width);
	};
	
	// Window Gold
	Window_Gold.prototype.refresh = function() {
		const x = $gameSystem.windowPadding();
		const y = $gameSystem.windowPadding()+$gameMap.tileHeight()/2;
		const width = this.textWidthFromImage("00000000");
		this.contents.clear();
		this.drawCurrencyValue(this.value(), this.currencyUnit(), x, y, width);
	};
	
	// Window Status Base
	Window_StatusBase.prototype.drawActorHpMp = function(actor, x, y, width) {
		width = width || $gameMap.tileWidth()/2*8;
		const lineHeight = this.lineHeight();
		this.drawText("HL", x, y, width);
		this.drawText(actor.hp + " %", x, y, width, "right");
		this.drawText("ST", x, y + lineHeight/2, width);
		this.drawText((100-actor.mp) + " %", x, y + lineHeight/2, width, "right");
	};
	
	Window_StatusBase.prototype.drawActorName = function(actor, x, y, width) {
		width = width || $gameMap.tileWidth()/2*8;
		//this.changeTextColor(ColorManager.hpColor(actor));
		this.drawText(actor.name(), x, y, width);
	};
	
	Window_StatusBase.prototype.drawActorClass = function(actor, x, y, width) {
		width = width || $gameMap.tileWidth()/2*8;
		this.resetTextColor();
		this.drawText(actor.currentClass().name, x, y, width);
	};
	
	Window_StatusBase.prototype.drawActorLevel = function(actor, x, y) {
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(TextManager.levelA, x, y, 48);
		this.resetTextColor();
		this.drawText(actor.level+"", x + 84, y, 36, "right");
	};
	
	Window_StatusBase.prototype.drawActorSkillPoints = function(actor, x, y) {
		const width = this.textWidthFromImage("00000000");
		this.drawText("SP", x, y, width);
		this.drawText(actor.currentExp()+"", x, y, width, "right");
	};
	
	Window_StatusBase.prototype.drawActorIcons = function(actor, x, y, width) {
		width = width || 144;
		const iconWidth = ImageManager.iconWidth;
		const icons = actor.allIcons().slice(0, Math.floor(width / iconWidth));
		let iconX = x;
		for (const icon of icons) {
			this.drawIcon(icon, iconX, y);
			iconX += iconWidth;
		}
	};
	
	Window_StatusBase.prototype.drawSvActor = function(actor, x, y, ignoreRow) {
		if(!ignoreRow) {
			x += actor.backRow() ? 0 : $gameMap.tileWidth()/2;
		}
		width = 16;
		height = 24;
		const bitmap = ImageManager.loadSvActor(actor.battlerName());
		const pw = 16
		const ph = 24;
		const sw = Math.min(width, pw);
		const sh = Math.min(height, ph);
		const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
		const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
		const sx = Math.floor((pw - sw) / 2);
		const sy = Math.floor((ph - sh) / 2);
		this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
	};
	
	Window_StatusBase.prototype.drawActorSimpleStatus = function(actor, x, y) {
		const lineHeight = this.lineHeight();
		const x2 = x + $gameMap.tileWidth()/2*9;
		const x3 = x2 + $gameMap.tileWidth()/2*8;
		this.drawActorName(actor, x, y);
		this.drawActorSkillPoints(actor, x, y + lineHeight/2);
		this.drawActorIcons(actor, x, y + lineHeight);
		this.drawActorClass(actor, x2, y);
		this.drawActorHpMp(actor, x2, y + lineHeight/2);
		this.drawSvActor(actor, x3, y);
	};
	
	// Window Menu Status
	Window_MenuStatus.prototype.itemHeight = function() {
		return $gameMap.tileHeight()/2*4;
	};
	
	Window_MenuStatus.prototype.drawPendingItemBackground = function(index) {
		if (index === this._pendingIndex) {
			const rect = this.itemRect(index);
			const bitmap = ImageManager.loadSystem("Window");
			this.contents.blt(bitmap, 32, 32, 8, 8, rect.x, rect.y);
			this.contents.blt(bitmap, 40, 32, 8, 8, rect.x+rect.width-8, rect.y);
			this.contents.blt(bitmap, 32, 40, 8, 8, rect.x, rect.y+rect.height-8);
			this.contents.blt(bitmap, 40, 40, 8, 8, rect.x+rect.width-8, rect.y+rect.height-8);
		}
	};
	
	Window_MenuStatus.prototype.drawItemImage = function(index) {
		// do nothing
	};
	
	Window_MenuStatus.prototype.drawItemStatus = function(index) {
		const actor = this.actor(index);
		const rect = this.itemRect(index);
		const x = rect.x;
		const y = rect.y;
		this.drawActorSimpleStatus(actor, x + $gameSystem.windowPadding(), y + $gameSystem.windowPadding());
	};
	
	// Window Item Category
	Window_ItemCategory.prototype.maxCols = function() {
		return 1;
	};
	
	// Window Item List
	Window_ItemList.prototype.colSpacing = function() {
		return 4;
	};
	
	Window_ItemList.prototype.drawItem = function(index) {
		const item = this.itemAt(index);
		if (item) {
			const numberWidth = this.numberWidth();
			const rect = this.itemLineRect(index);
			rect.y += $gameSystem.windowPadding();
			//this.changePaintOpacity(this.isEnabled(item));
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
			this.drawItemNumber(item, rect.x, rect.y, rect.width);
			this.changePaintOpacity(1);
		}
	};
	
	Window_ItemList.prototype.numberWidth = function() {
		return this.textWidth("00");
	};
	
	Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
		if (this.needsNumber()) {
			this.drawText($gameParty.numItems(item)+"", x, y, width, "right");
		}
	};
	
	// Window Skill Status
	Window_SkillStatus.prototype.refresh = function() {
		Window_StatusBase.prototype.refresh.call(this);
		if (this._actor) {
			const w = this.innerWidth;
			const h = this.innerHeight;
			const x = this.itemPadding();
			const y = $gameSystem.windowPadding() + $gameMap.tileHeight()/2;
			this.drawActorSimpleStatus(this._actor, x, y);
		}
	};
	
	// Window Skill List
	Window_SkillList.prototype.colSpacing = function() {
		return 4;
	};

	Window_SkillList.prototype.drawItem = function(index) {
		const skill = this.itemAt(index);
		if (skill) {
			const costWidth = this.costWidth();
			const rect = this.itemLineRect(index);
			rect.y += $gameSystem.windowPadding();
			//this.changePaintOpacity(this.isEnabled(skill));
			this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth);
			this.drawSkillCost(skill, rect.x, rect.y, rect.width);
			this.changePaintOpacity(1);
		}
	};

	Window_SkillList.prototype.costWidth = function() {
		return this.textWidth("00");
	};

	Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
		if (this._actor.skillTpCost(skill) > 0) {
			this.changeTextColor(ColorManager.tpCostColor());
			this.drawText(this._actor.skillTpCost(skill)+"", x, y, width, "right");
		} else if (this._actor.skillMpCost(skill) > 0) {
			this.changeTextColor(ColorManager.mpCostColor());
			this.drawText(this._actor.skillMpCost(skill)+"", x, y, width, "right");
		}
	};
	
	// Window Equip Status
	Window_EquipStatus.prototype.colSpacing = function() {
		return 4;
	};
	
	Window_EquipStatus.prototype.refresh = function() {
		this.contents.clear();
		if (this._actor) {
			const nameRect = this.itemLineRect(0);
			const x = $gameSystem.windowPadding();
			const y = $gameSystem.windowPadding();
			const textWidth = $gameMap.tileWidth()/2*8;
			const lineHeight = this.lineHeight()/2;
			this.drawActorName(this._actor, x, y, textWidth);
			this.drawSvActor(this._actor, x+$gameMap.tileWidth()/2*2, y + lineHeight*2, true);
			this.drawAllParams(x+$gameMap.tileWidth()/2*6, y);
		}
	};
	
	Window_EquipStatus.prototype.drawAllParams = function(x, y) {
		const textWidth = $gameMap.tileWidth()/2*8;
		const x2 = x + $gameMap.tileWidth()/2*9;
		const x3 = x2 + $gameMap.tileWidth()/2*9;
		const x4 = x3 + $gameMap.tileWidth()/2*9;
		const plusMinusWidth = textWidth - $gameMap.tileWidth()/2*3;
		const lineHeight = this.lineHeight()/2;
		
		const tempActor = this._tempActor ? this._tempActor : this._actor;
		
		this.drawNameAndValue(x, y+lineHeight*2, "TGH", this._actor.param(5), tempActor.param(5));
		this.drawNameAndValue(x, y+lineHeight*3, "MGC", this._actor.param(4), tempActor.param(4));
		this.drawNameAndValue(x, y+lineHeight*4, "SPD", this._actor.param(6), tempActor.param(6));
		this.drawNameAndValue(x, y+lineHeight*5, "RCV", this._actor.param(7), tempActor.param(7));
		
		this.drawNameAndValue(x2, y, "ATK", this._actor.param(2), tempActor.param(2));
		this.drawNameAndValue(x2, y+lineHeight*2, "ACC", Math.floor(this._actor.xparam(0)*100), Math.floor(tempActor.xparam(0)*100));
		this.drawText("TYP", x2, y+lineHeight*4, textWidth);
		
		this.drawNameAndValue(x3, y, "DEF", this._actor.param(3), tempActor.param(3));
		this.drawNameAndValue(x3, y+lineHeight*2, "EVA", Math.floor(this._actor.xparam(1)*100), Math.floor(tempActor.xparam(1)*100));
		this.drawNameAndValue(x3, y+lineHeight*3, "CVR", Math.floor(this._actor.xparam(3)*100), Math.floor(tempActor.xparam(3)*100));
		this.drawText("RES", x3, y+lineHeight*4, textWidth);
	};
	
	Window_EquipStatus.prototype.drawNameAndValue = function(x, y, name, curValue, newValue) {
		const textWidth = $gameMap.tileWidth()/2*8;
		const plusMinusWidth = textWidth - $gameMap.tileWidth()/2*3;
		this.drawText(name, x, y, textWidth);
		this.drawText(newValue+"", x, y, textWidth, "right");
		if (this._tempActor) {
			let symbol = "";
			if(newValue > curValue) {
				symbol = "+";
			} else if(newValue < curValue) {
				symbol = "-";
			}				
			this.drawText(symbol, x, y, plusMinusWidth, "right");
			this.drawText(newValue+"", x, y, textWidth, "right");
		}
	};
	
	Window_EquipStatus.prototype.drawItem = function(x, y, paramId) {
		const paramX = this.paramX();
		const paramWidth = this.paramWidth();
		const rightArrowWidth = this.rightArrowWidth();
		this.drawParamName(x, y, paramId);
		if (this._actor) {
			this.drawCurrentParam(paramX, y, paramId);
		}
		this.drawRightArrow(paramX + paramWidth, y);
		if (this._tempActor) {
			this.drawNewParam(paramX + paramWidth + rightArrowWidth, y, paramId);
		}
	};

	Window_EquipStatus.prototype.drawParamName = function(x, y, paramId) {
		const width = this.paramX() - this.itemPadding() * 2;
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(TextManager.param(paramId), x, y, width);
	};

	Window_EquipStatus.prototype.drawCurrentParam = function(x, y, paramId) {
		const paramWidth = this.paramWidth();
		this.resetTextColor();
		this.drawText(this._actor.param(paramId), x, y, paramWidth, "right");
	};

	Window_EquipStatus.prototype.drawRightArrow = function(x, y) {
		const rightArrowWidth = this.rightArrowWidth();
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("\u2192", x, y, rightArrowWidth, "center");
	};

	Window_EquipStatus.prototype.drawNewParam = function(x, y, paramId) {
		const paramWidth = this.paramWidth();
		const newValue = this._tempActor.param(paramId);
		const diffvalue = newValue - this._actor.param(paramId);
		this.changeTextColor(ColorManager.paramchangeTextColor(diffvalue));
		this.drawText(newValue, x, y, paramWidth, "right");
	};
	
	// Window Equip Command
	Window_EquipCommand.prototype.maxCols = function() {
		return 1;
	};
	
	// Window Equip Slot
	Window_EquipSlot.prototype.maxCols = function() {
		return 2;
	};
	
	Window_EquipSlot.prototype.colSpacing = function() {
		return 4;
	};
	
	Window_EquipSlot.prototype.drawItem = function(index) {
		if (this._actor) {
			const item = this.itemAt(index);
			const rect = this.itemLineRect(index);
			rect.y += $gameSystem.windowPadding();
			//this.changeTextColor(ColorManager.systemColor());
			//this.changePaintOpacity(this.isEnabled(index));
			if(item === null) {
				const slotName = this.actorSlotName(this._actor, index);
				this.drawText(slotName, rect.x, rect.y, rect.width);
			} else {
				this.drawItemName(item, rect.x, rect.y, rect.width);
			}
			this.changePaintOpacity(true);
		}
	};
	
	
	// Window Equip Item
	Window_EquipItem.prototype.maxCols = function() {
		return 2;
	};

	Window_EquipItem.prototype.colSpacing = function() {
		return 4;
	};
})();
