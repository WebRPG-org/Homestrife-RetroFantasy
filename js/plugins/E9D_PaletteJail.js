//=============================================================================
// RPG Maker MZ - Emerald9D's Palette Jail
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Provides palette-limited color filters.
 * @author Joule "Emerald9D" Royal
 *
 * @help E9D_PaletteJail.js
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
 *
 *
 *
 * @command Palette Jail Tint Screen
 * @desc Screen tint command, to be used instead of the vanilla command, when
 * using the Palette Jail plugin.
 *
 * @arg lightHue
 * @text Hue
 * @desc Starting from 0, represents a hue in the palette image. The grayscale hue will simply force grayscale.
 * @type number
 * @default 0
 * @min 0
 * @decimals 0
 *
 * @arg hueIntensity
 * @text Intensity
 * @desc Starting from 0, determines how strong the tint is.
 * @type number
 * @default 0
 * @min 0
 * @decimals 0
 *
 * @arg brightness
 * @text Brightness
 * @desc If non-zero, lightens or darkens the screen.
 * @type number
 * @default 0
 * @min -9999
 * @decimals 0
 *
 * @arg hueDarkenThreshold
 * @text Hue Darken Threshold
 * @desc If higher than 1, only darkens colors further from the chosen hue. Set >= hue count - 1 for no such darkening.
 * @type number
 * @default 1
 * @min 1
 * @decimals 0
 *
 *
 * @command Palette Jail Hue Rotate
 * @desc Shifts the event's or an actor's colors across the palette's hues. Ignores grayscale colors.
 * 
 * @arg shiftAmount
 * @text Shift Amount
 * @desc If non-zero, how many hues to shift by.
 * @type number
 * @default 0
 * @min -9999
 * @max 9999
 * @decimals 0
 *
 * @arg shiftAmountVar
 * @text Shift Amount Variable
 * @desc If not 0 (None), gets the shift amount from a variable.
 * @type variable
 * @default 0
 * @min 0
 * @decimals 0
 *
 * @arg target
 * @text Target
 * @desc Target actor. If 0 (None), targets the event.
 * @type actor
 * @default 0
 * @min 0
 * @decimals 0
 *
 * @arg targetVar
 * @text Target Variable
 * @desc If not 0 (None), gets the target from a variable.
 * @type variable
 * @default 0
 * @min 0
 * @decimals 0
 *
 */
 
