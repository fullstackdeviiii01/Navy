// lib/utils/mediaPreview.ts

/**
 * Safely opens any image URL (including Base64 Data URIs and relative paths) in a new preview window
 * without encountering browser data-URL top-frame navigation blocks (about:blank#blocked).
 */
export function openImagePreview(url: string, title: string = "Receipt / Evidence Preview") {
  if (!url) return;

  if (url.startsWith("data:image/")) {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                background: #121212;
                color: #e5e5e5;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 24px;
              }
              .toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                max-width: 900px;
                margin-bottom: 16px;
                padding: 10px 16px;
                background: #1e1e1e;
                border: 1px solid #333;
                border-radius: 8px;
              }
              .title {
                font-size: 13px;
                font-weight: 600;
                color: #d4af37;
                text-transform: uppercase;
                letter-spacing: 0.08em;
              }
              .btn {
                background: #333;
                color: #fff;
                border: none;
                padding: 6px 14px;
                font-size: 12px;
                font-weight: 600;
                border-radius: 6px;
                cursor: pointer;
                text-decoration: none;
                transition: background 0.2s;
              }
              .btn:hover { background: #444; }
              .img-container {
                display: flex;
                align-items: center;
                justify-content: center;
                max-width: 100%;
                max-height: 85vh;
              }
              img {
                max-width: 100%;
                max-height: 82vh;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.8);
                border: 1px solid rgba(255,255,255,0.08);
                background: #181818;
              }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <span class="title">${title}</span>
              <a href="${url}" download="payment_receipt.webp" class="btn">Download Image</a>
            </div>
            <div class="img-container">
              <img src="${url}" alt="${title}" />
            </div>
          </body>
        </html>
      `);
      win.document.close();
      return;
    }
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
