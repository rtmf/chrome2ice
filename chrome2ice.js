var pollingTimer;

function schedulePoll() {
	if (pollingTimer) {
		window.clearTimeout(requestTimer);
	}
	requestTimer=window.setTimeout(doPoll, 10000); // every 10 seconds
}

function setPlaying(text)
{
	URLs=settings.servers.map(
		server=>server.mounts.map(
			mount=>{
				return {
					auth:server.auth,
					url:serverToURL(server)+
					"admin/metadata?mode=updinfo&mount="+
					encodeURIComponent(mount)+"&song="+
					encodeURIComponent(server.ad+" | "+text)
				};
			})
	).reduce((urls,mount)=>urls.concat(mount),[]).forEach(
		mount=>{
			var xhr = new XMLHttpRequest();
			xhr.onload = e=>{
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
			xhr.open("GET",mount.url,true);
			xhr.setRequestHeader("Authorization","Basic "+window.btoa(mount.auth.user+":"+mount.auth.pass));
			xhr.send();
		}
	);
}

function doPoll()
{
	chrome.tabs.query({'audible': true}, tabsPlaying=>{
		if (tabsPlaying.length>0) {
			var pagesPlaying = tabsPlaying.reduce((tabs,tab)=>{
				return tabs.concat([tab.url,tab.title]);
			},[]);
			setPlaying(pagesPlaying.join(' | '));
		} else {
			setPlaying("Nothing currently playing! :(");
		};
		schedulePoll();
	});
}
function serverToURL(server) {
	return (server.ssl?"https":"http")+"://"+
		server.host+(server.port?":"+server.port:"")+"/";
}
function onInit() {
	console.log('onInit');
	schedulePoll();
}
onInit();