(() => {
	// plugin parameters
	const pluginParams = PluginManager.parameters('E9D_PaletteJail');
	
	// plugin commands
	PluginManager.registerCommand('E9D_PaletteJail', 'Palette Jail Tint Screen', args => {
		$gameScreen.startPaletteJailTint(
			parseInt(args.lightHue),
			parseInt(args.hueIntensity),
			parseInt(args.brightness),
			parseInt(args.hueDarkenThreshold)
		);
	});
	
	PluginManager.registerCommand('E9D_PaletteJail', 'Palette Jail Hue Rotate', args => {
		const shiftAmount = parseInt(args.shiftAmount);
		const targetVar = parseInt(args.targetVar);
		const target = targetVar === 0 ? parseInt(args.target) : parseInt($gameVariables.value(targetVar));
		if(target) {
			$gameActors.actor(target);
		} else {
			
		}
	});
	
	// plugin variables
	let emptyShaderSource = null;
	let monochromeShaderSource = null;
	let brightnessShaderSource = null;
	let lightingShaderSource = null;
	let hueRotateShaderSource = null;
	let monochromeTumbleShaderSource = null;
	let noiseFadeShaderSource = null;
	let horizontalScrollShaderSource = null;
	let paletteJailImage = null;
	loadPaletteJailFiles();
	
	// helper functions
	function loadPaletteJailFiles() {
		let imageReady = false;
		let emptySourceReady = false;
		let monochromeSourceReady = false;
		let brightnessSourceReady = false;
		let lightingSourceReady = false;
		let hueRotateSourceReady = false;
		let monochromeTumbleSourceReady = false;
		let noiseFadeSourceReady = false;
		let horizontalScrollSourceReady = false;
		
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
		
		const hueRotateXhr = new XMLHttpRequest();
		hueRotateXhr.open("GET", 'js/plugins/paletteJailHueRotateShader.frag');
		hueRotateXhr.onreadystatechange = () => {
			if(hueRotateXhr.readyState == 4 && (hueRotateXhr.status === 200 || hueRotateXhr.status === 0)) {
				hueRotateSourceReady = true;
				compileShader();
			}
		};
		hueRotateXhr.send();
		
		const monochromeTumbleXhr = new XMLHttpRequest();
		monochromeTumbleXhr.open("GET", 'js/plugins/paletteJailMonochromeTumbleShader.frag');
		monochromeTumbleXhr.onreadystatechange = () => {
			if(monochromeTumbleXhr.readyState == 4 && (monochromeTumbleXhr.status === 200 || monochromeTumbleXhr.status === 0)) {
				monochromeTumbleSourceReady = true;
				compileShader();
			}
		};
		monochromeTumbleXhr.send();
		
		const noiseFadeXhr = new XMLHttpRequest();
		noiseFadeXhr.open("GET", 'js/plugins/paletteJailNoiseFadeShader.frag');
		noiseFadeXhr.onreadystatechange = () => {
			if(noiseFadeXhr.readyState == 4 && (noiseFadeXhr.status === 200 || noiseFadeXhr.status === 0)) {
				noiseFadeSourceReady = true;
				compileShader();
			}
		};
		noiseFadeXhr.send();
		
		const horizontalScrollXhr = new XMLHttpRequest();
		horizontalScrollXhr.open("GET", 'js/plugins/paletteJailHorizontalScrollShader.frag');
		horizontalScrollXhr.onreadystatechange = () => {
			if(horizontalScrollXhr.readyState == 4 && (horizontalScrollXhr.status === 200 || horizontalScrollXhr.status === 0)) {
				horizontalScrollSourceReady = true;
				compileShader();
			}
		};
		horizontalScrollXhr.send();
		
		function compileShader() {
			if(
				!imageReady 					||
				!emptySourceReady 				||
				!monochromeSourceReady 			||
				!brightnessSourceReady 			||
				!lightingSourceReady 			||
				!hueRotateSourceReady			||
				!monochromeTumbleSourceReady	||
				!noiseFadeSourceReady			||
				!horizontalScrollSourceReady
			) { return; }
			
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
			
			hueRotateShaderSource = hueRotateXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			
			monochromeTumbleShaderSource = monochromeTumbleXhr.responseText
				.replaceAll('%%PALETTE_WIDTH%%', paletteImage.width)
				.replaceAll('%%PALETTE_HEIGHT%%', paletteImage.height);
			
			noiseFadeShaderSource = noiseFadeXhr.responseText;
			
			horizontalScrollShaderSource = horizontalScrollXhr.responseText;
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
	const _Sprite_initialize = Sprite.prototype.initialize;
	Sprite.prototype.initialize = function(bitmap) {
		_Sprite_initialize.call(this, bitmap);
		this._createColorFilter();
	};
	
	Sprite.prototype.setHueRotateFilter = function(shiftAmount, shiftDirection) {
		while(shiftAmount < 0) { shiftAmount += paletteJailImage.width; }
		while(shiftAmount > paletteJailImage.width-1) { shiftAmount -= paletteJailImage.width; }
		this._hueRotateFilterUniforms.shiftAmount = shiftAmount;
		this._hueRotateFilterUniforms.shiftDirection = shiftDirection;
		this._updateColorFilter();
	}
	
	Sprite.prototype.setMonochromeTumbleFilter = function(shiftAmount, shiftDirection, hue, ignoreBlack) {
		this._monochromeTumbleFilterUniforms.hue = hue;
		while(shiftAmount < (ignoreBlack ? 1 : 0)) { shiftAmount += paletteJailImage.height - (ignoreBlack ? 1 : 0); }
		while(shiftAmount > paletteJailImage.height-1) { shiftAmount -= paletteJailImage.height - (ignoreBlack ? 1 : 0); }
		this._monochromeTumbleFilterUniforms.shiftAmount = shiftAmount;
		this._monochromeTumbleFilterUniforms.shiftDirection = shiftDirection;
		this._monochromeTumbleFilterUniforms.ignoreBlack = ignoreBlack ? 1 : 0;
		this._updateColorFilter();
	}
	
	Sprite.prototype.setNoiseFadeFilter = function(rate) {
		const prevNoiseBitmap = this._noiseFadeFilterUniforms.noiseSampler ? this._noiseFadeFilterUniforms.noiseSampler : null;
		const noiseBitmap = new Bitmap(this.width, this.height);
		const imageData = noiseBitmap.context.getImageData(0, 0, noiseBitmap.width, noiseBitmap.height);
		let prevImageData = null;
		try {
			prevImageData = prevNoiseBitmap ? prevNoiseBitmap.context.getImageData(0, 0, prevNoiseBitmap.width, prevNoiseBitmap.height) : null;
		} catch(e) {
			prevImageData = null;
		}
		const data = imageData.data;
		const prevData = prevImageData ? prevImageData.data : null;
		for (let i = 0; i < data.length; i += 4) {
			data[i] = 0;																		// red
			data[i+1] = 0;																		// green
			data[i+2] = 0;																		// blue
			data[i+3] = prevData && prevData[i+3] === 0 ? 0 : (Math.random() < rate ? 0 : 255);	// alpha
		}
		noiseBitmap.context.putImageData(imageData, 0, 0);
		if(this._noiseFadeFilterUniforms.noiseSampler) {
			this._noiseFadeFilterUniforms.noiseSampler.destroy();
		}
		this._noiseFadeFilterUniforms.noiseSampler = noiseBitmap;
		this._updateColorFilter();
	};
	
	Sprite.prototype.clearFilterParams = function() {
		this._hueRotateFilterUniforms.shiftAmount = 0;
		this._hueRotateFilterUniforms.shiftDirection = 1;
		this._monochromeTumbleFilterUniforms.hue = -1;
		this._monochromeTumbleFilterUniforms.shiftAmount = 0;
		this._monochromeTumbleFilterUniforms.shiftDirection = 1;
		this._monochromeTumbleFilterUniforms.ignoreBlack = 0;
		if(this._noiseFadeFilterUniforms.noiseSampler) {
			this._noiseFadeFilterUniforms.noiseSampler.destroy();
		}
		this._noiseFadeFilterUniforms.noiseSampler = null;
		this._updateColorFilter();
	};
	
	Sprite.prototype._createColorFilter = function() {
		this.filters = [];
		if(emptyShaderSource) {
			this._emptyFilter = new PIXI.Filter(null, emptyShaderSource);
			this.filters.push(this._emptyFilter);
		}
		if(hueRotateShaderSource) {
			this._hueRotateFilterUniforms = {};
			this._hueRotateFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._hueRotateFilterUniforms.hues = paletteJailImage.width;
			this._hueRotateFilterUniforms.brightLevels = paletteJailImage.height;
			this._hueRotateFilterUniforms.shiftAmount = 0;
			this._hueRotateFilterUniforms.shiftDirection = 1;
			this._hueRotateFilter = new PIXI.Filter(null, hueRotateShaderSource, this._hueRotateFilterUniforms);
		}
		if(monochromeTumbleShaderSource) {
			this._monochromeTumbleFilterUniforms = {};
			this._monochromeTumbleFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._monochromeTumbleFilterUniforms.hues = paletteJailImage.width;
			this._monochromeTumbleFilterUniforms.brightLevels = paletteJailImage.height;
			this._monochromeTumbleFilterUniforms.hue = 0;
			this._monochromeTumbleFilterUniforms.shiftAmount = 0;
			this._monochromeTumbleFilterUniforms.shiftDirection = 1;
			this._monochromeTumbleFilterUniforms.ignoreBlack = 0;
			this._monochromeTumbleFilter = new PIXI.Filter(null, monochromeTumbleShaderSource, this._monochromeTumbleFilterUniforms);
		}
		if(noiseFadeShaderSource) {
			this._noiseFadeFilterUniforms = {};
			this._noiseFadeFilterUniforms.noiseSampler = null;
			this._noiseFadeFilter = new PIXI.Filter(null, noiseFadeShaderSource, this._noiseFadeFilterUniforms);
		}
	};

	Sprite.prototype._updateColorFilter = function() {
		if(this._hueRotateFilterUniforms.shiftAmount !== 0) {
			if(this.filters.length === 0 || this.filters[0] !== this._hueRotateFilter) {
				this.filters[0] = this._hueRotateFilter;
			}
		} else if(this._monochromeTumbleFilterUniforms.hue >= 0) {
			if(this.filters.length === 0 || this.filters[0] !== this._monochromeTumbleFilter) {
				this.filters[0] = this._monochromeTumbleFilter;
			}
		} else if(this._noiseFadeFilterUniforms.noiseSampler) {
			if(this.filters.length === 0 || this.filters[0] !== this._noiseFadeFilter) {
				this.filters[0] = this._noiseFadeFilter;
			}
		} else {
			if(this.filters.length === 0 || this.filters[0] !== this._emptyFilter) {
				this.filters[0] = this._emptyFilter;
			}
		}
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
		if(brightnessShaderSource) {
			this._brightnessFilterUniforms = {};
			this._brightnessFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._brightnessFilterUniforms.hues = paletteJailImage.width;
			this._brightnessFilterUniforms.brightLevels = paletteJailImage.height;
			this._brightnessFilterUniforms.brightness = 0;
			this._brightnessFilter = new PIXI.Filter(null, brightnessShaderSource, this._brightnessFilterUniforms);
			this._brightnessFilter.padding = Graphics.width;
		}
		if(monochromeShaderSource) {
			this._monochromeFilterUniforms = {};
			this._monochromeFilterUniforms.paletteTex = paletteJailImage.baseTexture;
			this._monochromeFilterUniforms.hues = paletteJailImage.width;
			this._monochromeFilterUniforms.brightLevels = paletteJailImage.height;
			this._monochromeFilterUniforms.hue = 0;
			this._monochromeFilterUniforms.brightness = 0;
			this._monochromeFilter = new PIXI.Filter(null, monochromeShaderSource, this._monochromeFilterUniforms);
			this._monochromeFilter.padding = Graphics.width;
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
		if(this._monochromeFilter && this._lightingFilterUniforms.hueIntensity >= this._lightingFilterUniforms.hues - 2 && this._lightingFilterUniforms.hueDarkenThreshold > this._lightingFilterUniforms.hues - 2) {
			if(this._lowerLayerContainer.filters.length === 0 || this._lowerLayerContainer.filters[0] !== this._monochromeFilter) {
				this._lowerLayerContainer.filters[0] = this._monochromeFilter;
			}
		} else if(this._lightingFilter && this._lightingFilterUniforms.hueIntensity > 0) {
			if(this._lowerLayerContainer.filters.length === 0 || this._lowerLayerContainer.filters[0] !== this._lightingFilter) {
				this._lowerLayerContainer.filters[0] = this._lightingFilter;
			}
		} else if(this._brightnessFilter && this._brightnessFilterUniforms.brightness !== 0) {
			if(this._lowerLayerContainer.filters.length === 0 || this._lowerLayerContainer.filters[0] !== this._brightnessFilter) {
				this._lowerLayerContainer.filters[0] = this._brightnessFilter;
			}
		} else if(this._emptyFilter) {
			if(this._lowerLayerContainer.filters.length === 0 || this._lowerLayerContainer.filters[0] !== this._emptyFilter) {
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
	
	Tilemap.prototype.setFilterParams = function(lightHue, hueIntensity, brightness, hueDarkenThreshold) {
		this._brightnessFilterUniforms.brightness = brightness;
		this._monochromeFilterUniforms.hue = lightHue;
		this._monochromeFilterUniforms.brightness = brightness;
		this._lightingFilterUniforms.lightHue = lightHue;
		this._lightingFilterUniforms.hueIntensity = hueIntensity;
		this._lightingFilterUniforms.brightness = brightness;
		this._lightingFilterUniforms.hueDarkenThreshold = hueDarkenThreshold;
	};
	
	// Tiling Sprite
	const _TilingSprite__initialize = TilingSprite.prototype.initialize;
	TilingSprite.prototype.initialize = function(bitmap) {
		_TilingSprite__initialize.call(this, bitmap);
		this._createColorFilter();
	};
	
	TilingSprite.prototype.setHorizontalScrollFilter = function(startY, height, scrollAmt, scrollDir) {
		if(height <= 0) {
			this._horizontalScrollFilterUniforms.scrollAmt = 0;
			return;
		}
		while(scrollAmt < 0) { scrollAmt += this.width; }
		while(scrollAmt > this.width-1) { scrollAmt -= this.width; }
		if(scrollAmt == 0) {
			this._horizontalScrollFilterUniforms.scrollAmt = 0;
			return;
		}
		this._horizontalScrollFilterUniforms.startY = startY < 0 ? 0 : startY / this.height;
		this._horizontalScrollFilterUniforms.height = height / this.height;
		this._horizontalScrollFilterUniforms.scrollAmt = scrollAmt / this.width;
		this._horizontalScrollFilterUniforms.scrollDir = !scrollDir || scrollDir > 0 ? 1 : -1;
		this._updateColorFilter();
	};
	
	TilingSprite.prototype.clearFilterParams = function() {
		this._horizontalScrollFilterUniforms.startY = 0;
		this._horizontalScrollFilterUniforms.height = 0;
		this._horizontalScrollFilterUniforms.scrollAmt = 0;
		this._horizontalScrollFilterUniforms.scrollDir = 1;
		this._updateColorFilter();
	};
	
	TilingSprite.prototype._createColorFilter = function() {
		this.filters = [];
		if(emptyShaderSource) {
			this._emptyFilter = new PIXI.Filter(null, emptyShaderSource);
			this.filters.push(this._emptyFilter);
		}
		if(horizontalScrollShaderSource) {
			this._horizontalScrollFilterUniforms = {};
			this._horizontalScrollFilterUniforms.startY = 0;
			this._horizontalScrollFilterUniforms.height = 0;
			this._horizontalScrollFilterUniforms.scrollAmt = 0;
			this._horizontalScrollFilterUniforms.scrollDir = 1;
			this._horizontalScrollFilter = new PIXI.Filter(null, horizontalScrollShaderSource, this._horizontalScrollFilterUniforms);
		}
	};

	TilingSprite.prototype._updateColorFilter = function() {
		if(this._horizontalScrollFilterUniforms.scrollAmt > 0 && this._horizontalScrollFilterUniforms.height > 0) {
			if(this.filters.length === 0 || this.filters[0] !== this._horizontalScrollFilter) {
				this.filters[0] = this._horizontalScrollFilter;
			}
		} else {
			if(this.filters.length === 0 || this.filters[0] !== this._emptyFilter) {
				this.filters[0] = this._emptyFilter;
			}
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
	
	// Game Screen
	const _Game_Screen_clear = Game_Screen.prototype.clear;
	Game_Screen.prototype.clear = function() {
		_Game_Screen_clear.call(this);
		this.clearPaletteJailTint();
	};
	
	Game_Screen.prototype.paletteJailTint = function() {
		return this._paletteJailTint;
	};
	
	Game_Screen.prototype.startPaletteJailTint = function(lightHue, hueIntensity, brightness, hueDarkenThreshold) {
		this._paletteJailTint = {
			lightHue: lightHue,
			hueIntensity: hueIntensity,
			brightness: brightness,
			hueDarkenThreshold: hueDarkenThreshold
		};
	};
	
	Game_Screen.prototype.clearPaletteJailTint = function() {
		this._paletteJailTint = {
			lightHue: 0,
			hueIntensity: 0,
			brightness: 0,
			hueDarkenThreshold: 1
		};
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
	
	// Spriteset Base
	const _Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
	Spriteset_Map.prototype.updateTilemap = function() {
		_Spriteset_Map_updateTilemap.call(this);
		const tint = $gameScreen.paletteJailTint();
		if(tint) {
			this._tilemap.setFilterParams(tint.lightHue, tint.hueIntensity, tint.brightness, tint.hueDarkenThreshold);
		} else {
			this._tilemap.setFilterParams(0, 0, 0, 1);
		}
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