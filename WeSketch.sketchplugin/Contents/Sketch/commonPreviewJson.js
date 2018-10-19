@import "common.js";
@import "commonPreview.js";


var commonPreviewJson = function (context, filePath, show) {
	var i18 = _(context).commonPreview;

	var BorderPositions = ["center", "inside", "outside"],
		FillTypes = ["color", "gradient"],
		GradientTypes = ["linear", "radial", "angular"],
		ShadowTypes = ["outer", "inner"],
		TextAligns = ["left", "right", "center", "justify", "left"],
		ResizingType = ["stretch", "corner", "resize", "float"];

	function pointToJSON(point) {
		return {
			x: parseFloat(point.x),
			y: parseFloat(point.y)
		};
	}

	function colorStopToJSON(colorStop) {
		return {
			color: colorToJSON(colorStop.color()),
			position: colorStop.position()
		};
	}

	function gradientToJSON(gradient) {
		var stopsData = [],
			stop, stopIter = gradient.stops().objectEnumerator();
		while (stop = stopIter.nextObject()) {
			stopsData.push(colorStopToJSON(stop));
		}

		return {
			type: GradientTypes[gradient.gradientType()],
			from: pointToJSON(gradient.from()),
			to: pointToJSON(gradient.to()),
			colorStops: stopsData
		};
	}

	function colorToJSON(color) {
		var obj = {
			r: Math.round(color.red() * 255),
			g: Math.round(color.green() * 255),
			b: Math.round(color.blue() * 255),
			a: color.alpha()
		}

		function bzone(d) {
			if (d.length == 1) {
				d = '0' + d;
			}
			return d;
		}
		if (obj.a == 1) {
			return '#' + bzone(obj.r.toString(16)) + bzone(obj.g.toString(16)) + bzone(obj.b.toString(16));
		} else {
			return 'rgba(' + obj.r + ',' + obj.g + ',' + obj.b + ',' + obj.a.toFixed(2) + ')';
		}
	}

	function getFills(style) {
		var fillsData = [],
			fill, fillIter = style.fills().objectEnumerator();
		while (fill = fillIter.nextObject()) {
			if (fill.isEnabled()) {
				var fillType = FillTypes[fill.fillType()],
					fillData = {
						fillType: fillType
					};

				switch (fillType) {
					case "color":
						fillData.color = colorToJSON(fill.color());
						break;

					case "gradient":
						fillData.gradient = gradientToJSON(fill.gradient());
						break;

					default:
						continue;
				}

				fillsData.push(fillData);
			}
		}

		return fillsData;
	}

	function exportColor(selection) {
		var layerStyle = selection.style();
		var returnText = [];
		var backgroundColor = getFills(layerStyle);

		if (backgroundColor.length > 0) {
			if (backgroundColor[0].fillType == 'color') {
				returnText.push(backgroundColor[0].color);
			} else if (backgroundColor[0].fillType == 'gradient') {
				function bzone6(z) {
					if (z.length != 6) {
						z = '0' + z;
					}
					if (z.length != 6) {
						bzone6(z);
					} else {
						return z;
					}
				}
				var param = [];
				var to = backgroundColor[0].gradient.to;
				var from = backgroundColor[0].gradient.from;
				param.push(parseInt(90 - 180 * Math.atan(Math.abs((to.y - from.y)) / Math.abs((to.x - from.x))) / Math.PI) + 'deg');
				var colorStops = backgroundColor[0].gradient.colorStops;
				for (var i = 0; i < colorStops.length; i++) {
					param.push(colorStops[i].color + ' ' + parseInt(colorStops[i].position * 100) + '%');
				}
				returnText.push('linear-gradient(' + param.join(',') + ')');
			}
			return returnText.join('');
		} else {
			return '';
		}
	}


	var exportSVGJson = {};
	var pageCount = 1;
	var fixedCount = 1;
	var dialogCount = 1;
	var kPluginDomain = "com.sketchplugins.wechat.link";

	var getConnectionsGroupInPage = function (page) {
		var connectionsLayerPredicate = NSPredicate.predicateWithFormat("userInfo != nil && function(userInfo, 'valueForKeyPath:', %@).isConnectionsContainer == true", kPluginDomain);
		return page.children().filteredArrayUsingPredicate(connectionsLayerPredicate).firstObject();
	}

	function getParentGroupIsFixed(selection,newPreviewObject){
		var parent = selection.parentGroup();
		if(parent.className() == 'MSArtboardGroup'){
			return '';
		}
		if(newPreviewObject.fixed[parent.objectID()]){
			return encodeURIComponent(parent.objectID());
		}else{
			getParentGroupIsFixed(parent,newPreviewObject);
		}
	}

	function relationship(doc,newPreviewObject) {
		var kPluginDomain = "com.sketchplugins.wechat.link";
		var linkLayersPredicate = NSPredicate.predicateWithFormat("userInfo != nil && function(userInfo, 'valueForKeyPath:', %@).destinationArtboardID != nil", kPluginDomain),
			linkLayers = doc.currentPage().children().filteredArrayUsingPredicate(linkLayersPredicate),
			loop = linkLayers.objectEnumerator(),
			connections = [],
			linkLayer, destinationArtboardID, destinationArtboard, isCondition, linkRect;

		while (linkLayer = loop.nextObject()) {
			var children = {};
			var parentArtboard = linkLayer.parentArtboard();
			children.x = parseInt(encodeURIComponent(linkLayer.absoluteRect().x())) - parseInt(encodeURIComponent(parentArtboard.absoluteRect().x()));
			children.y = parseInt(encodeURIComponent(linkLayer.absoluteRect().y())) - parseInt(encodeURIComponent(parentArtboard.absoluteRect().y()));
			children.width = encodeURIComponent(linkLayer.absoluteRect().size().width);
			children.height = encodeURIComponent(linkLayer.absoluteRect().size().height);
			children.baba = getParentGroupIsFixed(linkLayer,newPreviewObject);
			destinationArtboardID = context.command.valueForKey_onLayer_forPluginIdentifier("destinationArtboardID", linkLayer, kPluginDomain);
			var Message = destinationArtboardID.split('____');
			destinationArtboard = doc.currentPage().children().filteredArrayUsingPredicate(NSPredicate.predicateWithFormat("(objectID == %@) || (userInfo != nil && function(userInfo, 'valueForKeyPath:', %@).artboardID == %@)", Message[1], kPluginDomain, Message[1])).firstObject();

			if (destinationArtboard && Message[0] == linkLayer.objectID()) {
				children.to = encodeURIComponent(destinationArtboard.objectID());
			}
			if (exportSVGJson[linkLayer.parentArtboard().objectID()].children[linkLayer.objectID()]) {
				exportSVGJson[linkLayer.parentArtboard().objectID()].children[linkLayer.objectID()].to = children.to;
			} else {
				exportSVGJson[linkLayer.parentArtboard().objectID()].children[linkLayer.objectID()] = children;
			}

		}
	}

	function exportHTML(filePath) {
		var fx = 0;
		var fxstyle = '';
		var fxlocal = '0';

		function chooseDialog() {
			var settingsWindow = dialog(context);
			settingsWindow.addButtonWithTitle(i18.m2);
			settingsWindow.addButtonWithTitle(i18.m3);

			settingsWindow.setMessageText(i18.m19);

			var ButtonList = [i18.m20, i18.m21, i18.m22];

			fx = createRadioButtons(ButtonList, 0);
			settingsWindow.addAccessoryView(fx);
			return settingsWindow.runModal();
		}
		if (show || chooseDialog() != '1000') {
			fxstyle = 'default';
			if(show){
				fxlocal = '20';
			}
		} else {
			fx = fx.selectedCell();
			var index = [fx tag];
			if (index == 0) {
				fxstyle = 'default';
				fxlocal = '20';
			} else if (index == 1) {
				fxstyle = 'black';
				fxlocal = '20';
			} else if (index == 2) {
				fxstyle = 'black-translucent';
			}
		}
    	var i18nKey = "com.sketchplugins.wechat.i18n";
		var loadingTips = '正在加载所有素材文件<br>请稍后...';
		var desktop = 'i2';
		var lang = NSUserDefaults.standardUserDefaults().objectForKey(i18nKey);
		if (encodeURIComponent(lang).indexOf('enUS') > -1) {
			loadingTips = 'Loading all the images<br>Please wait...';
			desktop = 'i1';
		}

		var htmlPath = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Sketch").URLByAppendingPathComponent("preview.html").path();
		var previewData = NSData.dataWithContentsOfFile(htmlPath);
		previewData = [[NSString alloc] initWithData: previewData encoding: NSUTF8StringEncoding];
		previewData = previewData.replace('{{json}}', JSON.stringify(exportSVGJson)).replace('{{barstyle}}', fxstyle).replace(/{{local}}/ig, fxlocal).replace('{{loading}}',loadingTips).replace('{{desktop}}',desktop);
		writeFile({
			content: previewData,
			path: filePath,
			fileName: 'index.html'
		})
	}

	function getSliceHeader(artboard, context, name, file, scale) {
		var msSlice = [MSSliceLayer new]
		var frame = [msSlice frame];
		[frame setX: artboard.absoluteRect().x()];
		[frame setY: artboard.absoluteRect().y()];
		[frame setWidth: 1];
		var height = 20;
		if (artboard.absoluteRect().size().width == 750) {
			height = 40;
		}
		if (artboard.absoluteRect().size().width == 1242) {
			height = 60;
		}
		[frame setHeight: height];
		context.document.currentPage().addLayer(msSlice);
		var slice = MSExportRequest.exportRequestsFromExportableLayer(msSlice).firstObject();
		slice.scale = scale;
		slice.format = 'png';
		var savePath = file + '/' + name + '.png';
		context.document.saveArtboardOrSlice_toFile(slice, savePath);
		msSlice.removeFromParent();
	}

	function exportPNG(layer, context, file, scale, newPreviewObject) {
		exportSVGJson[layer.objectID()] = {};
		exportSVGJson[layer.objectID()].width = encodeURIComponent(layer.absoluteRect().size().width);
		exportSVGJson[layer.objectID()].height = encodeURIComponent(layer.absoluteRect().size().height);

		if (newPreviewObject.index[layer.objectID()] && newPreviewObject.index[layer.objectID()].main == layer.objectID()) {
			exportSVGJson[layer.objectID()].firstPage = true;
		}
		exportSVGJson[layer.objectID()].children = {};
		var saveChild = [];
		var saveChild2 = [];
		for (var i = 0; i < layer.children().length; i++) {
			var child = layer.children()[i];
			if (((newPreviewObject.back && newPreviewObject.back[child.objectID()]) || (newPreviewObject.fixed && newPreviewObject.fixed[child.objectID()])) && child.isVisible()) {
				var backObj = {};
				var parentArtboard = layer.children()[i].parentArtboard();
				backObj.x = parseInt(encodeURIComponent(layer.children()[i].absoluteRect().x())) - parseInt(encodeURIComponent(parentArtboard.absoluteRect().x()));
				backObj.y = parseInt(encodeURIComponent(layer.children()[i].absoluteRect().y())) - parseInt(encodeURIComponent(parentArtboard.absoluteRect().y()));
				backObj.width = encodeURIComponent(layer.children()[i].absoluteRect().size().width);
				backObj.height = encodeURIComponent(layer.children()[i].absoluteRect().size().height);
				backObj.baba = getParentGroupIsFixed(layer.children()[i],newPreviewObject);
				exportSVGJson[layer.objectID()].children[child.objectID()] = backObj;
				if (newPreviewObject.back && newPreviewObject.back[child.objectID()] && child.isVisible()) {
					exportSVGJson[layer.objectID()].children[child.objectID()].back = true;
				}
				if (newPreviewObject.fixed && newPreviewObject.fixed[child.objectID()] && child.isVisible()) {
					var name = 'fixed' + (fixedCount++);
					exportSVGJson[layer.objectID()].children[child.objectID()].fixed = true;
					exportSVGJson[layer.objectID()].children[child.objectID()].image = name;
					exportSVGJson[layer.objectID()].children[child.objectID()].fixedDirection = newPreviewObject.fixed[child.objectID()].direction;
					if (newPreviewObject.fixed[child.objectID()].direction == 'b') {
						exportSVGJson[layer.objectID()].children[child.objectID()].yy = exportSVGJson[layer.objectID()].height - exportSVGJson[layer.objectID()].children[child.objectID()].height - exportSVGJson[layer.objectID()].children[child.objectID()].y;
					}

					var fixedpng = MSExportRequest.exportRequestsFromExportableLayer(child).firstObject();
					fixedpng.scale = scale;
					fixedpng.format = 'png';
					var savePath = file + '/' + name + '.png';
					context.document.saveArtboardOrSlice_toFile(fixedpng, savePath);
					child.setIsVisible(false);
					saveChild.push(child);
				}
			}
		}

		var fileName;
		//把除了背景之外的元素拿出来导出图片，然后再放回去
		var group = MSLayerGroup.new();
		layer.addLayers([group]);

		var count = 0;
		var flagcount = 0;
		var layersLength = layer.layers().length;
		for (var i = 0; i < layersLength; i++) {
			if (layer.layers()[flagcount].objectID() != group.objectID() && layer.layers()[flagcount].isVisible()) {
				var p = layer.layers()[flagcount].duplicate();
				saveChild2.push(layer.layers()[flagcount]);
				layer.layers()[flagcount].setIsVisible(false);
				p.moveToLayer_beforeLayer(group, group);
				flagcount++;
			} else {
				flagcount++;
			}

			if (count + flagcount == layersLength) {
				break;
			}
		}
		group.resizeToFitChildrenWithOption(1);


		var dialogObj = {};
		var parentArtboard = group.parentArtboard();
		dialogObj.x = parseInt(encodeURIComponent(group.absoluteRect().x())) - parseInt(encodeURIComponent(parentArtboard.absoluteRect().x()));
		dialogObj.y = parseInt(encodeURIComponent(group.absoluteRect().y())) - parseInt(encodeURIComponent(parentArtboard.absoluteRect().y()));
		dialogObj.width = encodeURIComponent(group.absoluteRect().size().width);
		dialogObj.height = encodeURIComponent(group.absoluteRect().size().height);
		var name;
		if (newPreviewObject.dialog && newPreviewObject.dialog[layer.objectID()]) {
			exportSVGJson[layer.objectID()].type = 'dialog';
			name = 'dialog' + (dialogCount++);
			var dialogDirection = newPreviewObject.dialog[layer.objectID()].direction;
			dialogObj.direction = dialogDirection;
		} else {
			exportSVGJson[layer.objectID()].type = 'page';
			name = 'page' + (pageCount++);
		}
		dialogObj.name = name;
		exportSVGJson[layer.objectID()].content = dialogObj;


		var slice = MSExportRequest.exportRequestsFromExportableLayer(group).firstObject();
		slice.scale = scale;
		slice.format = 'png';
		var savePath = file + '/' + name + '.png';
		context.document.saveArtboardOrSlice_toFile(slice, savePath);

		for (var i = 0; i < saveChild.length; i++) {
			saveChild[i].setIsVisible(true);
		}
		for (var i = 0; i < saveChild2.length; i++) {
			saveChild2[i].setIsVisible(true);
		}

		group.removeFromParent();
		if (!exportSVGJson[layer.objectID()].background) {
			var background = layer.hasBackgroundColor() ? colorToJSON(layer.backgroundColor()) : '';
			exportSVGJson[layer.objectID()].background = background;
		}

		
	}

	function writeFile(options) {
		var content = NSString.stringWithString(options.content),
			savePathName = [];
		NSFileManager
			.defaultManager()
			.createDirectoryAtPath_withIntermediateDirectories_attributes_error(options.path, true, nil, nil);

		savePathName.push(
			options.path,
			"/",
			options.fileName
		);
		savePathName = savePathName.join("");
		content.writeToFile_atomically_encoding_error(savePathName, false, 4, null);
	}

	function writeDirectory(filePath) {
		NSFileManager
			.defaultManager()
			.createDirectoryAtPath_withIntermediateDirectories_attributes_error(filePath, true, nil, nil);
	}

	var newPreviewObject = buildPreview(context);

	var flag = false;
	if (newPreviewObject.index) {
		for (var i in newPreviewObject.index) {
			flag = true;
		}
	}
	if (!flag) {
		errorDialog(context,i18.m18);
		return false;
	}

	if (filePath == false) {
		return false;
	}
	writeDirectory(filePath);
	var scale = 1;
	var linkJson = {};
	hidePreview(context);

	var nowPage = context.document.currentPage();
	var artBoards = nowPage.artboards();

	var previewKey = "com.sketchplugins.wechat.preview.w";
	var linkLayersPredicate = NSPredicate.predicateWithFormat("userInfo != nil && function(userInfo, 'valueForKeyPath:', %@).noBuildMain != nil", previewKey);
	var noBuildObject = context.document.currentPage().children().filteredArrayUsingPredicate(linkLayersPredicate);

	for (var i = 0; i < noBuildObject.length; i++) {
		noBuildObject[i].setIsVisible(false);
	}

	for (var i = 0; i < artBoards.length; i++) {
		var size = artBoards[i].absoluteRect().size().width;
		if (size == 320 || size == 414 || size == 375) {
			scale = 2;
			exportSVGJson.width = parseInt(encodeURIComponent(size));
		}else if(size == 750){
			exportSVGJson.width = 375;
		}else if(size == 640){
			exportSVGJson.width = 320;
		}else{
			exportSVGJson.width = 414;
		}
		exportPNG(artBoards[i], context, filePath, scale, newPreviewObject);
	}
	relationship(context.document,newPreviewObject);
	exportHTML(filePath);
	hidePreview(context);
	for (var i = 0; i < noBuildObject.length; i++) {
		noBuildObject[i].setIsVisible(true);
	}
	var newContext = uploadContext(context);
	for (var i = 0; i < newContext.selection.length; i++) {
		newContext.selection[i].select_byExpandingSelection(false, false);
	}
	return true;
}