const rgb=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));
const luminance=channels=>channels.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
export function contrastRatio(a,b){const x=luminance(rgb(a)),y=luminance(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function appearanceColors(accent,dark){
  const surface=dark?'#131923':'#ffffff',ink=dark?'#eff3fa':'#1b2134',color=rgb(accent),text=rgb(ink);
  let accentInk=accent;
  for(const weight of [1,.8,.6,.4,.2,0]){
    const mixed='#'+color.map((v,i)=>Math.round(v*weight+text[i]*(1-weight)).toString(16).padStart(2,'0')).join('');
    if(contrastRatio(mixed,surface)>=5){accentInk=mixed;break;}
  }
  const onPrimary=contrastRatio(accent,'#ffffff')>=contrastRatio(accent,'#000000')?'#ffffff':'#000000';
  return {accentInk,onPrimary,canvas:dark?'#0b0e14':'#f7f8fc'};
}
