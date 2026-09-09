const panel=document.createElement("div");
panel.id="phoneos-panel";

const button=document.createElement("button");
button.id="phoneos-toggle";
button.innerHTML="📱";

const frame=document.createElement("iframe");
frame.src="/scripts/extensions/third-party/vampire/index.html";

panel.appendChild(frame);

document.body.appendChild(panel);
document.body.appendChild(button);

// 默认打开
let phoneOpen=true;

// 记忆状态
const saved=localStorage.getItem("phoneos-open");

if(saved==="false"){
    phoneOpen=false;
    panel.classList.add("hidden");
}

button.onclick=()=>{

    phoneOpen=!phoneOpen;

    panel.classList.toggle("hidden",!phoneOpen);

    localStorage.setItem("phoneos-open",phoneOpen);

};
