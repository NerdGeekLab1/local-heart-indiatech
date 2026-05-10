import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHeadScripts } from "@/lib/sanitizeHeadScripts";

/**
 * Reads tracking-category app_configuration entries and injects the
 * corresponding scripts into <head> at runtime.
 */
const HeaderScripts = () => {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("app_configuration")
        .select("key,value")
        .eq("category", "tracking");
      if (cancelled || !data) return;

      const map = Object.fromEntries(data.map(r => [r.key, r.value])) as Record<string, string | null>;
      const head = document.head;
      const tagged: HTMLElement[] = [];

      const addScript = (src: string, inline?: string) => {
        const s = document.createElement("script");
        if (src) { s.src = src; s.async = true; }
        if (inline) s.text = inline;
        s.dataset.injectedBy = "header-scripts";
        head.appendChild(s);
        tagged.push(s);
      };

      const addRaw = (html: string) => {
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        Array.from(wrap.childNodes).forEach(node => {
          if (node.nodeType === 1) {
            const el = node as HTMLElement;
            el.dataset.injectedBy = "header-scripts";
            head.appendChild(el);
            tagged.push(el);
          }
        });
      };

      const ga = map.GOOGLE_ANALYTICS_ID;
      if (ga) {
        addScript(`https://www.googletagmanager.com/gtag/js?id=${ga}`);
        addScript("", `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`);
      }
      const gtm = map.GOOGLE_TAG_MANAGER_ID;
      if (gtm) {
        addScript("", `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`);
      }
      const fbp = map.FACEBOOK_PIXEL_ID;
      if (fbp) {
        addScript("", `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbp}');fbq('track','PageView');`);
      }
      const custom = map.CUSTOM_HEAD_SCRIPTS;
      if (custom && custom.trim()) addRaw(custom);

      return () => {
        cancelled = true;
        tagged.forEach(el => el.remove());
      };
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
};

export default HeaderScripts;
