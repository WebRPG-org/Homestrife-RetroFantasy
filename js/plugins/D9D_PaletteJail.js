//=============================================================================
// RPG Maker MZ - Darlos9D's Palette Jail
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Provides palette-limited color filters.
 * @author Jonathan "Darlos9D" Royal
 *
 * @help D9D_PaletteJail.js
 *
 * This plugin limits color filter inputs and outputs to specific colors found
 * in a provided palette image file.
 *
 * The image file should be constructed such that each pixel in it is a color
 * in the palette. The leftmost column should represent grayscale, and the
 * following columns represent color hues. The hues should be arranged in color
 * wheel order, but it does not matter which colors are at the start or end.
 * The rows are shades of colors, with the darkest at the top and the lightest
 * at the bottom. The topmost row should be black for all, and the bottom most
 * row should be white for all.
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
	let emptyShaderSource = null;
	let monochromeShaderSource = null;
	let brightnessShaderSource = null;
	let lightingShaderSource = null;
	let paletteJailImage = null;
	loadPaletteJailFiles();
	
	// helper functions
	function loadPaletteJailFiles() {
		let imageReady = false;
		let emptySourceReady = false;
		let monochromeSourceReady = false;
		let brightnessSourceReady = false;
		let lightingSourceReady = false;
		
		const paletteImage = ImageManager.loadBitmapFromUrl(pluginParams.paletteFile + ".png");
		paletteImage.addLoadListener(() => {
			imageReady = true;
			compileShader();
		});
		
		const emptyXhr = new XMLHttpRequest();
		emptyXhr.open("GET", 'js/plugins/paletteJailEmptyShader.frag');
		emptyXhr.onreadystatechange = () => {
			if(emptyXhr.readyState == 4 && (emptyXhr.status === 200 || emptyXhr.status === 0)) {
				emptySourceReady = true;
				compileShader();
			}
		};
		emptyXhr.send();
		
		const monochromeXhr = new XMLHttpRequest();
		monochromeXhr.open("GET", 'js/plugins/paletteJailMonochromeShader.frag');
		monochromeXhr.onreadystatechange = () => {
			if(monochromeXhr.readyState == 4 && (monochromeXhr.status === 200 || monochromeXhr.status === 0)) {
				monochromeSourceReady = true;
				compileShader();
			}
		};
		monochromeXhr.send();
		
		const brightnessXhr = new XMLHttpRequest();
		brightnessXhr.open("GET", 'js/plugins/paletteJailBrightnessShader.frag');
		brightnessXhr.onreadystatechange = () => {
			if(brightnessXhr.readyState == 4 && (brightnessXhr.status === 200 || brightnessXhr.status === 0)) {
				brightnessSourceReady = true;
				compileShader();
			}
		};
		brightnessXhr.send();
		
		const lightingXhr = new XMLHttpRequest();
		lightingXhr.open("GET", 'js/plugins/paletteJailLightingShader.frag');
		lightingXhr.onreadystatechange = () => {
			if(lightingXhr.readyState == 4 && (lightingXhr.status === 200 || lightingXhr.status === 0)) {
				lightingSourceReady = true;
				compileShader();
			}
		};
		lightingXhr.send();
		
		function compileShader() {
			if(!imageReady || !emptySourceReady || !monochromeSourceReady || !brightnessSourceReady || !lightingSourceReady) { return; }
			
			// save universal uniforms
			paletteJailImage = paletteImage;
			
			// insert values into shader sources and save them
			emptyShaderSource = emptyXhr.responseText;
			
			monochromeShaderSource = monochromeXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			
			brightnessShaderSource = brightnessXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			
			lightingShaderSource = lightingXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
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
	Scene_Base.prototype.createColorFilter = function() {
		this.filters = [];
		if(emptyShaderSource) {
			this._emptyFilter = new PIXI.Filter(null, emptyShaderSource);
			this.filters.push(this._emptyFilter);
		}
		if(brightnessShaderSource) {
			this._colorFilterUniforms = {};
			this._colorFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._colorFilterUniforms.hues = paletteJailImage.width;
			this._colorFilterUniforms.brightLevels = paletteJailImage.height;
			this._colorFilterUniforms.brightness = 0;
			this._colorFilter = new PIXI.Filter(null, brightnessShaderSource, this._colorFilterUniforms);
		}
	};
	
	Scene_Base.prototype.updateColorFilter = function() {
		if(this._colorFilter && this._fadeOpacity > 0) {
			if(this.filters.length === 0 || this.filters[0] === this._emptyFilter) {
				this.filters[0] = this._colorFilter;
			}
			this._colorFilterUniforms.brightness = Math.ceil((this._colorFilterUniforms.brightLevels-1) * (this._fadeOpacity / 255)) * (this._fadeWhite ? 1 : -1);
		} else if(this._emptyFilter) {
			if(this.filters.length === 0 || this.filters[0] === this._colorFilter) {
				this.filters[0] = this._emptyFilter;
			}
		}
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
		if(emptyShaderSource) {
			this._emptyFilter = new PIXI.Filter(null, emptyShaderSource);
			this._baseSprite.filters.push(this._emptyFilter);
		}
		if(lightingShaderSource) {
			this._baseColorFilterUniforms = {};
			this._baseColorFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._baseColorFilterUniforms.hues = paletteJailImage.width;
			this._baseColorFilterUniforms.brightLevels = paletteJailImage.height;
			this._baseColorFilterUniforms.lightHue = 0;
			this._baseColorFilterUniforms.hueIntensity = 0;
			this._baseColorFilterUniforms.brightness = 0;
			this._lightingFilter = new PIXI.Filter(null, lightingShaderSource, this._baseColorFilterUniforms);
		}
	};
	
	Spriteset_Base.prototype.createOverallFilters = function() {
		this.filters = [];
		//this._overallColorFilter = new ColorFilter();
		//this.filters.push(this._overallColorFilter);
	};
	
	Spriteset_Base.prototype.updateBaseFilters = function() {
		const lightHue = 10;
		const hueIntensity = 1;
		const brightness = -1;
		if(this._lightingFilter && (hueIntensity > 0 || brightness != 0)) {
			if(this._baseSprite.filters.length === 0 || this._baseSprite.filters[0] === this._emptyFilter) {
				this._baseSprite.filters[0] = this._lightingFilter;
			}
			this._baseColorFilterUniforms.lightHue = lightHue;
			this._baseColorFilterUniforms.hueIntensity = hueIntensity;
			this._baseColorFilterUniforms.brightness = brightness;
		} else if(this._emptyFilter) {
			if(this._baseSprite.filters.length === 0 || this._baseSprite.filters[0] === this._lightingFilter) {
				this._baseSprite.filters[0] = this._emptyFilter;
			}
		}
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