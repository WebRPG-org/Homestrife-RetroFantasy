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
 * "autoplayNsf": {
 *   "file": "relative/path/to/file",
 *   "track": [a number more than or equal to 0] 
 * }
 * }
 *
 * For general system sound effects, select the files and tracks in the plugin
 * settings.
 *
 * Any nsfs that are specified will override the built in BGM and system SEs.
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
	let bgmPlayer = null;
	let sfxPlayer = null;
	const scriptUrlsE9D_NotMyNsf = [
		"js/libs/nsf-player/libgme/libgme.js",
		"js/libs/nsf-player/index.js"
	];
	loadMainScriptsE9D_NotMyNsf();
	
	// plugin commands
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Play BGM Track', args => {
		const url = args.fileDir + "/" + args.fileName + ".nsf";
		getBgmPlayer().play(url, args.track);
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Stop BGM Playback', args => {
		getBgmPlayer().stop();
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Play SFX Track', args => {
		const url = args.fileDir + "/" + args.fileName + ".nsf";
		getSfxPlayer().play(url, args.track);
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Stop SFX Playback', args => {
		getSfxPlayer().stop();
	});
	
	// helper functions
	function parsePluginParameters() {
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
		if(pluginParams[paramName] !== undefined && pluginParams[paramName] !== null && pluginParams[paramName] !== "") { pluginParams[paramName] = JSON.parse(pluginParams[paramName]); }
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
		if(bgmPlayer === null) {
			bgmPlayer = createNsfPlayer();
		}
		return bgmPlayer;
	}
	
	function getSfxPlayer() {
		if(sfxPlayer === null) {
			sfxPlayer = createNsfPlayer();
		}
		return sfxPlayer;
	}
})();