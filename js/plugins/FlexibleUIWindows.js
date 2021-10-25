//=============================================================================
// RPG Maker MZ - Flexible UI Windows
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjustments and options for default and custom UI windows
 * @author Jonathan "Darlos9D" Royal
 *
 * @help FlexibleUIWindows.js
 *
 * A plugin that easily allows for the positioning and resizing of UI windows.
 *
 * Out of the box, each window should already be arranged the same way they are
 * in default RPG Maker MZ. Windows can be modified to be absolutely positioned
 * and/or sized, or positioned and/or sized releative to other windows.
 * Unwanted windows can be permanently hidden as well.
 *
 * Custom window dimensiones can be added to an array. Custom windows must be
 * implemented in other plugins, but this plugin provides a unified method of
 * specifying their dimensions easily, making design easier.
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
 * @param menuBaseHelp
 * @text MenuBase Help
 * @desc Settings for party menus help window.
 * @type struct<windowSettings>
 *
 * @param menuCommand
 * @text Menu Command
 * @desc Settings for party menu command window.
 * @type struct<windowSettings>
 * #default {}
 *
 * @param menuGold
 * @text Menu Gold
 * @desc Settings for party menu gold window.
 * @type struct<windowSettings>
 *
 * @param menuStatus
 * @text Menu Status
 * @desc Settings for party menu actors status window.
 * @type struct<windowSettings>
 *
 * @param itemBaseActor
 * @text ItemBase Actor
 * @desc Settings for item menu actor window.
 * @type struct<windowSettings>
 *
 * @param itemCategory
 * @text Item Category
 * @desc Settings for item menu categories window.
 * @type struct<windowSettings>
 *
 * @param itemItem
 * @text Item Item
 * @desc Settings for item menu items list window.
 * @type struct<windowSettings>
 *
 * @param skillSkillType
 * @text Skill Skill Type
 * @desc Settings for skill menu skill types window.
 * @type struct<windowSettings>
 *
 * @param skillStatus
 * @text Skill Status
 * @desc Settings for skill menu actor status.
 * @type struct<windowSettings>
 *
 * @param skillItem
 * @text Skill Item
 * @desc Settings for skill menu skills list window.
 * @type struct<windowSettings>
 *
 * @param equipStatus
 * @text Equip Status
 * @desc Settings for equip menu actor status window.
 * @type struct<windowSettings>
 *
 * @param equipCommand
 * @text Equip Command
 * @desc Settings for equip menu commands window.
 * @type struct<windowSettings>
 *
 * @param equipSlot
 * @text Equip Slot
 * @desc Settings for equip menu equipment slots window.
 * @type struct<windowSettings>
 *
 * @param equipItem
 * @text Equip Item
 * @desc Settings for equip menu items list window.
 * @type struct<windowSettings>
 *
 * @param statusProfile
 * @text Status Profile
 * @desc Settings for status menu actor profile window.
 * @type struct<windowSettings>
 *
 * @param statusStatus
 * @text Status Status
 * @desc Settings for status menu actor status window.
 * @type struct<windowSettings>
 *
 * @param statusStatusParams
 * @text Status Status Params
 * @desc Settings for status menu actor params window.
 * @type struct<windowSettings>
 *
 * @param statusEquip
 * @text Status Equip
 * @desc Settings for status menu actor equips window.
 * @type struct<windowSettings>
 *
 * @param optionsOptions
 * @text Options Options
 * @desc Settings for options menu window.
 * @type struct<windowSettings>
 *
 * @param fileHelp
 * @text File Help
 * @desc Settings for load/save menus help window.
 * @type struct<windowSettings>
 *
 * @param fileList
 * @text File List
 * @desc Settings for load/save menus files list window.
 * @type struct<windowSettings>
 *
 * @param gameEndCommand
 * @text Game End Command
 * @desc Settings for game over screen commands window.
 * @type struct<windowSettings>
 *
 * @param shopGold
 * @text Shop Gold
 * @desc Settings for shop menu gold window.
 * @type struct<windowSettings>
 *
 * @param shopCommand
 * @text Shop Command
 * @desc Settings for shop menu commands window.
 * @type struct<windowSettings>
 *
 * @param shopDummy
 * @text Shop Dummy
 * @desc Settings for shop menu projected params window.
 * @type struct<windowSettings>
 *
 * @param shopNumber
 * @text Shop Number
 * @desc Settings for shop menu number of items window.
 * @type struct<windowSettings>
 *
 * @param shopStatus
 * @text Shop Status
 * @desc Settings for shop menu current params window.
 * @type struct<windowSettings>
 *
 * @param shopBuy
 * @text Shop Buy
 * @desc Settings for shop menu items to buy window.
 * @type struct<windowSettings>
 *
 * @param shopCategory
 * @text Shop Category
 * @desc Settings for shop menu categories window.
 * @type struct<windowSettings>
 *
 * @param shopSell
 * @text Shop Sell
 * @desc Settings for shop menu items to sell window.
 * @type struct<windowSettings>
 *
 * @param nameEdit
 * @text Name Edit
 * @desc Settings for name edit window.
 * @type struct<windowSettings>
 *
 * @param nameInput
 * @text Name Input
 * @desc Settings for name input window.
 * @type struct<windowSettings>
 *
 * @param debugRange
 * @text Debug Range
 * @desc Settings for debug menu range window.
 * @type struct<windowSettings>
 *
 * @param debugEdit
 * @text Debug Edit
 * @desc Settings for debug menu edit window.
 * @type struct<windowSettings>
 *
 * @param debugDebugHelp
 * @text Debug Debug Help
 * @desc Settings for debug menus help window.
 * @type struct<windowSettings>
 *
 * @param battleLog
 * @text Battle Log
 * @desc Settings for battle log window.
 * @type struct<windowSettings>
 *
 * @param battleStatus
 * @text Battle Status
 * @desc Settings for battle party status window.
 * @type struct<windowSettings>
 *
 * @param battlePartyCommand
 * @text Battle Party Command
 * @desc Settings for battle party command window.
 * @type struct<windowSettings>
 *
 * @param battleActorCommand
 * @text Battle Actor Command
 * @desc Settings for battle actor command window.
 * @type struct<windowSettings>
 *
 * @param battleHelp
 * @text Battle Help
 * @desc Settings for battle help window.
 * @type struct<windowSettings>
 *
 * @param battleSkill
 * @text Battle Skill
 * @desc Settings for battle skills window.
 * @type struct<windowSettings>
 *
 * @param battleItem
 * @text Battle Item
 * @desc Settings for battle items window.
 * @type struct<windowSettings>
 *
 * @param battleActor
 * @text Battle Actor
 * @desc Settings for battle actor window.
 * @type struct<windowSettings>
 *
 * @param battleEnemy
 * @text Battle Enemy
 * @desc Settings for battle enemy window.
 * @type struct<windowSettings>
 *
 * @param customWindows
 * @text Custom Windows
 * @desc A list to add custom windows settings to.
 * @type struct<windowSettings>[]
 */
 
