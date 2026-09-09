const panel = document.createElement("div");
panel.id = "phoneos-panel";

panel.innerHTML = `
<iframe src="/scripts/extensions/third-party/vampire/index.html"></iframe>
`;

document.body.appendChild(panel);
