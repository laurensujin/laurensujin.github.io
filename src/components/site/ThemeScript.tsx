/**
 * Runs before the page paints so the right colour theme is applied without a
 * flash. Order of preference: saved choice → operating system setting.
 * Also adds a `js` class so reveal animations only apply when scripts run.
 */
const script = `(function(){try{var c=document.documentElement.classList;c.add('js');var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){c.add('dark');}}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
