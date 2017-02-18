var pollingTimer;

function schedulePoll() {
	if (pollingTimer) {
		window.clearTimeout(requestTimer);
	}
	requestTimer=window.setTimeout(doPoll, 10000); // every 10 seconds
}

function setPlaying(text)
{
	//URL is http://rtmf:ice4fire@rfh.tymestl.org/admin/metadata?mode=updinfo&mount=%2F320.mp3&song=
	["/320.mp3","/500.ogg"].forEach(function (mount) {
		var user="rtmf";
		var pass="ice4fire";
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			switch(this.responseType)
			{
				case "":
				case "text":
					console.log(this.responseText);
					break;
				case "document":
					console.log("We got some XML.");
					break;
				case "arraybuffer":
					console.log("We got an arraybuffer.");
					break;
				case "blob":
					console.log("We got a blob.");
					break;
				case "json":
					console.log(JSON.stringify(this.response));
					break;
			};
		};
		xhr.open("GET","http://rfh.tymestl.org/admin/metadata?mode=updinfo&mount=" + encodeURIComponent(mount) + "&song=" + encodeURIComponent(this),true,user,pass);
		xhr.send();
	}, text);
}

function doPoll()
{
	chrome.tabs.query({'audible': true}, function (tabsPlaying) {
		if (tabsPlaying.length>0) {
			var pagesPlaying = tabsPlaying.reduce(function (tabs,tab) {
				return tabs.concat([tab.url,tab.title]);
			},[]);
			setPlaying(pagesPlaying.join(' | '));
		} else {
			setPlaying("Nothing currently playing! :(");
		};
		schedulePoll();
	});
}

function onInit() {
	console.log('onInit');
	schedulePoll();
}
onInit();
