'use strict';

const fs = require('hexo-fs');
const path = require('path');
const url_for = hexo.extend.helper.get('url_for').bind(hexo);

hexo.extend.tag.register("books", async function (args) {
    const viewerUrl = url_for('lib/pdf/web/viewer.html');
    const booksDir = path.join("books", ...args);
    const absBooksDir = path.join(hexo.source_dir, "books", ...args);
    if (!await fs.exists(absBooksDir)) {
        return "";
    }
    const files = await fs.listDir(absBooksDir);
    if (files.length <= 0) {
        return "";
    }
    return `<table><tr>` + files.filter((f) => f.endsWith(".pdf")).map((f) => {
        let fileName = path.basename(f);
        fileName = fileName.substring(0, fileName.lastIndexOf("."));
        const fullPath = '/' + path.join(booksDir, f);
        return `<td>${fileName}</td><td><a href="${viewerUrl}?file=${encodeURIComponent(fullPath)}">在线阅读</a></td><td><a href="${fullPath}">下载阅读</a></td>`
    }).join(`</tr><tr>`) + `</tr></table>`;
}, { async: true });