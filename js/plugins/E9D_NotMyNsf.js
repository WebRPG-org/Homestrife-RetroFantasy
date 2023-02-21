//=============================================================================
// RPG Maker MZ - Emerald9D's Not My Nsf (Player)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Integrates and adapts okaybenji's (on github) JS NSF player.
 * @author Joule "Emerald9D" Royal
 *
 * @help E9D_NotMyNsf.js
 *
 * This plugin integrates a JavaScript NSF Player, made by okaybenji on github.
 * It also alters it somewhat to increase efficiency and give more control over
 * channels.
 *
 * For map BGM, specify the file and track in the map's notes as such:
 *
 * {
 * "autoplayBgmNsf": {
 *   "fileDir": "relative/path/to/file/directory",
 *   "fileName": "fileName (without .nsf)",
 *   "track": a number more than or equal to 0
 * }
 * }
 *
 * For general system music and sound effects, select the files and tracks in
 * the plugin settings.
 *
 * Any nsfs that are specified will override the built in BGM and system SEs.
 *
 * @param title
 * @text Title
 * @type struct<nsfInfo>
 *
 * @param battle
 * @text Battle
 * @type struct<nsfInfo>
 *
 * @param victory
 * @text Victory
 * @type struct<nsfInfo>
 *
 * @param defeat
 * @text Defeat
 * @type struct<nsfInfo>
 *
 * @param gameOver
 * @text Game Over
 * @type struct<nsfInfo>
 *
 * @param boat
 * @text Boat
 * @type struct<nsfInfo>
 *
 * @param ship
 * @text Ship
 * @type struct<nsfInfo>
 *
 * @param airship
 * @text Airship
 * @type struct<nsfInfo>
 *
 * @param cursor
 * @text Cursor
 * @type struct<nsfInfo>
 *
 * @param ok
 * @text Ok
 * @type struct<nsfInfo>
 *
 * @param cancel
 * @text Cancel
 * @type struct<nsfInfo>
 *
 * @param buzzer
 * @text Buzzer
 * @type struct<nsfInfo>
 *
 * @param equip
 * @text Equip
 * @type struct<nsfInfo>
 *
 * @param save
 * @text Save
 * @type struct<nsfInfo>
 *
 * @param load
 * @text Load
 * @type struct<nsfInfo>
 *
 * @param battleStart
 * @text Battle Start
 * @type struct<nsfInfo>
 *
 * @param escape
 * @text Escape
 * @type struct<nsfInfo>
 *
 * @param enemyAttack
 * @text Enemy Attack
 * @type struct<nsfInfo>
 *
 * @param enemyDamage
 * @text Enemy Damage
 * @type struct<nsfInfo>
 *
 * @param enemyCollapse
 * @text Enemy Collapse
 * @type struct<nsfInfo>
 *
 * @param bossCollapse1
 * @text Boss Collapse 1
 * @type struct<nsfInfo>
 *
 * @param bossCollapse2
 * @text Boss Collapse 2
 * @type struct<nsfInfo>
 *
 * @param actorDamage
 * @text Actor Damage
 * @type struct<nsfInfo>
 *
 * @param actorCollapse
 * @text Actor Collapse
 * @type struct<nsfInfo>
 *
 * @param recovery
 * @text Recovery
 * @type struct<nsfInfo>
 *
 * @param miss
 * @text Miss
 * @type struct<nsfInfo>
 *
 * @param evasion
 * @text Evasion
 * @type struct<nsfInfo>
 *
 * @param magicEvasion
 * @text Magic Evasion
 * @type struct<nsfInfo>
 *
 * @param magicReflection
 * @text Magic Reflection
 * @type struct<nsfInfo>
 *
 * @param shop
 * @text Shop
 * @type struct<nsfInfo>
 *
 * @param useItem
 * @text Use Item
 * @type struct<nsfInfo>
 *
 * @param useSkill
 * @text Use Skill
 * @type struct<nsfInfo>
 *
 *
 * @command Not My NSF Play BGM Track
 * @desc Play a BGM track from an nsf file
 * 
 * @arg fileDir
 * @text File Directory
 * @desc The NSF file's directory.
 * @type file
 *
 * @arg fileName
 * @text File Name
 * @desc The NSF file's name, WITHOUT extension.
 * @type string
 *
 * @arg track
 * @text Track
 * @desc Starting from 0, the track to play in the NSF file.
 * @type number
 * @default 0
 * @min 0
 * @decimals 0
 *
 *
 * @command Not My NSF Stop BGM Playback
 * @desc Stop BGM playback
 *
 *
 * @command Not My NSF Play SFX Track
 * @desc Play a SFX track from an nsf file
 * 
 * @arg fileDir
 * @text File Directory
 * @desc The NSF file's directory.
 * @type file
 *
 * @arg fileName
 * @text File Name
 * @desc The NSF file's name, WITHOUT extension.
 * @type string
 *
 * @arg track
 * @text Track
 * @desc Starting from 0, the track to play in the NSF file.
 * @type number
 * @default 0
 * @min 0
 * @decimals 0
 *
 *
 * @command Not My NSF Stop SFX Playback
 * @desc Stop SFX playback
 */
 
