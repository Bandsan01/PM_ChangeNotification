/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comapp/zui_changenot/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
