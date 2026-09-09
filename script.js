// ========================================
// PhoneOS ST
// Version : v3.0
// Module  : Runtime + Navigation + Apps
// ========================================


// ========================================
// P-03 Dynamic Island
// ========================================

function showIsland(text = "收到新消息") {

    const island = document.querySelector(".dynamic-island");
    const islandText = document.querySelector(".island-text");

    if (!island || !islandText) return;

    islandText.textContent = text;

    island.classList.add("expand");

    setTimeout(() => {

        islandText.textContent = "●";
        island.classList.remove("expand");

    }, 2000);

}


// ========================================
// P-05 Avatar Manager
// ========================================

const avatar = document.getElementById("avatar");
const avatarInput = document.getElementById("avatarInput");

if (avatar && avatarInput) {

    avatar.addEventListener("click", () => {
        avatarInput.click();
    });

    avatarInput.addEventListener("change", (event) => {

        const file = event.target.files?.[0];

        if (!file) return;

        const url = URL.createObjectURL(file);

        document.querySelectorAll(".avatar").forEach(item => {
            item.style.backgroundImage = `url("${url}")`;
        });

        document.querySelectorAll(".cover-avatar").forEach(item => {
            item.style.backgroundImage = `url("${url}")`;
        });

        document.querySelectorAll(".moment-avatar").forEach(item => {
            item.style.backgroundImage = `url("${url}")`;
        });

    });

}


// ========================================
// SYS-01 Navigation
// ========================================

const homeView = document.getElementById("home-view");

let currentViewId = "home-view";

function showView(viewId) {

    if (!viewId) return;

    const target = document.getElementById(viewId);

    if (!target) {
        console.warn(`[PhoneOS] 页面不存在: ${viewId}`);
        return;
    }

    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });

    target.classList.add("active");

    currentViewId = viewId;

}


function goHome() {

    if (!homeView) return;

    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });

    homeView.classList.add("active");

    currentViewId = "home-view";

}


// ========================================
// SYS-02 App Navigation
// ========================================

const appMap = {

    "open-weibo": "weibo-view",
    "open-xhs": "xhs-view",
    "open-taobao": "taobao-view",
    "open-zhihu": "zhihu-view",
    "open-theater": "theater-view",

    // 这两个页面现在可以没有，
    // 等 index.html 建好后会自动接通
    "open-moments": "moments-view",
    "open-forum": "forum-view"

};


Object.entries(appMap).forEach(([buttonId, viewId]) => {

    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("click", () => {

        showView(viewId);

        // 每次打开独立 App，
        // 默认回到自己的首页状态
        resetAppState(viewId);

    });

});


// 设置

const openSettings = document.getElementById("open-settings");
const settingsView = document.getElementById("settings-view");

if (openSettings && settingsView) {

    openSettings.addEventListener("click", () => {
        showView("settings-view");
    });

}


// ========================================
// SYS-03 通用返回按钮
// ========================================

document.querySelectorAll('[data-back="home"]').forEach(button => {

    button.addEventListener("click", () => {
        goHome();
    });

});


// ========================================
// W-01 WeChat Navigation
// 桌面 → 微信列表 → 聊天
// ========================================

const wechatView = document.getElementById("wechat-view");

const openWechat = document.getElementById("open-wechat");

const chatListView = document.getElementById("chat-list-view");
const chatRoomView = document.getElementById("chat-room-view");

const navBack = document.getElementById("nav-back");
const wechatTitle = document.getElementById("wechat-title");

let wechatPage = "list";


if (openWechat) {

    openWechat.addEventListener("click", () => {

        showView("wechat-view");

        wechatPage = "list";

        if (chatListView) {
            chatListView.style.display = "block";
        }

        if (chatRoomView) {
            chatRoomView.style.display = "none";
        }

        if (wechatTitle) {
            wechatTitle.textContent = "WeChat";
        }

        if (navBack) {
            navBack.style.display = "block";
        }

    });

}


if (navBack) {

    navBack.addEventListener("click", () => {

        if (wechatPage === "chat") {

            // 聊天 → 微信列表

            wechatPage = "list";

            if (chatRoomView) {
                chatRoomView.style.display = "none";
            }

            if (chatListView) {
                chatListView.style.display = "block";
            }

            if (wechatTitle) {
                wechatTitle.textContent = "WeChat";
            }

        } else {

            // 微信列表 → 桌面

            goHome();

            navBack.style.display = "none";

        }

    });

}


// ========================================
// P-04 Settings
// ========================================

const backSettings = document.getElementById("back-settings");