/*~struct~windowSettings:
 *
 * @param customWindowName
 * @text Custom Window Name
 * @desc The name of the window, if this is custom window settings. Utilize this in your own plugins.
 * @type string
 *
 * @param hidden
 * @text Hidden
 * @desc Sets the window to be always hidden.
 * @type boolean
 * @on Hidden
 * @off Normal Visibility
 *
 * @param relativeX
 * @text X
 * @desc X position dimension settings.
 * @type struct<windowDimension>
 *
 * @param relativeY
 * @text Y
 * @desc Y position dimension settings.
 * @type struct<windowDimension>
 *
 * @param relativeW
 * @text Width
 * @desc Horizontal size dimension settings.
 * @type struct<windowDimension>
 *
 * @param relativeH
 * @text Height
 * @desc Vertical size dimension settings.
 * @type struct<windowDimension>
 *
 * @param relativeSideX
 * @text X Side
 * @desc To left or right side of relative window?
 * @type select
 * @option Outer Left
 * @option Inner Left
 * @option Inner Right
 * @option Outer Right
 *
 * @param relativeSideY
 * @text Y Side
 * @desc To top or bottom side of relative window?
 * @type select
 * @option Outer Top
 * @option Inner Top
 * @option Inner Bottom
 * @option Outer Bottom
 *
 * @param heightMeasurementType
 * @text Height Measurement Type
 * @desc Height dimension is raw pixels, or a number of rows for auto-fitted height.
 * @type select
 * @option Pixels
 * @option Fitting Height
 */
 
