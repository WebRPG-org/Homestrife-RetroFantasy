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
	
	Window.prototype._updatePauseSign = function() {
		const sprite = this._pauseSignSprite;
		const x = Math.floor(this._animationCount / 16) % 2;
		const y = Math.floor(this._animationCount / 16 / 2) % 2;
		const sx = 48;
		const sy = 32;
		const p = 8;
		if (!this.pause) {
			sprite.alpha = 0;
		} else if (sprite.alpha < 1) {
			sprite.alpha = 1;
		}
		sprite.setFrame(sx + x * p, sy + y * p, p, p);
		sprite.visible = this.isOpen();
	};
	
	// Data Manager
	const _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
	DataManager.makeSavefileInfo = function() {
		const info = _DataManager_makeSavefileInfo.call(this);
		info.svActors = $gameParty.svActorsForSavefile();
		return info;
	};
	
	DataManager.parseNotes = function() {
		for(const weapon of $dataWeapons) {
			if(!weapon) { continue; }
			weapon.d9dInfo = weapon.note && weapon.note.length > 0 ? JSON.parse(weapon.note) : {};
		}
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
	
	// Color Manager
	ColorManager.textColor = function(n) {
		const px = 32 + (n % 8) * 4 + 2;
		const py = 48 + Math.floor(n / 8) * 4 + 2;
		return this._windowskin.getPixel(px, py);
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
		this._skillLevels = {};
		// performance
		this._skillLevels.MeleeAcc = 0;
		this._skillLevels.RangeAcc = 0;
		this._skillLevels.Evasion  = 0;
		this._skillLevels.Balance  = 0;
		this._skillLevels.Agility  = 0;
		this._skillLevels.Focus    = 0;
		// universal ability
		this._skillLevels.MeleeWpn = 0;
		this._skillLevels.ThrowWpn = 0;
		this._skillLevels.RangeWpn = 0;
		this._skillLevels.Unarmed  = 0;
		// unique ability
		this._skillLevels.Tactics  = 0;
		this._skillLevels.Engineer = 0;
		this._skillLevels.Stealth  = 0;
		this._skillLevels.Wayfind  = 0;
		this._skillLevels.WhiteMgc = 0;
		this._skillLevels.Clairvoy = 0;
		this._skillLevels.GrayMagc = 0;
		this._skillLevels.SpellSwd = 0;
		this._skillLevels.BlackMgc = 0;
		this._skillLevels.DevilEye = 0;
		this._skillLevels.IronBody = 0;
		this._skillLevels.Spirit   = 0;
	};
	
	Game_BattlerBase.prototype.skillLevel = function(skillName) {
		const returnVal = this._skillLevels[skillName];
		return returnVal === undefined ? 0 : returnVal;
	};
	
	Game_BattlerBase.prototype.nextSkillLevelCost = function(skillName) {
		const nextSkillLevel = this.skillLevel(skillName) + 1;
		if(nextSkillLevel > 9) { return 0; }
		return nextSkillLevel * nextSkillLevel * 10;
	};
	
	Game_BattlerBase.prototype.setSkillLevel = function(skillName, newLevel) {
		if(this._skillLevels[skillName] !== undefined) { this._skillLevels[skillName] = Math.max(0, Math.min(9, newLevel)); }
	};
	
	Game_BattlerBase.prototype.incrementSkillLevel = function(skillName) {
		if(this._skillLevels[skillName] !== undefined) { this.setSkillLevel(skillName, this._skillLevels[skillName]+1); }
	};
	
	Game_BattlerBase.prototype.decrementSkillLevel = function(skillName) {
		if(this._skillLevels[skillName] !== undefined) { this.setSkillLevel(skillName, this._skillLevels[skillName]-1); }
	};
	
	Game_BattlerBase.prototype.canPurchaseNextSkillLevel = function(skillName) {
		return false;
	};
	
	Game_BattlerBase.prototype.purchaseNextSkillLevel = function(skillName) {
		this.incrementSkillLevel(skillName);
	};
	
	Game_BattlerBase.prototype.refundSkillLevels = function(skillName) {
		this.setSkillLevel(skillName, 0);
	};
	
	Game_BattlerBase.prototype.toggleRow = function() {
		this._backRow = !this._backRow;
	};
	
	Game_BattlerBase.prototype.backRow = function() {
		return this._backRow;
	};
	
	const _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
	Game_BattlerBase.prototype.param = function(paramId) {
		let paramTotal = _Game_BattlerBase_param.call(this, paramId);
		switch(paramId) {
			case 4: //toughness
				paramTotal += this.skillLevel("IronBody");
				break;
			case 5: //balance
				paramTotal += this.skillLevel("Balance");
				break;
			case 6: //agility
				paramTotal += this.skillLevel("Agility");
				break;
			case 7: //focus
				paramTotal += this.skillLevel("Focus");
				break;
		}
		return paramTotal;
	};
	
	const _Game_BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
	Game_BattlerBase.prototype.xparam = function(xparamId) {
		let xparamTotal = _Game_BattlerBase_xparam.call(this, xparamId);
		switch(xparamId) {
			case 0: //melee accuracy
				xparamTotal += this.skillLevel("MeleeAcc")/100;
				break;
			case 1: //evasion
				xparamTotal += this.skillLevel("Defense")/100;
				break;
			case 2: //range accuracy
			case 4: //special accuracy
				xparamTotal += this.skillLevel("RangeAcc")/100;
				break;
		}
		return xparamTotal;
	};
	
	// Game Actor
	const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_Game_Actor_initMembers.call(this);
		this._justEquipped = null;
	};
	
	Game_Actor.prototype.changeExp = function(exp, show) {
		this._exp[this._classId] = Math.max(exp, 0);
		const lastLevel = this._level;
		const lastSkills = this.skills();
		if (show && this._level > lastLevel) {
			this.displayLevelUp(this.findNewSkills(lastSkills));
		}
		this.refresh();
	};
	
	Game_Actor.prototype.weaponTypes = function() {
		return this.weapons().map(weapon => weapon.wtypeId).filter((value, index, self) => self.indexOf(value) === index);
	};
	
	Game_Actor.prototype.canPurchaseNextSkillLevel = function(skillName) {
		const nextSkillLevelCost = this.nextSkillLevelCost(skillName);
		return nextSkillLevelCost > 0 && this._exp[this._classId] >= nextSkillLevelCost;
	};
	
	Game_Actor.prototype.purchaseNextSkillLevel = function(skillName) {
		if(!this.canPurchaseNextSkillLevel()) { return; }
		this._exp[this._classId] -= this.nextSkillLevelCost(skillName);
		Game_BattlerBase.prototype.purchaseNextSkillLevel.call(this, skillName);
	};
	
	Game_Actor.prototype.refundSkillLevels = function(skillName) {
		while (this.skillLevel(skillName) > 0) {
			this.decrementSkillLevel(skillName);
			this._exp[this._classId] += this.nextSkillLevelCost(skillName);
		}
	};
	
	Game_Actor.prototype.changeEquip = function(slotId, item) {
		if (
			this.tradeItemWithParty(item, this.equips()[slotId]) &&
			(!item || this.correctEType(item, this.equipSlots()[slotId]))
		) {
			this._equips[slotId].setObject(item);
			this._justEquipped = item;
			this.refresh();
		}
	};
	
	Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
		this._equips[slotId].setObject(item);
		this._justEquipped = item;
		this.releaseUnequippableItems(true);
		this.refresh();
	};
	
	Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
		for (;;) {
			const slots = this.equipSlots();
			const equips = this.equips();
			let changed = false;
			for (let i = 0; i < equips.length; i++) {
				const item = equips[i];
				if (item && (!this.canEquip(item) || !this.correctEType(item, slots[i]) || this.shouldReleaseEquipDueToOtherItem(item))) {
					if (!forcing) {
						this.tradeItemWithParty(null, item);
					}
					this._equips[i].setObject(null);
					changed = true;
				}
			}
			if (!changed) {
				break;
			}
		}
		this._justEquipped = null;
	};
	
	Game_Actor.prototype.correctEType = function(item, slot) {
		return item.etypeId === slot ||
			(item.etypeId === 9 && slot === 10) ||
			(item.etypeId === 10 && slot === 9);
	};
	
	Game_Actor.prototype.shouldReleaseEquipDueToOtherItem = function(item) {
		if(
			this._justEquipped &&
			((item.etypeId === 1 && this._justEquipped.etypeId === 1) || (item.etypeId > 1 && this._justEquipped.etypeId > 1))
			&& item.id === this._justEquipped.id
		) {
			return false;
		}
		const equips = this.equips();
		return (this.isTwoHanded(item) && equips[1]) || (item.etypeId === 2 && this.isTwoHanded(equips[0]));
	};
	
	Game_Actor.prototype.isTwoHanded = function(item) {
		return item && item.wtypeId && item.wtypeId % 3 != 1;
	};
	
	Game_Actor.prototype.paramPlus = function(paramId) {
		let value = Game_Battler.prototype.paramPlus.call(this, paramId);
		const equips = this.equips();
		for (let i = 0; i < equips.length; i++) {
			if(paramId === 3 && i <= 1) { continue; }
			const item = equips[i];
			if (item) {
				value += item.params[paramId];
			}
		}
		return value;
	};
	
	Game_Actor.prototype.shieldDefense = function() {
		let value = 0;
		const equips = this.equips();
		for (let i = 0; i < equips.length; i++) {
			if(i > 1) { continue; }
			const item = equips[i];
			if (item) {
				value += item.params[3];
			}
		}
		return value;
	};
	
	Game_Actor.prototype.performAttack = function() {
		const weapons = this.weapons();
		const weapon = weapons[0];
		if(weapon && weapon.d9dInfo.image !== undefined && weapon.d9dInfo.motions !== undefined) {
			// TODO: base motion on attack type
			this.requestMotion(weapon.d9dInfo.motions[0]);
			this.startWeaponAnimation(weapon.d9dInfo.image);
		} else {
			const wtypeId = weapon ? weapon.wtypeId : 0;
			const attackMotion = $dataSystem.attackMotions[wtypeId];
			if (attackMotion) {
				if (attackMotion.type === 0) {
					this.requestMotion("thrust");
				} else if (attackMotion.type === 1) {
					this.requestMotion("swing");
				} else if (attackMotion.type === 2) {
					this.requestMotion("missile");
				}
				this.startWeaponAnimation(attackMotion.weaponImageId);
			}
		}
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
	
	Game_Party.prototype.svActorsForSavefile = function() {
		return this.battleMembers().map(actor => actor.battlerName());
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
	
	Scene_Boot.prototype.onDatabaseLoaded = function() {
		DataManager.parseNotes();
		this.setEncryptionInfo();
		this.loadSystemImages();
		this.loadPlayerData();
		this.loadGameFonts();
	};
	
	// Scene Title
	Scene_Title.prototype.update = function() {
		if (!this.isBusy() && !this._commandWindow.visible) {
			this._commandWindow.show();
			this._commandWindow.refresh();
		}
		Scene_Base.prototype.update.call(this);
	};

	Scene_Title.prototype.isBusy = function() {
		return Scene_Base.prototype.isBusy.call(this);
	};
	
	Scene_Title.prototype.commandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*3;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Title.prototype.commandNewGame = function() {
		DataManager.setupNewGame();
		this.fadeOutAll();
		SceneManager.goto(Scene_Map);
	};

	Scene_Title.prototype.commandContinue = function() {
		SceneManager.push(Scene_Load);
	};

	Scene_Title.prototype.commandOptions = function() {
		SceneManager.push(Scene_Options);
	};
	
	// Scene Message
	Scene_Message.prototype.messageWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*4;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Map
	Scene_Map.prototype.createMenuButton = function() {
		this._menuButton = new Sprite_Button("menu");
		this._menuButton.x = Graphics.boxWidth - this._menuButton.width;
		this._menuButton.y = this.buttonY();
		this._menuButton.visible = false;
		this.addWindow(this._menuButton);
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
	
	Scene_MenuBase.prototype.createCancelButton = function() {
		this._cancelButton = new Sprite_Button("cancel");
		this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width;
		this._cancelButton.y = this.buttonY();
		this.addWindow(this._cancelButton);
	};

	Scene_MenuBase.prototype.createPageButtons = function() {
		this._pageupButton = new Sprite_Button("pageup");
		this._pageupButton.x = 0;
		this._pageupButton.y = this.buttonY();
		const pageupRight = this._pageupButton.x + this._pageupButton.width;
		this._pagedownButton = new Sprite_Button("pagedown");
		this._pagedownButton.x = pageupRight;
		this._pagedownButton.y = this.buttonY();
		this.addWindow(this._pageupButton);
		this.addWindow(this._pagedownButton);
		this._pageupButton.setClickHandler(this.previousActor.bind(this));
		this._pagedownButton.setClickHandler(this.nextActor.bind(this));
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
		commandWindow.setHandler("skillLevels", this.commandPersonal.bind(this));
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
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
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
	
	Scene_Menu.prototype.onPersonalOk = function() {
		switch (this._commandWindow.currentSymbol()) {
			case "skill":
				SceneManager.push(Scene_Skill);
				break;
			case "equip":
				SceneManager.push(Scene_Equip);
				break;
			case "skillLevels":
				SceneManager.push(Scene_SkillLevels);
				break;
			case "status":
				SceneManager.push(Scene_Status);
				break;
		}
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
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Skill
	Scene_Skill.prototype.skillTypeWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*5;
		const wx = Graphics.boxWidth - ww - ($gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22);
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Skill.prototype.statusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
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
	
	// Scene Skill Levels
	function Scene_SkillLevels() {
		this.initialize(...arguments);
	}

	Scene_SkillLevels.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_SkillLevels.prototype.constructor = Scene_SkillLevels;

	Scene_SkillLevels.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_SkillLevels.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createHelpWindow();
		this.createSkillsWindow();
		this.createSkillsStatusWindow();
		this.createSkillsConfirmWindow();
		this.refreshActor();
	};
	
	Scene_SkillLevels.prototype.createSkillsWindow = function() {
		const rect = this.skillsWindowRect();
		this._skillsWindow = new Window_SkillLevels(rect);
		this._skillsWindow.setHelpWindow(this._helpWindow);
		this._skillsWindow.setHandler("ok", this.onSkillOk.bind(this));
		this._skillsWindow.setHandler("cancel", this.popScene.bind(this));
		this._skillsWindow.setHandler("pagedown", this.nextActor.bind(this));
		this._skillsWindow.setHandler("pageup", this.previousActor.bind(this));
		this.addWindow(this._skillsWindow);
	};

	Scene_SkillLevels.prototype.skillsWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_SkillLevels.prototype.createSkillsStatusWindow = function() {
		const rect = this.skillsStatusWindowRect();
		this._skillsStatusWindow = new Window_SkillLevelsStatus(rect);
		this.addWindow(this._skillsStatusWindow);
		this._skillsWindow.setSkillsStatusWindow(this._skillsStatusWindow);
	};

	Scene_SkillLevels.prototype.skillsStatusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*4;
		const wx = Graphics.boxWidth - ww - this._skillsWindow.width;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_SkillLevels.prototype.createSkillsConfirmWindow = function() {
		const rect = this.skillsConfirmWindowRect();
		this._skillsConfirmWindow = new Window_SkillLevelsConfirm(rect);
		this._skillsConfirmWindow.setHandler("cancel", this.onSkillUpgradeCancel.bind(this));
		this._skillsConfirmWindow.setHandler("upgrade", this.onSkillUpgrade.bind(this));
		this._skillsConfirmWindow.setHandler("refund", this.onSkillRefund.bind(this));
		this.addWindow(this._skillsConfirmWindow);
		this._skillsConfirmWindow.hide();
		this._skillsWindow.setSkillsConfirmWindow(this._skillsConfirmWindow);
	};

	Scene_SkillLevels.prototype.skillsConfirmWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*3;
		const wx = Graphics.boxWidth - ww - this._skillsWindow.width;
		const wy = this._skillsStatusWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_SkillLevels.prototype.refreshActor = function() {
		const actor = this.actor();
		this._skillsWindow.setActor(actor);
		this._skillsStatusWindow.setActor(actor);
	};
	
	Scene_SkillLevels.prototype.onSkillOk = function() {
		this._skillsWindow.deactivate();
		this._skillsConfirmWindow.activate();
		this._skillsConfirmWindow.show();
		this._skillsConfirmWindow.select(0);
	};
	
	Scene_SkillLevels.prototype.onSkillUpgradeCancel = function() {
		this.exitSkillsCofirmWindow();
	};
	
	Scene_SkillLevels.prototype.onSkillUpgrade = function() {
		if(this._skillsWindow.canPurchaseNextSkillLevel()) {
			this._skillsWindow.purchaseNextSkillLevel();
			this.exitSkillsCofirmWindow();
		}
	};
	
	Scene_SkillLevels.prototype.onSkillRefund = function() {
		if($gameSystem.isSaveEnabled()) {
			this._skillsWindow.refundSkillLevels();
			this.exitSkillsCofirmWindow();
		}
	};
	
	Scene_SkillLevels.prototype.exitSkillsCofirmWindow = function() {
		this._skillsWindow.activate();
		this._skillsConfirmWindow.deactivate();
		this._skillsConfirmWindow.hide();
	};
	
	Scene_SkillLevels.prototype.onActorChange = function() {
		Scene_MenuBase.prototype.onActorChange.call(this);
		this.refreshActor();
		this._skillsWindow.activate();
		this._skillsConfirmWindow.deactivate();
		this._skillsConfirmWindow.hide();
	};
	
	// Scene Status
	Scene_Status.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createStatusWindow();
	};
	
	Scene_Status.prototype.statusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()*13;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*10;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Status.prototype.refreshActor = function() {
		const actor = this.actor();
		this._statusWindow.setActor(actor);
	};
	
	// Scene Options
	Scene_Options.prototype.optionsWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()*11;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*7;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene File
	Scene_File.prototype.helpWindowRect = function() {
		return Scene_MenuBase.prototype.helpWindowRect.call(this);
	};
	
	Scene_File.prototype.listWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = 0;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Save
	Scene_Save.prototype.helpWindowText = function() {
		return "Choose a file to save the game\nto.";
	};
	
	Scene_GameEnd.prototype.createBackground = function() {
		Scene_MenuBase.prototype.createBackground.call(this);
	};
	
	// Scene Load
	Scene_Load.prototype.helpWindowText = function() {
		return "Choose a file to load the game\nfrom.";
	};
	
	// Scene Game End
	Scene_GameEnd.prototype.stop = function() {
		Scene_MenuBase.prototype.stop.call(this);
	};
	
	Scene_GameEnd.prototype.commandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*2;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Shop
	Scene_Shop.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	
	Scene_Shop.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createHelpWindow();
		this.createStatusWindow();
		this.createBuyWindow();
		this.createGoldWindow();
		this.createCommandWindow();
		this.createCategoryWindow();
		this.createSellWindow();
		this.createNumberWindow();
	};
	
	Scene_Shop.prototype.createStatusWindow = function() {
		const rect = this.statusWindowRect();
		this._statusWindow = new Window_ShopStatus(rect);
		this.addWindow(this._statusWindow);
	};
	
	Scene_Shop.prototype.statusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*12;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Shop.prototype.numberWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = this._statusWindow.x - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Shop.prototype.createBuyWindow = function() {
		const rect = this.buyWindowRect();
		this._buyWindow = new Window_ShopBuy(rect);
		this._buyWindow.setupGoods(this._goods);
		this._buyWindow.setHelpWindow(this._helpWindow);
		this._buyWindow.setStatusWindow(this._statusWindow);
		this._buyWindow.setHandler("ok", this.onBuyOk.bind(this));
		this._buyWindow.setHandler("cancel", this.onBuyCancel.bind(this));
		this.addWindow(this._buyWindow);
		this._buyWindow.deselect();
	};
	
	Scene_Shop.prototype.buyWindowRect = function() {
		return this.numberWindowRect();
	};
	
	Scene_Shop.prototype.goldWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight();
		const wx = this._buyWindow.x - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Shop.prototype.createCommandWindow = function() {
		const rect = this.commandWindowRect();
		this._commandWindow = new Window_ShopCommand(rect);
		this._commandWindow.setPurchaseOnly(this._purchaseOnly);
		this._commandWindow.setHandler("buy", this.commandBuy.bind(this));
		this._commandWindow.setHandler("sell", this.commandSell.bind(this));
		this._commandWindow.setHandler("cancel", this.popScene.bind(this));
		this.addWindow(this._commandWindow);
	};
	
	Scene_Shop.prototype.commandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*3;
		const wx = this._buyWindow.x - ww;
		const wy = this._goldWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Shop.prototype.categoryWindowRect = function() {
		return this.commandWindowRect();
	};
	
	Scene_Shop.prototype.sellWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = Graphics.boxWidth - ww;
		const wy = this._helpWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Shop.prototype.activateBuyWindow = function() {
		this._buyWindow.setMoney(this.money());
		this._buyWindow.activate();
	};
	
	Scene_Shop.prototype.commandBuy = function() {
		this.activateBuyWindow();
		this._buyWindow.select(0);
	};

	Scene_Shop.prototype.commandSell = function() {
		this._buyWindow.hide();
		this._statusWindow.hide();
		this._sellWindow.show();
		this._sellWindow.deselect();
		this._sellWindow.refresh();
		if (this._categoryWindow.needsSelection()) {
			this._categoryWindow.show();
			this._categoryWindow.activate();
		} else {
			this.onCategoryOk();
		}
	};
	
	Scene_Shop.prototype.onBuyOk = function() {
		this._item = this._buyWindow.item();
		this._numberWindow.setup(this._item, this.maxBuy(), this.buyingPrice(), this.money());
		this._numberWindow.setCurrencyUnit(this.currencyUnit());
		this._numberWindow.show();
		this._numberWindow.activate();
	};
	
	Scene_Shop.prototype.onBuyCancel = function() {
		this._commandWindow.activate();
		this._statusWindow.setItem(null);
		this._helpWindow.clear();
		this._buyWindow.deselect();
		this._buyWindow.scrollTo(0, 0);
	};
	
	Scene_Shop.prototype.onCategoryCancel = function() {
		this._commandWindow.activate();
		this._categoryWindow.hide();
		this._sellWindow.hide();
		this._buyWindow.show();
		this._statusWindow.show();
	};
	
	Scene_Shop.prototype.onSellOk = function() {
		this._item = this._sellWindow.item();
		this._categoryWindow.hide();
		this._sellWindow.hide();
		this._numberWindow.setup(this._item, this.maxSell(), this.sellingPrice(), this.money(), true);
		this._numberWindow.setCurrencyUnit(this.currencyUnit());
		this._numberWindow.show();
		this._numberWindow.activate();
		this._statusWindow.setItem(this._item);
		this._statusWindow.show();
	};
	
	// Scene name
	Scene_Name.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this._actor = $gameActors.actor(this._actorId);
		this.createInputWindow();
		this.createEditWindow();
	};
	
	Scene_Name.prototype.createInputWindow = function() {
		const rect = this.inputWindowRect();
		this._inputWindow = new Window_NameInput(rect);
		this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
		this.addWindow(this._inputWindow);
	};
	
	Scene_Name.prototype.inputWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()*10;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*9;
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Name.prototype.createEditWindow = function() {
		const rect = this.editWindowRect();
		this._editWindow = new Window_NameEdit(rect);
		this._editWindow.setup(this._actor, this._maxLength);
		this.addWindow(this._editWindow);
		this._inputWindow.setEditWindow(this._editWindow);
	};
	
	Scene_Name.prototype.editWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()*10;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()*2;
		const wx = Graphics.boxWidth - ww;
		const wy = this._inputWindow.y - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene Battle
	Scene_Battle.prototype.stop = function() {
		Scene_Message.prototype.stop.call(this);
		if (this.needsSlowFadeOut()) {
			this.startFadeOut(this.slowFadeSpeed(), false);
		} else {
			this.startFadeOut(this.fadeSpeed(), false);
		}
		this._partyCommandWindow.close();
		this._actorCommandWindow.close();
	};
	
	Scene_Battle.prototype.updateStatusWindowVisibility = function() {
		this.updateStatusWindowPosition();
	};
	
	Scene_Battle.prototype.statusWindowX = function() {
		return 0;
	};
	
	Scene_Battle.prototype.createAllWindows = function() {
		this.createLogWindow();
		this.createStatusWindow();
		this.createPartyCommandWindow();
		this.createActorCommandWindow();
		this.createHelpWindow();
		this.createSkillWindow();
		this.createItemWindow();
		this.createActorWindow();
		this.createEnemyWindow();
		Scene_Message.prototype.createAllWindows.call(this);
	};
	
	Scene_Battle.prototype.statusWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*28;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*5;
		const wx = 0;
		const wy = Graphics.boxHeight-wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.partyCommandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*6;
		const wx = 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.actorCommandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*6;
		const wx = 0;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.createHelpWindow = function() {
		const rect = this.helpWindowRect();
		this._helpWindow = new Window_Help(rect);
		this._helpWindow.setForBattle(true);
		this._helpWindow.hide();
		this.addWindow(this._helpWindow);
	};
	
	Scene_Battle.prototype.helpWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*3;
		const wx = 0;
		const wy = 0;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.skillWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*22;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*6;
		const wx = 0;
		const wy = Graphics.boxHeight-wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.enemyWindowRect = function() {
		return this.skillWindowRect();
	};
	
	Scene_Battle.prototype.startPartyCommandSelection = function() {
		this._statusWindow.deselect();
		this._actorCommandWindow.setup(null);
		this._actorCommandWindow.close();
		this._partyCommandWindow.setup();
	};
	
	Scene_Battle.prototype.startActorCommandSelection = function() {
		this._statusWindow.selectActor(BattleManager.actor());
		this._partyCommandWindow.close();
		this._actorCommandWindow.show();
		this._actorCommandWindow.setup(BattleManager.actor());
	};
	
	Scene_Battle.prototype.commandSkill = function() {
		this._skillWindow.setActor(BattleManager.actor());
		this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
		this._skillWindow.refresh();
		this._skillWindow.show();
		this._skillWindow.activate();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.commandItem = function() {
		this._itemWindow.refresh();
		this._itemWindow.show();
		this._itemWindow.activate();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.startEnemySelection = function() {
		this._enemyWindow.refresh();
		this._enemyWindow.show();
		this._enemyWindow.select(0);
		this._enemyWindow.activate();
	};
	
	Scene_Battle.prototype.onEnemyCancel = function() {
		this._enemyWindow.hide();
		switch (this._actorCommandWindow.currentSymbol()) {
			case "attack":
				this._actorCommandWindow.activate();
				break;
			case "skill":
				this._skillWindow.show();
				this._skillWindow.activate();
				break;
			case "item":
				this._itemWindow.show();
				this._itemWindow.activate();
				break;
		}
	};
	
	Scene_Battle.prototype.onSkillCancel = function() {
		this._skillWindow.hide();
		this._actorCommandWindow.show();
		this._actorCommandWindow.activate();
	};
	
	Scene_Battle.prototype.onItemCancel = function() {
		this._itemWindow.hide();
		this._actorCommandWindow.show();
		this._actorCommandWindow.activate();
	};
	
	Scene_Battle.prototype.endCommandSelection = function() {
		this.closeCommandWindows();
		this.hideSubInputWindows();
		this._statusWindow.deselect();
	};
	
	// Sprite Button
	Sprite_Button.prototype.updateOpacity = function() {
		this.opacity = 255;
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
	
	Sprite_Battler.prototype.updateSelectionEffect = function() {
		// do nothing
	};
	
	// Sprite Actor
	Sprite_Actor.prototype.initMembers = function() {
		Sprite_Battler.prototype.initMembers.call(this);
		this._battlerName = "";
		this._motion = null;
		this._motionCount = 0;
		this._motionType = null;
		this._pattern = 0;
		this._idleWeaponImageId = 0;
		this.createShadowSprite();
		this.createWeaponSprite();
		this.createMainSprite();
		this.createWeaponOverlaySprite();
		this.createStateSprite();
	};
	
	Sprite_Actor.prototype.createShadowSprite = function() {
		// do nothing
	};
	
	Sprite_Actor.prototype.createWeaponOverlaySprite = function() {
		this._weaponOverlaySprite = new Sprite_Weapon();
		this.addChild(this._weaponOverlaySprite);
	};
	
	Sprite_Actor.prototype.updateShadow = function() {
		// do nothing
	};
	
	Sprite_Actor.prototype.moveToStartPosition = function() {
		const spriteW = $gameMap.tileWidth()/2;
		this.startMove(-spriteW*5, 0, 0);
	};
	
	Sprite_Actor.prototype.setActorHome = function(index) {
		const spriteW = $gameMap.tileWidth()/2;
		const spriteH = $gameMap.tileHeight()/2;
		const rowX = this._actor.backRow() ? 0 : spriteW*2;
		const partyTop = spriteH*9+1;
		const battlerHeight = spriteH*3;
		const separationY = 2;
		this.setHome(spriteW*2 + rowX, partyTop + index*(battlerHeight + separationY));
	};
	
	Sprite_Actor.prototype.startEntryMotion = function() {
		const spriteW = $gameMap.tileWidth()/2;
		if (this._actor && this._actor.canMove()) {
			this.startMotion("walk");
			this.startMove(0, 0, spriteW);
		} else if (!this.isMoving()) {
			this.refreshMotion();
			this.startMove(0, 0, 0);
		}
	};
	
	Sprite_Actor.prototype.stepForward = function() {
		const spriteW = $gameMap.tileWidth()/2;
		this.startMove(spriteW*2, 0, spriteW);
	};
	
	Sprite_Actor.prototype.stepBack = function() {
		const spriteW = $gameMap.tileWidth()/2;
		this.startMove(0, 0, spriteW);
	};
	
	Sprite_Actor.prototype.retreat = function() {
		const spriteW = $gameMap.tileWidth()/2;
		this.startMove(-spriteW*5, 0, spriteW);
	};
	
	Sprite_Actor.prototype.damageOffsetX = function() {
		return Sprite_Battler.prototype.damageOffsetX.call(this) - 11;
	};
	
	Sprite_Actor.prototype.setupMotion = function() {
		if (this._actor.isMotionRequested()) {
			this.startMotion(this._actor.motionType());
		}
	};
	
	Sprite_Actor.prototype.setupWeaponAnimation = function() {
		if (this._actor.isWeaponAnimationRequested()) {
			this._weaponSprite.setup(this._actor.weaponImageId(), this._actor.motionType());
		}
	};
	
	Sprite_Actor.prototype.setupWeaponOverlayAnimation = function() {
		if (this._actor.isWeaponAnimationRequested()) {
			this._weaponOverlaySprite.setup(this._actor.weaponImageId(), this._actor.motionType(), true);
		}
	};
	
	Sprite_Actor.prototype.startMotion = function(motionType) {
		const newMotion = Sprite_Actor.MOTIONS[motionType];
		if (this._motion !== newMotion) {
			this._motion = newMotion;
			this._motionCount = 0;
			this._pattern = 0;
			if(
				motionType === "walk" ||
				motionType === "wait" ||
				motionType === "guard" ||
				motionType === "chant"
			) {
				this.startWeaponIdleAnimation(motionType);
			} else {
				this.clearWeaponIdleAnimation();
			}
		}
	};
	
	Game_Actor.prototype.performAttack = function() {
		const weapons = this.weapons();
		const weapon = weapons[0];
		if(weapon && weapon.d9dInfo.image !== undefined && weapon.d9dInfo.motions !== undefined) {
			// TODO: base motion on attack type
			this.requestMotion(weapon.d9dInfo.motions[0]);
			this.startWeaponAnimation(weapon.d9dInfo.image);
		} else {
			const wtypeId = weapon ? weapon.wtypeId : 0;
			const attackMotion = $dataSystem.attackMotions[wtypeId];
			if (attackMotion) {
				if (attackMotion.type === 0) {
					this.requestMotion("thrust");
				} else if (attackMotion.type === 1) {
					this.requestMotion("swing");
				} else if (attackMotion.type === 2) {
					this.requestMotion("missile");
				}
				this.startWeaponAnimation(attackMotion.weaponImageId);
			}
		}
	};
	
	Sprite_Actor.prototype.startWeaponIdleAnimation = function(motionType) {
		const weapons = this._actor.weapons();
		const weapon = weapons[0];
		if(weapon && weapon.d9dInfo.image !== undefined) {
			this._idleWeaponImageId = weapon.d9dInfo.image;
			this._weaponSprite.setup(this._idleWeaponImageId, motionType);
			this._weaponOverlaySprite.setup(this._idleWeaponImageId, motionType, true);
		} else {
			this.clearWeaponIdleAnimation();
		}
	};
	
	Sprite_Actor.prototype.clearWeaponIdleAnimation = function() {
		this._idleWeaponImageId = null;
		this._weaponSprite.setup(0);
		this._weaponOverlaySprite.setup(0);
	};
	
	Sprite_Actor.prototype.updateMotion = function() {
		this.setupMotion();
		this.setupWeaponAnimation();
		this.setupWeaponOverlayAnimation();
		this._actor.clearMotion();
		this._actor.clearWeaponAnimation();
		if (this._actor.isMotionRefreshRequested()) {
			this.refreshMotion();
			this._actor.clearMotion();
		}
		this.updateMotionCount();
	};
	
	// Sprite Enemy
	Sprite_Enemy.prototype.setBattler = function(battler) {
		Sprite_Battler.prototype.setBattler.call(this, battler);
		this._enemy = battler;
		const spriteW = $gameMap.tileWidth()/2;
		const spriteH = $gameMap.tileHeight()/2;
		const screenX = Math.round(battler.screenX()/3/spriteW)*spriteW;
		const screenY = Math.round(battler.screenY()/3/spriteH)*spriteH;
		this.setHome(screenX, screenY);
		this._stateIconSprite.setup(battler);
	};
	
	Sprite_Enemy.prototype.isSelected = function() {
		return this._battler && this._battler.isSelected();
	}
	
	// Sprite Battleback
	Sprite_Battleback.prototype.adjustPosition = function() {
		this.width = 272;
		this.height = 208;
		this.x = 0;
		this.y = 0;
		this.scale.x = 1;
		this.scale.y = 1;
	};
	
	// Sprite Gauge
	Sprite_Gauge.prototype.bitmapWidth = function() {
		return $gameMap.tileWidth()/2*4;
	};

	Sprite_Gauge.prototype.bitmapHeight = function() {
		return $gameMap.tileHeight()/2-1;
	};

	Sprite_Gauge.prototype.textHeight = function() {
		return this.bitmapHeight();
	};

	Sprite_Gauge.prototype.gaugeHeight = function() {
		return this.bitmapHeight();
	};
	
	Sprite_Gauge.prototype.flashingColor1 = function() {
		return [255, 255, 255, 255];
	};

	Sprite_Gauge.prototype.flashingColor2 = function() {
		return [0, 0, 0, 0];
	};
	
	Sprite_Gauge.prototype.drawGaugeRect = function(x, y, width, height) {
		const rate = this.gaugeRate();
		const fillW = Math.floor(width * rate);
		const fillH = height;
		
		let color1 = this.gaugeColor1();
		const color2 = ColorManager.normalColor();
		
		this.bitmap.fillRect(x, y, fillW, fillH, color1);
		
		this.bitmap.fillRect(x, y, 1, 2, color2);
		this.bitmap.fillRect(x, y+height-2, 1, 2, color2);
		this.bitmap.fillRect(x, y, 2, 1, color2);
		this.bitmap.fillRect(x, y+height-1, 2, 1, color2);
		
		this.bitmap.fillRect(x+width-1, y, 1, 2, color2);
		this.bitmap.fillRect(x+width-1, y+height-2, 1, 2, color2);
		this.bitmap.fillRect(x+width-2, y, 2, 1, color2);
		this.bitmap.fillRect(x+width-2, y+height-1, 2, 1, color2);
	};
	
	// Sprite Weapon
	const _Sprite_Weapon_initMembers = Sprite_Weapon.prototype.initMembers;
	Sprite_Weapon.prototype.initMembers = function() {
		_Sprite_Weapon_initMembers.call(this);
		this._motionType = null;
		this.anchor.x = 0.375;
		this.x = 0;
		this._isOverlay = false;
	};

	const _Sprite_Weapon_setup = Sprite_Weapon.prototype.setup;
	Sprite_Weapon.prototype.setup = function(weaponImageId, motionType, isOverlay) {
		this._motionType = motionType;
		this._isOverlay = isOverlay;
		_Sprite_Weapon_setup.call(this, weaponImageId);
	};
	
	Sprite_Weapon.prototype.isIdle = function() {
		return this._motion !== "thrust" && this._motion !== "swing" && this._motion !== "missile";
	}
	
	Sprite_Weapon.prototype.updatePattern = function() {
		this._pattern++;
		if (this._pattern >= 3) {
			if(this.isIdle()) {
				this._pattern = 0;
			} else {
				this._weaponImageId = 0;
			}
		}
	};
	
	Sprite_Weapon.prototype.updateFrame = function() {
		if (this._weaponImageId > 0) {
			let pattern = this._pattern;
			switch(this._motionType) {
				case "thrust":
					if(pattern > 0) { pattern = 1; }
					break;
				case "swing":
					if(pattern > 0) { pattern = 2; }
					break;
				case "missile":
					pattern = 1;
					break;
				default:
					pattern = 0;
					break;
			}
			if((pattern === 0 && this._isOverlay) || (pattern > 0 && !this._isOverlay)) {
				const index = (this._weaponImageId - 1) % 12;
				const w = 64;
				const h = 32;
				const sx = (Math.floor(index / 6) * 3 + pattern) * w;
				const sy = Math.floor(index % 6) * h;
				this.setFrame(sx, sy, w, h);
			} else {
				this.setFrame(0, 0, 0, 0);
			}
		} else {
			this.setFrame(0, 0, 0, 0);
		}
	};
	
	// Spriteset Battle
	const _Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
	Spriteset_Battle.prototype.createLowerLayer = function() {
		_Spriteset_Battle_createLowerLayer.call(this);
		this.createCursor();
	};
	
	const _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
	Spriteset_Battle.prototype.update = function() {
		_Spriteset_Battle_update.call(this);
		this.updateCursor();
	};
	
	Spriteset_Battle.prototype.updateCursor = function() {
		for(const enemySprite of this._enemySprites) {
			if(enemySprite.isSelected()) {
				this._cursorBlinkTimer++;
				if(this._cursorBlinkTimer % 2) {
					const cursorSpacing = 4;
					const startX = enemySprite.x - Math.round(enemySprite.anchor.x * enemySprite.width) - cursorSpacing;
					const startY = enemySprite.y - Math.round(enemySprite.anchor.y * enemySprite.height) - cursorSpacing;
					let curX = startX;
					let curY = startY;
					for(const cursorSprite of this._cursorSprites) {
						cursorSprite.show();
						cursorSprite.move(curX, curY);
						curX += enemySprite.width;
						if(curX > startX + enemySprite.width) {
							curX = startX;
							curY += enemySprite.height;
						}
					}
				} else {
					for(const cursorSprite of this._cursorSprites) {
						cursorSprite.hide();
					}
				}
				return;
			}
		}
		this._cursorBlinkTimer = 0;
		for(const cursorSprite of this._cursorSprites) {
			cursorSprite.hide();
		}
	};
	
	Spriteset_Battle.prototype.createCursor = function() {
		this._cursorSprites = [];
		this._cursorBlinkTimer = 0;
		const width = 8;
		const height = 8;
		const bitmapCursorX = 32;
		const bitmapCursorY = 32;
		const color = ColorManager.ctGaugeColor1();
		const cursorPartCount = 4;
		for(let i = 0; i < cursorPartCount; i++) {
			const sprite = new Sprite();
			sprite.bitmap = ImageManager.loadSystem("Window");
			sprite.setFrame(bitmapCursorX+width*(i%2), bitmapCursorY+height*Math.floor(i/2), width, height);
			sprite.hide();
			this._cursorSprites.push(sprite);
			this._battleField.addChild(sprite);
		}
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
	
	Window_Base.prototype.baseTextRect = function() {
		const itemPadding = this.itemPadding();
		const lineHeight = this.lineHeight()/2;
		const x = itemPadding;
		const y = itemPadding + lineHeight;
		const rect = new Rectangle(x, y, this.innerWidth, this.innerHeight);
		return rect;
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
		//this.resetTextColor();
		this.drawText(unit, x, y, width);
		this.drawText(value+"", x, y+$gameMap.tileHeight()/2, width, "right");
		//this.changeTextColor(ColorManager.systemColor());
	};
	
	Window_Base.prototype.drawBattler = function(battlerName, x, y) {
		width = 32;
		height = 24;
		const bitmap = ImageManager.loadSvActor(battlerName);
		const pw = 32;
		const ph = 24;
		const sw = Math.min(width, pw);
		const sh = Math.min(height, ph);
		const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
		const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
		const sx = Math.floor((pw - sw) / 2);
		const sy = Math.floor((ph - sh) / 2);
		this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
	};
	
	Window_Base.prototype.processDrawIcon = function(iconIndex, textState) {
		if (textState.drawing) {
			this.drawIcon(iconIndex, textState.x, textState.y);
		}
		textState.x += ImageManager.iconWidth;
	};
	
	// Window Selectable
	Window_Scrollable.prototype.overallHeightForDownArrow = function() {
		return this.innerHeight;
	};
	
	Window_Scrollable.prototype.updateArrows = function() {
		this.downArrowVisible = this._scrollY < this.maxScrollYForDownArrow();
		this.upArrowVisible = this._scrollY > 0;
	};
	
	Window_Scrollable.prototype.maxScrollYForDownArrow = function() {
		return Math.max(0, this.overallHeightForDownArrow() - this.innerHeight);
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
	
	Window_Selectable.prototype.overallHeight = function() {
		return (this.maxRows()+1) * this.itemHeight();
	};
	
	Window_Scrollable.prototype.overallHeightForDownArrow = function() {
		return this.maxRows() * this.itemHeight();
	};
	
	Window_Selectable.prototype.ensureCursorVisible = function(smooth) {
		if (this._cursorAll) {
			this.scrollTo(0, 0);
		} else if (this.innerHeight > 0 && this.row() >= 0) {
			const scrollY = this.scrollY();
			const itemHeight = this.itemHeight();
			const spriteH = $gameMap.tileHeight()/2;
			const itemTop = this.row() * itemHeight;
			const itemBottom = itemTop + itemHeight;
			if (scrollY > itemTop) {
				this.scrollTo(0, itemTop);
			} else if (itemBottom > scrollY + this.innerHeight) {
				this.scrollTo(0, itemBottom-this.innerHeight+this.innerHeight%itemHeight);
			}
		}
	};
	
	// Window Command
	Window_Command.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		this.drawText(this.commandName(index), rect.x, rect.y+$gameSystem.windowPadding(), rect.width);
	};
	
	// Window Help
	Window_Help.prototype.refresh = function() {
		const rect = this.baseTextRect();
		if(this._forBattle) {
			rect.y -= $gameMap.tileHeight()/2;
		}
		this.contents.clear();
		this.drawTextEx(this._text, rect.x, rect.y, rect.width);
	};
	
	Window_Help.prototype.setForBattle = function(forBattle) {
		if(this._forBattle != forBattle) {
			this._forBattle = forBattle;
			this.refresh();
		}
	}
	
	// Window Gold
	Window_Gold.prototype.refresh = function() {
		const x = $gameSystem.windowPadding();
		const y = $gameSystem.windowPadding();
		const width = this.textWidthFromImage("00000000");
		this.contents.clear();
		this.drawCurrencyValue(this.value(), this.currencyUnit(), x, y, width);
	};
	
	// Window Status Base
	Window_StatusBase.prototype.drawActorHpMp = function(actor, x, y, width) {
		width = width || $gameMap.tileWidth()/2*7;
		const lineHeight = this.lineHeight();
		this.drawText("HL", x, y, width);
		this.drawText(actor.hp + "%", x, y, width, "right");
		this.drawText("EN", x, y + lineHeight/2, width);
		this.drawText(actor.mp + "%", x, y + lineHeight/2, width, "right");
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
		x -= $gameMap.tileWidth()/2;
		if(!ignoreRow) {
			x += actor.backRow() ? 0 : $gameMap.tileWidth()/2;
		}
		this.drawBattler(actor.battlerName(), x, y);
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
	
	Window_StatusBase.prototype.iconForElementType = function(type) {
		let returnVal = 0;
		switch(type) {
			case  1: returnVal =  32; break;
			case  2: returnVal =  33; break;
			case  3: returnVal =  34; break;
			case  4: returnVal =  35; break;
			case  5: returnVal =  36; break;
			case  6: returnVal =  37; break;
			case  7: returnVal =  38; break;
			case  8: returnVal =  39; break;
			case  9: returnVal =  40; break;
			case 10: returnVal =  41; break;
			case 11: returnVal =  42; break;
			case 12: returnVal =  43; break;
			case 13: returnVal =  44; break;
			case 14: returnVal =  45; break;
		}
		return returnVal;
	};
	
	Window_StatusBase.prototype.iconForWeaponType = function(type) {
		let returnVal = 0;
		switch(type) {
			case  4: case  5: case  6: returnVal =  49; break;
			case  7: case  8: case  9: returnVal =  50; break;
			case 10: case 11: case 12: returnVal =  51; break;
			case 13: case 14: case 15: returnVal =  52; break;
			case 16: case 17: case 18: returnVal =  53; break;
		}
		return returnVal;
	};
	
	Window_StatusBase.prototype.drawIconList = function(x, y, name, icons, width) {
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const firstX = x + (name.length + 1) * spriteW;
		this.drawText(name, x, y, width);
		let curX = x + width - spriteW;
		let curY = y+lineHeight;
		for(let i = icons.length-1; i >= 0; i--) {
			if(icons[i] === 0) { continue; }
			this.drawIcon(icons[i], curX, curY);
			curX -= spriteW;
			if(curX < (y === curY ? firstX : x)) {
				curX = x + width - spriteW;
				curY -= lineHeight;
			}
		}
	};
	
	Window_StatusBase.prototype.drawSkillLevel = function(actor, skillNum, x, y, width) {
		if(!this._actor) { return; }
		const skillName = this.skillName(skillNum);
		this.drawText(skillName, x, y, width);
		this.drawText(this.skillLevel(actor, skillNum)+"", x, y, width, "right");
	};
	
	Window_StatusBase.prototype.classSkillStartsAt = function() {
		return 10;
	};
	
	Window_StatusBase.prototype.skillName = function(skillNum) {
		const classSkillStartsAt = this.classSkillStartsAt();
		if(skillNum >= classSkillStartsAt) { return this.classSkillName(skillNum-classSkillStartsAt); }
		let name = "UNKNOWN";
		switch(skillNum) {
			case  0: name = "MeleeAcc"; break; case  1: name = "RangeAcc"; break; 
			case  2: name =  "Evasion"; break; case  3: name =  "Balance"; break; 
			case  4: name =  "Agility"; break; case  5: name =    "Focus"; break; 
			case  6: name = "MeleeWpn"; break; case  7: name = "ThrowWpn"; break; 
			case  8: name = "FiredWpn"; break; case  9: name =  "Unarmed"; break; 
		}
		return name;
	};
	
	Window_StatusBase.prototype.classSkillName = function(skillNum) {
		const stypes = this._actor.addedSkillTypes();
		let reduceType = 0;
		for(let i = 0; i < stypes.length; i++) {
			if(stypes[i] === 1) {
				reduceType++;
				continue;
			}
			if(i - reduceType === skillNum) {
				return $dataSystem.skillTypes[stypes[i]];
			}
		}
		return "UNKNOWN";
	};
	
	Window_StatusBase.prototype.skillLevel = function(actor, index) {
		if(!this._actor) { return 0; }
		return actor.skillLevel(this.skillName(index));
	};
	
	Window_StatusBase.prototype.skillCount = function(actor) {
		return actor ? (actor.currentClass().id <= 6 ? 12 : 14) : 10;
	};
	
	Window_StatusBase.prototype.drawNameAndValue = function(x, y, name, curValue, newValue, useArrows) {
		const spriteW = $gameMap.tileWidth()/2;
		const textWidth = spriteW*8;
		const plusMinusWidth = textWidth - spriteW*3;
		this.drawText(name, x, y, textWidth);
		const newValueExists = newValue != null && newValue != undefined ;
		this.drawText((newValueExists ? newValue : curValue)+"", x, y, textWidth, "right");
		if (newValueExists && newValue != curValue) {
			if(useArrows) {
				let icon = 0;
				if(newValue > curValue) {
					icon = 92;
				} else if(newValue < curValue) {
					icon = 93;
				}
				this.drawIcon(icon, x+plusMinusWidth-spriteW, y);
			} else {
				let symbol = "";
				if(newValue > curValue) {
					symbol = "+";
				} else if(newValue < curValue) {
					symbol = "-";
				}				
				this.drawText(symbol, x, y, plusMinusWidth, "right");
			}
			this.drawText(newValue+"", x, y, textWidth, "right");
		}
	};
	
	Window_StatusBase.prototype.toughnessSymbol = function() {
		return "TGH";
	};
	
	Window_StatusBase.prototype.balanceSymbol = function() {
		return "BLC";
	};
	
	Window_StatusBase.prototype.agilitySymbol = function() {
		return "AGL";
	};
	
	Window_StatusBase.prototype.focusSymbol = function() {
		return "FCS";
	};
	
	Window_StatusBase.prototype.powerSymbol = function() {
		return "PWR";
	};
	
	Window_StatusBase.prototype.meleeAccuracySymbol = function() {
		return "MAC";
	};
	
	Window_StatusBase.prototype.rangeAccuracySymbol = function() {
		return "RAC";
	};
	
	Window_StatusBase.prototype.specialAccuracySymbol = function() {
		return "SAC";
	};
	
	Window_StatusBase.prototype.typeSymbol = function() {
		return "TYP";
	};
	
	Window_StatusBase.prototype.armorSymbol = function() {
		return "AMR";
	};
	
	Window_StatusBase.prototype.blockSymbol = function() {
		return "BLK";
	};
	
	Window_StatusBase.prototype.evadeSymbol = function() {
		return "EVS";
	};
	
	Window_StatusBase.prototype.coverageSymbol = function() {
		return "CVG";
	};
	
	Window_StatusBase.prototype.resistSymbol = function() {
		return "RST";
	};
	
	// Window Menu Command
	Window_MenuCommand.prototype.addMainCommands = function() {
		const enabled = this.areMainCommandsEnabled();
		if (this.needsCommand("item")) {
			this.addCommand(TextManager.item, "item", enabled);
		}
		if (this.needsCommand("skill")) {
			this.addCommand(TextManager.skill, "skill", enabled);
		}
		if (this.needsCommand("equip")) {
			this.addCommand(TextManager.equip, "equip", enabled);
		}
		this.addCommand("Skills", "skillLevels", enabled);
		if (this.needsCommand("status")) {
			this.addCommand(TextManager.status, "status", enabled);
		}
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
			this.drawActorClass(this._actor, x, y+lineHeight, textWidth);
			this.drawSvActor(this._actor, x+$gameMap.tileWidth()/2*2, y + lineHeight*3, true);
			this.drawAllParams(x+$gameMap.tileWidth()/2*6, y);
		}
	};
	
	Window_EquipStatus.prototype.drawAllParams = function(x, y) {
		const textWidth = $gameMap.tileWidth()/2*8;
		const x2 = x + $gameMap.tileWidth()/2*9;
		const x3 = x2 + $gameMap.tileWidth()/2*9;
		const x4 = x3 + $gameMap.tileWidth()/2*9;
		const lineHeight = this.lineHeight()/2;
		const y2 = y + lineHeight;
		const y3 = y2 + lineHeight;
		const y4 = y3 + lineHeight;
		const y5 = y4 + lineHeight;
		const y6 = y5 + lineHeight;
		
		const tempActor = this._tempActor ? this._tempActor : this._actor;
		
		this.drawNameAndValue(x, y3, this.toughnessSymbol(), this._actor.param(4), tempActor.param(4), true);
		this.drawNameAndValue(x, y4, this.balanceSymbol(), this._actor.param(5), tempActor.param(5), true);
		this.drawNameAndValue(x, y5, this.agilitySymbol(), this._actor.param(6), tempActor.param(6), true);
		this.drawNameAndValue(x, y6, this.focusSymbol(), this._actor.param(7), tempActor.param(7), true);
		
		this.drawNameAndValue(x2, y, this.powerSymbol(), this._actor.param(2), tempActor.param(2), true);
		this.drawNameAndValue(x2, y2, this.meleeAccuracySymbol(), Math.floor(this._actor.xparam(0)*100), Math.floor(tempActor.xparam(0)*100), true);
		this.drawNameAndValue(x2, y3, this.rangeAccuracySymbol(), Math.floor(this._actor.xparam(2)*100), Math.floor(tempActor.xparam(2)*100), true);
		this.drawNameAndValue(x2, y4, this.specialAccuracySymbol(), Math.floor(this._actor.xparam(4)*100), Math.floor(tempActor.xparam(4)*100), true);
		let typeIcons = [];
		if(this._tempActor) {
			typeIcons = typeIcons.concat(this._tempActor.traits(Game_BattlerBase.TRAIT_ATTACK_ELEMENT).map(trait => this.iconForElementType(trait.dataId)));
			typeIcons = typeIcons.concat(this._tempActor.weaponTypes().map(type => this.iconForWeaponType(type)));
		} else {
			typeIcons = typeIcons.concat(this._actor.traits(Game_BattlerBase.TRAIT_ATTACK_ELEMENT).map(trait => this.iconForElementType(trait.dataId)));
			typeIcons = typeIcons.concat(this._actor.weaponTypes().map(type => this.iconForWeaponType(type)));
		}
		this.drawIconList(x2, y5, this.typeSymbol(), typeIcons, textWidth);
		
		this.drawNameAndValue(x3, y, this.armorSymbol(), this._actor.param(3), tempActor.param(3), true);
		this.drawNameAndValue(x3, y2, this.blockSymbol(), this._actor.shieldDefense(), tempActor.shieldDefense(), true);
		this.drawNameAndValue(x3, y3, this.evadeSymbol(), Math.floor(this._actor.xparam(1)*100), Math.floor(tempActor.xparam(1)*100), true);
		this.drawNameAndValue(x3, y4, this.coverageSymbol(), Math.floor(this._actor.xparam(3)*100), Math.floor(tempActor.xparam(3)*100), true);
		this.drawText(this.resistSymbol(), x3, y5, textWidth);
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
	
	Window_EquipItem.prototype.includes = function(item) {
		if (item === null) {
			return true;
		}
		return (
			this._actor &&
			this._actor.canEquip(item) &&
			this.correctEType(item)
		);
	};
	
	Window_EquipItem.prototype.correctEType = function(item) {
		const slot = this.etypeId();
		return item.etypeId === slot ||
			(item.etypeId === 9 && slot === 10) ||
			(item.etypeId === 10 && slot === 9);
	};
	
	// Window Skill Levels
	function Window_SkillLevels() {
		this.initialize(...arguments);
	}

	Window_SkillLevels.prototype = Object.create(Window_StatusBase.prototype);
	Window_SkillLevels.prototype.constructor = Window_SkillLevels;

	Window_SkillLevels.prototype.initialize = function(rect) {
		Window_StatusBase.prototype.initialize.call(this, rect);
		this._actor = null;
		this._skillsStatusWindow = null;
		this.refresh();
		this.select(0);
		this.activate();
	};
	
	Window_SkillLevels.prototype.maxCols = function() {
		return 2;
	};
	
	Window_SkillLevels.prototype.colSpacing = function() {
		return 4;
	};
	
	Window_SkillLevels.prototype.setActor = function(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
		}
	};
	
	Window_SkillLevels.prototype.setSkillsStatusWindow = function(skillsStatusWindow) {
		if (this._skillsStatusWindow !== skillsStatusWindow) {
			this._skillsStatusWindow = skillsStatusWindow;
			this._skillsStatusWindow.setSkillLevelCost(this.nextSkillLevelCost());
		}
	};
	
	Window_SkillLevels.prototype.setSkillsConfirmWindow = function(skillsConfirmWindow) {
		if (this._skillsConfirmWindow !== skillsConfirmWindow) {
			this._skillsConfirmWindow = skillsConfirmWindow;
			this._skillsConfirmWindow.setUpgradeEnabled(this.canPurchaseNextSkillLevel());
			this._skillsConfirmWindow.setRefundEnabled(this.canRefund());
		}
	};
	
	Window_SkillLevels.prototype.maxItems = function() {
		return this.skillCount(this._actor);
	};
	
	Window_SkillLevels.prototype.refresh = function() {
		Window_StatusBase.prototype.refresh.call(this);
		this.drawStaticElements();
	};
	
	Window_SkillLevels.prototype.update = function() {
		Window_Selectable.prototype.update.call(this);
		if (this._skillsStatusWindow) {
			this._skillsStatusWindow.setSkillLevelCost(this.nextSkillLevelCost());
		}
		if (this._skillsConfirmWindow) {
			this._skillsConfirmWindow.setUpgradeEnabled(this.canPurchaseNextSkillLevel());
			this._skillsConfirmWindow.setRefundEnabled(this.canRefund());
		}
	};
	
	Window_SkillLevels.prototype.canRefund = function() {
		return $gameSystem.isSaveEnabled() && this._actor && this._actor.skillLevel(this.skillName(this.index())) > 0;
	};
	
	Window_SkillLevels.prototype.drawStaticElements = function() {
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight();
		const lineHalfHeight = lineHeight/2;
		const x = $gameSystem.windowPadding();
		const y = $gameSystem.windowPadding() + lineHalfHeight;
		const y2 = y + lineHeight*4;
		this.drawText("Performance", x, y, spriteW*11);
		this.drawText("Ability", x, y2, spriteW*7);
	};
	
	Window_SkillLevels.prototype.itemRect = function(index) {
		const rect = Window_StatusBase.prototype.itemRect.call(this, index);
		rect.x += $gameMap.tileWidth()/2;
		rect.y += $gameMap.tileHeight()*1;
		if(index > 5) {
			rect.y += $gameMap.tileHeight();
		}
		return rect;
	};
	
	Window_SkillLevels.prototype.drawItem = function(index) {
		if (this._actor) {
			const rect = this.itemLineRect(index);
			rect.y += $gameMap.tileHeight()/4;
			this.drawSkillLevel(this._actor, index, rect.x, rect.y, rect.width);
		}
	};
	
	Window_SkillLevels.prototype.nextSkillLevelCost = function() {
		if(!this._actor) { return 0; }
		return this._actor.nextSkillLevelCost(this.skillName(this.index()));
	};
	
	Window_SkillLevels.prototype.canPurchaseNextSkillLevel = function() {
		if(!this._actor) { return false; }
		return this._actor.canPurchaseNextSkillLevel(this.skillName(this.index()));
	};
	
	Window_SkillLevels.prototype.isCurrentItemEnabled = function() {
		return true;
	};
	
	Window_SkillLevels.prototype.purchaseNextSkillLevel = function() {
		if(!this._actor) { return; }
		this._actor.purchaseNextSkillLevel(this.skillName(this.index()));
		this.refresh();
	};
	
	Window_SkillLevels.prototype.refundSkillLevels = function() {
		if(!this._actor) { return; }
		this._actor.refundSkillLevels(this.skillName(this.index()));
		this.refresh();
	};
	
	Window_SkillLevels.prototype.updateHelp = function() {
		this.setHelpWindowItem(this.item());
	};
	
	Window_SkillLevels.prototype.item = function() {
		return this.itemAt(this.index());
	};
	
	Window_SkillLevels.prototype.itemAt = function(index) {
		const classSkillStartsAt = this.classSkillStartsAt();
		if(index >= classSkillStartsAt) { return this.classItemAt(index-classSkillStartsAt); }
		let desc = "";
		switch(index) {
			case  0:
				desc = "Increase chances of striking\nwith melee attacks.";
				break;
			case  1:
				desc = "Increase chances of striking\nwith thrown fired & magic atks.";
				break; 
			case  2:
				desc = "Increase chances of dodging,\nblocking, and parrying attacks.";
				break;
			case  3:
				desc = "Resist stress inflicted by\nshoves, tripping, and impacts.";
				break; 
			case  4:
				desc = "Decrease wait time between\nactions in combat.";
				break;
			case  5:
				desc = "Increase stress recovery and\nfocus gain.";
				break; 
			case  6:
				desc = "Unlock melee weapon techniques.";
				break;
			case  7:
				desc = "Unlock thrown weapon\ntechniques.";
				break; 
			case  8:
				desc = "Unlock techniques for bows and\nguns.";
				break;
			case  9:
				desc = "Unlock punch and kick\ntechniques.";
				break; 
		}
		const item = {};
		item.description = desc;
		return item;
	};
	
	Window_SkillLevels.prototype.classItemAt = function(skillNum) {
		const stypes = this._actor.addedSkillTypes();
		let reduceType = 0;
		let skillType = 0;
		for(let i = 0; i < stypes.length; i++) {
			if(stypes[i] === 1) {
				reduceType++;
				continue;
			}
			if(i - reduceType === skillNum) {
				skillType = stypes[i];
				break;
			}
		}
		let desc = "";
		switch(skillType) {
			case  2:
				desc = "Unlock abilities that reposition\nparty members.";
				break;
			case  3:
				desc = "Unlock abilities that utilize\ndevices in and out of battle.";
				break;
			case  4:
				desc = "Unlock abilities for avoiding\nbattles, striking from behind.";
				break;
			case  5:
				desc = "Unlock abilities for finding\ntraps and paths, opening locks.";
				break;
			case  6:
				desc = "Unlock healing and weather\nmagic, and reduce stress costs.";
				break;
			case  7:
				desc = "Unlock abilities that see the\netheral and predict events.";
				break;
			case  8:
				desc = "Unlock both white and black\nmagic, and reduce stress costs.";
				break;
			case  9:
				desc = "Unlock attack and cast in same\nturn, and reduce stress costs.";
				break;
			case 10:
				desc = "Unlock attack and infernal\nmagic, and reduce stress costs.";
				break;
			case 11:
				desc = "Unlock abilities for seeing the\nhidden, and uncanny aim.";
				break;
			case 12:
				desc = "Unlock abilities for incredible\ntoughness and body purity.";
				break;
			case 13:
				desc = "Unlock abilities that reduce\nstress, add focus, purify mind.";
				break;
		}
		const item = {};
		item.description = desc;
		return item;
	};
	
	// Window Skill Levels Status
	function Window_SkillLevelsStatus() {
		this.initialize(...arguments);
	}

	Window_SkillLevelsStatus.prototype = Object.create(Window_StatusBase.prototype);
	Window_SkillLevelsStatus.prototype.constructor = Window_SkillLevelsStatus;

	Window_SkillLevelsStatus.prototype.initialize = function(rect) {
		Window_StatusBase.prototype.initialize.call(this, rect);
		this._actor = null;
		this._skillLevelCost = 0;
		this.refresh();
	};
	
	Window_SkillLevelsStatus.prototype.setActor = function(actor) {
		if (this._actor !== actor) {
			this._actor = actor;
			this.refresh();
		}
	};
	
	Window_SkillLevelsStatus.prototype.setSkillLevelCost = function(skillLevelCost) {
		if (this._skillLevelCost !== skillLevelCost) {
			this._skillLevelCost = skillLevelCost;
			this.refresh();
		}
	};
	
	Window_SkillLevelsStatus.prototype.refresh = function() {
		this.contents.clear();
		if (this._actor) {
			const spriteW = $gameMap.tileWidth()/2;
			const textWidth = spriteW*8;
			const lineHeight = this.lineHeight()/2;
			const x = $gameSystem.windowPadding();
			const x2 = x + spriteW*3;
			const y = $gameSystem.windowPadding();
			const y2 = y + lineHeight;
			const y3 = y2 + lineHeight*2;
			const y4 = y3 + lineHeight*3;
			const y5 = y4 + lineHeight;
			this.drawActorName(this._actor, x, y, textWidth);
			this.drawActorClass(this._actor, x, y2, textWidth);
			this.drawSvActor(this._actor, x2, y3, true);
			this.drawActorSkillPoints(this._actor, x, y4);
			this.drawText("Cost", x, y5, textWidth);
			this.drawText(this._skillLevelCost+"", x, y5, textWidth, "right");
		}
	};
	
	// Window Skill Levels Confirm
	function Window_SkillLevelsConfirm() {
		this.initialize(...arguments);
	}

	Window_SkillLevelsConfirm.prototype = Object.create(Window_Command.prototype);
	Window_SkillLevelsConfirm.prototype.constructor = Window_SkillLevelsConfirm;

	Window_SkillLevelsConfirm.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
		this.select(0);
		this._canRepeat = false;
		this._upgradeEnabled = false;
		this._refundEnabled = false;
	};
	
	Window_SkillLevelsConfirm.prototype.makeCommandList = function() {
		this.addCommand("Cancel", "cancel", true);
		this.addCommand("Upgrade", "upgrade", this._upgradeEnabled);
		this.addCommand("Refund", "refund", this._refundEnabled);
	};
	
	Window_SkillLevelsConfirm.prototype.setUpgradeEnabled = function(enabled) {
		if(this._upgradeEnabled != enabled) {
			this._upgradeEnabled = enabled;
			this.refresh();
		}
	};
	
	Window_SkillLevelsConfirm.prototype.setRefundEnabled = function(enabled) {
		if(this._refundEnabled != enabled) {
			this._refundEnabled = enabled;
			this.refresh();
		}
	};
	
	// Window Status
	Window_Status.prototype.refresh = function() {
		Window_StatusBase.prototype.refresh.call(this);
		if (this._actor) {
			const spriteW = $gameMap.tileWidth()/2;
			const lineHeight = this.lineHeight()/2;
			const x = $gameSystem.windowPadding();
			const x2 = x + spriteW *2;
			const x3 = x2 + spriteW;
			const y = $gameSystem.windowPadding();
			const y2 = y + lineHeight*4;
			const y3 = y2 + lineHeight*7;
			this.drawActorSimpleStatus(this._actor, x3, y);
			this.drawEquipParams(this._actor, x, y2);
			this.drawSkillLevels(this._actor, x2, y3);
		}
	};
	
	Window_Status.prototype.drawSkillLevels = function(actor, x, y) {
		if (!actor) { return; }
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const textWidth = spriteW * 10;
		const skillCount = this.skillCount(actor);
		const y2 = y + lineHeight;
		const y3 = y2 + lineHeight*3;
		this.drawText("Performance", x, y, spriteW*11);
		this.drawText("Ability", x, y3, spriteW*11);
		const x2 = x + spriteW;
		const x3 = x2 + textWidth + spriteW;
		let curX = x2;
		let curY = y2;
		for(let i = 0; i < skillCount; i++) {
			this.drawSkillLevel(actor, i, curX, curY, textWidth);
			if(curX > x2) {
				curX = x2;
				curY += lineHeight;
				if(curY === y3) {
					curY += lineHeight;
				}
			} else {
				curX = x3;
			}
		}
	};
	
	Window_Status.prototype.drawEquipParams = function(actor, x, y) {
		if (!actor) { return; }
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const textWidth = spriteW*8;
		const x2 = x + textWidth + spriteW;
		const x3 = x2 + textWidth + spriteW;
		const y2 = y + lineHeight;
		const y3 = y2 + lineHeight;
		const y4 = y3 + lineHeight;
		const y5 = y4 + lineHeight;
		
		this.drawNameAndValue(x, y, this.toughnessSymbol(), actor.param(4));
		this.drawNameAndValue(x, y2, this.balanceSymbol(), actor.param(5));
		this.drawNameAndValue(x, y3, this.agilitySymbol(), actor.param(6));
		this.drawNameAndValue(x, y4, this.focusSymbol(), actor.param(7));
		
		this.drawNameAndValue(x2, y, this.powerSymbol(), actor.param(2));
		this.drawNameAndValue(x2, y2, this.meleeAccuracySymbol(), Math.floor(actor.xparam(0)*100));
		this.drawNameAndValue(x2, y3, this.rangeAccuracySymbol(), Math.floor(actor.xparam(2)*100));
		this.drawNameAndValue(x2, y4, this.specialAccuracySymbol(), Math.floor(actor.xparam(4)*100));
		let typeIcons = [];
		typeIcons = typeIcons.concat(actor.traits(Game_BattlerBase.TRAIT_ATTACK_ELEMENT).map(trait => this.iconForElementType(trait.dataId)));
		typeIcons = typeIcons.concat(actor.weaponTypes().map(type => this.iconForWeaponType(type)));
		this.drawIconList(x2, y5, this.typeSymbol(), typeIcons, textWidth);
		
		this.drawNameAndValue(x3, y, this.armorSymbol(), actor.param(3));
		this.drawNameAndValue(x3, y2, this.blockSymbol(), actor.shieldDefense());
		this.drawNameAndValue(x3, y3, this.evadeSymbol(), Math.floor(actor.xparam(1)*100));
		this.drawNameAndValue(x3, y4, this.coverageSymbol(), Math.floor(actor.xparam(3)*100));
		this.drawText(this.resistSymbol(), x3, y5, textWidth);
	};
	
	// Window Options
	Window_Options.prototype.drawItem = function(index) {
		const title = this.commandName(index);
		const status = this.statusText(index);
		const rect = this.itemLineRect(index);
		rect.y += $gameSystem.windowPadding();
		const statusWidth = this.statusWidth();
		const titleWidth = rect.width - statusWidth;
		this.resetTextColor();
		this.changePaintOpacity(this.isCommandEnabled(index));
		this.drawText(title, rect.x, rect.y, titleWidth, "left");
		this.drawText(status, rect.x + titleWidth, rect.y, statusWidth, "right");
	};
	
	// Window Savefile List
	Window_SavefileList.prototype.itemHeight = function() {
		return Window_Selectable.prototype.itemHeight.call(this)/2 * 5;
	};
	
	Window_SavefileList.prototype.drawContents = function(info, rect) {
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const y = rect.y + lineHeight + lineHeight/2
		this.drawPartySvActors(info, rect.x + spriteW*8, y);
		const y2 = y + lineHeight*2;
		this.drawPlaytime(info, rect.x, y2, rect.width);
	};

	Window_SavefileList.prototype.drawPartySvActors = function(info, x, y) {
		if (info.svActors) {
			const spriteW = $gameMap.tileWidth()/2;
			let characterX = x;
			for(let i = info.svActors.length-1; i >= 0; i--) {
				this.drawBattler(info.svActors[i], characterX, y);
				characterX += spriteW*3;
			}
		}
	};
	
	// Window Shop Command
	Window_ShopCommand.prototype.maxCols = function() {
		return 1;
	};
	
	// Window Shop Buy
	Window_ShopBuy.prototype.itemHeight = function() {
		return Window_Selectable.prototype.itemHeight.call(this)/2 * 3;
	};
	
	Window_ShopBuy.prototype.drawItem = function(index) {
		const item = this.itemAt(index);
		const price = this.price(item);
		const rect = this.itemLineRect(index);
		//this.changePaintOpacity(this.isEnabled(item));
		this.drawItemName(item, rect.x, rect.y, rect.width);
		this.drawText(price+"", rect.x, rect.y+$gameMap.tileHeight()/2, rect.width, "right");
		//this.changePaintOpacity(true);
	};
	
	// Window Shop Number
	Window_ShopNumber.prototype.initialize = function(rect) {
		Window_Selectable.prototype.initialize.call(this, rect);
		this._item = null;
		this._max = 1;
		this._price = 0;
		this._number = 1;
		this._partyGold = 0;
		this._selling = false;
		this._currencyUnit = TextManager.currencyUnit;
		this.createButtons();
		this.select(0);
		this._canRepeat = false;
	};

	Window_ShopNumber.prototype.setup = function(item, max, price, partyGold, selling) {
		this._item = item;
		this._max = Math.floor(max);
		this._price = price;
		this._number = 1;
		this._partyGold = partyGold;
		this._selling = selling;
		this.placeButtons();
		this.refresh();
	};
	
	Window_ShopNumber.prototype.createButtons = function() {
		this._buttons = [];
		if (ConfigManager.touchUI) {
			for (const type of ["ok", "up2", "up", "down2", "down"]) {
				const button = new Sprite_Button(type);
				this._buttons.push(button);
				this.addInnerChild(button);
			}
			this._buttons[0].setClickHandler(this.onButtonOk.bind(this));
			this._buttons[1].setClickHandler(this.onButtonUp2.bind(this));
			this._buttons[2].setClickHandler(this.onButtonUp.bind(this));
			this._buttons[3].setClickHandler(this.onButtonDown2.bind(this));
			this._buttons[4].setClickHandler(this.onButtonDown.bind(this));
		}
	};

	Window_ShopNumber.prototype.placeButtons = function() {
		const padding = this.itemPadding();
		const lineHeight = this.lineHeight();
		let x = padding;
		let y = padding;
		for (let i = 0; i < this._buttons.length; i++) {
			this._buttons[i].x = x;
			this._buttons[i].y = y;
			if(i === 2) {
				x -= this._buttons[i].width;
				y += lineHeight;
			} else {
				x += this._buttons[i].width;
			}
		}
	};

	Window_ShopNumber.prototype.buttonSpacing = function() {
		return 0;
	};
	
	Window_ShopNumber.prototype.refresh = function() {
		Window_Selectable.prototype.refresh.call(this);
		this.drawCurrentItemName();
		this.drawMultiplicationSign();
		this.drawNumber();
		this.drawTotalPrice();
	};
	
	Window_ShopNumber.prototype.drawCurrentItemName = function() {
		const padding = this.itemPadding();
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const x = padding;
		const y = padding + lineHeight*5;
		const width = spriteW*8;
		this.drawItemName(this._item, x, y, width);
	};
	
	Window_ShopNumber.prototype.drawMultiplicationSign = function() {
		const padding = this.itemPadding();
		const sign = this.multiplicationSign();
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const width = spriteW;
		const x = padding + spriteW*5;
		const y = padding + lineHeight*6;
		this.drawText(sign, x, y, width);
	};

	Window_ShopNumber.prototype.multiplicationSign = function() {
		return "x";
	};

	Window_ShopNumber.prototype.drawNumber = function() {
		const padding = this.itemPadding();
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const width = spriteW*2;
		const x = padding + spriteW*6;
		const y = padding + lineHeight*6;
		this.drawText(this._number+"", x, y, width, "right");
	};

	Window_ShopNumber.prototype.drawTotalPrice = function() {
		const padding = this.itemPadding();
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const width = spriteW*8;
		const total = this._price * this._number;
		let resultGold = this._partyGold;
		let mathSymbol = "+";
		if(this._selling) {
			resultGold += total;
		} else {
			mathSymbol = "-";
			resultGold -= total;
		}
		const x = padding;
		const y = padding + lineHeight*8;
		const y2 = y + lineHeight;
		const y3 = y2 + lineHeight;
		const y4 = y3 + lineHeight;
		this.drawText(this._partyGold+"", x, y, width, "right");
		this.drawText(mathSymbol, x, y2, width);
		this.drawText(total+"", x, y2, width, "right");
		this.drawText("--------", x-1, y3, width, "right");
		this.drawText("--------", x+2, y3, width, "right");
		this.drawText(resultGold+"", x, y4, width, "right");
	};
	
	Window_ShopNumber.prototype.itemRect = function() {
		const padding = this.itemPadding();
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const width = spriteW*8;
		const rect = new Rectangle();
		rect.x = 0;
		rect.y = lineHeight*5;
		rect.width = spriteW*9;
		rect.height = this.lineHeight()/2*3;
		return rect;
	};
	
	// Window Shop Status
	Window_ShopStatus.prototype.initialize = function(rect) {
		Window_StatusBase.prototype.initialize.call(this, rect);
		this._item = null;
		this._pageIndex = 0;
		const members = this.statusMembers();
		for (let i = 0; i < members.length; i++) {
			ImageManager.loadSvActor(members[i].battlerName());
		}
		this.refresh();
	};
	
	Window_ShopStatus.prototype.refresh = function() {
		const lineHeight = $gameMap.tileHeight()/2;
		const x = this.itemPadding();
		const y = this.itemPadding();
		const y2 = y + lineHeight*2;
		this.contents.clear();
		if (this._item) {
			const spriteW = $gameMap.tileWidth()/2;
			this.drawPossession(x, y);
			this.drawSvActors(x, y2);
			if (this.isEquipItem()) {
				const x2 = x + spriteW*3;
				const y = Math.floor(this.lineHeight() * 1.5);
				this.drawEquipInfo(x2, y2);
			}
		}
	};
	
	Window_ShopStatus.prototype.drawSvActors = function(x, y) {
		let curY = y;
		const members = this.statusMembers();
		for (let i = 0; i < members.length; i++) {
			this.drawSvActor(members[i], x, curY, true);
			curY += this.actorInfoHeight();
		}
	};
	
	Window_ShopStatus.prototype.actorInfoHeight = function() {
		return $gameMap.tileHeight()/2*4;
	};
	
	Window_ShopStatus.prototype.drawPossession = function(x, y) {
		const spriteW = $gameMap.tileWidth()/2;
		const width = spriteW*8;
		//this.changeTextColor(ColorManager.systemColor());
		this.drawText("# Own", x, y, width);
		//this.resetTextColor();
		this.drawText($gameParty.numItems(this._item)+"", x, y, width, "right");
	};
	
	Window_ShopStatus.prototype.drawEquipInfo = function(x, y) {
		let curY = y;
		const members = this.statusMembers();
		for (let i = 0; i < members.length; i++) {
			this.drawActorEquipInfo(x, curY, members[i]);
			curY += this.actorInfoHeight();
		}
	};
	
	Window_ShopStatus.prototype.drawActorEquipInfo = function(x, y, actor) {
		const item1 = this.currentEquippedItem(actor, this._item.etypeId);
		const width = this.textWidth("00000000");
		const warningWidth = width + this.textWidth("0");
		const enabled = actor.canEquip(this._item);
		const lineHeight = $gameMap.tileHeight()/2;
		const y2 = y + lineHeight;
		//this.changePaintOpacity(enabled);
		//this.resetTextColor();
		if (enabled) {
			if(item1 && this._item.id === item1.id && this._item.eTypeId === item1.eTypeId) {
				this.drawText("Equipped", x, y2, warningWidth);
			} else {
				this.drawActorParamChange(x, y, actor, item1);
			}
		} else {
			this.drawText("Can't use", x, y2, warningWidth);
		}
		//this.changePaintOpacity(true);
	};
	
	// prettier-ignore
	Window_ShopStatus.prototype.drawActorParamChange = function(
		x, y, actor, item1
	) {
		const width = this.textWidth("00000000");
		const lineHeight = $gameMap.tileHeight()/2;
		const paramId = this.paramId();
		const y2 = y + lineHeight;
		const y3 = y2 + lineHeight;
		if(paramId === 2) {
			this.drawNameAndValueChange(x, y, this.powerSymbol(), this._item.params[2], (item1 ? item1.params[2] : 0));
			if(this._item.wtypeId >= 13) {
				this.drawNameAndValueChange(x, y2, this.rangeAccuracySymbol(), this.getItemXParam(this._item, 2, true), this.getItemXParam(item1, 2, true));
			} else {
				this.drawNameAndValueChange(x, y2, this.meleeAccuracySymbol(), this.getItemXParam(this._item, 0, true), this.getItemXParam(item1, 0, true));
			}
			this.drawIconListChange(x, y3, this.typeSymbol(), this.getItemTypeIcons(this._item), this.getItemTypeIcons(item1));
		} else {
			let defenseSymbol = this._item.etypeId === 2 ? this.blockSymbol() : this.armorSymbol();
			this.drawNameAndValueChange(x, y, defenseSymbol, this._item.params[3], (item1 ? item1.params[3] : 0));
			const coverage = this.getItemXParam(this._item, 3, true);
			if(coverage > 0) {
				this.drawNameAndValueChange(x, y2, this.coverageSymbol(), coverage, this.getItemXParam(item1, 3, true));
			} else {
				this.drawNameAndValueChange(x, y2, this.evadeSymbol(), this.getItemXParam(this._item, 1, true), this.getItemXParam(item1, 1, true));
			}
			//this.drawText(this.resistSymbol(), x, y3, textWidth);
		}
	};
	
	Window_ShopStatus.prototype.getItemXParam = function(item, dataId, isPercent) {
		if(!item) { return 0; }
		const traits = item.traits
			.filter(trait => trait.code === Game_BattlerBase.TRAIT_XPARAM && trait.dataId === dataId);
		if(!traits || traits.length === 0) { return 0; }
		const total = traits.reduce((prevVal, curTrait) => prevVal + curTrait.value, 0);
		return isPercent? Math.floor(total*100) : total;
	};
	
	Window_ShopStatus.prototype.getItemTypeIcons = function(item) {
		if(!item) { return []; }
		const pendingTypeIcons = item.traits
			.filter(trait => trait.code === Game_BattlerBase.TRAIT_ATTACK_ELEMENT)
			.map(trait => this.iconForElementType(trait.dataId));
		pendingTypeIcons.push(this.iconForWeaponType(item.wtypeId));
		const typeIcons = [];
		for(let i = 0; i < pendingTypeIcons.length; i++) {
			if(typeIcons.indexOf(pendingTypeIcons[i]) >= 0) { continue; }
			typeIcons.push(pendingTypeIcons[i]);
		}
		return typeIcons;
	};
	
	Window_ShopStatus.prototype.drawNameAndValueChange = function(x, y, name, itemValue, actorValue) {
		let change = itemValue - (actorValue ? actorValue : 0);
		if(change === 0) { return; }
		const textWidth = $gameMap.tileWidth()/2*8;
		const plusMinusWidth = textWidth - $gameMap.tileWidth()/2*3;
		const changeSymbol = change > 0 ? "+" : "-";
		change = Math.abs(change);
		this.drawText(name, x, y, textWidth);
		this.drawText(changeSymbol, x, y, plusMinusWidth, "right");
		this.drawText(change+"", x, y, textWidth, "right");
	};
	
	Window_ShopStatus.prototype.drawIconListChange = function(x, y, name, itemIcons, actorIcons) {
		const addedIcons = [];
		const removedIcons = [];
		for(let i = 0; i < itemIcons.length; i++) {
			if(actorIcons.indexOf(itemIcons[i]) >= 0) { continue; }
			addedIcons.push(itemIcons[i]);
		}
		for(let i = 0; i < actorIcons.length; i++) {
			if(itemIcons.indexOf(actorIcons[i]) >= 0) { continue; }
			removedIcons.push(actorIcons[i]);
		}
		if(addedIcons.length === 0 && removedIcons.length === 0) { return; }
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const width = spriteW*8;
		const x2 = x + spriteW*3;
		const y2 = y + lineHeight;
		this.drawText(name, x, y, width);
		if(addedIcons.length > 0) {
			this.drawText("+", x2, y, spriteW);
			this.drawSingleIconList(x, y, addedIcons);
		}
		if(removedIcons.length > 0) {
			this.drawText("-", x2, y2, spriteW);
			this.drawSingleIconList(x, y2, removedIcons);
		}
	};
	
	Window_ShopStatus.prototype.drawSingleIconList = function(x, y, icons) {
		const spriteW = $gameMap.tileWidth()/2;
		const width = spriteW*9;
		let curX = x + width - spriteW;
		for(let i = icons.length-1; i >= 0; i--) {
			if(icons[i] === 0) { continue; }
			this.drawIcon(icons[i], curX, y);
			curX -= spriteW;
		}
	};
	
	// Window Name Edit
	Window_NameEdit.prototype.setup = function(actor, maxLength) {
		this._actor = actor;
		this._maxLength = maxLength;
		this._name = actor.name().slice(0, this._maxLength);
		this._index = this._name.length;
		this._defaultName = this._name;
		ImageManager.loadSvActor(actor.battlerName());
	};
	
	Window_NameEdit.prototype.add = function(ch) {
		if (this._index < this._maxLength) {
			this._name += ch;
			this._index++;
			this.refresh();
		} else {
			this._name = this._name.substring(0, this._maxLength-1)+ch;
			this.refresh();
		}
		return true;
	};
	
	Window_NameEdit.prototype.charWidth = function() {
		return this.textWidth("0");
	};
	
	Window_NameEdit.prototype.itemRect = function(index) {
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const itemPadding = this.itemPadding();
		const x = spriteW*4 + itemPadding + spriteW*2*index;
		const y = lineHeight*2 + itemPadding + lineHeight;
		const width = this.charWidth()*2;
		const height = lineHeight*2;
		return new Rectangle(x, y, width, height);
	};
	
	Window_NameEdit.prototype.refresh = function() {
		this.contents.clear();
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const itemPadding = this.itemPadding();
		const svX = itemPadding + spriteW;
		const svY = itemPadding + lineHeight;
		this.drawSvActor(this._actor, svX, svY, true);
		for (let j = 0; j < this._name.length; j++) {
			this.drawChar(j);
		}
		let rect = null;
		if(this._name.length < this._maxLength) {
			rect = this.itemRect(this._index);
		} else {
			rect = this.itemRect(this._maxLength-1);
		}
		rect.x -= itemPadding;
		rect.y -= itemPadding;
		this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
	};
	
	// Window Name Input
	Window_NameInput.prototype.itemWidth = function() {
		return Window_Selectable.prototype.itemWidth.call(this);
	};

	Window_NameInput.prototype.groupSpacing = function() {
		return $gameMap.tileWidth()/2;
	};
	
	Window_NameInput.prototype.isPageChange = function() {
		return this.isValuePageChange(this._index);
	};

	Window_NameInput.prototype.isOk = function() {
		return this.isValueOk(this._index);
	};
	
	Window_NameInput.prototype.isValuePageChange = function(index) {
		return index === 88;
	};

	Window_NameInput.prototype.isValueOk = function(index) {
		return index === 89;
	};
	
	Window_NameInput.prototype.itemRect = function(index) {
		const itemWidth = this.itemWidth();
		const itemHeight = this.itemHeight();
		const colSpacing = this.colSpacing();
		const rowSpacing = this.rowSpacing();
		const groupSpacing = this.groupSpacing();
		const col = index % 10;
		const group = Math.floor(col / 5);
		const x = col * itemWidth + group * groupSpacing + colSpacing / 2;
		const y = itemHeight/2 + Math.floor(index / 10) * itemHeight + rowSpacing / 2;
		const width = itemWidth - colSpacing;
		const height = itemHeight - rowSpacing;
		return new Rectangle(x, y, width, height);
	};
	
	Window_NameInput.prototype.drawItem = function(index) {
		const itemPadding = this.itemPadding();
		const rect = this.itemLineRect(index);
		rect.y += itemPadding;
		if(this.isValuePageChange(index)) { this.drawPageChange(rect.x, rect.y); return; }
		if(this.isValueOk(index)) { this.drawOk(rect.x, rect.y); return; }
		const table = this.table();
		const character = table[this._page][index];
		this.drawText(character, rect.x, rect.y, rect.width);
	};
	
	Window_NameInput.prototype.drawPageChange = function(x, y) {
		this.drawIcon(94, x, y);
	};
	
	Window_NameInput.prototype.drawOk = function(x, y) {
		this.drawIcon(95, x, y);
	};
	
	// Window Name Box
	Window_NameBox.prototype.initialize = function() {
		Window_Base.prototype.initialize.call(this, new Rectangle());
		this.hide();
		this._name = "";
	};
	
	Window_NameBox.prototype.windowWidth = function() {
		if (this._name) {
			const tileWidth = $gameMap.tileWidth();
			const textWidth = this.textSizeEx(this._name).width;
			const padding = this.padding + this.itemPadding();
			let width = Math.ceil(textWidth) + padding * 2;
			width = Math.ceil(width / tileWidth) * tileWidth;
			return Math.min(width, Graphics.boxWidth);
		} else {
			return 0;
		}
	};

	Window_NameBox.prototype.windowHeight = function() {
		return $gameSystem.windowPadding()*2 + this.itemPadding()*2 + this.lineHeight();
	};
	
	// Window Choice List
	Window_ChoiceList.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, new Rectangle());
		this.createCancelButton();
		this.hide();
		this.deactivate();
		this._background = 0;
		this._canRepeat = false;
	};
	
	Window_ChoiceList.prototype.start = function() {
		this.updatePlacement();
		this.updateBackground();
		this.placeCancelButton();
		this.createContents();
		this.refresh();
		this.scrollTo(0, 0);
		this.selectDefault();
		this.show();
		this.activate();
	};
	
	Window_ChoiceList.prototype.placeCancelButton = function() {
		if (this._cancelButton) {
			const spacing = 8;
			const button = this._cancelButton;
			const right = this.x + this.width;
			if (right < Graphics.boxWidth - button.width + spacing) {
				button.x = this.width + spacing;
			} else {
				button.x = -button.width - spacing;
			}
			button.y = this.height / 2 - button.height / 2;
		}
	};

	Window_ChoiceList.prototype.windowY = function() {
		if(this._messageWindow.visible && this._messageWindow.isOpen()) {
			const messageY = this._messageWindow.y;
			if (messageY >= Graphics.boxHeight / 2) {
				return messageY - this.windowHeight();
			} else {
				return messageY + this._messageWindow.height;
			}
		} else {
			return Graphics.boxHeight - this.windowHeight();
		}
	};

	Window_ChoiceList.prototype.windowWidth = function() {
		const width = this.maxChoiceWidth() + this.colSpacing() + this.padding * 2;
		return Math.min(width, Graphics.boxWidth);
	};

	Window_ChoiceList.prototype.windowHeight = function() {
		return $gameSystem.windowPadding()*2 + this.itemPadding()*2 + this.numVisibleRows()*$gameMap.tileHeight();
	};
	
	Window_ChoiceList.prototype.maxChoiceWidth = function() {
		const baseWidth = $gameSystem.windowPadding()*2 + this.itemPadding()*2;
		const tileWidth = $gameMap.tileWidth();
		let maxWidth = 96;
		const choices = $gameMessage.choices();
		for (const choice of choices) {
			const textWidth = this.textSizeEx(choice).width;
			const choiceWidth = baseWidth + Math.ceil(textWidth);
			if (maxWidth < choiceWidth) {
				maxWidth = choiceWidth;
			}
		}
		return Math.ceil(maxWidth/tileWidth)*tileWidth;
	};
	
	Window_ChoiceList.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		rect.y += this.itemPadding();
		this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width);
	};
	
	Window_ChoiceList.prototype.callOkHandler = function() {
		$gameMessage.onChoice(this.index());
		this._messageWindow.terminateMessage();
		this.hide();
	};

	Window_ChoiceList.prototype.callCancelHandler = function() {
		$gameMessage.onChoice($gameMessage.choiceCancelType());
		this._messageWindow.terminateMessage();
		this.hide();
	};
	
	// Window Number Input
	Window_NumberInput.prototype.initialize = function() {
		Window_Selectable.prototype.initialize.call(this, new Rectangle());
		this._number = 0;
		this._maxDigits = 1;
		this.hide();
		this.createButtons();
		this.deactivate();
		this._canRepeat = false;
	};
	
	Window_NumberInput.prototype.start = function() {
		this._maxDigits = $gameMessage.numInputMaxDigits();
		this._number = $gameVariables.value($gameMessage.numInputVariableId());
		this._number = this._number.clamp(0, Math.pow(10, this._maxDigits) - 1);
		this.updatePlacement();
		this.placeButtons();
		this.createContents();
		this.refresh();
		this.show();
		this.activate();
		this.select(0);
	};
	
	Window_NumberInput.prototype.updatePlacement = function() {
		const spacing = 0;
		this.width = this.windowWidth();
		this.height = this.windowHeight();
		this.x = (Graphics.boxWidth - this.width);
		if(this._messageWindow.visible) {
			const messageY = this._messageWindow.y;
			if (messageY >= Graphics.boxHeight / 2) {
				this.y = messageY - this.height - spacing;
			} else {
				this.y = messageY + this._messageWindow.height + spacing;
			}
		} else {
			this.y = Graphics.boxHeight - this.height;
		}
	};

	Window_NumberInput.prototype.windowWidth = function() {
		const totalItemWidth = this.maxCols() * this.itemWidth();
		const totalButtonWidth = this.totalButtonWidth();
		return Math.max(totalItemWidth, totalButtonWidth) + $gameSystem.windowPadding()*2 + this.itemPadding()*2;
	};

	Window_NumberInput.prototype.windowHeight = function() {
		const lineHeight = this.lineHeight();
		const baseHeight = $gameSystem.windowPadding()*2 + this.itemPadding()*2 + lineHeight;
		if (ConfigManager.touchUI) {
			return baseHeight + lineHeight + $gameMap.tileHeight();
		} else {
			return baseHeight;
		}
	};
	
	Window_NumberInput.prototype.itemWidth = function() {
		return $gameMap.tileWidth();
	};

	Window_NumberInput.prototype.itemRect = function(index) {
		const rect = Window_Selectable.prototype.itemRect.call(this, index);
		return rect;
	};
	
	Window_NumberInput.prototype.placeButtons = function() {
		const sp = this.buttonSpacing();
		const totalWidth = this.totalButtonWidth();
		let x = this.itemPadding();
		for (const button of this._buttons) {
			button.x = x;
			button.y = this.buttonY();
			x += button.width + sp;
		}
	};
	
	Window_NumberInput.prototype.totalButtonWidth = function() {
		return this._buttons.reduce((r, button) => r + button.width, 0);
	};
	
	Window_NumberInput.prototype.buttonSpacing = function() {
		return 0;
	};
	
	Window_NumberInput.prototype.buttonY = function() {
		return this.lineHeight()*2 + this.itemPadding();
	};
	
	Window_NumberInput.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		const s = this._number.padZero(this._maxDigits);
		const c = s.slice(index, index + 1);
		rect.y += this.itemPadding();
		//this.resetTextColor();
		this.drawText(c, rect.x, rect.y, rect.width);
	};
	
	Window_NumberInput.prototype.processOk = function() {
		this.playOkSound();
		$gameVariables.setValue($gameMessage.numInputVariableId(), this._number);
		this._messageWindow.terminateMessage();
		this.updateInputData();
		this.deactivate();
		this.hide();
	};
	
	// Window Message
	Window_Message.prototype.initialize = function(rect) {
		Window_Base.prototype.initialize.call(this, rect);
		this.hide();
		this.initMembers();
		this._textSoundTime = 4;
		this._textSoundTimer = 0;
	};
	
	Window_Message.prototype.checkToNotClose = function() {
		if (!this.visibility && this.doesContinue()) {
			this.show();
		}
	};
	
	Window_Message.prototype.synchronizeNameBox = function() {
		if(this.visible) {
			this._nameBoxWindow.show();
		} else {
			this._nameBoxWindow.hide();
		}
	};
	
	Window_Message.prototype.startMessage = function() {
		const text = $gameMessage.allText();
		const textState = this.createTextState(text, 0, 0, 0);
		textState.x = this.newLineX(textState);
		textState.startX = textState.x;
		textState.y = this.itemPadding() + $gameMap.tileHeight()/2;
		textState.startY = textState.y;
		this._textState = textState;
		this.newPage(this._textState);
		this.updatePlacement();
		this.updateBackground();
		this.show();
		this._nameBoxWindow.start();
	};
	
	Window_Message.prototype.newLineX = function(textState) {
		const faceExists = $gameMessage.faceName() !== "";
		const faceWidth = ImageManager.faceWidth;
		const spacing = 20;
		const margin = faceExists ? faceWidth + spacing : this.itemPadding();
		return textState.rtl ? this.innerWidth - margin : margin;
	};
	
	Window_Message.prototype.terminateMessage = function() {
		this.hide();
		this._goldWindow.hide();
		$gameMessage.clear();
	};
	
	Window_Message.prototype.updateInput = function() {
		if (this.isAnySubWindowActive()) {
			return true;
		}
		if (this.pause) {
			if (this.isTriggered()) {
				Input.update();
				this.pause = false;
				this.playOkSound();
				if (!this._textState) {
					this.terminateMessage();
				}
			}
			return true;
		}
		return false;
	};
	
	Window_Message.prototype.updateMessage = function() {
		const textState = this._textState;
		if (textState) {
			while (!this.isEndOfText(textState)) {
				if (this.needsNewPage(textState)) {
					this.newPage(textState);
				}
				this.updateShowFast();
				this.processCharacter(textState);
				this.playTextSound();
				if (this.shouldBreakHere(textState)) {
					break;
				}
			}
			this.flushTextState(textState);
			if (this.isEndOfText(textState) && !this.isWaiting()) {
				this.onEndOfText();
			}
			return true;
		} else {
			return false;
		}
	};
	
	Window_Message.prototype.playTextSound = function() {
		if(this._textSoundTimer > 0) { this._textSoundTimer--; return; }
		this._textSoundTimer = this._textSoundTime;
		this.playCursorSound();
	};
	
	Window_Message.prototype.newPage = function(textState) {
		this.contents.clear();
		this.resetFontSettings();
		this.clearFlags();
		this.updateSpeakerName();
		this.loadMessageFace();
		textState.x = textState.startX;
		textState.y = textState.startY;
		textState.height = this.calcTextHeight(textState);
	};
	
	Window_Message.prototype.needsNewPage = function(textState) {
		return (
			!this.isEndOfText(textState) &&
			textState.y + textState.height > this.lineHeight()*5
		);
	};
	
	Window_Message.prototype.processEscapeCharacter = function(code, textState) {
		switch (code) {
			case "$":
				this._goldWindow.show();
				break;
			case ".":
				this.startWait(15);
				break;
			case "|":
				this.startWait(60);
				break;
			case "!":
				this.startPause();
				break;
			case ">":
				this._lineShowFast = true;
				break;
			case "<":
				this._lineShowFast = false;
				break;
			case "^":
				this._pauseSkip = true;
				break;
			default:
				Window_Base.prototype.processEscapeCharacter.call(
					this,
					code,
					textState
				);
				break;
		}
	};
	
	// Window Battle Status
	Window_BattleStatus.prototype.initialize = function(rect) {
		Window_StatusBase.prototype.initialize.call(this, rect);
		this._bitmapsReady = 0;
		this._actorCursors = [];
		this._actorBlinkTimer = 2;
		this.preparePartyRefresh();
	};

	Window_BattleStatus.prototype.cursorWidth = function() {
		const spriteW = $gameMap.tileWidth()/2;
		const columnW = spriteW*5;
		return spriteW*9 + columnW*4 - spriteW;
	};

	Window_BattleStatus.prototype.cursorHeight = function() {
		return this.itemHeight();
	};
	
	Window_BattleStatus.prototype.maxCols = function() {
		return 1;
	};

	Window_BattleStatus.prototype.itemHeight = function() {
		const lineHeight = $gameMap.tileWidth()/2;
		return lineHeight;
	};
	
	Window_BattleStatus.prototype.updatePadding = function() {
		Window_Base.prototype.updatePadding.call(this);
	};
	
	const _Window_BattleStatus_update = Window_BattleStatus.prototype.update;
	Window_BattleStatus.prototype.update = function() {
		_Window_BattleStatus_update.call(this);
		this.updateActorCursors();
	};
	
	Window_BattleStatus.prototype.updateActorCursors = function() {
		let cursorIndex = 0;
		this._actorBlinkTimer++;
		for(const cursor of this._actorCursors) {
			if(this.active && cursorIndex === this.index()) {
				if(this._actorBlinkTimer % 2) {
					cursor.show();
				} else {
					cursor.hide();
				}
			} else {
				cursor.hide();
			}
			cursorIndex++;
		}
	};
	
	Window_BattleStatus.prototype.refresh = function() {
		Window_StatusBase.prototype.refresh.call(this);
		this.drawHeaders();
	};
	
	Window_BattleStatus.prototype.refreshCursor = function() {
		const lineHeight = $gameMap.tileHeight();
		this.setCursorRect(0, -lineHeight, 0, 0);
	};
	
	Window_BattleStatus.prototype.drawHeaders = function() {
		const itemPadding = this.itemPadding();
		const spriteW = $gameMap.tileWidth()/2;
		const valueW = spriteW*4;
		const columnW = valueW+spriteW;
		const x = itemPadding + spriteW*9;
		const x2 = x + columnW;
		const x3 = x2 + columnW;
		const x4 = x3 + columnW;
		const y = itemPadding;
		this.drawText("Time", x, y, valueW);
		this.drawText("Hlth", x2, y, valueW);
		this.drawText("Endr", x3, y, valueW);
		this.drawText("Strs", x4, y, valueW);
	};
	
	Window_BattleStatus.prototype.drawItem = function(index) {
		this.drawItemStatus(index);
	};
	
	Window_BattleStatus.prototype.itemRect = function(index) {
		const rect = Window_Selectable.prototype.itemRect.call(this, index);
		const lineHeight = $gameMap.tileWidth()/2;
		rect.height += lineHeight;
		return rect;
	};
	
	Window_BattleStatus.prototype.drawItemStatus = function(index) {
		const actor = this.actor(index);
		const rect = this.itemRectWithPadding(index);
		const spriteW = $gameMap.tileWidth()/2;
		const valueW = spriteW*4;
		const columnW = valueW+spriteW;
		const x = rect.x;
		const x2 = x + spriteW*9;
		const x3 = x2 + columnW;
		const x4 = x3 + columnW;
		const x5 = x4 + columnW;
		const y = rect.y + this.itemPadding();
		this.drawActorName(actor, x, y);
		this.placeTimeGauge(actor, x2, y+1);
		this.drawText(actor.hp + "%", x3, y, valueW, "right");
		this.drawText(actor.mp + "%", x4, y, valueW, "right");
		this.drawText(actor.tp + "%", x5, y, valueW, "right");
		this.placeActorCursor(actor, x-1, y);
	};
	
	Window_BattleStatus.prototype.placeActorCursor = function(actor, x, y) {
		const key = "actor%1-cursor".format(actor.actorId());
		const sprite = this.createInnerSprite(key, Sprite);
		const width = this.cursorWidth()+2;
		const height = this.cursorHeight()+1;
		sprite.bitmap = new Bitmap(width, height);
		sprite.move(x, y);
		const color = ColorManager.ctGaugeColor1();
		sprite.bitmap.fillRect(0, 0, width, height, color);
		sprite.bitmap.clearRect(1, 1, width-2, height-2, color);
		sprite.hide();
		const members = $gameParty.battleMembers();
		this._actorCursors[members.indexOf(actor)] = sprite;
	};
	
	// Window Battle Enemy
	Window_BattleEnemy.prototype.colSpacing = function() {
		return 4;
	};
	
	Window_BattleEnemy.prototype.drawItem = function(index) {
		this.resetTextColor();
		const name = this._enemies[index].name();
		const rect = this.itemLineRect(index);
		rect.y += this.itemPadding();
		this.drawText(name, rect.x, rect.y, rect.width);
	};
	
	// Window Title Command
	Window_TitleCommand.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
		this.hide();
		this.selectLast();
	};
	
	// Window Game End
	Window_GameEnd.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
	};
})();