/*~struct~nsfInfo:
 * 
 * @param fileDir
 * @text File Directory
 * @desc The NSF file's directory.
 * @type file
 *
 * @param fileName
 * @text File Name
 * @desc The NSF file's name, WITHOUT extension.
 * @type string
 *
 * @param track
 * @text Track
 * @desc Starting from 0, the track to play in the NSF file.
 * @type number
 * @default 0
 * @min 0
 * @decimals 0
 */
 
(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('E9D_NotMyNsf');
	parsePluginParameters();
	
	// plugin variables
	let bgmPlayer = undefined;
	let sfxPlayer = undefined;
	let curBgmNsf = undefined;
	let curSfxNsf = undefined;
	const scriptUrlsE9D_NotMyNsf = [
		"js/libs/nsf-player/libgme/libgme.js",
		"js/libs/nsf-player/index.js"
	];
	loadMainScriptsE9D_NotMyNsf();
	
	// plugin commands
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Play BGM Track', args => {
		playBgmNsf(args);
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Stop BGM Playback', args => {
		stopBgmNsf();
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Play SFX Track', args => {
		playSfxNsf(args);
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Stop SFX Playback', args => {
		stopSfxNsf();
	});
	
	// helper functions
	function parsePluginParameters() {
		parsePluginParameter("title");
		parsePluginParameter("battle");
		parsePluginParameter("victory");
		parsePluginParameter("defeat");
		parsePluginParameter("gameOver");
		parsePluginParameter("boat");
		parsePluginParameter("ship");
		parsePluginParameter("airship");
		parsePluginParameter("cursor");
		parsePluginParameter("ok");
		parsePluginParameter("cancel");
		parsePluginParameter("buzzer");
		parsePluginParameter("equip");
		parsePluginParameter("save");
		parsePluginParameter("load");
		parsePluginParameter("battleStart");
		parsePluginParameter("escape");
		parsePluginParameter("enemyAttack");
		parsePluginParameter("enemyDamage");
		parsePluginParameter("enemyCollapse");
		parsePluginParameter("bossCollapse1");
		parsePluginParameter("bossCollapse2");
		parsePluginParameter("actorDamage");
		parsePluginParameter("actorCollapse");
		parsePluginParameter("recovery");
		parsePluginParameter("miss");
		parsePluginParameter("evasion");
		parsePluginParameter("magicEvasion");
		parsePluginParameter("magicReflection");
		parsePluginParameter("shop");
		parsePluginParameter("useItem");
		parsePluginParameter("useSkill");
	}
	
	function parsePluginParameter(paramName) {
		if(
			pluginParams[paramName] === undefined ||
			pluginParams[paramName] === null ||
			pluginParams[paramName] === ""
		) {
			pluginParams[paramName] = undefined;
			return;
		}
		pluginParams[paramName] = JSON.parse(pluginParams[paramName]);
	}
	
	function loadMainScriptsE9D_NotMyNsf() {
        for (const url of scriptUrlsE9D_NotMyNsf) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            script.async = false;
            script.defer = true;
            script.onload = main.onScriptLoad.bind(main);
            script.onerror = main.onScriptError.bind(main);
            script._url = url;
            document.body.appendChild(script);
        }
        main.numScripts += scriptUrls.length;
    }
	
	function getBgmPlayer() {
		if(bgmPlayer === undefined) {
			bgmPlayer = createNsfPlayer();
		}
		return bgmPlayer;
	}
	
	function getSfxPlayer() {
		if(sfxPlayer === undefined) {
			sfxPlayer = createNsfPlayer();
		}
		return sfxPlayer;
	}
	
	function playBgmNsf(nsfInfo, fallback, fallbackThat) {
		if(isCurrentBgmNsf(nsfInfo)) { return; }
		curBgmNsf = nsfInfo;
		if(nsfInfo === undefined) {
			if(fallback !== undefined && fallbackThat !== undefined) {
				fallback.call(fallbackThat);
			}
			return;
		}
		const url = nsfInfo.fileDir + "/" + nsfInfo.fileName + ".nsf";
		getBgmPlayer().play(url, nsfInfo.track);
	}
	
	function isCurrentBgmNsf(nsfInfo) {
		if(nsfInfo === undefined || curBgmNsf === undefined) {
			return false;
		}
		if(nsfInfo.fileDir === curBgmNsf.fileDir && nsfInfo.fileName === curBgmNsf.fileName && nsfInfo.track === curBgmNsf.track) {
			return true;
		}
		return false;
	}
	
	function stopBgmNsf() {
		curBgmNsf = undefined;
		getBgmPlayer().stop();
	}
	
	function playSfxNsf(nsfInfo, fallback, fallbackThat) {
		curSfxNsf = nsfInfo;
		if(nsfInfo === undefined) {
			if(fallback !== undefined && fallbackThat !== undefined) {
				fallback.call(fallbackThat);
			}
			return;
		}
		const url = nsfInfo.fileDir + "/" + nsfInfo.fileName + ".nsf";
		getSfxPlayer().play(url, nsfInfo.track);
	}
	
	function stopSfxNsf() {
		curSfxNsf = undefined;
		getSfxPlayer().stop();
	}
	
	// data manager
	const _DataManager_onLoad = DataManager.onLoad;
	DataManager.onLoad = function(object) {
		_DataManager_onLoad.call(this, object);
		if (this.isMapObject(object)) {
			this.extractMetadata(object);
			this.extractArrayMetadata(object.events);
			if(object.note !== undefined && object.note !== null && object.note !== "") {
				object.autoplayBgmNsf = JSON.parse(object.note).autoplayBgmNsf;
			}
		}
	};
	
	// audio manager
	const _AudioManager_stopAll = AudioManager.stopAll;
	AudioManager.stopAll = function() {
		_AudioManager_stopAll.call(this);
		stopBgmNsf();
		stopSfxNsf();
	};
	
	// battle manager
	const _BattleManager_saveBgmAndBgs = BattleManager.saveBgmAndBgs;
	BattleManager.saveBgmAndBgs = function() {
		_BattleManager_saveBgmAndBgs.call(this);
		this._mapBgmNsf = curBgmNsf;
	};
	
	const _BattleManager_playBattleBgm = BattleManager.playBattleBgm;
	BattleManager.playBattleBgm = function() {
		playBgmNsf(pluginParams.battle, _BattleManager_playBattleBgm, this);
	};

	const _BattleManager_playVictoryMe = BattleManager.playVictoryMe;
	BattleManager.playVictoryMe = function() {
		playBgmNsf(pluginParams.victory, _BattleManager_playVictoryMe, this);
	};

	const _BattleManager_playDefeatMe = BattleManager.playDefeatMe;
	BattleManager.playDefeatMe = function() {
		playBgmNsf(pluginParams.defeat, _BattleManager_playDefeatMe, this);
	};

	const _BattleManager_replayBgmAndBgs = BattleManager.replayBgmAndBgs;
	BattleManager.replayBgmAndBgs = function() {
		_BattleManager_replayBgmAndBgs.call(this);
		playBgmNsf(this._mapBgmNsf);
	};
	
	BattleManager.processDefeat = function() {
		this.displayDefeatMessage();
		this.playDefeatMe();
		if (this._canLose) {
			this.replayBgmAndBgs();
		} else {
			AudioManager.stopBgm();
			stopBgmNsf();
		}
		this.endBattle(2);
	};
	
	BattleManager.updateBattleEnd = function() {
		if (this.isBattleTest()) {
			AudioManager.stopBgm();
			stopBgmNsf();
			SceneManager.exit();
		} else if (!this._escaped && $gameParty.isAllDead()) {
			if (this._canLose) {
				$gameParty.reviveBattleMembers();
				SceneManager.pop();
			} else {
				SceneManager.goto(Scene_Gameover);
			}
		} else {
			SceneManager.pop();
		}
		this._phase = "";
	};
	
	// game system
	const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
	Game_System.prototype.onBeforeSave = function() {
		_Game_System_onBeforeSave.call(this);
		this._bgmNsfOnSave = curBgmNsf;
	};
	
	const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
	Game_System.prototype.onAfterLoad = function() {
		playBgmNsf(this._bgmNsfOnSave, _Game_System_onAfterLoad, that);
	};
	
	const _Game_System_saveBgm = Game_System.prototype.saveBgm;
	Game_System.prototype.saveBgm = function() {
		_Game_System_saveBgm.call(this);
		this._savedBgmNsf = curBgmNsf;
	};

	const _Game_System_replayBgm = Game_System.prototype.replayBgm;
	Game_System.prototype.replayBgm = function() {
		playBgmNsf(this._savedBgmNsf, _Game_System_replayBgm, this);
	};

	const _Game_System_saveWalkingBgm = Game_System.prototype.saveWalkingBgm;
	Game_System.prototype.saveWalkingBgm = function() {
		_Game_System_saveWalkingBgm.call(this);
		this._walkingBgmNsf = curBgmNsf;
	};

	const _Game_System_replayWalkingBgm = Game_System.prototype.replayWalkingBgm;
	Game_System.prototype.replayWalkingBgm = function() {
		playBgmNsf(this._walkingBgmNsf, _Game_System_replayWalkingBgm, this);
	};

	const _Game_System_saveWalkingBgm2 = Game_System.prototype.saveWalkingBgm2;
	Game_System.prototype.saveWalkingBgm2 = function() {
		_Game_System_saveWalkingBgm2.call(this);
		this._walkingBgmNsf = $dataMap.autoplayBgmNsf;
	};
	
	// game map
	const _Game_Map_autoplay = Game_Map.prototype.autoplay;
	Game_Map.prototype.autoplay = function() {
		if ($dataMap.autoplayBgmNsf !== undefined) {
			if ($gamePlayer.isInVehicle()) {
				$gameSystem.saveWalkingBgm2();
			} else {
				playBgmNsf($dataMap.autoplayBgmNsf);
			}
		}
		_Game_Map_autoplay.call(this);
	};
	
	// game vehicle
	const _Game_Vehicle_playBgm = Game_Vehicle.prototype.playBgm;
	Game_Vehicle.prototype.playBgm = function() {
		if(pluginParams.boat !== undefined && this.isBoat()) {
			playBgmNsf(pluginParams.boat);
			return;
		}
		if(pluginParams.ship !== undefined && this.isShip()) {
			playBgmNsf(pluginParams.ship);
			return;
		}
		if(pluginParams.airship !== undefined && this.isAirship()) {
			playBgmNsf(pluginParams.airship);
			return;
		}
		_Game_Vehicle_playBgm.call(this);
	};
	
	// scene title
	const _Scene_Title_playTitleMusic = Scene_Title.prototype.playTitleMusic;
	Scene_Title.prototype.playTitleMusic = function() {
		_Scene_Title_playTitleMusic.call(this);
		stopBgmNsf();
		playBgmNsf(pluginParams.title);
	};
	
	// scene map
	const _Scene_Map_stopAudioOnBattleStart = Scene_Map.prototype.stopAudioOnBattleStart;
	Scene_Map.prototype.stopAudioOnBattleStart = function() {
		_Scene_Map_stopAudioOnBattleStart.call(this);
		if(!isCurrentBgmNsf(pluginParams.battle)) {
			stopBgmNsf();
		}
	};
	
	// scene gameover
	const _Scene_Gameover_playGameoverMusic = Scene_Gameover.prototype.playGameoverMusic;
	Scene_Gameover.prototype.playGameoverMusic = function() {
		_Scene_Gameover_playGameoverMusic.call(this);
		stopBgmNsf();
	};
})();