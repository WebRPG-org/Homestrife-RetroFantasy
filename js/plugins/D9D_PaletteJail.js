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
	
	// Tilemap
	const _Tilemap_initialize = Tilemap.prototype.initialize;
	Tilemap.prototype.initialize = function() {
		_Tilemap_initialize.call(this);
		this._createFilters();
	};
	
	Tilemap.prototype._createLayers = function() {
		/*
		 * [Z coordinate]
		 *  0 : Lower tiles
		 *  1 : Lower characters
		 *  3 : Normal characters
		 *  4 : Upper tiles
		 *  5 : Upper characters
		 *  6 : Airship shadow
		 *  7 : Balloon
		 *  8 : Animation
		 *  9 : Destination
		 */
		this._lowerLayer = new Tilemap.Layer();
		this._lowerLayerContainer = new PIXI.Container();
		this._lowerLayerContainer.z = 0;
		this._lowerLayerContainer.addChild(this._lowerLayer);
		this._upperLayer = new Tilemap.Layer();
		this._upperLayer.z = 4;
		this.addChild(this._lowerLayerContainer);
		this.addChild(this._upperLayer);
		this._needsRepaint = true;
	};
	
	Tilemap.prototype._createFilters = function() {
		this._lowerLayerContainer.filters = [];
		if(emptyShaderSource) {
			this._emptyFilter = new PIXI.Filter(null, emptyShaderSource);
			this._emptyFilter.padding = Graphics.width;
			this._lowerLayerContainer.filters.push(this._emptyFilter);
		}
		if(lightingShaderSource) {
			this._lightingFilterUniforms = {};
			this._lightingFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._lightingFilterUniforms.hues = paletteJailImage.width;
			this._lightingFilterUniforms.brightLevels = paletteJailImage.height;
			this._lightingFilterUniforms.lightHue = 0;
			this._lightingFilterUniforms.hueIntensity = 0;
			this._lightingFilterUniforms.brightness = 0;
			this._lightingFilterUniforms.hueDarkenThreshold = 0.0;
			this._lightingFilter = new PIXI.Filter(null, lightingShaderSource, this._lightingFilterUniforms);
			this._lightingFilter.padding = Graphics.width;
		}
	};
	
	const _Tilemap_update = Tilemap.prototype.update;
	Tilemap.prototype.update = function() {
		_Tilemap_update.call(this);
		this._updateFilters();
	};
	
	Tilemap.prototype._updateFilters = function() {
		const lightHue = 10;
		const hueIntensity = 1;
		const brightness = -1;
		const hueDarkenThreshold = 3;
		if(this._lightingFilter && (hueIntensity > 0 || brightness != 0)) {
			if(this._lowerLayerContainer.filters.length === 0 || this._lowerLayerContainer.filters[0] === this._emptyFilter) {
				this._lowerLayerContainer.filters[0] = this._lightingFilter;
			}
			this._lightingFilterUniforms.lightHue = lightHue;
			this._lightingFilterUniforms.hueIntensity = hueIntensity;
			this._lightingFilterUniforms.brightness = brightness;
			this._lightingFilterUniforms.hueDarkenThreshold = hueDarkenThreshold;
		} else if(this._emptyFilter) {
			if(this._lowerLayerContainer.filters.length === 0 || this._lowerLayerContainer.filters[0] === this._lightingFilter) {
				this._lowerLayerContainer.filters[0] = this._emptyFilter;
			}
		}
	};
	
	Tilemap.prototype._addSpot = function(startX, startY, x, y) {
		const mx = startX + x;
		const my = startY + y;
		const dx = x * this._tileWidth;
		const dy = y * this._tileHeight;
		const tileId0 = this._readMapData(mx, my, 0);
		const tileId1 = this._readMapData(mx, my, 1);
		const tileId2 = this._readMapData(mx, my, 2);
		const tileId3 = this._readMapData(mx, my, 3);
		const shadowBits = this._readMapData(mx, my, 4);
		const upperTileId1 = this._readMapData(mx, my - 1, 1);

		this._addSpotTile(tileId0, dx, dy);
		this._addSpotTile(tileId1, dx, dy);
		//this._addShadow(this._lowerLayer, shadowBits, dx, dy);
		if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
			if (!Tilemap.isShadowingTile(tileId0)) {
				this._addTableEdge(this._lowerLayer, upperTileId1, dx, dy);
			}
		}
		if (this._isOverpassPosition(mx, my)) {
			this._addTile(this._upperLayer, tileId2, dx, dy);
			this._addTile(this._upperLayer, tileId3, dx, dy);
		} else {
			this._addSpotTile(tileId2, dx, dy);
			this._addSpotTile(tileId3, dx, dy);
		}
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
			this._brightnessFilterUniforms = {};
			this._brightnessFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._brightnessFilterUniforms.hues = paletteJailImage.width;
			this._brightnessFilterUniforms.brightLevels = paletteJailImage.height;
			this._brightnessFilterUniforms.brightness = 0;
			this._brightnessFilter = new PIXI.Filter(null, brightnessShaderSource, this._brightnessFilterUniforms);
		}
	};
	
	Scene_Base.prototype.updateColorFilter = function() {
		if(this._brightnessFilter && this._fadeOpacity > 0) {
			if(this.filters.length === 0 || this.filters[0] !== this._brightnessFilter) {
				this.filters[0] = this._brightnessFilter;
			}
			this._brightnessFilterUniforms.brightness = Math.ceil((this._brightnessFilterUniforms.brightLevels-1) * (this._fadeOpacity / 255)) * (this._fadeWhite ? 1 : -1);
		} else if(this._emptyFilter) {
			if(this.filters.length === 0 || this.filters[0] !== this._emptyFilter) {
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
		//this._baseSprite.filters = [];
		//this._baseColorFilter = new ColorFilter();
		//this._baseSprite.filters.push(this._baseColorFilter);
	};
	
	Spriteset_Base.prototype.createOverallFilters = function() {
		//this.filters = [];
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