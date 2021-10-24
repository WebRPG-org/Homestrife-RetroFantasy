//=============================================================================
// RPG Maker MZ - Flexible Windows
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjustments and options for default and custom windows
 * @author Jonathan "Darlos9D" Royal
 *
 * @help FlexibleWindows.js
 *
 * A plugin that easily allows for the positioning and resizing of UI windows.
 * Default windows can be selected, or custom named windows can be specified.
 * Custom windows must be implemented in other plugins, but this plugin
 * provides a unified method of specifying their dimensions easily.
 *
 * Windows settings are provided as an array to avoid clutter. However, be
 * careful of duplicate window entries, as consistent behavior is not
 * guaranteed in this case. A warning will be logged in the console if there
 * are duplicate entries.
 *
 * If used with the RetroPixels plugin, this plugin can use the retro pixel
 * size for window sizing and positioning.
 *
 * This plugin does not provide plugin commands.
 * 
 * @param useRetroPixelSize
 * @text Use Retro Pixel Size
 * @desc Whether the position/size values are in retro or real pixel size.
 * @type boolean
 * @default false
 * @on Retro Pixels
 * @off Real Pixels
 *
 * @param windowsSettings
 * @text Windows Settings
 * @desc Settings to position, size, and enable/disable various UI windows.
 * @type struct<windowSettings>[]
 */
 
/*~struct~windowSettings:
 *
 * @param window
 * @text Window
 * @desc The default window to apply these settings to, or select Custom.
 * @type select
 * @default MenuBase Help
 * @option MenuBase Help
 * @option Menu Command
 * @option Menu Gold
 * @option Menu Status
 * @option ItemBase Actor
 * @option Item Category
 * @option Item Item
 * @option Item Item
 * @option Skill Skill Type
 * @option Skill Status
 * @option Skill Item
 * @option Skill Status
 * @option Equip Status
 * @option Equip Command
 * @option Equip Slot
 * @option Equip Item
 * @option Equip Status
 * @option Status Profile
 * @option Status Status
 * @option Status Status Params
 * @option Status Equip
 * @option Options Options
 * @option File Help
 * @option File List
 * @option GameEnd List
 * @option GameEnd Command
 * @option Shop Gold
 * @option Shop Command
 * @option Shop Dummy
 * @option Shop Number
 * @option Shop Status
 * @option Shop Buy
 * @option Shop Category
 * @option Shop Sell
 * @option Name Edit
 * @option Name Input
 * @option Debug Range
 * @option Debug Edit
 * @option Debug Debug Help
 * @option Battle Log
 * @option Battle Status
 * @option Battle Party Command
 * @option Battle Actor Command
 * @option Battle Help
 * @option Battle Skill
 * @option Battle Item
 * @option Battle Actor
 * @option Battle Enemy
 * @option Custom
 *
 * @param customWindowName
 * @text Custom Window Name
 * @desc The name of the custom window. Utilize this in your own plugins.
 * @type string
 *
 * @param hidden
 * @text Hidden
 * @desc Sets the window to be always hidden.
 * @type boolean
 * @default false
 * @on Hidden
 * @off Normal Visibility
 *
 * @param relativePosition
 * @text Relative Position
 * @desc Whether the X and Y values are relative to default, or absolute.
 * @type boolean
 * @default true
 * @on Relative
 * @off Absolute
 *
 * @param x
 * @text X
 * @desc X position of window.
 * @type number
 * @default 0
 * @decimals 0
 * @min -99999
 *
 * @param y
 * @text Y
 * @desc Y position of window.
 * @type number
 * @default 0
 * @decimals 0
 * @min -99999
 *
 * @param relativeSize
 * @text Relative Size
 * @desc Whether the width and height values are relative to default, or absolute.
 * @type boolean
 * @default true
 * @on Relative
 * @off Absolute
 *
 * @param width
 * @text Width
 * @desc Width of window.
 * @type number
 * @default 0
 * @decimals 0
 * @min -99999
 *
 * @param height
 * @text Height
 * @desc Height of window.
 * @type number
 * @default 0
 * @decimals 0
 * @min -99999
 */
 
(() => {
	// plugin parameters
	const useRetroPixelSize = PluginManager.parameters('FlexibleWindows').useRetroPixelSize === 'true';
	const windowsSettings = [];
	for(const windowsSettingsString of JSON.parse(PluginManager.parameters('FlexibleWindows').windowsSettings)) {
		windowSettings = JSON.parse(windowsSettingsString);
		windowSettings.hidden = windowSettings.hidden === 'true';
		windowSettings.relativePosition = windowSettings.relativePosition === 'true';
		windowSettings.x = parseInt(windowSettings.x);
		windowSettings.y = parseInt(windowSettings.y);
		windowSettings.relativeSize = windowSettings.relativeSize === 'true';
		windowSettings.width = parseInt(windowSettings.width);
		windowSettings.height = parseInt(windowSettings.height);
		windowsSettings.push(windowSettings);
	}
	
	const retroPixelSize = PluginManager.parameters('RetroPixels') ? parseInt(PluginManager.parameters('RetroPixels').retroPixelSize) : 1;
	
	// helper functions
	function getWindowSettings(windowName) {
		const windowNameLower = windowName.toLowerCase();
		if(windowNameLower === 'custom') { return null; }
		for(const windowSettings of windowsSettings) {
			if(windowSettings.window.toLowerCase() === windowNameLower) { return windowSettings; }
		}
		return null;
	};
	
	function getWindowRect(windowName, defaultX, defaultY, defaultW, defaultH) {
		const windowSettings = getWindowSettings(windowName);
		const dimensionMult = useRetroPixelSize ? retroPixelSize : 1;
		let wx = 0;
		let wy = 0;
		let ww = 0;
		let wh = 0;
		if(windowSettings) {
			wx = windowSettings.x * dimensionMult;
			wy = windowSettings.y * dimensionMult;
			ww = windowSettings.width * dimensionMult;
			wh = windowSettings.height * dimensionMult;
			if(windowSettings.relativePosition) {
				wx += defaultX;
				wy += defaultY;
			}
			if(windowSettings.relativeSize) {
				ww += defaultW;
				wh += defaultH;
			}
		} else {
			wx = defaultX;
			wy = defaultY;
			ww = defaultW;
			wh = defaultH;
		}
		ww = Math.max(ww, 0);
		wh = Math.max(wh, 0);
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene_MenuBase
	Scene_MenuBase.prototype.helpWindowRect = function() {
		return getWindowRect(
			'MenuBase Help',
			0,
			this.helpAreaTop(),
			Graphics.boxWidth,
			this.helpAreaHeight()
		);
	};
	
	// Scene_Menu
	Scene_Menu.prototype.commandWindowRect = function() {
		return getWindowRect(
			'Menu Command',
			this.isRightInputMode() ? Graphics.boxWidth - this.mainCommandWidth() : 0,
			this.mainAreaTop(),
			this.mainCommandWidth(),
			this.mainAreaHeight() - this.goldWindowRect().height
		);
	};
})();