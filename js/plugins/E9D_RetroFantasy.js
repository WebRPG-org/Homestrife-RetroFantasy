//=============================================================================
// RPG Maker MZ - Emerald9D's Retro Fantasy
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Features for Retro Fantasy.
 * @author Joule "Emerald9D" Royal
 *
 * @help E9D_RetroFantasy.js
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
 * The effect images feature allows the specification of image files that
 * contain simple animations. This is to bring back some functionality
 * resembling older RPG Maker skill animations. They can be referenced in skill
 * note json data.
 *
 * @param textImages
 * @text Text Images
 * @desc An array of text image files and their specifications.
 * @type struct<textImageInfo>[]
 *
 * @param effects
 * @text Effects
 * @desc An array of effects to be used by skills.
 * @type struct<effectInfo>[]
 */
 
/*~struct~textImageInfo:
 *
 * @param file
 * @text File
 * @desc The text image file.
 * @type file
 * @dir img/system
 *
 * @param characterW
 * @text Character Width
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
 
/*~struct~effectInfo:
 *
 * @param name
 * @text Name
 * @desc The name of the effect.
 * @type string
 *
 * @param animFile
 * @text Animation File
 * @desc The animation image file.
 * @type file
 * @dir img/effects
 *
 * @param frameW
 * @text Frame Width
 * @desc The width of an individual animation frame.
 * @type number
 * @default 64
 * @min 1
 * @decimals 0
 *
 * @param frameH
 * @text Frame Height
 * @desc The height of an individual animation frame.
 * @type number
 * @default 64
 * @min 1
 * @decimals 0
 *
 * @param frameCount
 * @text Frame Count
 * @desc The number of frames in the file.
 * @type number
 * @default 9
 * @min 1
 * @decimals 0
 *
 * @param mirror
 * @text Mirror
 * @desc Whether or not to mirror the animation graphics.
 * @type boolean
 *
 * @param filters
 * @text Filters
 * @desc An array of filters to be applied throughout the animation.
 * @type struct<filterInfo>[]
 *
 * @param se
 * @text SE
 * @desc The sound effect.
 * @type struct<seInfo>
 */
 
/*~struct~filterInfo:
 *
 * @param name
 * @text Name
 * @desc The name of the filter.
 * @type string
 *
 * @param shiftDown
 * @text Shift Down
 * @desc Whether or not the hue/luminosity shift should be negative.
 * @type boolean
 *
 * @param hue
 * @text Hue
 * @desc The hue to use.
 * @type number
 * @min 0
 * @max 12
 * @decimals 0
 *
 * @param startFrame
 * @text Start Frame
 * @desc Which frame in the animation the filter should begin in.
 * @type number
 * @min 0
 * @decimals 0
 *
 * @param duration
 * @text Duration
 * @desc How many frames of the animation the filter should last through.
 * @type number
 * @min 1
 * @decimals 0
 */
 
/*~struct~seInfo:
 *
 * @param name
 * @text SE File
 * @desc The sound effect file.
 * @type file
 * @dir audio/se
 *
 * @param volume
 * @text Volume
 * @desc The sound effect volume, from 0 to 100.
 * @type number
 * @default 90
 * @min 0
 * @max 100
 * @decimals 0
 *
 * @param pitch
 * @text Pitch
 * @desc The sound effect pitch, from 50 to 150.
 * @type number
 * @default 100
 * @min 50
 * @max 150
 * @decimals 0
 *
 * @param pan
 * @text Pan
 * @desc The sound effect panning, from -100 to 100.
 * @type number
 * @default 0
 * @min -100
 * @max 100
 * @decimals 0
 */

