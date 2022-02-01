//=============================================================================
// RPG Maker MZ - Darlos9D's Palette Jail
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Converts to-be-displayed colors to a given palette.
 * @author Jonathan "Darlos9D" Royal
 *
 * @help D9D_PaletteJail.js
 *
 * This plugin allows you to input an image file that contains a collection of
 * colors. The plugin will then pass the colors found in this file into RMMZ's
 * color shader. This shader will convert every incoming color to its closest
 * neighbor in the palette. This will help in limiting the effects of screen
 * fade in/out, tinting, and lighting to only result in certain colors. Of
 * course this will also do the same with the base colors of any assets used.
 *
 * @param paletteFile
 * @text Palette File
 * @desc The image file that contains the colors of the desired palette.
 * @type file
 */
 
(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('D9D_PaletteJail');
	
	// plugin variables
	let paletteJailFilter = null;
	loadPaletteJailFiles();
	
	// helper functions
	function loadPaletteJailFiles() {
		let imageReady = false;
		let sourceReady = false;
		
		const paletteImage = ImageManager.loadBitmapFromUrl(pluginParams.paletteFile + ".png");
		paletteImage.addLoadListener(() => {
			imageReady = true;
			compileShader();
		});
		
		const xhr = new XMLHttpRequest();
		xhr.open("GET", 'js/plugins/paletteJailShaderTemplate.frag');
		xhr.onreadystatechange = () => {
			if(xhr.readyState == 4 && (xhr.status === 200 || xhr.status === 0)) {
				sourceReady = true;
				compileShader();
			}
		};
		xhr.send();
		
		function compileShader() {
			if(!imageReady || !sourceReady) { return; }
			
			// get all the colors into a single array
			const jailPalette = [];
			const hexColors = [];
			for(let ix = 0; ix < paletteImage.width; ix++) {
				for(let iy = 0; iy < paletteImage.height; iy++) {
					const hexColor = paletteImage.getPixel(ix, iy);
					if(hexColors.indexOf(hexColor) >= 0) { continue; }
					hexColors.push(hexColor);
					const rgbColor = hexToRgb(hexColor);
					jailPalette.push(rgbColor.r / 255);
					jailPalette.push(rgbColor.g / 255);
					jailPalette.push(rgbColor.b / 255);
				}
			}
			
			// compile the shader
			const shaderSource = xhr.responseText.replaceAll('%%PALETTE_ARRAY_SIZE%%', hexColors.length+'');
			paletteJailFilter = new PIXI.Filter(null, shaderSource, { palette: jailPalette });
		}
	}
	
	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
	
	// Scene Base
	_Scene_Base__createColorFilter = Scene_Base.prototype.createColorFilter;
	Scene_Base.prototype.createColorFilter = function() {
		_Scene_Base__createColorFilter.call(this);
		if(paletteJailFilter) {
			this.filters.push(paletteJailFilter);
		}
	};
})();