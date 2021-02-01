const {app, BrowserWindow, Notification} = require('electron')
const path = require('path')

const Axios = require('axios')
const re = require('rage-edit')
const DiscordRPC = require('discord-rpc')

var mainWindow

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    mainWindow.setMenu(null);
    mainWindow.gameLocation = "";
    mainWindow.towerSelected = "Somewhere...";
    mainWindow.gameLocationUpdated = function(func) {
        toFire.push(func);
	}
	
	const notif = new Notification({
		title: "JToH Presence",
		body: "JToH Presence is now online! Status will update every 15 seconds."
	})

	notif.show();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  	createWindow()
  
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

const toFire = [];

const clientId = '805541446974963715';
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
let startTimestamp = new Date();

let robloxUser;
let lastGame;

function updateGameLoc(newLocation) {
    mainWindow.gameLocation = newLocation;
    toFire.forEach(func => {
        func(newLocation);
    })
}

async function getRoverUser() {
    const res = await Axios.get('https://verify.eryn.io/api/user/' + rpc.user.id);
    return res.data;
}

async function getPresence() {
    try {
        const bloxauth = require('./bloxauth');
        const res = await bloxauth.post({ url: 'https://presence.roblox.com/v1/presence/users', data: { userIds: [robloxUser.robloxId] } });
        return {
            request: {
                status: 'ok',
                userId: robloxUser.robloxId
            },
            presence: res.data
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

async function getGame(id) {
    try {
        const bloxauth = require('./bloxauth');
        const res = await bloxauth.get({url: `https://api.roblox.com/marketplace/productinfo`, data: { assetId: id }});
        return {
            request: {
                status: 'ok',
                placeId: id
            },
            gameData: res.data
        }
    } catch (e) {
        return false;
    }
}

async function setActivity() {
    if (!robloxUser) {
        const roverResult = await getRoverUser();
        if (roverResult.status === 'ok') {
            robloxUser = roverResult;
        } else {
            console.log("No user!");
            return;
        }
    }

    if (!rpc || !mainWindow) {
        return;
    }

    const presence = await getPresence();
    if (presence === false || presence.request.status === 'error') {
        console.log("No Presence!")
        return;
    }

    const presenceInfo = presence.presence.userPresences[0];

    let state = mainWindow.towerSelected;
    let gameName = "Ring select";
  
    if (presenceInfo.rootPlaceId != 2919924313)
    {
        details = "Not playing JToH.";
        state = "Not playing JToH.";
    } else if (presenceInfo.rootPlaceId === 2919924313 && lastGame != 2919924313)
    {
        startTimestamp = new Date();
    }

    if (presenceInfo.rootPlaceId === 2919924313) {
        if (presenceInfo.PlaceId === 2919924313) {
            gameName = 'Ring Select'
        } else {
            const gameData = await getGame(presenceInfo.placeId);
            if (gameData === false || gameData.request.status === 'error')
            {
                console.log("No Game Data!");
                return;
            } 
            updateGameLoc(gameData.gameData.Name)
            gameName = gameData.gameData.Name;
        }
    }

    rpc.setActivity({
        details: gameName,
        state: state,
        startTimestamp,
        largeImageKey: 'jtoh',
        largeImageText: gameName,
        smallImageKey: 'jtoh',
        smallImageText: 'Juke\'s Towers of Hell',
        instance: false,
    });

    lastGame = presenceInfo.rootPlaceId;
}

rpc.on('ready', () => {
    setActivity();
  
    setInterval(() => {
        setActivity();
    }, 15e3);
});

rpc.login({ clientId }).catch(console.error);