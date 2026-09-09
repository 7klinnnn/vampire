/* ========================================
   PhoneOS ST Extension
   Version : v1.1
   Module  : Floating Toggle + Drag
======================================== */

(() => {

    // 防止重复加载
    if (document.getElementById("phoneos-panel")) {
        return;
    }


    /* ========================================
       手机面板
    ======================================== */

    const panel = document.createElement("div");

    panel.id = "phoneos-panel";


    const frame = document.createElement("iframe");

    frame.src =
        "/scripts/extensions/third-party/vampire/index.html";

    frame.setAttribute("frameborder", "0");

    panel.appendChild(frame);


    /* ========================================
       悬浮挂件
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
       加入酒馆页面
    ======================================== */

    document.body.appendChild(panel);
    document.body.appendChild(toggle);


    /* ========================================
       初始状态
    ======================================== */

    let opened = false;

    panel.classList.add("hidden");


    /* ========================================
       点击 / 拖动状态
    ======================================== */

    let dragging = false;

    let pointerDown = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    /* ========================================
       开始拖动
    ======================================== */

    toggle.addEventListener("pointerdown", (event) => {

        pointerDown = true;
        dragging = false;

        startX = event.clientX;
        startY = event.clientY;


        const rect =
            toggle.getBoundingClientRect();


        startLeft = rect.left;
        startTop = rect.top;


        toggle.setPointerCapture(event.pointerId);

    });


    /* ========================================
       拖动中
    ======================================== */

    toggle.addEventListener("pointermove", (event) => {

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
            window.innerWidth - toggle.offsetWidth;

        const maxTop =
            window.innerHeight - toggle.offsetHeight;


        newLeft =
            Math.max(
                0,
                Math.min(newLeft, maxLeft)
            );


        newTop =
            Math.max(
                0,
                Math.min(newTop, maxTop)
            );


        toggle.style.left =
            `${newLeft}px`;

        toggle.style.top =
            `${newTop}px`;

        toggle.style.right =
            "auto";

        toggle.style.bottom =
            "auto";

    });


    /* ========================================
       松开
    ======================================== */

    toggle.addEventListener("pointerup", () => {

        pointerDown = false;

        if (dragging) {

            localStorage.setItem(
                "phoneos_toggle_left",
                toggle.style.left
            );

            localStorage.setItem(
                "phoneos_toggle_top",
                toggle.style.top
            );

        }

    });


    /* ========================================
       点击开关
    ======================================== */

    toggle.addEventListener("click", () => {

        // 拖动结束后，不触发点击
        if (dragging) {
            dragging = false;
            return;
        }


        opened = !opened;


        panel.classList.toggle(
            "hidden",
            !opened
        );

    });


    /* ========================================
       读取挂件位置
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

        toggle.style.left = savedLeft;
        toggle.style.top = savedTop;

        toggle.style.right = "auto";
        toggle.style.bottom = "auto";

    }


    /* ========================================
       防止浏览器拖图片
    ======================================== */

    img.addEventListener(
        "dragstart",
        event => {
            event.preventDefault();
        }
    );


})();