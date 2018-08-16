import {_,dialog,errorDialog,initDefaults,saveDefaults,uploadContext,paste,rgb,request,networkRequest,zip,encodeData,get,post,getConfig,openUrlInBrowser,createRadioButtons,createRadioButtons2,createArtboard,hexToRgb,unique,SMPanel} from "./common";
import {getLink} from "./link";
import {commonPreviewJson} from "./commonPreviewJson";

function webPreview(context) {
	var i18 = _(context).webPreview;
	var webPreviewUrl = 'https://sketch.weapi.io';
	context.document.showMessage(i18.m5);

	function chooseFilePath() {
		var save = NSSavePanel.savePanel();
		save.setAllowsOtherFileTypes(true);
		save.setExtensionHidden(false);
		return save.URL().path() + '/' + (Math.random());
	}
	var filePath = chooseFilePath();
	var flag = commonPreviewJson(context, filePath);
	if (!flag) {
		return;
	}
	zip(['-q', '-r', '-m', '-o', '-j', filePath + '.zip', filePath]);
	var settingsWindow = dialog(context);
	settingsWindow.addButtonWithTitle(i18.m1);
	settingsWindow.addButtonWithTitle(i18.m2);

	settingsWindow.setMessageText(i18.m3);
	settingsWindow.setInformativeText(i18.m4);

	if (settingsWindow.runModal() == "1000") {
		var returnData = networkRequest(['-F', 'image=@' + filePath + '.zip', iconQueryUrl + '/users/uploadHtml']);
		var jsonData = NSString.alloc().initWithData_encoding(returnData, NSUTF8StringEncoding);
		jsonData = JSON.parse(jsonData);

		var pluginSketch = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Resources").URLByAppendingPathComponent("library").path();
		SMPanel({
			url: pluginSketch + "/panel/webPreview.html",
			width: 280,
			height: 300,
			data: {
				link: webPreviewUrl + '/' + jsonData.dir + '/index.html'
			},
			hiddenClose: false,
			floatWindow: false,
			identifier: "preview",
			callback: function (data) {
				openUrlInBrowser(data.link);
			},
			closeCallback: function () {
				post(['/users/deleteHtml', 'dirname=' + jsonData.dir]);
			}
		});
		var fm = NSFileManager.defaultManager();
		fm.removeItemAtPath_error(filePath, nil);
		fm.removeItemAtPath_error(filePath + '.zip', nil);
		var ga = new Analytics(context);
		if (ga) ga.sendEvent('webPreview', 'preview');
	}

}

export function webPreviewAction(context) {
	webPreview(context);
}