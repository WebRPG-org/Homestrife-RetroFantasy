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
	let paletteJailBrightFilter = null;
	const paletteJailUniforms = {};
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
		
		const brightXhr = new XMLHttpRequest();
		brightXhr.open("GET", 'js/plugins/paletteJailBrightShader.frag');
		brightXhr.onreadystatechange = () => {
			if(brightXhr.readyState == 4 && (brightXhr.status === 200 || brightXhr.status === 0)) {
				sourceReady = true;
				compileShader();
			}
		};
		brightXhr.send();
		
		function compileShader() {
			if(!imageReady || !sourceReady) { return; }
			
			// compile the shaders
			const brightShaderSource = brightXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			paletteJailUniforms.paletteTex = paletteImage.baseTexture;
			paletteJailUniforms.hues = paletteImage.width - 1;
			paletteJailUniforms.brightLevels = paletteImage.height;
			paletteJailUniforms.hueTarget = -1;
			paletteJailUniforms.hueOffset = 0;
			paletteJailUniforms.brightOffset = 0;
			paletteJailBrightFilter = new PIXI.Filter(null, brightShaderSource, paletteJailUniforms);
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
	
	// Sprite
	Sprite.prototype._createColorFilter = function() {
		// this._colorFilter = new ColorFilter();
		// if (!this.filters) {
			// this.filters = [];
		// }
		// this.filters.push(this._colorFilter);
	};

	Sprite.prototype._updateColorFilter = function() {
		// if (!this._colorFilter) {
			// this._createColorFilter();
		// }
		// this._colorFilter.setHue(this._hue);
		// this._colorFilter.setBlendColor(this._blendColor);
		// this._colorFilter.setColorTone(this._colorTone);
	};
	
	// Window
	Window.prototype._createClientArea = function() {
		this._clientArea = new Sprite();
		//this._clientArea.filters = [new PIXI.filters.AlphaFilter()];
		//this._clientArea.filterArea = new Rectangle();
		this._clientArea.move(this._padding, this._padding);
		this.addChild(this._clientArea);
	};
	
	Window.prototype._updateFilterArea = function() {
		const pos = this._clientArea.worldTransform.apply(new Point(0, 0));
		//const filterArea = this._clientArea.filterArea;
		//filterArea.x = pos.x + this.origin.x;
		//filterArea.y = pos.y + this.origin.y;
		//filterArea.width = this.innerWidth;
		//filterArea.height = this.innerHeight;
	};
	
	// Scene Base
	// const _Scene_Base_initialize = Scene_Base.prototype.initialize;
	// Scene_Base.prototype.initialize = function() {
		// _Scene_Base_initialize.call(this);
		// this.hueOffset = 0;
		// this.brightOffset = 0;
	// };
	
	Scene_Base.prototype.createColorFilter = function() {
		this.filters = [];
		if(paletteJailBrightFilter) {
			this._colorFilter = paletteJailBrightFilter;
			this.filters.push(paletteJailBrightFilter);
		}
	};
	
	Scene_Base.prototype.updateColorFilter = function() {
		paletteJailUniforms.brightOffset = Math.ceil((paletteJailUniforms.brightLevels-1) * (this._fadeOpacity / 255)) * (this._fadeWhite ? 1 : -1);
		console.log(paletteJailUniforms.brightOffset);
		//this._colorFilter.setBlendColor(blendColor);
	};
	
	// Scene Menu Base
	Scene_MenuBase.prototype.createBackground = function() {
		//this._backgroundFilter = new PIXI.filters.BlurFilter();
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		//this._backgroundSprite.filters = [this._backgroundFilter];
		this.addChild(this._backgroundSprite);
		this.setBackgroundOpacity(255);
	};
	
	// Spriteset Base
	Spriteset_Base.prototype.createBaseFilters = function() {
		this._baseSprite.filters = [];
		//this._baseColorFilter = new ColorFilter();
		//this._baseSprite.filters.push(this._baseColorFilter);
	};
	
	Spriteset_Base.prototype.createOverallFilters = function() {
		this.filters = [];
		//this._overallColorFilter = new ColorFilter();
		//this.filters.push(this._overallColorFilter);
	};
	
	Spriteset_Base.prototype.updateBaseFilters = function() {
		//const filter = this._baseColorFilter;
		//filter.setColorTone($gameScreen.tone());
	};
	
	Spriteset_Base.prototype.updateOverallFilters = function() {
		//const filter = this._overallColorFilter;
		//filter.setBlendColor($gameScreen.flashColor());
		//filter.setBrightness($gameScreen.brightness());
	};
	
	// Spriteset Battle
	Spriteset_Battle.prototype.createBackground = function() {
		//this._backgroundFilter = new PIXI.filters.BlurFilter();
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		//this._backgroundSprite.filters = [this._backgroundFilter];
		this._baseSprite.addChild(this._backgroundSprite);
	};
})();