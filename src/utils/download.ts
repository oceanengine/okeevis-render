export function downloadBase64(base64: string, name: string) {
  const ismsie = !!(window as any).ActiveXObject || 'ActiveXObject' in window
    const isedge = navigator.userAgent.indexOf('Edge') > -1;
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = base64; // 将画布内的信息导出为png图片数据
    a.download = name || document.title; // 设定下载名称
    a.target = '_blank';
    // for Chrome and Firefox
    // 来自echarts
    if (
        typeof MouseEvent === 'function' &&
        !(ismsie || isedge)
    ) {
        const evt: MouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: false,
        });
        a.dispatchEvent(evt);
    } else {
        // for IE
        const html: string = `<body style="margin:0;">
                    <img src="${base64}" style="max-width:100%;"  title="(test)" />
                </body>`;
        const tab: Window = window.open();
        tab.document.write(html);
    }
}