const SCRIPT = `(function(){try{var saved=localStorage.getItem('sewfunlife-theme');if(saved==='dark'||saved==='light'){document.documentElement.dataset.theme=saved;var meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.setAttribute('content',saved==='dark'?'#08090a':'#f6f7f8')}}}catch(_){}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
