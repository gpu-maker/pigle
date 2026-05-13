const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
    newTab: (url) => ipcRenderer.send("new-tab", url),
    onNewTab: (cb) => ipcRenderer.on("create-tab", (e, url) => cb(url)),

    getBookmarks: () => ipcRenderer.sendSync("get-bookmarks"),
    saveBookmark: (bm) => ipcRenderer.send("save-bookmark", bm),

    onDownload: (cb) => ipcRenderer.on("download-complete", (e, path) => cb(path))
});
