var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/previewToolbar.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/previewToolbar.js":
/*!*******************************!*\
  !*** ./src/previewToolbar.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

// @import 'common.js';
// @import 'commonPreview.js';
// @import 'localPreview.js';
// @import 'webPreview.js';
// @import 'showPreview.js';
function previewToolbar(context) {
  var i18 = _(context).toolbar;

  var pluginSketch = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Sketch").URLByAppendingPathComponent("library");
  var identifier = "com.sketchplugins.wechat.previewtoolbar",
      threadDictionary = NSThread.mainThread().threadDictionary(),
      Toolbar2 = threadDictionary[identifier];
  var i18nKey = "com.sketchplugins.wechat.i18n";
  var lang = NSUserDefaults.standardUserDefaults().objectForKey(i18nKey);
  var prefix = '-' + lang.toString();

  function getImage(size, name) {
    var isRetinaDisplay = NSScreen.mainScreen().backingScaleFactor() > 1 ? true : false;
    var suffix = isRetinaDisplay ? '@2x' : '';
    var imageURL = pluginSketch.URLByAppendingPathComponent("toolbar2").URLByAppendingPathComponent(name + suffix + '.png');
    var image = NSImage.alloc().initWithContentsOfURL(imageURL);
    return image;
  }

  function addImage(rect, name) {
    var view = NSImageView.alloc().initWithFrame(rect),
        image = getImage(rect.size, name);
    view.setImage(image);
    return view;
  }

  function addButton(rect, name, callAction) {
    var button = NSButton.alloc().initWithFrame(rect),
        image = getImage(rect.size, name);
    button.setImage(image);
    button.setBordered(false);
    button.sizeToFit();
    button.setButtonType(NSMomentaryChangeButton);
    button.setCOSJSTargetFunction(callAction);
    button.setAction("callAction:");
    return button;
  }

  if (!Toolbar2) {
    coscript.setShouldKeepAround(true);
    Toolbar2 = NSPanel.alloc().init();
    Toolbar2.setStyleMask(NSTitledWindowMask + NSFullSizeContentViewWindowMask);
    Toolbar2.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(0.92, 0.92, 0.92, 1));
    Toolbar2.setTitleVisibility(NSWindowTitleHidden);
    Toolbar2.setTitlebarAppearsTransparent(true);
    var locationx = NSScreen.mainScreen().frame().size.width;
    var locationy = NSScreen.mainScreen().frame().size.height;
    var xlocation = 20;
    Toolbar2.setFrame_display(NSMakeRect(locationx, locationy, 320, 210), false);
    Toolbar2.setMovableByWindowBackground(true);
    Toolbar2.becomeKeyWindow();
    Toolbar2.setLevel(NSFloatingWindowLevel);
    var contentView = Toolbar2.contentView();
    var linkButton0 = addButton(NSMakeRect(20, 161, 161, 11), "title-1" + prefix, function (sender) {});
    contentView.addSubview(linkButton0);
    linkButton0 = addButton(NSMakeRect(20, 73, 82, 11), "title-2" + prefix, function (sender) {});
    contentView.addSubview(linkButton0);
    linkButton0 = addButton(NSMakeRect(97, 0, 320, 2), "line", function (sender) {});
    contentView.addSubview(linkButton0);
    linkButton0 = addButton(NSMakeRect(50, 182, 14, 14), "wiki", function (sender) {
      openUrlInBrowser('https://github.com/weixin/WeSketch/wiki/%E2%92%92-PREVIEW');
    });
    contentView.addSubview(linkButton0);
    linkButton0 = addButton(NSMakeRect(20, 180, 18, 18), "close", function (sender) {
      threadDictionary.removeObjectForKey(identifier);
      Toolbar2.close();
    });
    contentView.addSubview(linkButton0);
    var linkButton = addButton(NSMakeRect(xlocation, 107, 45, 45), "start" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      setIndex(nowcontext);
    });
    contentView.addSubview(linkButton);
    xlocation = xlocation + 60;
    var linkButton2 = addButton(NSMakeRect(xlocation, 107, 45, 45), "popup" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      setDialog(nowcontext);
    });
    contentView.addSubview(linkButton2);
    xlocation = xlocation + 60;
    var linkButton3 = addButton(NSMakeRect(xlocation, 107, 45, 45), "linkback" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      setBacks(nowcontext);
    });
    contentView.addSubview(linkButton3);
    xlocation = xlocation + 60;
    var linkButton4 = addButton(NSMakeRect(xlocation, 107, 45, 45), "fixed" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      setFixed(nowcontext);
    });
    contentView.addSubview(linkButton4);
    xlocation = xlocation + 60;
    var linkButton10 = addButton(NSMakeRect(xlocation, 107, 56, 45), "transparent" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      setNoBuild(nowcontext);
    });
    contentView.addSubview(linkButton10);
    xlocation = 20;
    var linkButton11 = addButton(NSMakeRect(xlocation, 19, 45, 45), "preview" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      showPreview(nowcontext);
    });
    contentView.addSubview(linkButton11);
    xlocation = xlocation + 60;
    var linkButton8 = addButton(NSMakeRect(xlocation, 19, 45, 45), "local" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      localPreview(nowcontext);
    });
    contentView.addSubview(linkButton8);
    xlocation = xlocation + 60;
    var linkButton9 = addButton(NSMakeRect(xlocation, 19, 45, 45), "online" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      webPreview(nowcontext);
    });
    contentView.addSubview(linkButton9);
    xlocation = xlocation + 60;
    var linkButton6 = addButton(NSMakeRect(xlocation, 19, 45, 45), "hide" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      hidePreview(nowcontext);
    });
    contentView.addSubview(linkButton6);
    xlocation = xlocation + 60;
    var linkButton5 = addButton(NSMakeRect(xlocation, 19, 45, 45), "delete" + prefix, function (sender) {
      var nowcontext = uploadContext(context);
      clearPreview(nowcontext);
    });
    contentView.addSubview(linkButton5);
    threadDictionary[identifier] = Toolbar2;
    Toolbar2.makeKeyAndOrderFront(nil);
    var ga = new Analytics(context);
    if (ga) ga.sendEvent('previewToolbar', 'open');
  } else {
    // coscript.setShouldKeepAround(false);
    threadDictionary.removeObjectForKey(identifier);
    Toolbar2.close();
  }
}

var onRunPreviewToolBar = function onRunPreviewToolBar(context) {
  previewToolbar(context);
};

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRunPreviewToolBar'] = __skpm_run.bind(this, 'onRunPreviewToolBar');
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=previewToolbar.js.map