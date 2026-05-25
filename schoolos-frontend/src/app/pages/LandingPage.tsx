import { useEffect, useRef } from "react";

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/managen-landing.html")
      .then(r => r.text())
      .then(html => {
        if (!rootRef.current) return;

        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
        const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
        const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
        const fontLink = html.match(/<link\s+[^>]*href="https:\/\/fonts\.googleapis\.com[^>]*\/?>/);

        if (fontLink && !document.querySelector('link[href*="fonts.googleapis.com"]')) {
          const d = document.createElement("div");
          d.innerHTML = fontLink[0];
          const el = d.firstElementChild;
          if (el) document.head.appendChild(el);
        }

        if (styleMatch) {
          const s = document.createElement("style");
          s.textContent = styleMatch[1];
          document.head.appendChild(s);
        }

        if (bodyMatch) {
          rootRef.current.innerHTML = bodyMatch[1];
        }

        if (scriptMatch) {
          const sc = document.createElement("script");
          sc.textContent = scriptMatch[1];
          document.body.appendChild(sc);
        }
      });
  }, []);

  return <div ref={rootRef} />;
}
