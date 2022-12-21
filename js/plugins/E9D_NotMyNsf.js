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
 */
 
(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('E9D_NotMyNsf');
	
	// plugin variables
	const scriptUrlsE9D_NotMyNsf = [
		"js/libs/nsf-player/libgme/libgme.js",
		"js/libs/nsf-player/index.js"
	];
	loadMainScriptsE9D_NotMyNsf();
	
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
        main.numScripts = scriptUrls.length;
    }
	
	
})();