if (backSettings) {

    backSettings.addEventListener("click", () => {
        goHome();
    });

}


// ========================================
// SYS-04 App State
// ========================================

function resetAppState(viewId) {

    // 这里以后负责：
    // 微博首页 / 详情
    // 小红书首页 / 详情
    // 论坛首页 / 帖子
    // 等等

    if (viewId === "moments-view") {

        const list = document.getElementById("moments-list-view");
        const detail = document.getElementById("moments-detail-view");

        if (list) list.style.display = "block";
        if (detail) detail.style.display = "none";

    }

}


// ========================================
// SYS-05 PhoneOS UI Parser
//
// 世界书输出：
//
// [phone_ui]
// ...HTML...
// [/phone_ui]
//
// PhoneOS 负责读取，不负责生成。
// ========================================

const PhoneRuntime = {

    latestHTML: "",

    parse(text) {

        if (typeof text !== "string") {
            return null;
        }

        const match = text.match(
            /\[phone_ui\]([\s\S]*?)\[\/phone_ui\]/i
        );

        if (!match) {
            return null;
        }

        this.latestHTML = match[1].trim();

        return this.latestHTML;

    },

    toDOM(html) {

        if (!html) return null;

        const parser = new DOMParser();

        const doc = parser.parseFromString(
            `<div id="phone-runtime-root">${html}</div>`,
            "text/html"
        );

        return doc.getElementById("phone-runtime-root");

    }

};


// ========================================
// SYS-06 Helpers
// ========================================

function replaceHTML(target, sourceNode) {

    if (!target || !sourceNode) return;

    target.innerHTML = sourceNode.innerHTML;

}


function renderHTMLList(target, nodes) {

    if (!target) return;

    target.innerHTML = "";

    nodes.forEach(node => {

        target.appendChild(
            node.cloneNode(true)
        );

    });

}


function findFirst(root, selector) {

    if (!root) return null;

    return root.querySelector(selector);

}


function findAll(root, selector) {

    if (!root) return [];

    return Array.from(
        root.querySelectorAll(selector)
    );

}


// ========================================
// W-04 WeChat Native Renderer
// ========================================

function renderWeChat(source) {

    const target = document.getElementById("messages");

    if (!target || !source) return;

    const contact =
        source.querySelector(".wechat-contact");

    const rows =
        [...source.querySelectorAll(".message-row")];

    let html = "";

    if (contact) {

        html += `
        <div class="wechat-contact">
            ${contact.innerHTML}
        </div>`;

    }

    rows.forEach(row => {

        const side =
            row.classList.contains("right")
            ? "right"
            : "left";

        const bubble =
            row.querySelector(".message-bubble");

        if (!bubble) return;

        html += `
        <div class="message-row ${side}">
            <div class="message-bubble">
                ${bubble.innerHTML}
            </div>
        </div>`;

    });

    target.innerHTML = html;

    target.scrollTop = target.scrollHeight;

}
// ========================================
// W-06 WeChat Multi Chat List
// ========================================

function renderChatList(source){

    const chatList = document.getElementById("chat-list");
    const messages = document.getElementById("messages");

    if(!chatList || !messages || !source) return;

    // ===== 兼容未来多联系人 =====
    let threads = [...source.querySelectorAll(".wechat-thread")];

    // 如果世界书还是旧格式（只有一个联系人）
    if(threads.length === 0){

        const contactText =
            source.querySelector(".wechat-contact")?.textContent || "";

        const contact =
            contactText.split("|").pop().replace("联系人：","").trim() || "未知联系人";

        const time =
            contactText.match(/时间：(.+?)\s*\|/)?.[1] || "";

        const rows = [...source.querySelectorAll(".message-row")];

        threads = [{
            contact,
            time,
            rows
        }];

    }else{

        threads = threads.map(thread=>{

            const contactText =
                thread.querySelector(".wechat-contact")?.textContent || "";

            return{
                contact:
                    contactText.split("|").pop().replace("联系人：","").trim() || "未知联系人",

                time:
                    contactText.match(/时间：(.+?)\s*\|/)?.[1] || "",

                rows:
                    [...thread.querySelectorAll(".message-row")]
            };

        });

    }

    // 最新聊天排前面
    threads.reverse();

    chatList.innerHTML="";

    threads.forEach((thread,index)=>{

        const preview =
            thread.rows.length
                ? thread.rows[thread.rows.length-1]
                    .querySelector(".message-bubble")
                    ?.textContent || ""
                : "暂无消息";

        const unread =
            Math.min(thread.rows.length,99);

        const item=document.createElement("div");

        item.className="chat-item";

        item.innerHTML=`
            <div class="avatar">${thread.contact[0] || "?"}</div>

            <div class="chat-info">

                <div class="name">${thread.contact}</div>

                <div class="preview">${preview}</div>

            </div>

            <div class="chat-right">

                <div class="time-small">${thread.time}</div>

                ${
                    unread>1
                    ? `<div class="unread-badge">${unread}</div>`
                    : ""
                }

            </div>
        `;

        item.addEventListener("click",()=>{

            wechatPage="chat";

            chatListView.style.display="none";
            chatRoomView.style.display="block";

            wechatTitle.textContent=thread.contact;

            let html=`<div class="wechat-contact">联系人：${thread.contact}</div>`;

            thread.rows.forEach(row=>{

                const side=row.classList.contains("right")?"right":"left";

                html+=`
                    <div class="message-row ${side}">
                        <div class="message-bubble">
                            ${row.querySelector(".message-bubble")?.innerHTML || ""}
                        </div>
                    </div>`;
            });

            messages.innerHTML=html;
            messages.scrollTop=messages.scrollHeight;

        });

        chatList.appendChild(item);

    });

}

