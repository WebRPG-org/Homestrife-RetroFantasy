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
 * It also alters it somewhat to give more control over channels.
 * This plugin mostly exists to be used by other plugins.
 *
 *
 * @command Not My NSF Play Track
 * @desc Play a track from an nsf file
 * 
 * @arg fileDir
 * @text File Directory
 * @desc The NSF file's directory.
 * @type file
 *
 * @arg fileName
 * @text File Name
 * @desc The NSF file's name.
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
 * @command Not My NSF Stop Playback
 * @desc Stop music playback
 */
 
(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('E9D_NotMyNsf');
	
	// plugin variables
	let nsfPlayer = null;
	const scriptUrlsE9D_NotMyNsf = [
		"js/libs/nsf-player/libgme/libgme.js",
		"js/libs/nsf-player/index.js"
	];
	loadMainScriptsE9D_NotMyNsf();
	
	// plugin commands
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Play Track', args => {
		const url = args.fileDir + "/" + args.fileName + ".nsf";
		getNsfPlayer().play(url, args.track);
	});
	
	PluginManager.registerCommand('E9D_NotMyNsf', 'Not My NSF Stop Playback', args => {
		getNsfPlayer().stop();
	});
	
	// helper functions
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
	
	function getNsfPlayer() {
		if(nsfPlayer === null) {
			nsfPlayer = createNsfPlayer();
		}
		return nsfPlayer;
	}
})();