(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('E9D_RetroFantasy');
	parsePluginParameters();
	
	// plugin variables
	let curTextImage = 0;
	
	// helper functions
	function parsePluginParameters() {
		pluginParams.useTextImages = true;
		pluginParams.textImages = parseStringToJson(pluginParams.textImages, []);
		for(const textImageInfoStringIndex in pluginParams.textImages) {
			const textImageInfo = JSON.parse(pluginParams.textImages[textImageInfoStringIndex]);
			textImageInfo.characterW = parseJSONInt(textImageInfo.characterW, 8, 1);
			textImageInfo.characterH = parseJSONInt(textImageInfo.characterH, 8, 1);
			pluginParams.textImages[textImageInfoStringIndex] = textImageInfo;
		}
		pluginParams.effects = parseStringToJson(pluginParams.effects, []);
		for(const effectInfoStringIndex in pluginParams.effects) {
			const effectInfo = JSON.parse(pluginParams.effects[effectInfoStringIndex]);
			effectInfo.frameW = parseJSONInt(effectInfo.frameW, 64, 1);
			effectInfo.frameH = parseJSONInt(effectInfo.frameH, 64, 1);
			effectInfo.frameCount = parseJSONInt(effectInfo.frameCount, 1, 1);
			
			effectInfo.filters = parseStringToJson(effectInfo.filters, []);
			for(const filterInfoStringIndex in effectInfo.filters) {
				const filterInfo = JSON.parse(effectInfo.filters[filterInfoStringIndex]);
				filterInfo.shiftDirection = filterInfo.shiftDown === "true" ? -1 : 1;
				filterInfo.hue = parseJSONInt(filterInfo.hue, 0, 0, 12);
				filterInfo.startFrame = parseJSONInt(filterInfo.startFrame, 0, 0);
				filterInfo.duration = parseJSONInt(filterInfo.duration, 1, 1);
				effectInfo.filters[filterInfoStringIndex] = filterInfo;
			}
			
			effectInfo.se = parseStringToJson(effectInfo.se, {});
			effectInfo.se.volume = parseJSONInt(effectInfo.se.volume, 90, 0, 100);
			effectInfo.se.pitch = parseJSONInt(effectInfo.se.pitch, 100, 50, 150);
			effectInfo.se.pan = parseJSONInt(effectInfo.se.pan, 0, -100, 100);
			
			pluginParams.effects[effectInfoStringIndex] = effectInfo;
		}
	}
	
	function parseJSONInt(string, defaultValue, min, max) {
		let parsedValue = parseInt(string);
		return processNumber(parsedValue, defaultValue, min, max);
	}
	
	function parseJSONFloat(string, defaultValue, min, max) {
		let parsedValue = parseFloat(string);
		return processNumber(parsedValue, defaultValue, min, max);
	}
	
	function processNumber(number, defaultValue, min, max) {
		if(number === NaN) { return defaultValue; }
		if(min !== undefined) { number = Math.max(min, number); }
		if(max !== undefined) { number = Math.min(max, number); }
		return number;
	}
	
	function parseStringToJson(string, defaultValue) {
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
		const bmp = ImageManager.loadBitmapFromUrl("img/system/" + textImage.file + ".png");
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
	
	// Tilemap
	/**
	 * Updates the tilemap for each frame.
	 */
	Tilemap.prototype.update = function() {
		this.animationCount++;
		this.animationFrame = Math.floor(this.animationCount / 15);
		for (const child of this.children) {
			if (child.update) {
				child.update();
			}
		}
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
		for(const skill of $dataSkills) {
			if(!skill) { continue; }
			skill.e9dInfo = skill.note && skill.note.length > 0 ? JSON.parse(skill.note) : {};
		}
		for(const item of $dataItems) {
			if(!item) { continue; }
			item.e9dInfo = item.note && item.note.length > 0 ? JSON.parse(item.note) : {};
		}
		for(const weapon of $dataWeapons) {
			if(!weapon) { continue; }
			weapon.e9dInfo = weapon.note && weapon.note.length > 0 ? JSON.parse(weapon.note) : {};
		}
		for(const armor of $dataArmors) {
			if(!armor) { continue; }
			armor.e9dInfo = armor.note && armor.note.length > 0 ? JSON.parse(armor.note) : {};
		}
		for(const enemy of $dataEnemies) {
			if(!enemy) { continue; }
			enemy.e9dInfo = enemy.note && enemy.note.length > 0 ? JSON.parse(enemy.note) : {};
		}
	};
	
	// Audio Manager
	AudioManager.playSe = function(se) {
		if (se.name) {
			// [Note] Do not play the same sound in the same frame.
			const latestBuffers = this._seBuffers.filter(
				buffer => buffer.frameCount === Graphics.frameCount
			);
			if (latestBuffers.find(buffer => buffer.name === se.name)) {
				return;
			}
			const buffer = this.createBuffer("se/", se.name);
			this.updateSeParameters(buffer, se);
			buffer.play(false);
			this._seBuffers.push(buffer);
			this.cleanupSe();
			return buffer;
		}
		return null;
	};
	
	// Sound Manager
	SoundManager.playSwing = function(seWeight) {
		const se = {};
		se.name = seWeight === "heavy" ? "swingHeavy" : "swing";
		se.volume = 90;
		se.pitch = 100;
		se.pan = 0;
		AudioManager.playSe(se);
	};
	
	SoundManager.playHit = function(result) {
		const se = {};
		se.name = result.hpDamage === 0 ? "hitNoDamage" : (result.critical ? "hit" : "hitArmor");
		se.volume = 90;
		se.pitch = 100;
		se.pan = 0;
		return AudioManager.playSe(se);
	};
	
	SoundManager.playParry = function() {
		const se = {};
		se.name = "parry";
		se.volume = 90;
		se.pitch = 100;
		se.pan = 0;
		AudioManager.playSe(se);
	};
	
	// Battle Manager
	const _BattleManager_initMembers = BattleManager.initMembers;
	BattleManager.initMembers = function() {
		_BattleManager_initMembers.call(this);
		this._actionWindow = null;
	};
	
	BattleManager.setActionWindow = function(actionWindow) {
		this._actionWindow = actionWindow;
	};
	
	BattleManager.updateTpb = function() {
		while(!this.updateAllTpbBattlers()) {
			$gameParty.updateTpb();
			$gameTroop.updateTpb();
		}
		this.checkTpbTurnEnd();
	};

	BattleManager.updateAllTpbBattlers = function() {
		let result = false;
		for (const battler of this.allBattleMembers()) {
			result = this.updateTpbBattler(battler) ? true : result;
		}
		return result;
	};

	BattleManager.updateTpbBattler = function(battler) {
		if (battler.isTpbTurnEnd()) {
			battler.onTurnEnd();
			battler.startTpbTurn();
			this.displayBattlerStatus(battler, false);
			return true;
		} else if (battler.isTpbReady()) {
			battler.startTpbAction();
			this._actionBattlers.push(battler);
			return true;
		} else if (battler.isTpbTimeout()) {
			battler.onTpbTimeout();
			this.displayBattlerStatus(battler, true);
			return true;
		}
		return false;
	};

	BattleManager.checkTpbTurnEnd = function() {
		if ($gameTroop.isTpbTurnEnd()) {
			this.endTurn();
		}
	};
	
	BattleManager.invokeAction = function(subject, target) {
		this._logWindow.push("pushBaseLine");
		this.invokeNormalAction(subject, target);
		subject.setLastTarget(target);
		this._logWindow.push("popBaseLine");
	};
	
	BattleManager.invokeNormalAction = function(subject, target) {
		const realTarget = this.applySubstitute(target);
		this._action.apply(realTarget);
		this._logWindow.displayActionResults(subject, this._action, realTarget);
	};
	
	BattleManager.startAction = function() {
		const subject = this._subject;
		const action = subject.currentAction();
		const targets = action.makeTargets();
		this._phase = "action";
		this._action = action;
		this._targets = targets;
		subject.cancelMotionRefresh();
		this._action.applyGlobal();
		this._logWindow.startAction(subject, action, targets);
		this._actionWindow.setItem(action.effectiveItem());
		this._actionWindow.show();
	};
	
	BattleManager.endAction = function() {
		this._subject.useItem(this._action.item());
		
		// stress inflicted from using a flail
		if(this._subject.equips) {
			const weapon = this._subject.equips()[0];
			if(weapon && weapon.wtypeId > 6 && weapon.wtypeId < 10) {
				const skill = this._action.item();
				if(skill.id === 1 || skill.id === 4) {
					this._subject._tp += Game_Action.prototype.stressThreshold()*2;
					this._subject._tp = this._subject._tp.clamp(0, this.maxTp());
					$gameTemp.requestBattleRefresh();
				}
			}
		}
		
		this._logWindow.endAction(this._subject);
		this._actionWindow.hide();
		this._phase = "turn";
		if (this._subject.numActions() === 0) {
			this.endBattlerActions(this._subject);
			this._subject = null;
		}
	};
	
	BattleManager.endBattle = function(result) {
		this._phase = "battleEnd";
		this.cancelActorInput();
		this._inputting = false;
		if (this._eventCallback) {
			this._eventCallback(result);
		}
		if (result === 0) {
			$gameSystem.onBattleWin();
		} else if (this._escaped) {
			$gameSystem.onBattleEscape();
		}
		this.regenerateAllTp();
	};
	
	BattleManager.regenerateAllTp = function() {
		for (const actor of $gameParty.allMembers()) {
			actor.gainSilentMp(-actor.tp/Game_Action.prototype.enduranceStressRatio());
			actor.gainSilentTp(-actor.tp);
		}
	};
	
	// Color Manager
	ColorManager.textColor = function(n) {
		const px = 32 + (n % 8) * 4 + 2;
		const py = 48 + Math.floor(n / 8) * 4 + 2;
		return this._windowskin.getPixel(px, py);
	};
	
	// Game Temp
	// prettier-ignore
	Game_Temp.prototype.requestAnimation = function(
		targets, effectName
	) {
		for(const effect of pluginParams.effects) {
			if(effect.name && effect.name === effectName) {
				const request = {
					targets: targets,
					effect: effect
				};
				this._animationQueue.push(request);
				for (const target of targets) {
					if (target.startAnimation) {
						target.startAnimation();
					}
				}
				break;
			}
		}
	};
	
	// Game System
	Game_System.prototype.windowPadding = function() {
		return 4;
	};
	
	// Game Action
	Game_Action.prototype.decideRandomTarget = function() {
		let target;
		if (this.isForDeadFriend()) {
			target = this.friendsUnit().randomDeadTarget();
		} else if (this.isForFriend()) {
			target = this.friendsUnit().randomTarget(true);
		} else {
			target = this.opponentsUnit().randomTarget(false, this.isReach());
		}
		if (target) {
			this._targetIndex = target.index();
		} else {
			this.clear();
		}
	};
	
	Game_Action.prototype.confusionTarget = function() {
		switch (this.subject().confusionLevel()) {
			case 1:
				return this.opponentsUnit().randomTarget(false, this.isReach());
			case 2:
				if (Math.randomInt(2) === 0) {
					return this.opponentsUnit().randomTarget(false, this.isReach());
				}
				return this.friendsUnit().randomTarget(false, this.isReach());
			default:
				return this.friendsUnit().randomTarget(false, this.isReach());
		}
	};
	
	Game_Action.prototype.targetsForOpponents = function() {
		const unit = this.opponentsUnit();
		if (this.isForRandom()) {
			return this.randomTargets(unit);
		} else {
			return this.targetsForAlive(unit);
		}
	};

	Game_Action.prototype.targetsForFriends = function() {
		const unit = this.friendsUnit();
		if (this.isForUser()) {
			return [this.subject()];
		} else if (this.isForDeadFriend()) {
			return this.targetsForDead(unit);
		} else if (this.isForAliveFriend()) {
			return this.targetsForAlive(unit, true);
		} else {
			return this.targetsForDeadAndAlive(unit);
		}
	};
	
	Game_Action.prototype.randomTargets = function(unit) {
		const targets = [];
		for (let i = 0; i < this.numTargets(); i++) {
			targets.push(unit.randomTarget(false, this.isReach()));
		}
		return targets;
	};
	
	Game_Action.prototype.targetsForAlive = function(unit, forFriends) {
		if (this.isForOne()) {
			if (this._targetIndex < 0) {
				return [unit.randomTarget(forFriends, this.isReach())];
			} else {
				return [unit.smoothTarget(this._targetIndex)];
			}
		} else {
			return unit.aliveMembers();
		}
	};
	
	Game_Action.prototype.isReach = function() {
		// Figure out if its melee, ranged, or special
		if(this.isAttack()) {
			// need to dynamically figure things out for basic attacks
			if(this.subject().equips) {
				// actor basic attack hit is based on weapon type
				const weapon = this.subject().equips()[0];
				if(
					weapon && (
						weapon.wtypeId >= 16 || // strictly ranged
						(weapon.wtypeId > 9 && weapon.wtypeId < 13) // reach weapon
					)
				) {
					return true;
				}
			} else {
				// how does an enemy figure this out? they probably just always choose specific skills
			}
		} else if(!this.isGuard()) {
			// for other skills, just base it on the skill itself
			if(this.isMagical()) {
				return true;
			}
		}
		return false;
	};
	
	Game_Action.prototype.rangeType = function() {
		// Figure out if its melee, ranged, or special
		if(this.isAttack()) {
			// need to dynamically figure things out for basic attacks
			if(this.subject().equips) {
				// actor basic attack hit is based on weapon type
				const weapon = this.subject().equips()[0];
				if(weapon && weapon.wtypeId >= 16) {
					// its a strictly ranged weapon
					return "ranged";
				}
			} else {
				// how does an enemy figure this out?
			}
		} else if(!this.isGuard()) {
			// for other skills, just base it on the skill itself
			if(this.isMagical()) {
				if(this.item().stypeId === 1) {
					// weapon tech, so ranged
					return "ranged";
				} else {
					// special (ranged, but ignoring the weapon)
					return "special";
				}
			}
		}
		return "melee";
	};
	
	Game_Action.prototype.stressThreshold = function() {
		return 10;
	};
	
	Game_Action.prototype.effectiveItem = function() {
		if(this.isAttack()) {
			const weapon = this.subject().equips ? this.subject().equips()[0] : null;
			if(weapon) {
				const target = this.opponentsUnit().members()[this._targetIndex];
				const unarmored = target.def <= 0 || target.cev <= 0;
				let firstSkill = -1;
				for(const trait of weapon.traits) {
					if(trait.code === 43) {
						if(firstSkill === -1) { firstSkill = trait.dataId; } // hang onto the very first skill
						if(
							(unarmored && (trait.dataId === 5 || trait.dataId === 7)) || // use the first skill that is anti-armor
							(!unarmored && (trait.dataId === 4 || trait.dataId === 6)) // use the first skill that is regular damage
						) {
							return $dataSkills[trait.dataId];
						}
					}
				}
				return $dataSkills[firstSkill]; // use the first skill found
			} else {
				return $dataSkills[101];
			}
		}
		return this.item();
	};
	
	Game_Action.prototype.itemHit = function(target, rangeType, isReach) {
		//const successRate = this.item().successRate;
		let adjustType = "none";
		const weapon = this.subject().equips ? this.subject().equips()[0] : null;
		if(!this.isAttack() && weapon) {
			if(this.item().id === 52 || (this.item().id > 53 && this.item().id < 103)) {
				// pommel strike or non-weapon tech shouldn't include the weapon bonus
				adjustType = "ignoreWeapon";
			} else if(this.item().id > 3 && this.item().id < 52 && (weapon.wtypeId === 4 || weapon.wtypeId === 5 || weapon.wtypeId === 6)) {
				// sword techs get a small penalty
				adjustType = "swordTech";
			}
		}
		let subjectHit = 0;
		switch(rangeType) {
		case "melee":
			subjectHit = this.subject().hit;
			if(adjustType === "ignoreWeapon") {
				subjectHit -= weapon.traits.reduce((prev, cur) => prev + (cur.code === Game_BattlerBase.TRAIT_XPARAM && cur.dataId === 0 ? Math.round(cur.value * 100) : 0), 0);
			}
			const rangePenalty = 5;
			const totalPenalty = Math.max(0, (this.subject().backRow() ? rangePenalty : 0) + (target.backRow() ? rangePenalty : 0) - (isReach ? rangePenalty : 0));
			subjectHit -= totalPenalty;
			break;
		case "ranged":
			subjectHit = this.subject().xparam(2);
			if(adjustType === "ignoreWeapon") {
				subjectHit -= weapon.traits.reduce((prev, cur) => prev + (cur.code === Game_BattlerBase.TRAIT_XPARAM && cur.dataId === 2 ? Math.round(cur.value * 100) : 0), 0);
			}
			break;
		case "special":
			subjectHit = this.subject().xparam(4);
			if(adjustType === "ignoreWeapon") {
				subjectHit -= weapon.traits.reduce((prev, cur) => prev + (cur.code === Game_BattlerBase.TRAIT_XPARAM && cur.dataId === 4 ? Math.round(cur.value * 100) : 0), 0);
			}
			break;
		}
		subjectHit -= adjustType === "swordTech" ? 2 : 0;
		return Math.max(0, subjectHit - Math.floor(this.subject().tp / this.stressThreshold()));
	};

	Game_Action.prototype.itemEva = function(target) {
		return Math.max(0, target.eva + (target.isGuard() ? 5 : 0) - Math.floor(target.tp / this.stressThreshold()));
	};
	
	Game_Action.prototype.itemCri = function(target) {
		if(this.item().damage.critical) {
			let elementId = 0;
			if (this.isAttack()) {
				const elements = this.subject().attackElements();
				for(const element of elements) {
					if(element === 2) { // high crit
						elementId = 2;
						break;
					}
				}
			} else {
				elementId = this.item().damage.elementId;
			}
			
			let critEva = target.cev;
			if(critEva === 0) { return 0; }
			switch(elementId) {
			case 0: // none
			case 1: // piercing
				// this stuff has a hard time getting around armor
				critEva += 0.15;
				break;
			}
			return critEva;
		} else {
			return 1;
		}
	};
	
	Game_Action.prototype.apply = function(target) {
		const result = target.result();
		this.subject().clearResult();
		result.clear();
		result.used = this.testApply(target);
		// is "used" necessary?
		//result.missed = result.used && Math.random() >= this.itemHit(target);
		result.missed = false;
		result.parry = false;
		
		// here's the new hit/miss math
		const rangeType = this.rangeType();
		const isReach = this.isReach();
		const subjectHit = this.itemHit(target, rangeType, isReach); // accuracy
		const targetEva = this.itemEva(target); // evasion, guarding adds a bonus
		const successRate = this.isCertainHit() ? 0.5 : this.doRoll(subjectHit, targetEva);
		result.evaded = successRate < 0.5;
		// new hit/miss math over
		
		//result.physical = this.isPhysical();
		//result.drain = this.isDrain();
		result.physical = true;
		result.drain = false;
		
		if (result.isHit()) {
			if (this.item().damage.type > 0) {
				// here's the new critical math
				result.critical = this.doRoll(subjectHit, targetEva) >= this.itemCri(target);
				// new critical math over
				
				const value = this.makeDamageValue(target, result.critical, successRate - 0.5);
				this.executeDamage(target, value);
			}
			for (const effect of this.item().effects) {
				this.applyItemEffect(target, effect);
			}
			this.applyItemUserEffect(target);
		} else if(!this.isCertainHit()) {
			if(rangeType === "melee") {
				// check for a parry
				result.parry = this.doRoll(subjectHit, targetEva) < target.xparam(5);
			}
			if(result.parry) {
				// apply stress to attacker
				this.subject().gainTp(Math.max(0, Math.round(this.stressThreshold()*2 - (this.stressThreshold()*2 * (Math.min(successRate, 0.5) / 0.5)))));
			} else {
				// apply stress even on miss
				target.gainTp(Math.round(this.stressThreshold()*2 * (Math.min(successRate, 0.5) / 0.5)));
			}
		}
		this.updateLastTarget(target);
		$gameTemp.requestBattleRefresh();
	};
	
	Game_Action.prototype.doRoll = function(hit, eva) {
		const rollDiff = hit-eva;
		let rollCount = Math.abs(rollDiff);
		let roll = Math.random();
		while(rollCount > 0) {
			const nextRoll = Math.random();
			if((rollDiff < 0 && nextRoll < roll) || (rollDiff > 0 && nextRoll > roll)) {
				roll = nextRoll;
			}
			rollCount--;
		}
		return roll;
	};
	
	Game_Action.prototype.elementalPowerRatio = function() {
		// if a weapon attack also has elemental damage types (fire, ice, etc), this much of the power is actuall elemental damage
		return 0.1;
	};
	
	Game_Action.prototype.makeDamageValue = function(target, critical, successRate) {
		const item = this.item();
		
		// get the power from either the weapon or the skill itself. bonus damage from hit success amount
		let power = this.subject().atk;
		if(!this.isAttack() && (item.stypeId != 1 || (item.id > 52 && item.id < 103))) {
			// get power from the skill itself if its not an attack, and not one of the first 50 techs
			power = this.evalDamageFormula(target);
		}
		const powerMult = item.id === 52 ? 7.5 : 10; // pommel attack uses partial damage
		power = power * powerMult * (1 + successRate);
		
		// armor, unless its a critical or stress
		const armor = critical || this.isMpEffect() ? 0 : target.def * 5;
		
		// gather the elements and do element specific stuff
		let isWeaponAttack = false;
		let isPiercing = false;
		const fluidElements = [];
		if (this.isAttack() || (item.stypeId == 1 && item.id > 3 && item.id < 53)) {
			isWeaponAttack = true;
			const elements = this.subject().attackElements();
			if(!this.isAttack()) {
				// get rid of the weapon's piercing and high crit and use the skill's element instead
				elements.filter(element => element > 2);
				elements.push(this.item().damage.elementId);
			}
			for(const element of elements) {
				if(element === 1) {
					isPiercing = true;
				} else if(element > 2) {
					fluidElements.push(element);
				}
			}
		} else {
			isPiercing = this.item().damage.elementId === 1;
		}
		
		let elementalPower = 0;
		if(isWeaponAttack) {
			if (fluidElements.length > 0) {
				// if a weapon attack has elemental damage types, remove them from the total power
				for(const element of fluidElements) {
					switch(element) {
					case 3: // fire
					case 4: // ice
					case 5: // corrode
					case 6: // lightning
					case 7: // banish
					case 8: // curse
						// TODO: elemental resistences should get applied at some point
						elementalPower += power * this.elementalPowerRatio();
						break;
					}
				}
				elementalPower = Math.min(power, elementalPower);
				power = Math.max(0, power - elementalPower);
			}
		} else {
			// TODO: elemental resistence for non-weapon attacks should get applied here
		}
		
		// piercing basically ignores 50% of the power that would have been reduced
		const bonusBlunt = isPiercing ? Math.min(power, armor) / 2 : 0;
		
		// get the final value
		return Math.round(Math.max(0, power + bonusBlunt + elementalPower - armor));
	};

	Game_Action.prototype.calcElementRate = function(target) {
		if (this.item().damage.elementId < 0) {
			return this.elementsMaxRate(target, this.subject().attackElements());
		} else {
			return target.elementRate(this.item().damage.elementId);
		}
	};

	Game_Action.prototype.elementsMaxRate = function(target, elements) {
		if (elements.length > 0) {
			const rates = elements.map(elementId => target.elementRate(elementId));
			return Math.max(...rates);
		} else {
			return 1;
		}
	};
	
	Game_Action.prototype.executeMpDamage = function(target, value) {
		if (value !== 0) {
			this.makeSuccess(target);
		}
		// reduction from balance
		const reducedValue = Math.max(0, this.stressThreshold()*2 + value - target.sparam(8)*4);
		// gain stress instead
		target.gainTp(reducedValue);
		this.gainDrainedMp(-reducedValue);
	};
	
	Game_Action.prototype.gainDrainedMp = function(value) {
		if (this.isDrain()) {
			let gainTarget = this.subject();
			if (this._reflectionTarget) {
				gainTarget = this._reflectionTarget;
			}
			gainTarget.gainTp(value);
		}
	};
	
	Game_Action.prototype.enduranceStressRatio = function() {
		return 10;
	};
	
	Game_Action.prototype.itemEffectRecoverHp = function(target, effect) {
		let value = (target.mhp * effect.value1 + effect.value2) * target.rec;
		if (this.isItem()) {
			value *= this.subject().pha;
		}
		value = Math.floor(value);
		if (value !== 0) {
			const effectiveValue = Math.min(target.mhp - target.hp, value);
			const stressRate = Math.round((effectiveValue / target.mhp) * 100);
			if($gameParty.inBattle()) {
				target.gainSilentTp(stressRate);
			} else if(this.item().occasion !== 2) {
				target.gainSilentMp(-stressRate/this.enduranceStressRatio());
			}
			target.gainHp(value);
			this.makeSuccess(target);
		}
	};
	
	Game_Action.prototype.itemEffectGainTp = function(target, effect) {
		let value = Math.floor(effect.value1);
		if (value !== 0) {
			target.gainTp(-value);
			this.makeSuccess(target);
		}
	};
	
	Game_Action.prototype.applyItemUserEffect = function(/*target*/) {
		const value = Math.floor(this.item().tpGain * this.subject().tcr);
		this.subject().gainTp(value * (this.subject().isGuard() ? 2 : 1));
	};
	
	// Game Action Result
	_Game_ActionResult = Game_ActionResult.prototype.clear;
	Game_ActionResult.prototype.clear = function() {
		_Game_ActionResult.call(this);
		this.parry = false;
	};
	
	// Game Battler Base
	const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
	Game_BattlerBase.prototype.initMembers = function() {
		_Game_BattlerBase_initMembers.call(this);
		this._prevMhp = 500;
		this._backRow = false;
		this._skillLevels = {};
		// performance
		this._skillLevels.MeleeAc	= 0;
		this._skillLevels.RangeAc	= 0;
		this._skillLevels.Defense	= 0;
		this._skillLevels.Balance	= 0;
		this._skillLevels.Agility	= 0;
		this._skillLevels.Focus		= 0;
		// universal ability
		this._skillLevels.MeleeWp	= 0;
		this._skillLevels.Throw		= 0;
		this._skillLevels.Archery	= 0;
		this._skillLevels.Firearm	= 0;
		// unique ability
		this._skillLevels.Tactics	= 0;
		this._skillLevels.Engine	= 0;
		this._skillLevels.Stealth	= 0;
		this._skillLevels.Wayfare	= 0;
		this._skillLevels.Spirit	= 0;
		this._skillLevels.Tough		= 0;
		this._skillLevels.GrayMgc	= 0;
		this._skillLevels.SpellSd	= 0;
		this._skillLevels.WhiteMg	= 0;
		this._skillLevels.Divine	= 0;
		this._skillLevels.BlackMg	= 0;
		this._skillLevels.DarkEye	= 0;
	};
	
	Game_BattlerBase.prototype.updateAbilities = function() {
		// this gets overrided in Game_Actor
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
		if(undefined === this._skillLevels[skillName] || newLevel === this._skillLevels[skillName]) { return; }
		this._skillLevels[skillName] = Math.max(0, Math.min(9, newLevel));
		if(skillName === "Tough") {
			this.refresh();
		}
		if(
			skillName === "MeleeWp" ||
			skillName === "Throw" 	||
			skillName === "Archery"	||
			skillName === "Firearm" ||
			skillName === "Tactics" ||
			skillName === "Engine" 	||
			skillName === "Stealth" ||
			skillName === "Wayfare" ||
			skillName === "Spirit" 	||
			skillName === "Tough" 	||
			skillName === "GrayMgc" ||
			skillName === "SpellSd" ||
			skillName === "WhiteMg" ||
			skillName === "Divine" 	||
			skillName === "BlackMg" ||
			skillName === "DarkEye"
		) {
			this.updateAbilities();
		}
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
	
	Game_BattlerBase.prototype.param = function(paramId) {
		if(paramId === 0) {
			return this.sparam(6)*100;
		}
		
		const value =
			this.paramBasePlus(paramId) *
			this.paramRate(paramId) *
			this.paramBuffRate(paramId);
		const maxValue = this.paramMax(paramId);
		const minValue = this.paramMin(paramId);
		return Math.round(value.clamp(minValue, maxValue));
	};
	
	Game_BattlerBase.prototype.refresh = function() {
		for (const stateId of this.stateResistSet()) {
			this.eraseState(stateId);
		}
		
		this._hp = this._hp.clamp(0, this.mhp);
		
		if(this._prevMhp !== this.mhp && this._hp > 0 && this._hp < this.mhp) {
			const prevHpPercent = this._hp / this._prevMhp;
			this._hp = this.mhp * prevHpPercent;
		}
		
		this._mp = this._mp.clamp(0, this.mmp);
		this._tp = this._tp.clamp(0, this.maxTp());
		
		this._prevMhp = this.mhp;
	};
	
	const _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
	Game_BattlerBase.prototype.param = function(paramId) {
		let paramTotal = _Game_BattlerBase_param.call(this, paramId);
		switch(paramId) {
			case 6: //agility, using Agility
				paramTotal += this.skillLevel("Agility");
				break;
		}
		return paramTotal;
	};
	
	const _Game_BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
	Game_BattlerBase.prototype.xparam = function(xparamId) {
		let xparamTotal = _Game_BattlerBase_xparam.call(this, xparamId);
		switch(xparamId) {
			case 0: //melee accuracy, using Hit Rate
				xparamTotal = Math.round(xparamTotal*100) + this.skillLevel("MeleeAc");
				break;
			case 1: //evasion, using Evasion Rate
				xparamTotal = Math.round(xparamTotal*100) + this.skillLevel("Defense");
				break;
			case 2: //range accuracy, using Critical Rate
			case 4: //special accuracy, using Magic Evasion (???)
				xparamTotal = Math.round(xparamTotal*100) + this.skillLevel("RangeAc");
				break;
			case 9: //focus, using TP Regeneration
				xparamTotal = Math.round(xparamTotal*100) + this.skillLevel("Focus");
				break;
		}
		return xparamTotal;
	};
	
	const _Game_BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
	Game_BattlerBase.prototype.sparam = function(sparamId) {
		let sparamTotal = _Game_BattlerBase_sparam.call(this, sparamId);
		switch(sparamId) {
			case 6: //toughness, using Physical Damage
				sparamTotal = Math.round(sparamTotal*100) + this.skillLevel("Tough");
				break;
			case 8: //balance, using Floor Damage
				sparamTotal = Math.round(sparamTotal*100) + this.skillLevel("Balance");
				break;
		}
		return sparamTotal;
	};
	
	Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
		return true;
	};
	
	Game_BattlerBase.prototype.paySkillCost = function(skill) {
		if($gameParty.inBattle()) {
			this._tp += this.skillMpCost(skill) + this.skillTpCost(skill);
			this._tp = this._tp.clamp(0, this.maxTp());
			$gameTemp.requestBattleRefresh();
		} else {
			this._mp -= (this.skillMpCost(skill) + this.skillTpCost(skill))/Game_Action.prototype.enduranceStressRatio();
			this._mp = this._mp.clamp(0, this.mmp);
		}
	};
	
	// Game Battler
	Game_Battler.prototype.initTp = function() {
		this.clearTp();
	};
	
	Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
		const stressFromDamage = Math.round((damageRate / this.mhp) * 100);
		this.gainSilentTp(Game_Action.prototype.stressThreshold()*2+stressFromDamage);
	};
	
	Game_Battler.prototype.regenerateTp = function() {
		const regenRate = this.xparam(9)*Game_Action.prototype.stressThreshold()*2/5;
		const tpRate = Math.min(Math.floor(this.mp*Game_Action.prototype.enduranceStressRatio()), regenRate);
		const adjustedTpRate = Math.max(this.xparam(9), tpRate);
		const mpRate = Math.min(this.tp, tpRate);
		this.gainSilentTp(-adjustedTpRate);
		this.gainSilentMp(-mpRate/Game_Action.prototype.enduranceStressRatio());
	};
	
	Game_Battler.prototype.onDamage = function(value) {
		this.removeStatesByDamage();
		this.chargeTpByDamage(value);
	};
	
	Game_Battler.prototype.onTurnEnd = function() {
		this.clearResult();
		this.regenerateAll();
		this.updateStateTurns();
		this.updateBuffTurns();
		this.removeStatesAuto(2);
		$gameTemp.requestBattleRefresh();
	};
	
	Game_Battler.prototype.gainSilentMp = function(value) {
		this.setMp(this.mp + value);
	};
	
	Game_Battler.prototype.gainTp = function(value) {
		this._result.tpDamage = value;
		this.setTp(this.tp + value);
	};
	
	Game_Battler.prototype.shouldPopupDamage = function() {
		const result = this._result;
		return (
			result.missed ||
			result.evaded ||
			result.hpAffected ||
			result.mpDamage !== 0 ||
			result.tpDamage !== 0
		);
	};
	
	Game_Battler.prototype.performActionEnd = function() {
		this.clearResult();
	};
	
	Game_Battler.prototype.performDamage = function(action) {
		let hitBuffer = null;
		if(!action.effectiveItem().e9dInfo.effect) {
			hitBuffer = SoundManager.playHit(this.result());
		}
		this.clearResult();
		return hitBuffer;
	};
	
	Game_Battler.prototype.performMiss = function() {
		if(this.result().parry) {
			SoundManager.playParry();
		}
		this.clearResult();
	};
	
	Game_Battler.prototype.performRecovery = function() {
		//SoundManager.playRecovery();
	};
	
	Game_Battler.prototype.performEvasion = function() {
		if(this.result().parry) {
			SoundManager.playParry();
		}
		this.clearResult();
	};
	
	// Game Actor
	const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_Game_Actor_initMembers.call(this);
		this._justEquipped = null;
		this._trailImage = null;
	};
	
	const _Game_Actor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		_Game_Actor_setup.call(this, actorId);
		this.updateAbilities();
	};
	
	Game_Actor.prototype.updateAbilities = function() {
		this._skills = [];
		$dataSkills.forEach((skill) => {
			if(skill === undefined || skill === null || this._skills.indexOf(skill.id) >= 0) { return; }
			if(this.meetsAbilityRequirements(skill.e9dInfo.requirements, true)) {
				this._skills.push(skill.id);
			}
		});
		this._skills.sort((a, b) => a - b);
	};
	
	Game_Actor.prototype.meetsAbilityRequirements = function(reqs, ignoreEquipAbilities) {
		if(!reqs || reqs.length === undefined || reqs.length === 0) { return false; }
		for(let i = 0; i < reqs.length; i++) {
			if(ignoreEquipAbilities && reqs[i].equipment) { continue; } //ignore requirements that come from equipment
			if(
				(reqs[i].meleeWp 	=== undefined || this._skillLevels.MeleeWp 	>= reqs[i].meleeWp) &&
				(reqs[i].throw 		=== undefined || this._skillLevels.Throw 	>= reqs[i].throw) 	&&
				(reqs[i].archery 	=== undefined || this._skillLevels.Archery 	>= reqs[i].archery) &&
				(reqs[i].firearm 	=== undefined || this._skillLevels.Firearm 	>= reqs[i].firearm) &&
				(reqs[i].tactics 	=== undefined || this._skillLevels.Tactics 	>= reqs[i].tactics) &&
				(reqs[i].engine 	=== undefined || this._skillLevels.Engine 	>= reqs[i].engine) 	&&
				(reqs[i].stealth 	=== undefined || this._skillLevels.Stealth 	>= reqs[i].stealth) &&
				(reqs[i].wayfare 	=== undefined || this._skillLevels.Wayfare 	>= reqs[i].wayfare) &&
				(reqs[i].spirit 	=== undefined || this._skillLevels.Spirit 	>= reqs[i].spirit) 	&&
				(reqs[i].tough 		=== undefined || this._skillLevels.Tough 	>= reqs[i].tough) 	&&
				(reqs[i].grayMgc 	=== undefined || this._skillLevels.GrayMgc	>= reqs[i].grayMgc)	&&
				(reqs[i].spellSd 	=== undefined || this._skillLevels.SpellSd 	>= reqs[i].spellSd) &&
				(reqs[i].whiteMg	=== undefined || this._skillLevels.WhiteMg 	>= reqs[i].whiteMg) &&
				(reqs[i].divine 	=== undefined || this._skillLevels.Divine 	>= reqs[i].divine) 	&&
				(reqs[i].blackMg 	=== undefined || this._skillLevels.BlackMg 	>= reqs[i].blackMg) &&
				(reqs[i].darkEye 	=== undefined || this._skillLevels.DarkEye 	>= reqs[i].darkEye)
			) {
				return true;
			}
		}
		return false;
	};
	
	Game_Actor.prototype.clearTrail = function() {
		this._trailImage = null;
	};
	
	Game_Actor.prototype.isTrailRequested = function() {
		return this._trailImage !==  null;
	};
	
	Game_Actor.prototype.trailImage = function() {
		return this._trailImage;
	};
	
	Game_Actor.prototype.startTrail = function(trailImage) {
		if(trailImage !== "Small" && trailImage !== "Medium" && trailImage !== "Large" && trailImage !== "Huge") { return; }
		this._trailImage = trailImage;
	};
	
	Game_Actor.prototype.weaponSeWeight = function() {
		return this.weapons().length > 0 && this.weapons()[0].e9dInfo.seWeight ? this.weapons()[0].e9dInfo.seWeight : "light";
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
		if(!this.canPurchaseNextSkillLevel(skillName)) { return; }
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
	
	Game_Actor.prototype.performAction = function(action) {
		Game_Battler.prototype.performAction.call(this, action);
		if (action.isAttack()) {
			this.performSkill(action.effectiveItem());
		} else if (action.isGuard()) {
			this.requestMotion("evade");
		} else if (action.isSkill()) {
			this.performSkill(action.item());
		} else if (action.isItem()) {
			this.requestMotion("item");
		}
	};
	
	Game_Actor.prototype.performDamage = function(action) {
		Game_Battler.prototype.performDamage.call(this, action);
		if (this.isSpriteVisible()) {
			this.requestMotion("damage");
		} else {
			$gameScreen.startShake(5, 5, 10);
		}
	};
	
	Game_Actor.prototype.performSkill = function(item) {
		const weapons = this.weapons();
		const weapon = weapons[0];
		if(weapon) {
			this.startWeaponAnimation(weapon.e9dInfo.image);
			this.startTrail(weapon.e9dInfo.trail);
		}
		const motion = item.e9dInfo.motion;
		if(motion) {
			this.requestMotion(motion);
			return;
		}
		this.requestMotion("skill");
	};
	
	Game_Actor.prototype.performMiss = function() {
		Game_Battler.prototype.performMiss.call(this);
		this.requestMotion("evade");
	};
	
	Game_Actor.prototype.performEvasion = function() {
		Game_Battler.prototype.performEvasion.call(this);
		this.requestMotion("evade");
	};
	
	Game_Actor.prototype.bareHandsElementId = function() {
		return 2;
	};
	
	Game_Actor.prototype.skills = function() {
		const list = [];
		
		// get added skills that the actor qualifies for
		const addedSkills = [];
		for (const id of this.addedSkills()) {
			if(this.meetsAbilityRequirements($dataSkills[id].e9dInfo.requirements)) {
				addedSkills.push(id);
			}
		}
		
		// get all the skill ids
		let skillIds = this._skills.concat(addedSkills);
		
		// filter out duplicates
		skillIds = skillIds.filter(function(item, pos, self) {
			return self.indexOf(item) == pos;
		})
		
		// sort by id
		skillIds.sort(function(a, b) {
		  return a - b;
		});
		
		for (const id of skillIds) {
			if (!list.includes($dataSkills[id])) {
				list.push($dataSkills[id]);
			}
		}
		return list;
	};
	
	// Game Enemy
	_Game_Enemy__initMembers = Game_Enemy.prototype.initMembers;
	Game_Enemy.prototype.initMembers = function() {
		_Game_Enemy__initMembers.call(this);
		this._hitBuffer = null;
	};
	
	Game_Enemy.prototype.performDamage = function(action) {
		this._hitBuffer = Game_Battler.prototype.performDamage.call(this, action);
		if(!action.effectiveItem().e9dInfo.effect) {
			this.requestEffect(action.critical ? "blink" : "blinkFast");
		}
	};
	
	Game_Enemy.prototype.performCollapse = function() {
		Game_Battler.prototype.performCollapse.call(this);
		if(this._hitBuffer) {
			this._hitBuffer.destroy();
			this._hitBuffer = null;
		}
		switch (this.collapseType()) {
			case 0:
				this.requestEffect("collapse");
				SoundManager.playEnemyCollapse();
				break;
			case 1:
				this.requestEffect("bossCollapse");
				SoundManager.playBossCollapse1();
				break;
			case 2:
				this.requestEffect("instantCollapse");
				break;
		}
	};
	
	// Game Unit
	Game_Unit.prototype.randomTarget = function(ignoreRow, reach) {
		if(ignoreRow) { return this.randomTargetEqualChance(this.aliveMembers()); }
		
		// check if there's both front and back row members
		const frontRow = [];
		const backRow = [];
		for (const member of this.aliveMembers()) {
			if(member.backRow()) {
				backRow.push(member);
			} else {
				frontRow.push(member);
			}
		}
		
		// everyone's in the same row, treat them equally
		if(frontRow.length == 0 || backRow.length == 0) { return this.randomTargetEqualChance(this.aliveMembers()); }
		
		// figure out which row is targeted
		const rowDifference = frontRow.length - backRow.length;
		let frontRowChance = (reach ? 0.6 : 0.8) + Math.abs(rowDifference) * (rowDifference >= 0 ? 0.5 : -1);
		frontRowChance = frontRowChance.clamp(0.5, 0.9);
		const rowRand = Math.random();
		if(rowRand >= frontRowChance) {
			return this.randomTargetEqualChance(backRow);
		}
		return this.randomTargetEqualChance(frontRow);
	};
	
	Game_Unit.prototype.randomTargetEqualChance = function(members) {
		let tgrRand = Math.random();
		const tgrThreshold = 1 / members.length;
		let target = null;
		for (const member of members) {
			tgrRand -= tgrThreshold;
			if (tgrRand <= 0 && !target) {
				target = member;
			}
		}
		return target;
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
	
	Game_Party.prototype.setupBattleTestMembers = function() {
		for (let i = 0; i < $dataSystem.testBattlers.length; i++) {
			const battler = $dataSystem.testBattlers[i];
			const actor = $gameActors.actor(battler.actorId);
			if (actor) {
				actor.changeLevel(1, false);
				actor.setSkillLevel("GrayMgc", 1);
				actor.setSkillLevel("WhiteMg", 1);
				actor.initEquips(battler.equips);
				actor.recoverAll();
				if(i > 1) {
					actor.toggleRow();
				}
				this.addActor(battler.actorId);
			}
		}
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
	
	Game_CharacterBase.prototype.canPassDiagonally = function(x, y, horz, vert) {
		const x2 = $gameMap.roundXWithDirection(x, horz);
		const y2 = $gameMap.roundYWithDirection(y, vert);
		return this.canPass(x, y, vert) && this.canPass(x, y2, horz) && this.canPass(x2, y, vert);
	};

	Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
		this.setMovementSuccess(
			this.canPassDiagonally(this._x, this._y, horz, vert)
		);
		if (this.isMovementSucceeded()) {
			this._x = $gameMap.roundXWithDirection(this._x, horz);
			this._y = $gameMap.roundYWithDirection(this._y, vert);
			this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
			this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
			this.increaseSteps();
			if (this._direction === this.reverseDir(horz)) {
				this.setDirection(horz);
			}
			if (this._direction === this.reverseDir(vert)) {
				this.setDirection(vert);
			}
			return;
		}
		this.moveStraight(horz);
		if (!this.isMovementSucceeded()) {
			this.moveStraight(vert);
		}
	};
	
	// Game Player
	Game_Player.prototype.getInputDirection = function() {
		return Input.dir8;
	};
	
	Game_Player.prototype.getInputHoriz = function(direction) {
		switch(direction) {
			case 1:
			case 4:
			case 7:
				return 4;
			case 3:
			case 6:
			case 9:
				return 6;
		}
		return 0;
	};
	
	Game_Player.prototype.getInputVert = function(direction) {
		switch(direction) {
			case 1:
			case 2:
			case 3:
				return 2;
			case 7:
			case 8:
			case 9:
				return 8;
		}
		return 0;
	};

	Game_Player.prototype.executeMove = function(direction) {
		const horiz = this.getInputHoriz(direction);
		const vert = this.getInputVert(direction);
		
		if(horiz === 0 || vert === 0) {
			this.moveStraight(direction);
			return;
		}
		this.moveDiagonally(horiz, vert);
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
	Scene_Battle.prototype.changeInputWindow = function() {
		this.hideSubInputWindows();
		if (BattleManager.isInputting() && !this._turnInputsDone) {
			if (BattleManager.actor()) {
				this.startActorCommandSelection();
			} else {
				this.startPartyCommandSelection();
			}
		} else {
			this.endCommandSelection();
		}
		this._turnInputsDone = false;
	};
	
	Scene_Battle.prototype.stop = function() {
		Scene_Message.prototype.stop.call(this);
		if (this.needsSlowFadeOut()) {
			this.startFadeOut(this.slowFadeSpeed(), false);
		} else {
			this.startFadeOut(this.fadeSpeed(), false);
		}
		this._partyCommandWindow.hide();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.updateStatusWindowVisibility = function() {
		this.updateStatusWindowPosition();
	};
	
	Scene_Battle.prototype.statusWindowX = function() {
		return 0;
	};
	
	Scene_Battle.prototype.createAllWindows = function() {
		this.createLogWindow();
		this.createActionWindow();
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
	
	const _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
	Scene_Battle.prototype.createDisplayObjects = function() {
		_Scene_Battle_createDisplayObjects.call(this);
		BattleManager.setActionWindow(this._actionWindow);
	};
	
	Scene_Battle.prototype.createActionWindow = function() {
		const rect = this.actionWindowRect();
		this._actionWindow = new Window_BattleAction(rect);
		this._actionWindow.hide();
		this.addWindow(this._actionWindow);
	};
	
	Scene_Battle.prototype.actionWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2;
		const wx = Graphics.boxWidth/2-ww/2;
		const wy = 0;
		return new Rectangle(wx, wy, ww, wh);
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
		const wx = Graphics.boxWidth - ww;
		const wy = Graphics.boxHeight - wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.actorCommandWindowRect = function() {
		const ww = $gameSystem.windowPadding()*4 + $gameMap.tileWidth()/2*8;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*6;
		const wx = Graphics.boxWidth - ww;
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
		const wx = Graphics.boxWidth-ww;
		const wy = Graphics.boxHeight-wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.enemyWindowRect = function() {
		return this.skillWindowRect();
	};
	
	Scene_Battle.prototype.messageWindowRect = function() {
		const ww = Graphics.boxWidth;
		const wh = $gameSystem.windowPadding()*4 + $gameMap.tileHeight()/2*6;
		const wx = 0;
		const wy = Graphics.boxHeight-wh;
		return new Rectangle(wx, wy, ww, wh);
	};
	
	Scene_Battle.prototype.closeCommandWindows = function() {
		this._partyCommandWindow.deactivate();
		this._actorCommandWindow.deactivate();
		this._partyCommandWindow.hide();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.startPartyCommandSelection = function() {
		this._statusWindow.deselect();
		this._actorCommandWindow.setup(null);
		this._actorCommandWindow.hide();
		this._partyCommandWindow.setup();
	};
	
	Scene_Battle.prototype.startActorCommandSelection = function() {
		this._statusWindow.selectActor(BattleManager.actor());
		this._partyCommandWindow.hide();
		this._actorCommandWindow.show();
		this._actorCommandWindow.setup(BattleManager.actor());
	};
	
	Scene_Battle.prototype.commandAttack = function() {
		const action = BattleManager.inputtingAction();
		action.setAttack();
		this.onSelectAction();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.commandSkill = function() {
		this._skillWindow.setActor(BattleManager.actor());
		this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
		this._skillWindow.refresh();
		this._skillWindow.show();
		this._skillWindow.activate();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.commandGuard = function() {
		const action = BattleManager.inputtingAction();
		action.setGuard();
		this.turnInputsDone();
	};
	
	Scene_Battle.prototype.commandItem = function() {
		this._itemWindow.refresh();
		this._itemWindow.show();
		this._itemWindow.activate();
		this._actorCommandWindow.hide();
	};
	
	Scene_Battle.prototype.turnInputsDone = function() {
		BattleManager.finishActorInput();
		this.hideSubInputWindows();
		this.endCommandSelection();
		this._turnInputsDone = true;
	};
	
	Scene_Battle.prototype.onActorOk = function() {
		const action = BattleManager.inputtingAction();
		action.setTarget(this._actorWindow.index());
		this.hideSubInputWindows();
		this.turnInputsDone();
	};
	
	Scene_Battle.prototype.startEnemySelection = function() {
		this._enemyWindow.refresh();
		this._enemyWindow.show();
		this._enemyWindow.select(0);
		this._enemyWindow.activate();
	};
	
	Scene_Battle.prototype.onEnemyOk = function() {
		const action = BattleManager.inputtingAction();
		action.setTarget(this._enemyWindow.enemyIndex());
		this.hideSubInputWindows();
		this.turnInputsDone();
	};
	
	Scene_Battle.prototype.onEnemyCancel = function() {
		this._enemyWindow.hide();
		switch (this._actorCommandWindow.currentSymbol()) {
			case "attack":
				this._actorCommandWindow.show();
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
	
	Sprite_Battler.prototype.isSelected = function() {
		return this._battler && this._battler.isSelected();
	}
	
	Sprite_Battler.prototype.setupDamagePopup = function() {
		if (this._battler.isDamagePopupRequested()) {
			if (this._battler.isSpriteVisible()) {
				this.createDamageSprite();
			}
			this._battler.clearDamagePopup();
			//this._battler.clearResult();
		}
	};
	
	Sprite_Battler.prototype.createDamageSprite = function() {
		const last = this._damages[this._damages.length - 1];
		const sprite = new Sprite_Damage();
		if (last) {
			sprite.x = last.x + 3;
			sprite.y = last.y - 5;
		} else {
			sprite.x = this.x + this.damageOffsetX();
			sprite.y = this.y + this.damageOffsetY();
		}
		sprite.setup(this._battler);
		this._damages.push(sprite);
		this.parent.addChild(sprite);
	};
	
	// Sprite Actor
	Sprite_Actor.MOTIONS = {
		walk: { index: 0, loop: true },
		wait: { index: 1, loop: true },
		spear: { index: 2, loop: true },
		longGun: { index: 3, loop: true },
		damage: { index: 4, loop: false },
		evade: { index: 5, loop: false },
		swing: { index: 6, loop: false },
		thrust: { index: 7, loop: false },
		spearThrust: { index: 8, loop: false },
		handGun: { index: 9, loop: false },
		skill: { index: 10, loop: false },
		item: { index: 11, loop: false },
		escape: { index: 12, loop: true },
		victory: { index: 13, loop: true },
		dying: { index: 14, loop: true },
		abnormal: { index: 15, loop: true },
		sleep: { index: 16, loop: true },
		dead: { index: 17, loop: true }
	};
	
	Sprite_Actor.prototype.initMembers = function() {
		Sprite_Battler.prototype.initMembers.call(this);
		this._battlerName = "";
		this._motion = null;
		this._motionCount = 0;
		this._motionType = null;
		this._pattern = 0;
		this.createShadowSprite();
		this.createShieldSprite();
		this.createTrailSprite();
		this.createWeaponSprite();
		this.createMainSprite();
		this.createShieldOverlaySprite();
		this.createWeaponOverlaySprite();
		this.createStateSprite();
	};
	
	Sprite_Actor.prototype.createShadowSprite = function() {
		// do nothing
	};
	
	Sprite_Actor.prototype.createShieldSprite = function() {
		this._shieldSprite = new Sprite_Weapon(false, true);
		this.addChild(this._shieldSprite);
	};
	
	Sprite_Actor.prototype.createTrailSprite = function() {
		this._trailSprite = new Sprite();
		this._trailSprite.anchor.x = 0;
		this._trailSprite.anchor.y = 1;
		this._trailSprite.x = -16;
		this._trailSprite.y = 8;
		this._trailSprite.hide();
		this.addChild(this._trailSprite);
	};
	
	Sprite_Actor.prototype.createShieldOverlaySprite = function() {
		this._shieldOverlaySprite = new Sprite_Weapon(true, true);
		this.addChild(this._shieldOverlaySprite);
	};
	
	Sprite_Actor.prototype.createWeaponOverlaySprite = function() {
		this._weaponOverlaySprite = new Sprite_Weapon(true);
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
		this.setHome(spriteW*2 + spriteW/2 + rowX, partyTop + index*(battlerHeight + separationY));
	};
	
	Sprite_Actor.prototype.updateTargetPosition = function() {
		if (this._actor.canMove() && BattleManager.isEscaped()) {
			this.retreat();
		} else if (this.shouldStepForward()) {
			this.stepForward();
		} else if (!this._actor.isActing() && this.inActingPosition()) {
			this.stepBack();
		} else if (this._actor.motionType() === "damage") {
			this.stepBackDamage();
		} else if (this._actor.motionType() === "evade") {
			this.stepBackEvade();
		}
	};
	
	Sprite_Actor.prototype.inActingPosition = function() {
		return this._offsetX === this.motionSpeed() && this._offsetY === 0;
	};
	
	Sprite_Actor.prototype.shouldStepForward = function() {
		return this._actor.isActing() && this.motionTypeIsMelee();
	};
	
	Sprite_Actor.prototype.isMoving = function() {
		return this._movementDuration > 0 && !this._actor.isActing();
	};
	
	Sprite_Actor.prototype.updateMotionCount = function() {
		if (this._motion && ++this._motionCount >= this.motionSpeed()) {
			if (this._motion.loop) {
				this._pattern = (this._pattern + 1) % 4;
			} else if (this._pattern < 2) {
				this._pattern++;
				if(this._pattern === 1 && this.motionTypeIsMelee()) {
					SoundManager.playSwing(this._actor.weaponSeWeight());
				}
				if(this._motionType === "swing") {
					if(this._pattern === 1) {
						this._trailSprite.show();
					} else {
						this._trailSprite.hide();
					}
				} else {
					this._trailSprite.hide();
				}
			} else {
				this.refreshMotion();
			}
			this._motionCount = 0;
		}
	};
	
	Sprite_Actor.prototype.motionSpeed = function() {
		return 12;
	};
	
	Sprite_Actor.prototype.refreshMotion = function() {
		const actor = this._actor;
		if (actor) {
			const stateMotion = actor.stateMotionIndex();
			if (actor.isInputting()) {
				this.startMotion("wait");
			} else if (actor.isActing()) {
				// do nothing
			} else if (stateMotion === 3) {
				this.startMotion("dead");
			} else if (stateMotion === 2) {
				this.startMotion("sleep");
			} else if (actor.isChanting()) {
				this.startMotion("wait");
			} else if (actor.isGuard() || actor.isGuardWaiting()) {
				this.startMotion("evade");
			} else if (stateMotion === 1) {
				this.startMotion("abnormal");
			} else if (actor.isDying()) {
				this.startMotion("dying");
			} else if (actor.isUndecided()) {
				if(this.motionTypeIsMelee()) {
					this.startMotion("walk");
				} else {
					this.startMotion("wait");
				}
			} else {
				this.startMotion("wait");
			}
		}
	};
	
	Sprite_Actor.prototype.motionTypeIsMelee = function() {
		return this._motionType === "swing" || this._motionType === "thrust" || this._motionType === "pommel" || this._motionType === "unarmed";
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
		this.startMove(this.motionSpeed(), 0, this.motionSpeed());
	};
	
	Sprite_Actor.prototype.stepBack = function() {
		this.startMove(0, 0, this.motionSpeed());
	};
	
	Sprite_Actor.prototype.retreat = function() {
		const spriteW = $gameMap.tileWidth()/2;
		this.startMove(-spriteW*5, 0, spriteW);
	};
	
	Sprite_Actor.prototype.stepBackDamage = function() {
		this.startMove(-1, 0, 0);
	};
	
	Sprite_Actor.prototype.stepBackEvade = function() {
		this.startMove(-2, 0, 0);
	};
	
	Sprite_Actor.prototype.damageOffsetX = function() {
		return Sprite_Battler.prototype.damageOffsetX.call(this) + 16;
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
			this._weaponOverlaySprite.setup(this._actor.weaponImageId(), this._actor.motionType());
		}
	};
	
	Sprite_Actor.prototype.setupTrail = function() {
		if(this._actor.isTrailRequested()) {
			const trailImage = this._actor.trailImage();
			this._trailSprite.bitmap = ImageManager.loadSystem("WeaponTrail" + trailImage);
			let trailSize = 0;
			switch(trailImage) {
				case  "Small": trailSize = 40; break;
				case "Medium": trailSize = 48; break;
				case  "Large": trailSize = 56; break;
				case   "Huge": trailSize = 64; break;
			}
			this._trailSprite.setFrame(0, 0, trailSize, trailSize);
			this._actor.clearTrail();
		};
	};
	
	Sprite_Actor.prototype.startMotion = function(motionType) {
		const actorMotionType = motionType === "pommel" || motionType === "unarmed" ? "thrust" : (motionType === "throw" ? "swing" : motionType);
		const newMotion = Sprite_Actor.MOTIONS[actorMotionType];
		if (this._motion !== newMotion) {
			if(this._motionType === "damage" || this._motionType === "evade") {
				this.startMove(0, 0, 0);
			}
			this._motionType = motionType;
			this._motion = newMotion;
			this._motionCount = 0;
			this._pattern = 0;
			if(
				motionType === "walk" ||
				motionType === "wait" ||
				motionType === "chant" ||
				motionType === "guard" ||
				motionType === "damage" ||
				motionType === "evade" ||
				motionType === "skill" ||
				motionType === "spell" ||
				motionType === "item"
			) {
				this.startWeaponIdleAnimation(motionType);
			} else {
				this.clearWeaponIdleAnimation();
			}
			if(
				motionType === "walk" ||
				motionType === "wait" ||
				motionType === "chant" ||
				motionType === "guard" ||
				motionType === "damage" ||
				motionType === "evade" ||
				motionType === "skill" ||
				motionType === "spell" ||
				motionType === "item" ||
				motionType === "swing" ||
				motionType === "thrust" ||
				motionType === "pommel" ||
				motionType === "unarmed" ||
				motionType === "throw" ||
				motionType === "missile"
			) {
				this.startShieldIdleAnimation(motionType);
			} else {
				this.clearShieldIdleAnimation();
			}
		}
	};
	
	Sprite_Actor.prototype.startWeaponIdleAnimation = function(motionType) {
		const weapons = this._actor.weapons();
		const weapon = weapons[0];
		if(weapon && weapon.e9dInfo.image !== undefined) {
			this._weaponSprite.setup(weapon.e9dInfo.image, motionType);
			this._weaponOverlaySprite.setup(weapon.e9dInfo.image, motionType, true);
		} else {
			this.clearWeaponIdleAnimation();
		}
	};
	
	Sprite_Actor.prototype.clearWeaponIdleAnimation = function() {
		this._weaponSprite.setup(0);
		this._weaponOverlaySprite.setup(0);
		this._weaponSprite.x = 0;
		this._weaponSprite.y = 0;
		this._weaponSprite.scale.x = 1;
		this._weaponSprite.scale.y = 1;
		this._weaponOverlaySprite.x = 0;
		this._weaponOverlaySprite.y = 0;
		this._weaponOverlaySprite.scale.x = 1
		this._weaponOverlaySprite.scale.y = 1;
	};
	
	Sprite_Actor.prototype.startShieldIdleAnimation = function(motionType) {
		const armors = this._actor.armors();
		const armor = armors[0];
		if(armor && armor.e9dInfo.image !== undefined) {
			this._shieldSprite.setup(armor.e9dInfo.image, motionType);
			this._shieldOverlaySprite.setup(armor.e9dInfo.image, motionType, true);
		} else {
			this.clearShieldIdleAnimation();
		}
	};
	
	Sprite_Actor.prototype.clearShieldIdleAnimation = function() {
		this._shieldSprite.setup(0);
		this._shieldOverlaySprite.setup(0);
		this._shieldSprite.x = 0;
		this._shieldSprite.y = 0;
		this._shieldOverlaySprite.x = 0;
		this._shieldOverlaySprite.y = 0;
	};
	
	Sprite_Actor.prototype.updateMotion = function() {
		this.setupMotion();
		this.setupWeaponAnimation();
		this.setupWeaponOverlayAnimation();
		this.setupTrail();
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
	
	Sprite_Enemy.prototype.startEffect = function(effectType) {
		this._effectType = effectType;
		switch (this._effectType) {
			case "appear":
				this.startAppear();
				break;
			case "disappear":
				this.startDisappear();
				break;
			case "whiten":
				this.startWhiten();
				break;
			case "blink":
				this.startBlink();
				break;
			case "blinkFast":
				this.startBlinkFast();
				break;
			case "collapse":
				this.startCollapse();
				break;
			case "bossCollapse":
				this.startBossCollapse();
				break;
			case "instantCollapse":
				this.startInstantCollapse();
				break;
		}
		this.revertToNormal();
	};
	
	Sprite_Enemy.prototype.startWhiten = function() {
		this._effectDuration = 17;
	};
	
	Sprite_Enemy.prototype.startBlink = function() {
		this._effectDuration = 21;
	};
	
	Sprite_Enemy.prototype.startBlinkFast = function() {
		this._effectDuration = 21;
	};
	
	Sprite_Enemy.prototype.startCollapse = function() {
		this._effectDuration = this.collapseDuration();
		this._appeared = false;
	};
	
	Sprite_Enemy.prototype.collapseDuration = function() {
		return 33;
	};
	
	Sprite_Enemy.prototype.updateEffect = function() {
		this.setupEffect();
		if (this._effectDuration > 0) {
			this._effectDuration--;
			switch (this._effectType) {
				case "whiten":
					this.updateWhiten();
					break;
				case "blink":
					this.updateBlink();
					break;
				case "blinkFast":
					this.updateBlinkFast();
					break;
				case "appear":
					this.updateAppear();
					break;
				case "disappear":
					this.updateDisappear();
					break;
				case "collapse":
					this.updateCollapse();
					break;
				case "bossCollapse":
					this.updateBossCollapse();
					break;
				case "instantCollapse":
					this.updateInstantCollapse();
					break;
			}
			if (this._effectDuration === 0) {
				this._effectType = null;
				this.clearFilterParams();
			}
		}
	};
	
	Sprite_Enemy.prototype.updateWhiten = function() {
		if(Math.ceil(this._effectDuration / 4) % 2 === 0) {
			this.setMonochromeTumbleFilter(0, 1, 0, true);
		} else {
			this.clearFilterParams();
		}
	};

	Sprite_Enemy.prototype.updateBlink = function() {
		this.opacity = this._effectDuration % 10 < 5 ? 255 : 0;
	};

	Sprite_Enemy.prototype.updateBlinkFast = function() {
		this.opacity = this._effectDuration % 6 < 3 ? 255 : 0;
	};

	Sprite_Enemy.prototype.updateAppear = function() {
		this.opacity = 256;
	};

	Sprite_Enemy.prototype.updateDisappear = function() {
		this.opacity = 0;
	};

	Sprite_Enemy.prototype.updateCollapse = function() {
		if(this._effectDuration > 0) {
			this.setNoiseFadeFilter(1 - (this._effectDuration / this.collapseDuration()));
		} else {
			this.opacity = 0;
		}
	};

	Sprite_Enemy.prototype.updateBossCollapse = function() {
		this.opacity = 0;
	};
	
	Sprite_Enemy.prototype.damageOffsetY = function() {
		return Sprite_Battler.prototype.damageOffsetY.call(this);
	};
	
	Sprite_Enemy.prototype.isSelected = function() {
		return Sprite_Battler.prototype.isSelected.call(this);
	}
	
	// Sprite Animation MV
	Sprite_AnimationMV.prototype.initMembers = function() {
		this._targets = [];
		this._effect = null;
		this._shouldMirror = false;
		this._delay = 0;
		this._rate = 4;
		this._duration = 0;
		this._bitmap = null;
		this._cellSprite = null;
		this.z = 8;
	};
	
	// prettier-ignore
	Sprite_AnimationMV.prototype.setup = function(
		targets, effect, shouldMirror, delay
	) {
		this._targets = targets;
		this._effect = effect;
		this._shouldMirror = !!shouldMirror;
		this._delay = delay;
		if (this._effect) {
			this.setupRate();
			this.setupDuration();
			this.loadBitmaps();
			this.createCellSprite();
		}
	};
	
	Sprite_AnimationMV.prototype.setupRate = function() {
		this._rate = 4;
	};
	
	Sprite_AnimationMV.prototype.setupDuration = function() {
		this._duration = this._effect.frameCount * this._rate + 1;
	};
	
	Sprite_AnimationMV.prototype.update = function() {
		Sprite.prototype.update.call(this);
		this.updateMain();
	};
	
	Sprite_AnimationMV.prototype.loadBitmaps = function() {
		this._bitmap = ImageManager.loadBitmap("img/effects/", this._effect.animFile);
	};
	
	Sprite_AnimationMV.prototype.isReady = function() {
		return (
			this._bitmap &&
			this._bitmap.isReady()
		);
	};
	
	Sprite_AnimationMV.prototype.createCellSprite = function() {
		const sprite = new Sprite();
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		this._cellSprite = sprite;
		this.addChild(sprite);
	};
	
	Sprite_AnimationMV.prototype.updateMain = function() {
		if (this.isPlaying() && this.isReady()) {
			if (this._delay > 0) {
				this._delay--;
			} else {
				this._duration--;
				this.updatePosition();
				if (this._duration % this._rate === 0) {
					this.updateFrame();
				}
				if (this._duration <= 0) {
					this.onEnd();
				}
			}
		}
	};
	
	Sprite_AnimationMV.prototype.updatePosition = function() {
		const target = this._targets[0];
		const parent = target.parent;
		const grandparent = parent ? parent.parent : null;
		this.x = target.x;
		this.y = target.y;
		if (this.parent === grandparent) {
			this.x += parent.x;
			this.y += parent.y;
		}
		this.y -= this._effect.frameH / 2;
};

	Sprite_AnimationMV.prototype.updateFrame = function() {
		const frameIndex = this.currentFrameIndex();
		if (this._duration > 0) {
			this.updateCellSprite(this._effect, frameIndex);
			this.updateFilter(this._effect.filters, frameIndex);
		}
		if(frameIndex === 0) {
			AudioManager.playSe(this._effect.se);
		}
	};

	Sprite_AnimationMV.prototype.currentFrameIndex = function() {
		return (
			this._effect.frameCount -
			Math.floor((this._duration + this._rate - 1) / this._rate)
		);
	};
	
	Sprite_AnimationMV.prototype.updateCellSprite = function(effect, frameIndex) {
		if (frameIndex >= 0 && frameIndex < effect.frameCount) {
			const framesH = this._bitmap.width / effect.frameW;
			const sx = (frameIndex % framesH) * effect.frameW;
			const sy = Math.floor(frameIndex / framesH) * effect.frameH;
			let mirror = !!this._effect.mirror;
			if(this._shouldMirror) {
				mirror = !mirror;
			}
			this._cellSprite.bitmap = this._bitmap;
			this._cellSprite.setFrame(sx, sy, effect.frameW, effect.frameH);

			this._cellSprite.rotation = 0;
			this._cellSprite.scale.x = 1;
			if (mirror) {
				this._cellSprite.x *= -1;
				this._cellSprite.rotation *= -1;
				this._cellSprite.scale.x *= -1;
			}
			
			this._cellSprite.visible = true;
		} else {
			this._cellSprite.visible = false;
		}
	};
	
	Sprite_AnimationMV.prototype.updateFilter = function(filters, frameIndex) {
		for (const filter of filters) {
			for (const target of this._targets) {
				if(frameIndex >= filter.startFrame && frameIndex < filter.startFrame + filter.duration) {
					const shiftAmount = frameIndex - filter.startFrame;
					switch(filter.name) {
						case "hueRotate":
							target.setHueRotateFilter(shiftAmount, filter.shiftDirection);
							break;
						case "monochromeTumble":
							target.setMonochromeTumbleFilter(shiftAmount, filter.shiftDirection, filter.hue, true);
							break;
					}
				} else {
					target.clearFilterParams();
				}
			}
		}
	};

	Sprite_AnimationMV.prototype.onEnd = function() {
		for (const target of this._targets) {
			target.clearFilterParams();
		}
	};
	
	// Sprite Battleback
	Sprite_Battleback.prototype.adjustPosition = function() {
		this.width = 272;
		this.height = 208;
		this.x = 0;
		this.y = 0;
		this.y = 0;
		this.scale.x = 1;
		this.scale.y = 1;
	};
	
	// Sprite Damage
	Sprite_Damage.prototype.setup = function(target) {
		const result = target.result();
		if (result.missed || result.evaded) {
			if (result.parry) {
				this._colorType = 0;
				this.createParry();
			} else {
				this._colorType = 0;
				this.createMiss(result.tpDamage);
			}
		} else if (result.hpAffected) {
			this._colorType = result.hpDamage >= 0 ? 0 : 1;
			this.createDamage(result.hpDamage);
		} else if (target.isAlive()) {
			if(result.mpDamage !== 0) {
				this._colorType = result.mpDamage >= 0 ? 2 : 3;
				this.createDigits(result.mpDamage);
			} else if(result.tpDamage !== 0) {
				this._colorType = result.tpDamage >= 0 ? 2 : 3;
				this.createStress(result.tpDamage);
			}
		}
		if (result.critical) {
			this.setupCriticalEffect();
		}
	};
	
	Sprite_Damage.prototype.setupCriticalEffect = function() {
		this._flashColor = [178, 16, 48, 255];
		this._flashDuration = 60;
	};
	
	Sprite_Damage.prototype.createMiss = function(tpDamage) {
		const w = $gameMap.tileWidth()/2*4;
		const h = $gameMap.tileHeight()/2;
		const sprite = this.createChildSprite(w, h, true);
		sprite.bitmap.drawText("Miss", 0, 0, w, h, "center");
		sprite.dy = 0;
		this.createDigits(tpDamage);
	};
	
	Sprite_Damage.prototype.createParry = function() {
		const w = $gameMap.tileWidth()/2*5;
		const h = $gameMap.tileHeight()/2;
		const sprite = this.createChildSprite(w, h);
		sprite.bitmap.drawText("Parry", 0, 0, w, h, "center");
		sprite.dy = 0;
	};
	
	Sprite_Damage.prototype.createDamage = function(hpDamage) {
		if(hpDamage < 0) {
			const w = $gameMap.tileWidth()/2*4;
			const h = $gameMap.tileHeight()/2;
			const sprite = this.createChildSprite(w, h, true);
			sprite.bitmap.drawText("Heal", 0, 0, w, h, "center");
			sprite.dy = 0;
		}
		this.createDigits(hpDamage);
	};
	
	Sprite_Damage.prototype.createStress = function(tpDamage) {
		const w = $gameMap.tileWidth()/2*6;
		const h = $gameMap.tileHeight()/2;
		const sprite = this.createChildSprite(w, h, true);
		sprite.bitmap.drawText(tpDamage >= 0 ? "Stress" : "Soothe", 0, 0, w, h, "center");
		sprite.dy = 0;
		this.createDigits(tpDamage);
	};
	
	Sprite_Damage.prototype.createDigits = function(value) {
		const string = Math.abs(value).toString();
		const w = $gameMap.tileWidth()/2;
		const h = $gameMap.tileHeight()/2;
		let curX = Math.floor(string.length / -2);
		for (let i = 0; i < string.length; i++) {
			const sprite = this.createChildSprite(w, h);
			sprite.bitmap.drawText(string[i], 0, 0, w, h, "center");
			sprite.x = curX;
			sprite.dy = -i;
			curX += w;
		}
	};
	
	Sprite_Damage.prototype.createChildSprite = function(width, height, isCaption) {
		const sprite = new Sprite();
		sprite.bitmap = this.createBitmap(width, height);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 1;
		sprite.y = -13 - (isCaption ? $gameMap.tileHeight()/2 : 0);
		sprite.ry = sprite.y;
		sprite.isCaption = isCaption;
		this.addChild(sprite);
		return sprite;
	};
	
	Sprite_Damage.prototype.updateChild = function(sprite) {
		sprite.dy += 1;
		sprite.ry += sprite.dy;
		if (sprite.ry >= (sprite.isCaption ? -$gameMap.tileHeight()/2 : 0)) {
			sprite.ry = (sprite.isCaption ? -$gameMap.tileHeight()/2 : 0);
			sprite.dy = -Math.floor(sprite.dy*0.8);
		}
		sprite.y = Math.round(sprite.ry);
		if(this._duration % 10 < 5) {
			sprite.setBlendColor([0,0,0,0]);
		} else {
			sprite.setBlendColor(this._flashColor);
		}
	};
	
	Sprite_Damage.prototype.updateFlash = function() {
		// do nothing
	};
	
	Sprite_Damage.prototype.updateOpacity = function() {
		// do nothing
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
	
	Sprite_Gauge.prototype.smoothness = function() {
		return this._statusType === "time" ? 1 : 20;
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
	Sprite_Weapon.prototype.initialize = function(isOverlay, isShield) {
		Sprite.prototype.initialize.call(this);
		this.initMembers(isOverlay, isShield);
	};
	
	const _Sprite_Weapon_initMembers = Sprite_Weapon.prototype.initMembers;
	Sprite_Weapon.prototype.initMembers = function(isOverlay, isShield) {
		_Sprite_Weapon_initMembers.call(this);
		this._motionType = null;
		this.anchor.x = 0.375;
		this.x = 0;
		this._isOverlay = isOverlay;
		this._isShield = isShield;
	};

	const _Sprite_Weapon_setup = Sprite_Weapon.prototype.setup;
	Sprite_Weapon.prototype.setup = function(weaponImageId, motionType) {
		this._motionType = motionType;
		_Sprite_Weapon_setup.call(this, weaponImageId);
	};
	
	Sprite_Weapon.prototype.isIdle = function() {
		return !this.motionTypeIsAttack();
	}
	
	Sprite_Weapon.prototype.motionTypeIsAttack = function() {
		return this._motionType === "thrust" || this._motionType === "swing" || this._motionType === "missile" || this._motionType === "pommel" || this._motionType === "throw" || this._motionType === "unarmed";
	}
	
	Sprite_Weapon.prototype.updatePattern = function() {
		if (this._pattern < 2) {
			this._pattern++;
		}
	};
	
	Sprite_Weapon.prototype.loadBitmap = function() {
		const pageId = Math.floor((this._weaponImageId - 1) / 3) + 1;
		if (pageId >= 1) {
			const baseName = this._isShield ? "Shields" : "Weapons";
			this.bitmap = ImageManager.loadSystem(baseName + pageId);
		} else {
			this.bitmap = ImageManager.loadSystem("");
		}
	};
	
	Sprite_Weapon.prototype.updateFrame = function() {
		if (this._weaponImageId > 0) {
			let displayPattern = this._pattern;
			if (this._isShield) {
				displayPattern = 0;
				this.x = -8;
				if(this._motionType === "item") {
					this.y = 7;
				} else {
					this.y = 16;
				}
			} else {
				switch(this._motionType) {
					case "thrust":
					case "unarmed":
						if(displayPattern > 0) { displayPattern = 1; }
						break;
					case "swing":
					case "throw":
						if(displayPattern > 0) { displayPattern = 2; }
						break;
					case "missile":
						displayPattern = 1;
						break;
					default:
						displayPattern = 0;
						break;
				}
				if (
					this._motionType === "skill" ||
					this._motionType === "spell" ||
					this._motionType === "victory"
				) {
					this.x = 4;
					this.y = 8;
					this.scale.x = -1;
				} else if (this._motionType === "pommel" && this._pattern > 0) {
					this.x = 8;
					this.y = 16;
					this.scale.x = 1;
				} else {
					this.x = -8;
					this.y = 16;
					this.scale.x = 1;
				}
			}
			let shouldUnderlay = this.motionTypeIsAttack() && this._pattern > 0;
			const shouldShow = (this._isShield || (this._motionType !== "throw" && this._motionType !== "unarmed") || this._pattern === 0) && (shouldUnderlay && !this._isOverlay) || (!shouldUnderlay && this._isOverlay);
			if(shouldShow) {
				const index = (this._weaponImageId - 1) % 3;
				const w = 128;
				const h = 64;
				const sx = displayPattern * w;
				const sy = index * h;
				this.setFrame(sx, sy, w, h);
			} else {
				this.setFrame(0, 0, 0, 0);
			}
		} else {
			this.setFrame(0, 0, 0, 0);
		}
	};
	
	// Spriteset Base
	Spriteset_Base.prototype.createAnimation = function(request) {
		const effect = request.effect;
		const targets = request.targets;
		let delay = this.animationBaseDelay();
		const nextDelay = this.animationNextDelay();
		for (const target of targets) {
			this.createAnimationSprite([target], effect, delay);
			delay += nextDelay;
		}
	};
	
	// prettier-ignore
	Spriteset_Base.prototype.createAnimationSprite = function(
		targets, effect, delay
	) {
		const sprite = new Sprite_AnimationMV();
		const targetSprites = this.makeTargetSprites(targets);
		const baseDelay = this.animationBaseDelay();
		const previous = delay > baseDelay ? this.lastAnimationSprite() : null;
		const shouldMirror = this.animationShouldMirror(targets[0]);
		sprite.targetObjects = targets;
		sprite.setup(targetSprites, effect, shouldMirror, delay, previous);
		this._effectsContainer.addChild(sprite);
		this._animationSprites.push(sprite);
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
		let selectedSprite = null;
		for(const actorSprite of this._actorSprites) {
			if(actorSprite.isSelected()) {
				selectedSprite = actorSprite;
			}
		}
		for(const enemySprite of this._enemySprites) {
			if(enemySprite.isSelected()) {
				selectedSprite = enemySprite;
			}
		}
		if(selectedSprite) {
			this._cursorBlinkTimer++;
			if(this._cursorBlinkTimer % 2) {
				const cursorSpacing = 4;
				const startX = selectedSprite.x - Math.round(selectedSprite.anchor.x * selectedSprite.width) - cursorSpacing;
				const startY = selectedSprite.y - Math.round(selectedSprite.anchor.y * selectedSprite.height) - cursorSpacing;
				let curX = startX;
				let curY = startY;
				for(const cursorSprite of this._cursorSprites) {
					cursorSprite.show();
					cursorSprite.move(curX, curY);
					curX += selectedSprite.width;
					if(curX > startX + selectedSprite.width) {
						curX = startX;
						curY += selectedSprite.height;
					}
				}
			} else {
				for(const cursorSprite of this._cursorSprites) {
					cursorSprite.hide();
				}
			}
			return;
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
	
	Window_Base.prototype.drawIconAndText = function(icon, text, x, y, width, iconFirst) {
		const iconWidth = ImageManager.iconWidth;
		const textX = iconFirst ? x+iconWidth : x;
		const iconX = iconFirst ? x : x+width-iconWidth;
		this.drawText(text, textX, y, width-iconWidth);
		this.drawIcon(icon, iconX, y);
	};
	
	Window_Base.prototype.drawItemName = function(item, x, y, width) {
		if (item) {
			this.drawIconAndText(item.iconIndex, item.name, x, y, width);
		}
	};
	
	Window_Base.prototype.drawEmptyEquip = function(iconIndex, x, y, width) {
		this.drawIcon(iconIndex, x+width-ImageManager.iconWidth, y);
	};
	
	Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
		this.drawText(unit, x, y, width);
		this.drawText(value+"", x, y+$gameMap.tileHeight()/2, width, "right");
	};
	
	Window_Base.prototype.drawBattler = function(battlerName, x, y) {
		width = 32;
		height = 24;
		const bitmap = ImageManager.loadSvActor(battlerName);
		const pw = width;
		const ph = height;
		const sw = Math.min(width, pw);
		const sh = Math.min(height, ph);
		const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
		const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
		const sx = Math.floor((pw - sw) / 2) + width;
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
	// prettier-ignore
	Window_Command.prototype.addCommand = function(
		name, symbol, enabled = true, ext = null, icon = null
	) {
		for(let i = 0; i < this._list.length; i++) {
			const curCommand = this._list[i];
			if(curCommand.name === name && curCommand.symbol === symbol) { return; } //don't add the same command twice!
		}
		this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext, icon: icon });
	};
	
	Window_Command.prototype.commandIcon = function(index) {
		return this._list[index].icon;
	};
	
	Window_Command.prototype.drawItem = function(index) {
		const rect = this.itemLineRect(index);
		const icon = this.commandIcon(index);
		if(icon) {
			this.drawIconAndText(icon, this.commandName(index), rect.x, rect.y+$gameSystem.windowPadding(), rect.width);
		} else {
			this.drawText(this.commandName(index), rect.x, rect.y+$gameSystem.windowPadding(), rect.width);
		}
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
		const charWidth = $gameMap.tileWidth()/2;
		width = width || charWidth*8;
		const lineHeight = this.lineHeight();
		this.drawIconAndText(77, "LI", x, y, charWidth*4);
		this.drawText(actor.hp + " /", x+charWidth*3, y, width, "right");
		this.drawText(actor.mhp + "", x+width+charWidth*4, y, width/2, "right");
		this.drawIconAndText(78, "EN", x, y + lineHeight/2, charWidth*4);
		this.drawText(Math.floor(actor.mp) + "%", x, y + lineHeight/2, width, "right");
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
		const width = 144;
		const iconWidth = ImageManager.iconWidth;
		const lineHeight = this.lineHeight();
		const x2 = x + $gameMap.tileWidth()/2*9;
		const x3 = x2 + $gameMap.tileWidth()/2*8;
		this.drawActorName(actor, x, y);
		this.drawActorHpMp(actor, x, y + lineHeight/2);
		const icons = actor.allIcons().slice(0, Math.floor(width / iconWidth));
		icons.length > 0 ? this.drawActorIcons(actor, x2, y) : this.drawActorClass(actor, x2, y);
		this.drawActorSkillPoints(actor, x2, y + lineHeight);
		this.drawSvActor(actor, x3, y);
	};
	
	Window_StatusBase.prototype.iconForElementType = function(type) {
		let returnVal = 0;
		switch(type) {
			case  1: returnVal =  34; break; // piercing
			case  2: returnVal =  35; break; // high crit
			case  3: returnVal =  36; break; // fire
			case  4: returnVal =  37; break; // ice
			case  5: returnVal =  38; break; // corrode
			case  6: returnVal =  39; break; // electric
			case  7: returnVal =  40; break; // banish
			case  8: returnVal =  41; break; // curse
		}
		return returnVal;
	};
	
	Window_StatusBase.prototype.iconForWeaponType = function(type) {
		let returnVal = 0;
		switch(type) {
			case  7: case  8: case  9:								returnVal = 49; break; // flail
			case 10: case 11: case 12:								returnVal = 50; break; // reach
			case 13: case 14: case 15:								returnVal = 51; break; // throwable melee
			case 16: case 17: case 18: case 19: case 20: case 21:	returnVal = 52; break; // strictly thrown
			case 22: case 23: case 24:								returnVal = 53; break; // fired
		}
		return returnVal;
	};
	
	Window_StatusBase.prototype.drawIconList = function(x, y, name, icons, width) {
		const iconWidth = ImageManager.iconWidth;
		const lineHeight = this.lineHeight()/2;
		const firstX = x + (name.length + 1) * iconWidth;
		this.drawText(name, x, y, width);
		let curX = x + width - iconWidth;
		let curY = y+lineHeight;
		for(let i = icons.length-1; i >= 0; i--) {
			if(icons[i] === 0) { continue; }
			this.drawIcon(icons[i], curX, curY);
			curX -= iconWidth;
			if(curX < (y === curY ? firstX : x)) {
				curX = x + width - iconWidth;
				curY -= lineHeight;
			}
		}
	};
	
	Window_StatusBase.prototype.drawSkillLevel = function(actor, skillNum, x, y, width) {
		if(!this._actor) { return; }
		const spriteW = $gameMap.tileWidth()/2;
		const skillIcon = this.skillIcon(skillNum);
		const skillName = this.skillName(skillNum);
		this.drawIconAndText(skillIcon, skillName, x, y, spriteW*8);
		this.drawText(this.skillLevel(actor, skillNum)+"", x, y, width, "right");
	};
	
	Window_StatusBase.prototype.skillIconStartsAt = function() {
		return 80;
	};
	
	Window_StatusBase.prototype.classSkillIconStartsAt = function() {
		return 65;
	};
	
	Window_StatusBase.prototype.classSkillStartsAt = function() {
		return 10;
	};
	
	Window_StatusBase.prototype.classSkillCount = function() {
		return 12;
	};
	
	Window_StatusBase.prototype.skillIcon = function(skillNum) {
		const skillIconStartsAt = this.skillIconStartsAt();
		if(skillNum < 0) { return 0; }
		const classSkillStartsAt = this.classSkillStartsAt();
		if(skillNum >= classSkillStartsAt) { return this.classSkillIcon(skillNum-classSkillStartsAt); }
		return skillIconStartsAt+skillNum;
	};
	
	Window_StatusBase.prototype.classSkillIcon = function(skillNum) {
		const stypes = this._actor.addedSkillTypes();
		let reduceType = 0;
		for(let i = 0; i < stypes.length; i++) {
			if(stypes[i] === 1) { // first added skill is always Tech, so ignore it
				reduceType++;
				continue;
			}
			if(i - reduceType === skillNum) {
				const classSkillIconStartsAt = this.classSkillIconStartsAt();
				const iconNum = classSkillIconStartsAt+stypes[i]-reduceType-1;
				return iconNum >= classSkillIconStartsAt+this.classSkillCount() ? classSkillIconStartsAt-1 : iconNum;
			}
		}
		return "UNKNOWN";
	};
	
	Window_StatusBase.prototype.skillName = function(skillNum) {
		const classSkillStartsAt = this.classSkillStartsAt();
		if(skillNum >= classSkillStartsAt) { return this.classSkillName(skillNum-classSkillStartsAt); }
		let name = "UNKNOWN";
		switch(skillNum) {
			case  0: name =	"MeleeAc"; break; case  1: name =	 "RangeAc"; break; 
			case  2: name =	"Defense"; break; case  3: name =	 "Balance"; break; 
			case  4: name =	"Agility"; break; case  5: name =	   "Focus"; break; 
			case  6: name =	"MeleeWp"; break; case  7: name =	   "Throw"; break; 
			case  8: name =	"Archery"; break; case  9: name =	 "Firearm"; break; 
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
	
	Window_StatusBase.prototype.drawIconNameAndValue = function(x, y, icon, name, curValue, newValue, isPercent, usePlusMinus) {
		const spriteW = $gameMap.tileWidth()/2;
		const textWidth = spriteW*8;
		const plusMinusWidth = spriteW*4;
		this.drawIconAndText(icon, name, x, y, spriteW*5);
		const newValueExists = newValue != null && newValue != undefined ;
		this.drawText((newValueExists ? newValue : curValue)+(isPercent ? "%" : ""), x, y, textWidth, "right");
		if (newValueExists && newValue != curValue) {
			if(usePlusMinus) {
				let symbol = "";
				if(newValue > curValue) {
					symbol = "+";
				} else if(newValue < curValue) {
					symbol = "-";
				}				
				this.drawText(symbol, x, y, plusMinusWidth, "right");
			} else {
				let arrowIcon = 0;
				if(newValue > curValue) {
					arrowIcon = 92;
				} else if(newValue < curValue) {
					arrowIcon = 93;
				}
				this.drawIcon(arrowIcon, x+plusMinusWidth-spriteW, y);
			}
			this.drawText(newValue+"", x, y, textWidth, "right");
		}
	};
	
	Window_StatusBase.prototype.toughnessIcon = function() {
		return 70;
	};
	
	Window_StatusBase.prototype.balanceIcon = function() {
		return 83;
	};
	
	Window_StatusBase.prototype.agilityIcon = function() {
		return 84;
	};
	
	Window_StatusBase.prototype.focusIcon = function() {
		return 85;
	};
	
	Window_StatusBase.prototype.powerIcon = function() {
		return 54;
	};
	
	Window_StatusBase.prototype.meleeAccuracyIcon = function() {
		return 80;
	};
	
	Window_StatusBase.prototype.rangeAccuracyIcon = function() {
		return 81;
	};
	
	Window_StatusBase.prototype.specialAccuracyIcon = function() {
		return 55;
	};
	
	Window_StatusBase.prototype.typeIcon = function() {
		return 56;
	};
	
	Window_StatusBase.prototype.armorIcon = function() {
		return 57;
	};
	
	Window_StatusBase.prototype.evadeIcon = function() {
		return 58;
	};
	
	Window_StatusBase.prototype.parryIcon = function() {
		return 59;
	};
	
	Window_StatusBase.prototype.coverageIcon = function() {
		return 60;
	};
	
	Window_StatusBase.prototype.resistIcon = function() {
		return 61;
	};
	
	Window_StatusBase.prototype.toughnessSymbol = function() {
		return "TOU";
	};
	
	Window_StatusBase.prototype.balanceSymbol = function() {
		return "BAL";
	};
	
	Window_StatusBase.prototype.agilitySymbol = function() {
		return "AGI";
	};
	
	Window_StatusBase.prototype.focusSymbol = function() {
		return "FOC";
	};
	
	Window_StatusBase.prototype.powerSymbol = function() {
		return "POW";
	};
	
	Window_StatusBase.prototype.meleeAccuracySymbol = function() {
		return "MEL";
	};
	
	Window_StatusBase.prototype.rangeAccuracySymbol = function() {
		return "RAN";
	};
	
	Window_StatusBase.prototype.specialAccuracySymbol = function() {
		return "SPE";
	};
	
	Window_StatusBase.prototype.typeSymbol = function() {
		return "TYP";
	};
	
	Window_StatusBase.prototype.armorSymbol = function() {
		return "ARM";
	};
	
	Window_StatusBase.prototype.evadeSymbol = function() {
		return "EVA";
	};
	
	Window_StatusBase.prototype.parrySymbol = function() {
		return "PAR";
	};
	
	Window_StatusBase.prototype.coverageSymbol = function() {
		return "COV";
	};
	
	Window_StatusBase.prototype.resistSymbol = function() {
		return "RES";
	};

	Window_StatusBase.prototype.actorSlotIcon = function(actor, index) {
		const slots = actor.equipSlots();
		switch(slots[index]) {
			case  1: returnVal =  97; break; // MainHand
			case  2: returnVal = 129; break; // Off-Hand
			case  3: returnVal = 134; break; // Head
			case  4: returnVal = 146; break; // Back
			case  5: returnVal = 137; break; // Torso
			case  6: returnVal = 139; break; // Legs
			case  7: returnVal = 142; break; // Hands
			case  8: returnVal = 144; break; // Feet
			case  9: returnVal = 153; break; // Accessory
			case 10: returnVal = 153; break; // Accessory
		}
		return returnVal;
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
		this.addCommand("SkillLvl", "skillLevels", enabled);
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
	
	// Window Skill Type
	Window_SkillType.prototype.makeCommandList = function() {
		if (this._actor) {
			const skillTypes = this._actor.skillTypes();
			for (const stypeId of skillTypes) {
				if(stypeId === 8) {
					this.addCommand($dataSystem.skillTypes[10], "skill", true, 10, 73);
					this.addCommand($dataSystem.skillTypes[12], "skill", true, 12, 75);
				} else {
					this.addCommand($dataSystem.skillTypes[stypeId], "skill", true, stypeId, 63+stypeId);
				}
			}
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
			this.drawActorSimpleStatus(this._actor, x+$gameMap.tileWidth()/2, y);
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
		const spriteW = $gameMap.tileWidth()/2;
		const textWidth = spriteW*8;
		const x2 = x + spriteW*9;
		const x3 = x2 + spriteW*9;
		const x4 = x3 + spriteW*9;
		const lineHeight = this.lineHeight()/2;
		const y2 = y + lineHeight;
		const y3 = y2 + lineHeight;
		const y4 = y3 + lineHeight;
		const y5 = y4 + lineHeight;
		const y6 = y5 + lineHeight;
		
		const tempActor = this._tempActor ? this._tempActor : this._actor;
		
		this.drawIconNameAndValue(x, y3, this.toughnessIcon(), this.toughnessSymbol(), this._actor.sparam(6), tempActor.sparam(6));
		this.drawIconNameAndValue(x, y4, this.balanceIcon(), this.balanceSymbol(), this._actor.sparam(8), tempActor.sparam(8));
		this.drawIconNameAndValue(x, y5, this.agilityIcon(), this.agilitySymbol(), this._actor.param(6), tempActor.param(6));
		this.drawIconNameAndValue(x, y6, this.focusIcon(), this.focusSymbol(), this._actor.xparam(9), tempActor.xparam(9));
		
		this.drawIconNameAndValue(x2, y, this.powerIcon(), this.powerSymbol(), this._actor.param(2), tempActor.param(2));
		this.drawIconNameAndValue(x2, y2, this.meleeAccuracyIcon(), this.meleeAccuracySymbol(), this._actor.xparam(0), tempActor.xparam(0));
		this.drawIconNameAndValue(x2, y3, this.rangeAccuracyIcon(), this.rangeAccuracySymbol(), this._actor.xparam(2), tempActor.xparam(2));
		this.drawIconNameAndValue(x2, y4, this.specialAccuracyIcon(), this.specialAccuracySymbol(), this._actor.xparam(4), tempActor.xparam(4));
		let typeIcons = [];
		if(this._tempActor) {
			typeIcons = typeIcons.concat(this._tempActor.traits(Game_BattlerBase.TRAIT_ATTACK_ELEMENT).map(trait => this.iconForElementType(trait.dataId)));
			typeIcons = typeIcons.concat(this._tempActor.weaponTypes().map(type => this.iconForWeaponType(type)));
		} else {
			typeIcons = typeIcons.concat(this._actor.traits(Game_BattlerBase.TRAIT_ATTACK_ELEMENT).map(trait => this.iconForElementType(trait.dataId)));
			typeIcons = typeIcons.concat(this._actor.weaponTypes().map(type => this.iconForWeaponType(type)));
		}
		this.drawIconList(x2, y5, this.typeSymbol(), typeIcons, textWidth);
		
		this.drawIconNameAndValue(x3, y, this.armorIcon(), this.armorSymbol(), this._actor.param(3), tempActor.param(3));
		this.drawIconNameAndValue(x3, y2, this.evadeIcon(), this.evadeSymbol(), this._actor.xparam(1), tempActor.xparam(1));
		this.drawIconNameAndValue(x3, y3, this.parryIcon(), this.parrySymbol(), Math.round(this._actor.xparam(5)*100), Math.round(tempActor.xparam(5)*100));
		this.drawIconNameAndValue(x3, y4, this.coverageIcon(), this.coverageSymbol(), Math.round(this._actor.xparam(3)*100), Math.round(tempActor.xparam(3)*100), true);
		this.drawText(this.resistSymbol(), x3, y5, spriteW*4);
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
			if(item === null) {
				const slotIcon = this.actorSlotIcon(this._actor, index);
				this.drawEmptyEquip(slotIcon, rect.x, rect.y, rect.width);
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
				desc = "Increase chances of striking\nwith ranged and special attacks.";
				break; 
			case  2:
				desc = "Increase chances of dodging and\nparrying attacks.";
				break;
			case  3:
				desc = "Resist stress and damage caused\nby tripping and terrain.";
				break; 
			case  4:
				desc = "Decrease wait time between\nactions in combat.";
				break;
			case  5:
				desc = "Increase stress recovery and\nfocus gain.";
				break; 
			case  6:
				desc = "Unlock melee weapon, shield, and\nunarmed techniques.";
				break;
			case  7:
				desc = "Unlock thrown weapon and sling\ntechniques.";
				break; 
			case  8:
				desc = "Unlock bow techniques.";
				break;
			case  9:
				desc = "Unlock gun and crossbow\ntechniques.";
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
				desc = "Unlock abilities that reduce\nstress, add focus, purify mind.";
				break;
			case  7:
				desc = "Unlock abilities for incredible\ntoughness and impactful unarmed.";
				break;
			case  8:
				desc = "Unlock both white and black\nmagic, and reduce stress costs.";
				break;
			case  9:
				desc = "Unlock attack and cast in same\nturn, and reduce stress costs.";
				break;
			case 10:
				desc = "Unlock healing and weather\nmagic, and reduce stress costs.";
				break;
			case 11:
				desc = "Unlock abilities that see the\netherial and predict events.";
				break;
			case 12:
				desc = "Unlock attack and infernal\nmagic, and reduce stress costs.";
				break;
			case 13:
				desc = "Unlock abilities for seeing the\nhidden, and uncanny aim.";
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
			const y = $gameSystem.windowPadding();
			const y2 = y + lineHeight*5;
			const y3 = y2 + lineHeight*6;
			this.drawActorStatus(this._actor, x, y);
			this.drawEquipParams(this._actor, x, y2);
			this.drawSkillLevels(this._actor, x2, y3);
		}
	};
	
	Window_Status.prototype.drawActorStatus = function(actor, x, y) {
		const charWidth = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight();
		const charHeight = lineHeight/2;
		const iconWidth = ImageManager.iconWidth;
		const columnWidth = charWidth*10;
		const columnWidth2 = columnWidth-charWidth;
		const x2 = x + charWidth*6;
		const x3 = x2 + columnWidth+charWidth;
		const y2 = y+charHeight;
		const y3 = y2+charHeight;
		const y4 = y3+charHeight;
		this.drawSvActor(actor, x+charWidth*2, y2, true);
		this.drawActorName(actor, x2, y);
		
		this.drawIconAndText(77, "Life", x2, y2, charWidth*6);
		this.drawText(actor.hp + " /", x2+charWidth*7, y2, charWidth*6, "right");
		this.drawText(actor.mhp + "", x2+charWidth*14, y2, charWidth*4, "right");
		
		this.drawText("Endurance", x2, y3, columnWidth);
		this.drawIcon(78, x2+columnWidth-charWidth*6, y4);
		this.drawText(Math.floor(actor.mp) + "%", x2, y4, columnWidth, "right");
		
		const icons = actor.allIcons().slice(0, Math.floor(columnWidth2 / iconWidth));
		icons.length > 0 ? this.drawActorIcons(actor, x3, y) : this.drawActorClass(actor, x3, y);
		
		this.drawText("Skill Pts", x3, y3, columnWidth2);
		this.drawIcon(79, x3, y4);
		this.drawText(actor.currentExp()+"", x3, y4, columnWidth2, "right");
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
		
		this.drawIconNameAndValue(x, y, this.toughnessIcon(), this.toughnessSymbol(), actor.sparam(6));
		this.drawIconNameAndValue(x, y2, this.balanceIcon(), this.balanceSymbol(), actor.sparam(8));
		this.drawIconNameAndValue(x, y3, this.agilityIcon(), this.agilitySymbol(), actor.param(6));
		this.drawIconNameAndValue(x, y4, this.focusIcon(), this.focusSymbol(), actor.xparam(9));
		
		this.drawIconNameAndValue(x2, y, this.powerIcon(), this.powerSymbol(), actor.param(2));
		this.drawIconNameAndValue(x2, y2, this.meleeAccuracyIcon(), this.meleeAccuracySymbol(), actor.xparam(0));
		this.drawIconNameAndValue(x2, y3, this.rangeAccuracyIcon(), this.rangeAccuracySymbol(), actor.xparam(2));
		this.drawIconNameAndValue(x2, y4, this.specialAccuracyIcon(), this.specialAccuracySymbol(), actor.xparam(4));
		let typeIcons = [];
		typeIcons = typeIcons.concat(actor.traits(Game_BattlerBase.TRAIT_ATTACK_ELEMENT).map(trait => this.iconForElementType(trait.dataId)));
		typeIcons = typeIcons.concat(actor.weaponTypes().map(type => this.iconForWeaponType(type)));
		this.drawIconList(x2, y5, this.typeSymbol(), typeIcons, textWidth);
		
		this.drawIconNameAndValue(x3, y, this.armorIcon(), this.armorSymbol(), actor.param(3));
		this.drawIconNameAndValue(x3, y2, this.evadeIcon(), this.evadeSymbol(), actor.xparam(1));
		this.drawIconNameAndValue(x3, y3, this.parryIcon(), this.parrySymbol(), Math.round(actor.xparam(5)*100));
		this.drawIconNameAndValue(x3, y4, this.coverageIcon(), this.coverageSymbol(), Math.round(actor.xparam(3)*100), Math.round(actor.xparam(3)*100), true);
		this.drawText(this.resistSymbol(), x3, y5, spriteW*4);
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
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = $gameMap.tileHeight()/2;
		const x = this.itemPadding()+spriteW;
		const y = this.itemPadding();
		const y2 = y + lineHeight*2;
		this.contents.clear();
		if (this._item) {
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
		const width = spriteW*11;
		this.drawText("# Owned:", x, y, width);
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
		if (enabled) {
			if(item1 && this._item.id === item1.id && this._item.eTypeId === item1.eTypeId) {
				this.drawText("Equipped", x, y2, warningWidth);
			} else {
				this.drawActorParamChange(x, y, actor, item1);
			}
		} else {
			this.drawText("Can't use", x, y2, warningWidth);
		}
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
			this.drawIconNameAndValueChange(x, y, this.powerIcon(), this.powerSymbol(), this._item.params[2], (item1 ? item1.params[2] : 0));
			if(this._item.wtypeId >= 16) {
				this.drawIconNameAndValueChange(x, y2, this.rangeAccuracyIcon(), this.rangeAccuracySymbol(), this.getItemXParam(this._item, 2), this.getItemXParam(item1, 2));
			} else {
				this.drawIconNameAndValueChange(x, y2, this.meleeAccuracyIcon(), this.meleeAccuracySymbol(), this.getItemXParam(this._item, 0), this.getItemXParam(item1, 0));
			}
			this.drawIconListChange(x, y3, this.typeSymbol(), this.getItemTypeIcons(this._item), this.getItemTypeIcons(item1));
		} else {
			this.drawIconNameAndValueChange(x, y, this.armorIcon(), this.armorSymbol(), this._item.params[3], (item1 ? item1.params[3] : 0));
			const evasion = this.getItemXParam(this._item, 1);
			if(evasion > 0) {
				this.drawIconNameAndValueChange(x, y2, this.evadeIcon(), this.evadeSymbol(), evasion, this.getItemXParam(item1, 1));
			} else {
				this.drawIconNameAndValueChange(x, y2, this.coverageIcon(), this.coverageSymbol(), this.getItemXParam(this._item, 3), this.getItemXParam(item1, 3), true);
			}
			//this.drawText(this.resistSymbol(), x, y3, textWidth);
		}
	};
	
	Window_ShopStatus.prototype.getItemXParam = function(item, dataId) {
		if(!item) { return 0; }
		const traits = item.traits
			.filter(trait => trait.code === Game_BattlerBase.TRAIT_XPARAM && trait.dataId === dataId);
		if(!traits || traits.length === 0) { return 0; }
		const total = traits.reduce((prevVal, curTrait) => prevVal + curTrait.value, 0);
		return Math.round(total*100);
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
	
	Window_ShopStatus.prototype.drawIconNameAndValueChange = function(x, y, icon, name, itemValue, actorValue, isPercent) {
		let change = itemValue - (actorValue ? actorValue : 0);
		if(change === 0) { return; }
		const spriteW = $gameMap.tileWidth()/2;
		const textWidth = spriteW*8;
		const plusMinusWidth = spriteW*4;
		const changeSymbol = change > 0 ? "+" : "-";
		change = Math.abs(change);
		this.drawIconAndText(icon, name, x, y, spriteW*5);
		this.drawText(changeSymbol, x, y, plusMinusWidth, "right");
		this.drawText(change+(isPercent ? "%" : ""), x, y, textWidth, "right");
	};
	
	Window_ShopStatus.prototype.drawIconListChange = function(x, y, name, itemIcons, actorIcons) {
		const addedIcons = [];
		const removedIcons = [];
		for(let i = 0; i < itemIcons.length; i++) {
			if(itemIcons[i] === 0 || actorIcons.indexOf(itemIcons[i]) >= 0) { continue; }
			addedIcons.push(itemIcons[i]);
		}
		for(let i = 0; i < actorIcons.length; i++) {
			if(actorIcons[i] === 0 || itemIcons.indexOf(actorIcons[i]) >= 0) { continue; }
			removedIcons.push(actorIcons[i]);
		}
		if(addedIcons.length === 0 && removedIcons.length === 0) { return; }
		const spriteW = $gameMap.tileWidth()/2;
		const lineHeight = this.lineHeight()/2;
		const width = spriteW*8;
		const x2 = x + spriteW*3;
		const y2 = y + lineHeight;
		this.drawText(name, x, y, spriteW*4);
		if(addedIcons.length > 0) {
			this.drawText("+", x2, y, spriteW);
			this.drawSingleIconList(x, y, addedIcons);
		}
		if(removedIcons.length > 0) {
			this.drawText("-", x2, addedIcons.length > 0 ? y2 : y, spriteW);
			this.drawSingleIconList(x, addedIcons.length > 0 ? y2 : y, removedIcons);
		}
	};
	
	Window_ShopStatus.prototype.drawSingleIconList = function(x, y, icons) {
		const spriteW = $gameMap.tileWidth()/2;
		const width = spriteW*9;
		let curX = x + width - spriteW*2;
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
	
	// Window Battle Log
	Window_BattleLog.prototype.messageSpeed = function() {
		return 8;
	};
	
	Window_BattleLog.prototype.updateWaitCount = function() {
		if (this._waitCount > 0) {
			this._waitCount--;
			if (this._waitCount < 0) {
				this._waitCount = 0;
			}
			return true;
		}
		return false;
	};
	
	Window_BattleLog.prototype.performDamage = function(action, target) {
		target.performDamage(action);
	};
	
	// prettier-ignore
	Window_BattleLog.prototype.showAnimation = function(
		subject, action, targets, effect
	) {
		if(effect) {
			this.showNormalAnimation(targets, effect);
		} else {
			this.showAttackAnimation(subject, action, targets);
		}
	};
	
	Window_BattleLog.prototype.showAttackAnimation = function(subject, action, targets) {
		if (subject.isActor()) {
			this.showActorAttackAnimation(subject, targets);
		} else {
			this.showEnemyAttackAnimation(subject, action);
		}
	};
	
	// prettier-ignore
	Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, action) {
		const actionItem = action.effectiveItem();
		if(!actionItem.e9dInfo.effect) {
			SoundManager.playSwing(subject.enemy().e9dInfo.seWeight);
		}
	};
	
	// prettier-ignore
	Window_BattleLog.prototype.showNormalAnimation = function(
		targets, effect
	) {
		if(effect) {
			$gameTemp.requestAnimation(targets, effect);
		}
	};
	
	Window_BattleLog.prototype.startAction = function(subject, action, targets) {
		const item = action.item();
		this.push("performActionStart", subject, action);
		this.push("waitForMovement");
		this.push("performAction", subject, action);
		this.push("showAnimation", subject, action, targets.clone(), item.e9dInfo.effect);
		this.displayAction(subject, item);
	};
	
	Window_BattleLog.prototype.drawBackground = function() {
		this.contentsBack.clear();
	};
	
	Window_BattleLog.prototype.drawLineText = function(index) {
		const rect = this.lineRect(index);
		this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
	};
	
	Window_BattleLog.prototype.displayActionResults = function(subject, action, target) {
		if (target.result().used) {
			this.push("pushBaseLine");
			this.displayCritical(target);
			this.push("popupDamage", target);
			this.push("popupDamage", subject);
			this.displayDamage(action, target);
			this.displayAffectedStatus(target);
			this.displayFailure(target);
			this.push("waitForNewLine");
			this.push("popBaseLine");
		}
	};
	
	Window_BattleLog.prototype.displayCritical = function(target) {
		// do nothing
	};
	
	Window_BattleLog.prototype.displayDamage = function(action, target) {
		if (target.result().missed) {
			this.displayMiss(target);
		} else if (target.result().evaded) {
			this.displayEvasion(target);
		} else {
			this.displayHpDamage(action, target);
			this.displayMpDamage(target);
			this.displayTpDamage(target);
		}
	};
	
	Window_BattleLog.prototype.displayHpDamage = function(action, target) {
		if (target.result().hpAffected) {
			if (target.result().hpDamage > 0 && !target.result().drain) {
				this.push("performDamage", action, target);
			}
			if (target.result().hpDamage < 0) {
				this.push("performRecovery", target);
			}
			this.push("addText", this.makeHpDamageText(target));
		}
	};
	
	Window_BattleLog.prototype.displayAddedStates = function(target) {
		const result = target.result();
		const states = result.addedStateObjects();
		for (const state of states) {
			const stateText = target.isActor() ? state.message1 : state.message2;
			if (state.id === target.deathStateId()) {
				this.push("performCollapse", target);
			}
			if (stateText) {
				// do nothing
			}
		}
	};

	Window_BattleLog.prototype.displayRemovedStates = function(target) {
		const result = target.result();
		const states = result.removedStateObjects();
		for (const state of states) {
			if (state.message4) {
				// do nothing
			}
		}
	};
	
	// Window Battle Action
	function Window_BattleAction() {
		this.initialize(...arguments);
	}
	
	Window_BattleAction.prototype = Object.create(Window_Base.prototype);
	Window_BattleAction.prototype.constructor = Window_BattleAction;
	
	Window_BattleAction.prototype.initialize = function(rect) {
		Window_Base.prototype.initialize.call(this, rect);
		this._icon = 0;
		this._text = "";
	};
	
	Window_BattleAction.prototype.setIconAndText = function(icon, text) {
		let needRefresh = false;
		if (this._icon !== icon) {
			this._icon = icon;
			needRefresh = true;
		}
		if (this._text !== text) {
			this._text = text;
			needRefresh = true;
		}
		if(needRefresh) { this.refresh(); }
	};

	Window_BattleAction.prototype.clear = function() {
		this.setIconAndText(0, "");
	};

	Window_BattleAction.prototype.setItem = function(item) {
		this.setIconAndText(item ? item.iconIndex : 0, item ? item.name : "");
	};

	Window_BattleAction.prototype.refresh = function() {
		const rect = this.baseTextRect();
		rect.y -= $gameMap.tileHeight()/2;
		rect.width -= $gameMap.tileWidth()/2
		this.contents.clear();
		this.drawIconAndText(this._icon, this._text, rect.x, rect.y, rect.width);
	};
	
	// Window Party Command
	Window_PartyCommand.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
		this.hide();
		this.deactivate();
	};

	Window_PartyCommand.prototype.setup = function() {
		this.refresh();
		this.forceSelect(0);
		this.activate();
		this.show();
	};
	
	// Window Actor Command
	Window_ActorCommand.prototype.initialize = function(rect) {
		Window_Command.prototype.initialize.call(this, rect);
		this.hide();
		this.deactivate();
		this._actor = null;
	};
	
	Window_ActorCommand.prototype.addAttackCommand = function() {
		this.addCommand(TextManager.attack, "attack", this._actor.canAttack());
	};

	Window_ActorCommand.prototype.addSkillCommands = function() {
		const skillTypes = this._actor.skillTypes();
		for (const stypeId of skillTypes) {
			if(stypeId === 8) {
				this.addCommand($dataSystem.skillTypes[10], "skill", true, 10, 73);
				this.addCommand($dataSystem.skillTypes[12], "skill", true, 12, 75);
			} else {
				this.addCommand($dataSystem.skillTypes[stypeId], "skill", true, stypeId, 63+stypeId);
			}
		}
	};

	Window_ActorCommand.prototype.addGuardCommand = function() {
		this.addCommand(TextManager.guard, "guard", this._actor.canGuard());
	};

	Window_ActorCommand.prototype.addItemCommand = function() {
		this.addCommand(TextManager.item, "item");
	};
	
	Window_ActorCommand.prototype.setup = function(actor) {
		this._actor = actor;
		this.refresh();
		this.selectLast();
		this.activate();
		this.show();
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
			if(cursorIndex === this.index()) {
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
		const y = itemPadding;
		this.drawIconAndText(32, "ST", x,  y, valueW);
		this.drawIconAndText(78, "EN", x2, y, valueW);
		this.drawIconAndText(77, "LI", x3, y, valueW);
	};
	
	Window_BattleStatus.prototype.preparePartyRefresh = function() {
		$gameTemp.clearBattleRefreshRequest();
		this.refresh();
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
		const y = rect.y + this.itemPadding();
		
		const width = 144;
		const iconWidth = ImageManager.iconWidth;
		const icons = actor.allIcons().slice(0, Math.floor(width / iconWidth));
		icons.length > 0 ? this.drawActorIcons(actor, x, y) : this.drawActorName(actor, x, y);
		
		this.drawText(actor.tp + "%", x2, y, valueW, "right");
		this.drawText(Math.floor(actor.mp) + "%", x3, y, valueW, "right");
		this.drawText(actor.hp + "/", x4, y, valueW+spriteW, "right");
		this.drawText(actor.mhp + "", x4+spriteW+valueW, y, valueW, "right");
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