// ========================================
// M-01 Moments Renderer
// ========================================

function renderMoments(source) {

    const target = document.getElementById("moments-feed");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// ZH-01 Zhihu Renderer
// ========================================

function renderZhihu(source) {

    const target = document.getElementById("zhihu-feed");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// XHS-01 Xiaohongshu Renderer
// ========================================

function renderXHS(source) {

    const target = document.getElementById("xhs-feed");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// WB-01 Weibo Renderer
// ========================================

function renderWeibo(source) {

    const target = document.getElementById("weibo-feed");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// F-01 Forum Renderer
// ========================================

function renderForum(source) {

    const target = document.getElementById("forum-feed");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// MEMO-01 Memo Renderer
// ========================================

function renderMemo(source) {

    const target = document.querySelector(".notes-widget");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// THEATER-01 Theater Renderer
// ========================================

function renderTheater(source) {

    const target = document.getElementById("theater-feed");

    if (!target || !source) return;

    target.innerHTML = source.innerHTML;

}


// ========================================
// SYS-07 Extract 8 App Modules
// Version : v3.2
// Module  : Stable Module Detection
// ========================================

/* ========================================
   PhoneRuntime 解析器（DOMParser版）
======================================== */

function extractPhoneModules(phoneText){

    const match =
        phoneText.match(/\[phone_ui\]([\s\S]*?)\[\/phone_ui\]/i);

    if(!match){
        return {};
    }

    const parser = new DOMParser();

    const doc =
        parser.parseFromString(
            match[1],
            "text/html"
        );

    const result = {};

    const map = {
        "💬 微信":"wechat",
        "⭕ 朋友圈":"moments",
        "💡 知乎 · 提问与回答":"zhihu",
        "📕 小红书 · 笔记":"xhs",
        "🔥 微博热搜":"weibo",
        "🏫 校园论坛 · 讨论贴":"forum",
        "📌 宴雎的手机备忘录":"notes"
    };

    doc.querySelectorAll(
        ".app-card,.post-card,.note-card"
    ).forEach(card=>{

        const title =
            card.querySelector(".app-title")?.textContent.trim()
            || card.querySelector("div")?.textContent.trim();

        if(map[title]){
            result[map[title]] =
                card.outerHTML;
        }

    });

    const theater =
        doc.querySelector(".notebook-card");

    if(theater){
        result.theater =
            theater.outerHTML;
    }

    return result;
}

PhoneRuntime.parse = function(phoneText){

    return extractPhoneModules(phoneText);

};


// ========================================
// SYS-08 Compatibility API
//
// 以后外部只需要：
//
// PhoneOS.update(text)
//
// 或：
//
// PhoneOS.load(text)
// ========================================

window.PhoneOS = PhoneOS;
window.PhoneRuntime = PhoneRuntime;


// ========================================
// Debug
// ========================================

console.log(
    `[PhoneOS] Runtime v${PhoneOS.version} loaded`
);

// ========================================
// M-02 Moments Navigation
// Version : v3.0.2
// ========================================

const momentsBack = document.getElementById("moments-back");

if (momentsBack) {

    momentsBack.addEventListener("click", () => {

        goHome();

    });

}
// ========================================
// P-04-01 Wallpaper Manager
// Version : v3.1
// ========================================

const wallpaperButton =
    document.getElementById("open-wallpaper");

const resetWallpaperButton =
    document.getElementById("reset-wallpaper");    
const wallpaperInput =
    document.getElementById("wallpaperInput");


// ----------------------------------------
// 应用壁纸
// ----------------------------------------

function applyWallpaper(dataUrl) {

    const screen =
        document.querySelector(".screen");

    if (!screen) return;


    if (!dataUrl) {

        screen.style.backgroundImage = "";
        screen.style.backgroundSize = "";
        screen.style.backgroundPosition = "";
        screen.style.backgroundRepeat = "";

        return;
    }


    screen.style.backgroundImage =
        `url("${dataUrl}")`;

    screen.style.backgroundSize =
        "cover";

    screen.style.backgroundPosition =
        "center";

    screen.style.backgroundRepeat =
        "no-repeat";
}


// ----------------------------------------
// 读取已经保存的壁纸
// ----------------------------------------

function loadSavedWallpaper() {

    try {

        const savedWallpaper =
            localStorage.getItem("phoneos_wallpaper");

        if (savedWallpaper) {

            applyWallpaper(savedWallpaper);

        }

    } catch (error) {

        console.warn(
            "[PhoneOS] 无法读取已保存的壁纸",
            error
        );

    }
}


// ----------------------------------------
// 打开文件选择器
// ----------------------------------------

if (wallpaperButton && wallpaperInput) {

    wallpaperButton.addEventListener("click", () => {

        wallpaperInput.click();

    });


    wallpaperInput.addEventListener("change", (event) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            return;

        }

        const reader =
            new FileReader();


        reader.onload = () => {

            const dataUrl =
                reader.result;

            applyWallpaper(dataUrl);


            try {

                localStorage.setItem(
                    "phoneos_wallpaper",
                    dataUrl
                );

            } catch (error) {

                console.warn(
                    "[PhoneOS] 壁纸保存失败",
                    error
                );

            }

        };


        reader.readAsDataURL(file);

    });

}
if(resetWallpaperButton){

    resetWallpaperButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "phoneos_wallpaper"
            );


            applyWallpaper(null);


            console.log(
                "[PhoneOS] 已恢复默认壁纸"
            );
        }
    );

}


// ----------------------------------------
// 启动时恢复壁纸
// ----------------------------------------

loadSavedWallpaper();

// ========================================
// P-07-01 PhoneOS Auto Sync
// Version : v3.3
// Module  : Auto Listener
// ========================================

let lastPhoneUI = "";


// ----------------------------------------
// 提取最后一个 phone_ui
// ----------------------------------------

function extractLatestPhoneUI(text){

    if(!text) return null;

    const matches =
        [...text.matchAll(/\[phone_ui\]([\s\S]*?)\[\/phone_ui\]/g)];

    if(matches.length === 0){
        return null;
    }

    return matches[matches.length-1][0];

}


// ----------------------------------------
// 从聊天页面读取
// ----------------------------------------

function readLatestAssistantMessage(){

    const candidates = [

        ".mes:last-child .mes_text",
        ".mes:last-child .message_text",
        ".mes:last-child .message-body",
        ".mes:last-child"

    ];

    for(const selector of candidates){

        const node =
            document.querySelector(selector);

        if(node?.innerHTML){

            return node.innerHTML;

        }

        if(node?.textContent){

            return node.textContent;

        }

    }

    return "";

}


// ----------------------------------------
// 更新 PhoneOS
// ----------------------------------------

function autoRefreshPhone(){

    const message =
        readLatestAssistantMessage();

    const phoneUI =
        extractLatestPhoneUI(message);

    if(!phoneUI) return;

    if(phoneUI === lastPhoneUI) return;


    if(PhoneOS.update(phoneUI)){
    lastPhoneUI = phoneUI;
}

}


// ----------------------------------------
// MutationObserver
// ----------------------------------------

function startPhoneObserver(){

    const chat =
        document.querySelector("#chat")
        || document.querySelector("#chat_container")
        || document.querySelector(".chat")
        || document.body;

    const observer =
        new MutationObserver(() => {

            requestAnimationFrame(autoRefreshPhone);

        });

    observer.observe(chat,{
        childList:true,
        subtree:true,
        characterData:true
    });

    autoRefreshPhone();

    console.log("[PhoneOS] Auto Sync Ready");

}


// ----------------------------------------
// 启动
// ----------------------------------------

if(document.readyState === "loading"){

    document.addEventListener(
        "DOMContentLoaded",
        startPhoneObserver
    );

}else{

    startPhoneObserver();

}