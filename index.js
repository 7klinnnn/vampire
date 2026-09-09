/* ========================================
   PhoneOS ST Extension
   Version : v3.5
   Module  : Mobile Chat Sync + Floating Toggle
======================================== */

(() => {

    if (document.getElementById("phoneos-panel")) {
        return;
    }

    /* ========================================
       创建手机面板
    ======================================== */

    const panel = document.createElement("div");
    panel.id = "phoneos-panel";

    const frame = document.createElement("iframe");

    frame.src =
        "/scripts/extensions/third-party/vampire/index.html";

    frame.setAttribute("frameborder", "0");

    panel.appendChild(frame);

    /* ========================================
       创建悬浮挂件
    ======================================== */

    const toggle = document.createElement("button");

    toggle.id = "phoneos-toggle";
    toggle.type = "button";

    const img = document.createElement("img");

    img.src =
        "/scripts/extensions/third-party/vampire/assets/icons/phone-toggle.png";

    img.alt = "PhoneOS";

    toggle.appendChild(img);

    /* ========================================
       加入酒馆
    ======================================== */

    document.body.appendChild(panel);
    document.body.appendChild(toggle);

    /* ========================================
       手机默认关闭
    ======================================== */

    let opened = false;

    panel.classList.add("hidden");

    /* ========================================
       挂件拖动
    ======================================== */

    let pointerDown = false;
    let dragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;

    toggle.addEventListener(
        "pointerdown",
        event => {

            pointerDown = true;
            dragging = false;

            startX = event.clientX;
            startY = event.clientY;

            const rect =
                toggle.getBoundingClientRect();

            startLeft = rect.left;
            startTop = rect.top;

            try {
                toggle.setPointerCapture(
                    event.pointerId
                );
            } catch (error) {
                console.warn(
                    "[PhoneOS] PointerCapture unavailable",
                    error
                );
            }
        }
    );

    toggle.addEventListener(
        "pointermove",
        event => {

            if (!pointerDown) {
                return;
            }

            const deltaX =
                event.clientX - startX;

            const deltaY =
                event.clientY - startY;

            if (
                !dragging &&
                Math.abs(deltaX) < 5 &&
                Math.abs(deltaY) < 5
            ) {
                return;
            }

            dragging = true;

            let newLeft =
                startLeft + deltaX;

            let newTop =
                startTop + deltaY;

            const maxLeft =
                window.innerWidth -
                toggle.offsetWidth;

            const maxTop =
                window.innerHeight -
                toggle.offsetHeight;

            newLeft =
                Math.max(
                    0,
                    Math.min(
                        newLeft,
                        maxLeft
                    )
                );

            newTop =
                Math.max(
                    0,
                    Math.min(
                        newTop,
                        maxTop
                    )
                );

            toggle.style.left =
                `${newLeft}px`;

            toggle.style.top =
                `${newTop}px`;

            toggle.style.right =
                "auto";

            localStorage.setItem(
                "phoneos_toggle_left",
                toggle.style.left
            );

            localStorage.setItem(
                "phoneos_toggle_top",
                toggle.style.top
            );
        }
    );

    toggle.addEventListener(
        "pointerup",
        () => {

            pointerDown = false;

        }
    );

    toggle.addEventListener(
        "pointercancel",
        () => {

            pointerDown = false;

        }
    );

    /* ========================================
       点击挂件
    ======================================== */

    toggle.addEventListener(
        "click",
        () => {

            if (dragging) {

                dragging = false;
                return;
            }

            opened = !opened;

            panel.classList.toggle(
                "hidden",
                !opened
            );
        }
    );

    /* ========================================
       恢复挂件位置
    ======================================== */

    const savedLeft =
        localStorage.getItem(
            "phoneos_toggle_left"
        );

    const savedTop =
        localStorage.getItem(
            "phoneos_toggle_top"
        );

    if (savedLeft && savedTop) {

        toggle.style.left =
            savedLeft;

        toggle.style.top =
            savedTop;

        toggle.style.right =
            "auto";
    }

    /* ========================================
       iframe 状态
    ======================================== */

    let iframeReady = false;
    let lastPhoneUI = "";

    frame.addEventListener(
        "load",
        () => {

            iframeReady = true;

            console.log(
                "[PhoneOS] iframe ready"
            );

            syncPhoneFromChat();
        }
    );

    /* ========================================
       提取完整 [phone_ui]
    ======================================== */

    function extractLatestPhoneUI(text) {

        if (!text) {
            return null;
        }

        const matches = [
            ...String(text).matchAll(
                /\[phone_ui\][\s\S]*?\[\/phone_ui\]/gi
            )
        ];

        if (!matches.length) {
            return null;
        }

        return matches[
            matches.length - 1
        ][0];
    }

    /* ========================================
       判断是不是用户消息
    ======================================== */

    function isUserMessage(message) {

        if (!message) {
            return false;
        }

        const attr =
            message.getAttribute("is_user");

        if (attr === "true") {
            return true;
        }

        const dataAttr =
            message.getAttribute("data-is-user");

        if (dataAttr === "true") {
            return true;
        }

        if (
            message.classList.contains("is_user")
        ) {
            return true;
        }

        return false;
    }

    /* ========================================
       读取消息正文
    ======================================== */

    function getMessageHTML(message) {

        if (!message) {
            return "";
        }

        const selectors = [
            ".mes_text",
            ".message_text",
            ".message-body",
            ".mes_block"
        ];

        for (
            const selector of selectors
        ) {

            const node =
                message.querySelector(
                    selector
                );

            if (!node) {
                continue;
            }

            if (node.innerHTML) {
                return node.innerHTML;
            }

            if (node.textContent) {
                return node.textContent;
            }
        }

        return (
            message.innerHTML ||
            message.textContent ||
            ""
        );
    }

    /* ========================================
       找最新助手消息
    ======================================== */

    function readLatestAssistantMessage() {

        const messages =
            Array.from(
                document.querySelectorAll(
                    ".mes"
                )
            );

        if (!messages.length) {
            return "";
        }

        for (
            let i = messages.length - 1;
            i >= 0;
            i--
        ) {

            const message =
                messages[i];

            if (isUserMessage(message)) {
                continue;
            }

            const html =
                getMessageHTML(message);

            if (!html) {
                continue;
            }

            if (
                html.includes("[phone_ui]")
            ) {
                return html;
            }

        }

        return "";
    }

    /* ========================================
       注入 PhoneOS
    ======================================== */

    function injectPhoneUI(payload) {

        if (!iframeReady) {
            return false;
        }

        if (!payload) {
            return false;
        }

        try {

            const phoneOS =
                frame.contentWindow &&
                frame.contentWindow.PhoneOS;

            if (
                phoneOS &&
                typeof phoneOS.update ===
                    "function"
            ) {

                const result =
                    phoneOS.update(payload);

                console.log(
                    "[PhoneOS] PhoneOS.update()",
                    result
                );

                return result !== false;
            }

        } catch (error) {

            console.warn(
                "[PhoneOS] 注入失败",
                error
            );
        }

        /* ========================================
           备用 postMessage
        ======================================== */

        try {

            frame.contentWindow.postMessage(
                {
                    type:
                        "PHONEOS_UPDATE",
                    html:
                        payload
                },
                "*"
            );

            console.log(
                "[PhoneOS] postMessage sent"
            );

            return true;

        } catch (error) {

            console.warn(
                "[PhoneOS] postMessage 失败",
                error
            );

            return false;
        }
    }

    /* ========================================
       同步聊天
    ======================================== */

    function syncPhoneFromChat() {

        if (!iframeReady) {
            return;
        }

        const message =
            readLatestAssistantMessage();

        if (!message) {
            return;
        }

        const phoneUI =
            extractLatestPhoneUI(
                message
            );

        if (!phoneUI) {
            return;
        }

        if (
            phoneUI === lastPhoneUI
        ) {
            return;
        }

        const success =
            injectPhoneUI(
                phoneUI
            );

        if (success) {

            lastPhoneUI =
                phoneUI;

            console.log(
                "[PhoneOS] UI injected successfully"
            );
        }
    }

    /* ========================================
       找聊天容器
       手机端加载晚时反复寻找
    ======================================== */

    let chatObserver = null;
    let bodyObserver = null;
    let finderTimer = null;

    function findChatContainer() {

        return (
            document.querySelector("#chat") ||
            document.querySelector("#chat_container") ||
            document.querySelector(".chat")
        );
    }

    /* ========================================
       开始监听聊天
    ======================================== */

    function attachChatObserver() {

        if (chatObserver) {
            return true;
        }

        const chat =
            findChatContainer();

        if (!chat) {
            return false;
        }

        chatObserver =
            new MutationObserver(
                () => {

                    requestAnimationFrame(
                        syncPhoneFromChat
                    );
                }
            );

        chatObserver.observe(
            chat,
            {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            }
        );

        console.log(
            "[PhoneOS] Chat Observer Ready"
        );

        syncPhoneFromChat();

        return true;
    }

    /* ========================================
       监听整个页面，等待手机端聊天出现
    ======================================== */

    function startPageObserver() {

        if (bodyObserver) {
            return;
        }

        bodyObserver =
            new MutationObserver(
                () => {

                    if (
                        attachChatObserver()
                    ) {

                        if (bodyObserver) {
                            bodyObserver.disconnect();
                            bodyObserver = null;
                        }

                        if (finderTimer) {
                            clearInterval(
                                finderTimer
                            );

                            finderTimer = null;
                        }
                    }

                    requestAnimationFrame(
                        syncPhoneFromChat
                    );
                }
            );

        bodyObserver.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    /* ========================================
       启动聊天监听
    ======================================== */

    function startChatSync() {

        if (
            attachChatObserver()
        ) {
            return;
        }

        console.log(
            "[PhoneOS] 等待酒馆聊天容器..."
        );

        startPageObserver();

        if (!finderTimer) {

            finderTimer =
                setInterval(
                    () => {

                        if (
                            attachChatObserver()
                        ) {

                            clearInterval(
                                finderTimer
                            );

                            finderTimer = null;

                            if (bodyObserver) {
                                bodyObserver.disconnect();
                                bodyObserver = null;
                            }
                        }

                    },
                    1000
                );
        }
    }

    /* ========================================
       启动
    ======================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startChatSync,
            {
                once: true
            }
        );

    } else {

        startChatSync();

    }

    /* ========================================
       图片禁止拖动
    ======================================== */

    img.addEventListener(
        "dragstart",
        event => {

            event.preventDefault();

        }
    );

})();