let tabs = [];
let currentTab = null;

const tabsDiv = document.getElementById("tabs");
const viewsDiv = document.getElementById("views");
const bookmarksDiv = document.getElementById("bookmarks");

function createTab(url, incognito=false) {
    let id = Date.now();

    let tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = incognito ? "🕵️ Incognito" : "New Tab";

    let view = document.createElement("webview");
    view.src = url;
    view.partition = incognito ? "persist:incognito" : "persist:main";
    view.style.display = "none";

    view.addEventListener("did-finish-load", () => {
        tab.innerText = view.getTitle().substring(0, 15);
        document.getElementById("url").value = view.getURL();
    });

    tab.onclick = () => switchTab(id);

    tab.oncontextmenu = () => closeTab(id);

    tabs.push({ id, tab, view });

    tabsDiv.appendChild(tab);
    viewsDiv.appendChild(view);

    switchTab(id);
}

function switchTab(id) {
    tabs.forEach(t => {
        t.view.style.display = "none";
        t.tab.classList.remove("active");
    });

    let t = tabs.find(t => t.id === id);
    if (!t) return;

    t.view.style.display = "block";
    t.tab.classList.add("active");
    currentTab = t;
}

function closeTab(id) {
    let index = tabs.findIndex(t => t.id === id);
    if (index === -1) return;

    tabs[index].tab.remove();
    tabs[index].view.remove();
    tabs.splice(index, 1);

    if (tabs.length) switchTab(tabs[0].id);
}

function go(e) {
    if (e.key === "Enter") {
        let url = urlInput.value;

        if (!url.startsWith("http")) {
            url = "https://duckduckgo.com/?q=" + encodeURIComponent(url);
        }

        currentTab.view.loadURL(url);
    }
}

function back(){ currentTab.view.goBack(); }
function forward(){ currentTab.view.goForward(); }
function reload(){ currentTab.view.reload(); }

function newTab(){ createTab("https://duckduckgo.com"); }

function bookmark() {
    let bm = {
        title: currentTab.view.getTitle(),
        url: currentTab.view.getURL()
    };
    window.api.saveBookmark(bm);
    loadBookmarks();
}

function loadBookmarks() {
    bookmarksDiv.innerHTML = "";
    let data = window.api.getBookmarks();

    data.forEach(b => {
        let btn = document.createElement("button");
        btn.innerText = b.title;
        btn.onclick = () => createTab(b.url);
        bookmarksDiv.appendChild(btn);
    });
}

// Shortcuts
document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "t") newTab();
    if (e.ctrlKey && e.key === "w") closeTab(currentTab.id);
    if (e.ctrlKey && e.key === "l") document.getElementById("url").focus();
});

// Init
const urlInput = document.getElementById("url");
window.api.onNewTab(url => createTab(url));

createTab("https://duckduckgo.com");
loadBookmarks();
