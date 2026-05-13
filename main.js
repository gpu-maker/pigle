const { app, BrowserWindow, ipcMain, session } = require('electron');
const fs = require('fs');
const path = require('path');

let win;
const BOOKMARKS_PATH = path.join(__dirname, "bookmarks.json");

// Load or create bookmarks
function loadBookmarks() {
    if (!fs.existsSync(BOOKMARKS_PATH)) {
        fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(BOOKMARKS_PATH));
}

function saveBookmarks(data) {
    fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify(data, null, 2));
}

function createWindow() {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: __dirname + "/preload.js",
            webviewTag: true,
            contextIsolation: true
        }
    });

    win.loadFile("index.html");

    // 🧱 Simple Ad Blocker
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const blocked = ["doubleclick.net", "ads.google.com", "adservice"];
        if (blocked.some(b => details.url.includes(b))) {
            callback({ cancel: true });
        } else {
            callback({});
        }
    });

    // 📥 Download manager
    session.defaultSession.on("will-download", (event, item) => {
        const filePath = path.join(app.getPath("downloads"), item.getFilename());
        item.setSavePath(filePath);

        item.on("updated", () => {
            win.webContents.send("download-progress", item.getReceivedBytes());
        });

        item.once("done", () => {
            win.webContents.send("download-complete", filePath);
        });
    });
}

app.whenReady().then(createWindow);

// IPC
ipcMain.on("new-tab", (e, url) => {
    win.webContents.send("create-tab", url || "https://duckduckgo.com");
});

ipcMain.on("get-bookmarks", (e) => {
    e.returnValue = loadBookmarks();
});

ipcMain.on("save-bookmark", (e, bm) => {
    let data = loadBookmarks();
    data.push(bm);
    saveBookmarks(data);
});
