# OCR: Image to Text

**English** · [简体中文](README.zh-CN.md)

Extract text from images, screenshots and scanned pages in your browser, without uploading them. Recognizes English and Simplified Chinese, and gives you editable text to copy or save as TXT.

**Try it:** https://ocr.bodhi.tools/en/

![OCR screenshot](docs/screenshot.png)

## Features

- Languages: Chinese + English (default), English only, or Chinese only
- Editable result, one-click copy and download as `.txt`
- Progress shown while the language pack loads and recognition runs
- Works best on clear, high-contrast printed text; handwriting and decorative fonts may come out wrong
- No signup, no usage limits
- English and Simplified Chinese interface

## How it works

[tesseract.js](https://github.com/naptha/tesseract.js) runs the Tesseract OCR engine as WebAssembly in a Web Worker. On first use it downloads the engine and the selected language data; the browser caches them for later runs. The Chinese pack is larger than the English one.

## Privacy

- Your image is read and recognized in your browser. The app has no upload endpoint, which makes it a reasonable choice for screenshots with private information.
- tesseract.js downloads its worker, WebAssembly core and language data from jsDelivr. Fonts load from Google Fonts and Fontshare.
- The hosted site at ocr.bodhi.tools uses Cloudflare Web Analytics, which counts page views without cookies. If you self-host and don't want it, delete the `cloudflareinsights` script tag in `index.html` and `en/index.html`.

## Run it locally

Requires Node.js 20.19+ (or 22.12+) and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/bodhi1425/ocr.git
cd ocr
pnpm install
pnpm dev     # http://localhost:5173
pnpm build   # static site in dist/
```

`dist/` contains only static files. Host it on Cloudflare Pages, Netlify, GitHub Pages or any web server.

## Project layout

```
index.html       Chinese page (/)
en/index.html    English page (/en/)
src/main.ts      UI and recognition logic
src/style.css    Styles
public/          favicon, robots.txt, sitemap.xml
```

## Built with

| Package | Used for | License |
|---|---|---|
| [tesseract.js](https://github.com/naptha/tesseract.js) | OCR engine | Apache-2.0 |
| [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) | Build | MIT, Apache-2.0 |

## More privacy-first tools

Each one runs entirely in your browser:

- [local-pdf-toolbox](https://github.com/bodhi1425/local-pdf-toolbox): merge, split, compress and convert PDFs
- [image-compressor](https://github.com/bodhi1425/image-compressor): compress an image to an exact KB size
- [heic-converter](https://github.com/bodhi1425/heic-converter): convert iPhone HEIC photos to JPG or PNG
- [qrcode](https://github.com/bodhi1425/qrcode): QR codes with logos, gradients, Wi-Fi and vCard
- [cutout](https://github.com/bodhi1425/cutout): remove image backgrounds with an on-device AI model

## Contributing

Bug reports and pull requests are welcome. Please open an issue first for larger changes.

## License

[MIT](LICENSE) © 2026 bodhi1425
