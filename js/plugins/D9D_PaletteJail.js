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
	let emptyShaderSource = null;
	let hueShaderSource = null;
	let brightShaderSource = null;
	let hueBrightShaderSource = null;
	let paletteJailImage = null;
	loadPaletteJailFiles();
	
	// helper functions
	function loadPaletteJailFiles() {
		let imageReady = false;
		let emptySourceReady = false;
		let hueSourceReady = false;
		let brightSourceReady = false;
		let hueBrightSourceReady = false;
		
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
		
		const hueXhr = new XMLHttpRequest();
		hueXhr.open("GET", 'js/plugins/paletteJailHueShader.frag');
		hueXhr.onreadystatechange = () => {
			if(hueXhr.readyState == 4 && (hueXhr.status === 200 || hueXhr.status === 0)) {
				hueSourceReady = true;
				compileShader();
			}
		};
		hueXhr.send();
		
		const brightXhr = new XMLHttpRequest();
		brightXhr.open("GET", 'js/plugins/paletteJailBrightShader.frag');
		brightXhr.onreadystatechange = () => {
			if(brightXhr.readyState == 4 && (brightXhr.status === 200 || brightXhr.status === 0)) {
				brightSourceReady = true;
				compileShader();
			}
		};
		brightXhr.send();
		
		const hueBrightXhr = new XMLHttpRequest();
		hueBrightXhr.open("GET", 'js/plugins/paletteJailHueBrightShader.frag');
		hueBrightXhr.onreadystatechange = () => {
			if(hueBrightXhr.readyState == 4 && (hueBrightXhr.status === 200 || hueBrightXhr.status === 0)) {
				hueBrightSourceReady = true;
				compileShader();
			}
		};
		hueBrightXhr.send();
		
		function compileShader() {
			if(!imageReady || !emptySourceReady || !hueSourceReady || !brightSourceReady || !hueBrightSourceReady) { return; }
			
			// save universal uniforms
			paletteJailImage = paletteImage;
			
			// insert values into shader sources and save them
			emptyShaderSource = emptyXhr.responseText;
			
			hueShaderSource = hueXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			
			brightShaderSource = brightXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			
			hueBrightShaderSource = hueBrightXhr.responseText
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
		if(brightShaderSource) {
			this._colorFilterUniforms = {};
			this._colorFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._colorFilterUniforms.hues = paletteJailImage.width;
			this._colorFilterUniforms.brightLevels = paletteJailImage.height;
			this._colorFilterUniforms.brightOffset = 0;
			this._colorFilter = new PIXI.Filter(null, brightShaderSource, this._colorFilterUniforms);
			this.filters.push(this._colorFilter);
		}
	};
	
	Scene_Base.prototype.updateColorFilter = function() {
		if(this._colorFilter) {
			this._colorFilterUniforms.brightOffset = Math.ceil((this._colorFilterUniforms.brightLevels-1) * (this._fadeOpacity / 255)) * (this._fadeWhite ? 1 : -1);
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