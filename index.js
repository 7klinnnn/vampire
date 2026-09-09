/* ========================================
   PhoneOS ST Extension
   Version : v2.0

   功能：
   1. 悬浮挂件
   2. 手机开关
   3. 挂件拖动
   4. 自动读取酒馆最新助手回复
   5. 提取 [phone_ui]
   6. 注入 iframe 内 PhoneOS
======================================== */

(() => {

    /* ========================================
       防止重复加载
    ======================================== */

    if (document.getElementById("phoneos-panel")) {
        return;
    }


    /* ========================================
       创建手机
    ======================================== */

    const panel =
        document.createElement("div");

    panel.id = "phoneos-panel";


    const frame =
        document.createElement("iframe");

    frame.src =
        "/scripts/extensions/third-party/vampire/index.html";

    frame.setAttribute(
        "frameborder",
        "0"
    );


    panel.appendChild(frame);


    /* ========================================
       创建悬浮挂件
    ======================================== */

    const toggle =
        document.createElement("button");

    toggle.id = "phoneos-toggle";

    toggle.type = "button";


    const img =
        document.createElement("img");

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
       点击 / 拖动
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


            toggle.setPointerCapture(
                event.pointerId
            );
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
       iframe 加载完成
    ======================================== */

    let iframeReady = false;


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
       提取最后一个 [phone_ui]
    ======================================== */

    function extractLatestPhoneUI(text){

        if (!text) {
            return null;
        }


        const matches = [
            ...text.matchAll(
                /\[phone_ui\]([\s\S]*?)\[\/phone_ui\]/gi
            )
        ];


        if (!matches.length) {
            return null;
        }


        return matches[matches.length - 1][0];
    }


    /* ========================================
       找到酒馆最新助手消息
    ======================================== */

    function readLatestAssistantMessage(){

        const messages =
            Array.from(
                document.querySelectorAll(
                    "#chat .mes, #chat_container .mes, .chat .mes"
                )
            );


        if (!messages.length) {
            return "";
        }


        /*
         * 从后往前找最新的助手消息
         *
         * 排除：
         * is_user="true"
         */

        for(
            let i = messages.length - 1;
            i >= 0;
            i--
        ){

            const message =
                messages[i];


            if (
                message.getAttribute(
                    "is_user"
                ) === "true"
            ){
                continue;
            }


            const textNode =
                message.querySelector(
                    ".mes_text"
                )
                || message.querySelector(
                    ".message_text"
                )
                || message.querySelector(
                    ".message-body"
                )
                || message;


            if (
                textNode.innerHTML
            ){

                return textNode.innerHTML;
            }


            if (
                textNode.textContent
            ){

                return textNode.textContent;
            }
        }


        return "";
    }


    /* ========================================
       注入 iframe
    ======================================== */

    function injectPhoneUI(html){

        if (!html) {
            return;
        }


        if (!iframeReady) {
            return;
        }


        try {

            const phoneOS =
                frame.contentWindow.PhoneOS;


            if (
                phoneOS &&
                typeof phoneOS.update ===
                "function"
            ){

                phoneOS.update(
                    html
                );


                console.log(
                    "[PhoneOS] UI injected"
                );


                return;
            }


            /*
             * 备用方案：
             * 直接 postMessage
             */

            frame.contentWindow.postMessage(
                {
                    type:
                        "PHONEOS_UPDATE",

                    html:
                        html
                },
                "*"
            );

        } catch (error) {

            console.warn(
                "[PhoneOS] 注入失败",
                error
            );
        }
    }


    /* ========================================
       同步聊天内容
    ======================================== */

    let lastPhoneUI = "";


    function syncPhoneFromChat(){

        if (!iframeReady) {
            return;
        }


        const message =
            readLatestAssistantMessage();


        const phoneUI =
            extractLatestPhoneUI(
                message
            );


        if (!phoneUI) {
            return;
        }


        if (
            phoneUI === lastPhoneUI
        ){
            return;
        }


        lastPhoneUI =
            phoneUI;


        injectPhoneUI(
            phoneUI
        );
    }


    /* ========================================
       监听酒馆聊天变化
    ======================================== */

    function startChatObserver(){

        const chat =
            document.querySelector("#chat")
            || document.querySelector(
                "#chat_container"
            )
            || document.querySelector(
                ".chat"
            );


        if (!chat) {

            console.warn(
                "[PhoneOS] 找不到酒馆聊天容器"
            );

            return;
        }


        const observer =
            new MutationObserver(
                () => {

                    requestAnimationFrame(
                        syncPhoneFromChat
                    );
                }
            );


        observer.observe(
            chat,
            {
                childList:true,
                subtree:true,
                characterData:true
            }
        );


        syncPhoneFromChat();


        console.log(
            "[PhoneOS] Chat Observer Ready"
        );
    }


    /* ========================================
       启动
    ======================================== */

    if (
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            startChatObserver
        );

    }else{

        startChatObserver();
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