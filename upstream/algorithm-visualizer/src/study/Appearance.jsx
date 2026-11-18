import React,{createContext,useContext,useEffect,useState} from 'react';
import {appearanceColors} from './appearanceColors.mjs';

const key='zhixu.appearance.v1';
const defaults={mode:'light',accent:'#5550d6',textSize:16,motion:'auto'};
const Context=createContext({appearance:defaults,update:()=>{},dark:false});
export function AppearanceProvider({children}){
  const [appearance,setAppearance]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem(key));return {mode:['light','dark','system'].includes(saved?.mode)?saved.mode:defaults.mode,accent:/^#[0-9a-f]{6}$/i.test(saved?.accent)?saved.accent:defaults.accent,textSize:[16,18].includes(saved?.textSize)?saved.textSize:16,motion:saved?.motion==='off'?'off':'auto'};}catch{return defaults;}});
  const [systemDark,setSystemDark]=useState(()=>matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),onChange=e=>setSystemDark(e.matches);media.addEventListener('change',onChange);return()=>media.removeEventListener('change',onChange);},[]);
  const dark=appearance.mode==='dark'||appearance.mode==='system'&&systemDark;
  useEffect(()=>{
    const root=document.documentElement,colors=appearanceColors(appearance.accent,dark);root.dataset.theme=dark?'dark':'light';root.dataset.motion=appearance.motion;root.style.setProperty('--primary',appearance.accent);root.style.fontSize=appearance.textSize+'px';
    root.style.setProperty('--on-primary',colors.onPrimary);root.style.setProperty('--accent-ink',colors.accentInk);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',colors.canvas);
    try{localStorage.setItem(key,JSON.stringify(appearance));}catch{/* Preference still applies when storage is unavailable. */}
  },[appearance,dark]);
  return <Context.Provider value={{appearance,dark,update:patch=>setAppearance(a=>({...a,...patch}))}}>{children}</Context.Provider>;
}
export const useAppearance=()=>useContext(Context);
export function AppearanceSettings(){
  const {appearance,update}=useAppearance();
  return <section className="card settings-card appearance-settings"><h3>外观与阅读</h3><p>即时应用，并记住此浏览器的选择。</p>
    <label>显示模式<select aria-label="显示模式" value={appearance.mode} onChange={e=>update({mode:e.target.value})}><option value="light">浅色</option><option value="dark">深色</option><option value="system">跟随系统</option></select></label>
    <label>阅读字号<select aria-label="阅读字号" value={appearance.textSize} onChange={e=>update({textSize:+e.target.value})}><option value="16">舒适（16px）</option><option value="18">大字（18px）</option></select></label>
    <label>界面动效<select aria-label="界面动效" value={appearance.motion} onChange={e=>update({motion:e.target.value})}><option value="auto">跟随系统</option><option value="off">关闭装饰动效</option></select></label>
    <div className="accent-label">主题色</div><div className="accent-options">{[['紫罗兰','#5550d6'],['海蓝','#2563eb'],['青绿','#0f766e'],['玫瑰','#be185d'],['琥珀','#b45309'],['石墨','#475569']].map(([name,color])=><button key={color} type="button" title={name} aria-label={'主题色：'+name} aria-pressed={appearance.accent===color} style={{background:color}} onClick={()=>update({accent:color})}>{appearance.accent===color?'✓':''}</button>)}<label>自定义<input type="color" aria-label="自定义主题色" value={appearance.accent} onChange={e=>update({accent:e.target.value})}/></label></div>
  </section>;
}
