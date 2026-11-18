import React from 'react';

const palettes={
  intro:['#6366f1','#a78bfa','#a5b4fc'],linear:['#3b82f6','#22d3ee','#93c5fd'],
  stack:['#8b5cf6','#c084fc','#c4b5fd'],string:['#059669','#34d399','#6ee7b7'],
  array:['#d97706','#fbbf24','#fcd34d'],tree:['#0891b2','#2dd4bf','#67e8f9'],
  graph:['#e05b36','#fb923c','#fdba74'],search:['#db2777','#f472b6','#f9a8d4'],
  sort:['#6366f1','#a78bfa','#a5b4fc'],external:['#2563eb','#38bdf8','#93c5fd'],
  file:['#64748b','#a78bfa','#cbd5e1']
};
const Dot=({x,y,r=4,secondary=false})=><circle cx={x} cy={y} r={r} className={secondary?'logo-pop':'logo-main'}/>;
const shapes={
  intro:<><path className="logo-wash" d="M5 7h12l3 3 3-3h12v26H23l-3 3-3-3H5z"/><path className="logo-line" d="M20 12v20M9 14h6m-6 6h6m10-6h6m-6 6h6"/><path className="logo-pop" d="m24 26 3 3 7-8-2-2-5 6-1-1z"/></>,
  linear:<><path className="logo-line" d="M12 20h6m-2-3 3 3-3 3m12-3h6m-2-3 3 3-3 3"/><rect className="logo-main" x="2" y="12" width="10" height="16" rx="4"/><rect className="logo-pop" x="19" y="12" width="10" height="16" rx="4"/><rect className="logo-main" x="35" y="12" width="3" height="16" rx="1.5"/><circle className="logo-cutout" cx="7" cy="20" r="1.5"/><circle className="logo-cutout" cx="24" cy="20" r="1.5"/></>,
  stack:<><path className="logo-wash" d="m4 27 16-7 16 7-16 9z"/><path className="logo-main" d="m4 20 16-8 16 8-16 8z"/><path className="logo-pop" d="m4 12 16-8 16 8-16 8z"/><path className="logo-detail" d="m12 12 8-4 8 4"/></>,
  string:<><rect className="logo-main" x="2" y="9" width="11" height="22" rx="4"/><rect className="logo-pop" x="15" y="9" width="10" height="22" rx="4"/><rect className="logo-wash" x="27" y="9" width="11" height="22" rx="4"/><path className="logo-detail" d="m5 24 2.5-8 2.5 8m-4-3h3M18 16h4m-2 0v8m-2 0h4"/><path className="logo-line" d="m30 17 4 6m0-6-4 6"/></>,
  array:<>{[0,1,2].flatMap(r=>[0,1,2].map(c=><rect key={r+'-'+c} className={r===c?'logo-pop':r+c===2?'logo-main':'logo-wash'} x={4+c*11} y={4+r*11} width="9" height="9" rx="2.5"/>))}</>,
  tree:<><path className="logo-line" d="M20 9v7M9 25v-9h22v9M9 25l-5 9m5-9 6 9m16-9-6 9m6-9 5 9"/><Dot x={20} y={7} r={5}/><Dot x={9} y={23} secondary/><Dot x={31} y={23} secondary/><Dot x={4} y={35} r={3}/><Dot x={15} y={35} r={3}/><Dot x={25} y={35} r={3}/><Dot x={36} y={35} r={3}/></>,
  graph:<><path className="logo-line" d="m7 11 22-4 5 21-22 6-5-23 27 17M29 7 12 34"/><Dot x={7} y={11} r={5}/><Dot x={29} y={7} r={5} secondary/><Dot x={34} y={28} r={5}/><Dot x={12} y={34} r={5} secondary/></>,
  search:<><circle className="logo-wash" cx="17" cy="17" r="13"/><circle className="logo-outline" cx="17" cy="17" r="11"/><path className="logo-line" d="m25 25 11 11"/><path className="logo-pop" d="M10 14h14v3H10zm0 6h9v3h-9z"/><circle className="logo-main" cx="17" cy="10" r="2"/></>,
  sort:<><rect className="logo-wash" x="3" y="24" width="7" height="12" rx="2"/><rect className="logo-pop" x="13" y="17" width="7" height="19" rx="2"/><rect className="logo-main" x="23" y="8" width="7" height="28" rx="2"/><path className="logo-line" d="M5 16V5m-3 3 3-3 3 3m26 14v13m-3-3 3 3 3-3"/></>,
  external:<><path className="logo-line" d="m9 15 11 11 11-11M20 26v10"/><rect className="logo-main" x="2" y="3" width="13" height="13" rx="4"/><rect className="logo-pop" x="25" y="3" width="13" height="13" rx="4"/><rect className="logo-main" x="13" y="27" width="14" height="11" rx="3"/><path className="logo-detail" d="M6 8h5M6 12h5m22-4h-5m5 4h-5m-11 20h6"/></>,
  file:<><path className="logo-wash" d="M8 3h16l9 9v25H8z"/><path className="logo-main" d="M24 3v10h9zM12 18h16v3H12zm0 7h16v3H12zm0 7h10v3H12z"/><rect className="logo-pop" x="3" y="6" width="9" height="9" rx="3"/></>
};
export default function ChapterLogo({chapter,className=''}){
  const [main,pop,dark]=palettes[chapter]||palettes.intro;
  return <span className={'chapter-logo '+className} data-chapter={chapter} style={{'--logo-color':main,'--logo-accent':pop,'--logo-dark':dark}} aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" focusable="false">{shapes[chapter]||shapes.intro}</svg></span>;
}
