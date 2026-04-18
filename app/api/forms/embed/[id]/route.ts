import { NextRequest, NextResponse } from 'next/server'

/**
 * Serves a tiny self-contained JS snippet that embeds a form as either an
 * iframe, a popup triggered by an element click, or a slider that opens from
 * the page edge. Consumers include it via <script src="..." async></script>.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const mode = (req.nextUrl.searchParams.get('mode') || 'iframe').toLowerCase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const publicUrl = `${appUrl}/forms/public/${id}`

  const js = buildScript(id, publicUrl, mode)
  return new NextResponse(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

function buildScript(formId: string, publicUrl: string, mode: string) {
  const safeId = JSON.stringify(formId)
  const safeUrl = JSON.stringify(publicUrl)
  const safeMode = JSON.stringify(mode)
  return `(function () {
  var FORM_ID = ${safeId};
  var FORM_URL = ${safeUrl};
  var MODE = ${safeMode};
  var css = '\\n.uavrw-embed-iframe { border: 0; width: 100%; min-height: 640px; display: block; } \\n.uavrw-embed-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 2147483646; opacity: 0; transition: opacity .18s ease; } \\n.uavrw-embed-backdrop.open { opacity: 1; } \\n.uavrw-embed-popup { position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; pointer-events: none; } \\n.uavrw-embed-popup > div { background: #fff; border-radius: 14px; overflow: hidden; width: min(780px, 92vw); height: min(720px, 90vh); box-shadow: 0 24px 60px rgba(0,0,0,.25); transform: translateY(12px) scale(.98); opacity: 0; transition: transform .2s ease, opacity .2s ease; pointer-events: auto; } \\n.uavrw-embed-popup.open > div { transform: translateY(0) scale(1); opacity: 1; } \\n.uavrw-embed-slider { position: fixed; top: 0; right: 0; bottom: 0; width: min(520px, 92vw); background: #fff; z-index: 2147483647; box-shadow: -12px 0 40px rgba(0,0,0,.2); transform: translateX(100%); transition: transform .25s ease; } \\n.uavrw-embed-slider.open { transform: translateX(0); } \\n.uavrw-embed-close { position: absolute; top: 10px; right: 12px; background: rgba(255,255,255,.9); border: 1px solid rgba(0,0,0,.08); border-radius: 999px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; z-index: 1; color: #0f172a; } \\n';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function makeIframe() {
    var f = document.createElement('iframe');
    f.src = FORM_URL;
    f.className = 'uavrw-embed-iframe';
    f.setAttribute('title', 'Embedded form');
    return f;
  }
  function clearChildren(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function makeClose(onClose) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'uavrw-embed-close';
    b.setAttribute('aria-label', 'Close form');
    b.textContent = '\u00D7';
    b.onclick = onClose;
    return b;
  }

  if (MODE === 'iframe') {
    var targets = document.querySelectorAll('[data-uavrw-form="' + FORM_ID + '"]');
    targets.forEach(function (el) { clearChildren(el); el.appendChild(makeIframe()); });
    return;
  }

  function openOverlay(kind) {
    var back = document.createElement('div'); back.className = 'uavrw-embed-backdrop';
    var panel, container;
    if (kind === 'slider') {
      panel = document.createElement('aside'); panel.className = 'uavrw-embed-slider';
      panel.appendChild(makeIframe());
      panel.appendChild(makeClose(close));
      container = panel;
    } else {
      panel = document.createElement('div'); panel.className = 'uavrw-embed-popup';
      var inner = document.createElement('div');
      inner.appendChild(makeIframe());
      inner.appendChild(makeClose(close));
      panel.appendChild(inner);
      container = panel;
    }
    document.body.appendChild(back);
    document.body.appendChild(container);
    requestAnimationFrame(function () { back.classList.add('open'); container.classList.add('open'); });
    back.addEventListener('click', close);

    function close() {
      back.classList.remove('open'); container.classList.remove('open');
      setTimeout(function () { if (back.parentNode) back.parentNode.removeChild(back); if (container.parentNode) container.parentNode.removeChild(container); }, 220);
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.getAttribute && el.getAttribute('data-uavrw-form') === FORM_ID) {
        e.preventDefault();
        openOverlay(MODE);
        return;
      }
      el = el.parentNode;
    }
  });
})();
`
}
