import test from 'node:test';import assert from 'node:assert/strict';
import {appearanceColors,contrastRatio} from '../src/study/appearanceColors.mjs';
test('custom accent text and primary button labels remain readable across both themes',()=>{
  const colors=['#5550d6','#2563eb','#0f766e','#be185d','#b45309','#475569','#ffffff','#000000','#777777','#ffd900'];
  for(const r of [0,51,102,153,204,255])for(const g of [0,51,102,153,204,255])for(const b of [0,51,102,153,204,255])colors.push('#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''));
  for(const dark of [false,true])for(const color of colors){const result=appearanceColors(color,dark);assert.ok(contrastRatio(result.accentInk,dark?'#131923':'#ffffff')>=4.5,color+' accent text');assert.ok(contrastRatio(result.onPrimary,color)>=4.5,color+' button label');assert.equal(result.canvas,dark?'#0b0e14':'#f7f8fc');}
});
