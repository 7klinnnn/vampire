/* ========================================
   PhoneOS ST Extension
   v1.0
======================================== */

(() => {

    // 防止重复加载
    if (document.getElementById("phoneos-panel")) return;

    // ---------- 手机 ----------

    const panel = document.createElement("div");
    panel.id = "phoneos-panel";

    const frame = document.createElement("iframe");
    frame.src = "/scripts/extensions/third-party/vampire/index.html";

    panel.appendChild(frame);

    // ---------- 挂件 ----------

    const toggle = document.createElement("button");
    toggle.id = "phoneos-toggle";

    const img = document.createElement("img");
    img.src = "/scripts/extensions/third-party/vampire/assets/icons/phone-toggle.png";
    img.alt = "PhoneOS";

    toggle.appendChild(img);

    // ---------- 加入页面 ----------

    document.body.appendChild(panel);
    document.body.appendChild(toggle);

    // ---------- 开关状态 ----------

    let opened = false;

    if (!opened){
        panel.classList.add("hidden");
    }

    toggle.addEventListener("click", () => {

        opened = !opened;

        panel.classList.toggle("hidden", !opened);

        localStorage.setItem(
            "phoneos_open",
            String(opened)
        );

    });

})();