/*~struct~windowDimension:
 * 
 * @param relativeTo
 * @text Relative To
 * @desc The window to get the base dimension from.
 * @type select
 * @option None
 * @option Screen
 * @option MenuBase Help
 * @option Menu Command
 * @option Menu Gold
 * @option Menu Status
 * @option ItemBase Actor
 * @option Item Category
 * @option Item Item
 * @option Skill Skill Type
 * @option Skill Status
 * @option Skill Item
 * @option Equip Status
 * @option Equip Command
 * @option Equip Slot
 * @option Equip Item
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
 * @option Custom Window
 *
 * @param customWindowName
 * @text Custom Window Name
 * @desc The name of the window, if Custom Window is chosen. Utilize this in your own plugins.
 * @type string
 * 
 * @param offset
 * @text Offset
 * @desc Offset from refrence dimension. If None is chosen, this just sets the dimension value.
 * @type number
 * @decimals 0
 * @min -99999
 */
 
(() => {
	// plugin parameters
	const flexUIParams = PluginManager.parameters('FlexibleUIWindows');
	parseFlexUIParams();
	
	const retroPixelSize = PluginManager.parameters('RetroPixels') ? parseInt(PluginManager.parameters('RetroPixels').retroPixelSize) : 1;
	
	// helper functions
	function parseWindowDimension(jsonString) {
		try {
			const windowDimension = JSON.parse(jsonString);
			windowDimension.relativeTo = windowDimension.relativeTo ?? 'None';
			windowDimension.customWindowName = windowDimension.customWindowName ?? '';
			windowDimension.offset = parseInt(windowDimension.offset);
			windowDimension.offset = isNaN(windowDimension.offset) ? 0 : windowDimension.offset;
			return windowDimension;
		} catch(error) {
			const windowDimension = {};
			windowDimension.relativeTo = 'None';
			windowDimension.customWindowName = '';
			windowDimension.offset = 0;
			return windowDimension;
		}
	}
	
	function parseWindowSettings(jsonString) {
		try {
			const windowSettings = JSON.parse(jsonString);
			windowSettings.customWindowName = windowSettings.customWindowName ?? '';
			windowSettings.hidden = windowSettings.hidden === 'true';
			windowSettings.relativeX = parseWindowDimension(windowSettings.relativeX);
			windowSettings.relativeY = parseWindowDimension(windowSettings.relativeY);
			windowSettings.relativeW = parseWindowDimension(windowSettings.relativeW);
			windowSettings.relativeH = parseWindowDimension(windowSettings.relativeH);
			windowSettings.relativeSideX = windowSettings.relativeSideX ?? 'Outer Left';
			windowSettings.relativeSideY = windowSettings.relativeSideY ?? 'Outer Top';
			windowSettings.heightMeasurementType = windowSettings.heightMeasurementType ?? 'Pixels';
			return windowSettings;
		} catch(error) {
			const windowSettings = {};
			windowSettings.customWindowName = '';
			windowSettings.hidden = false;
			windowSettings.relativeX = parseWindowDimension('');
			windowSettings.relativeY = parseWindowDimension('');
			windowSettings.relativeW = parseWindowDimension('');
			windowSettings.relativeH = parseWindowDimension('');
			windowSettings.relativeSideX = 'Outer Left';
			windowSettings.relativeSideY = 'Outer Top';
			windowSettings.heightMeasurementType = 'Pixels';
			return windowSettings;
		}
	}
	
	function parseFlexUIParams() {
		flexUIParams.useRetroPixelSize = flexUIParams.useRetroPixelSize === 'true';
		for(const flexUIParamKey in flexUIParams) {
			if(flexUIParamKey === 'useRetroPixelSize' || flexUIParamKey === 'customWindows') { continue; }
			flexUIParams[flexUIParamKey] = parseWindowSettings(flexUIParams[flexUIParamKey]);
		}
		const newCustomWindows = [];
		try {
			for(const customWindow in JSON.parse(flexUIParams.customWindows)) {
				newCustomWindows.push(parseWindowSettings(customWindow));
			}
		} catch (error) {
			
		}
		flexUIParams.customWindows = newCustomWindows;
	}
	
	function getWindowRect(windowName) {
		
		return new Rectangle(wx, wy, ww, wh);
	};
	
	// Scene_MenuBase
	Scene_MenuBase.prototype.helpWindowRect = function() {
		const wx = 0;
		const wy = this.helpAreaTop();
		const ww = Graphics.boxWidth;
		const wh = this.helpAreaHeight();
		return new Rectangle(wx, wy, ww, wh);
	};
})();