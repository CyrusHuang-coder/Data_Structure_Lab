import React,{forwardRef,useEffect,useId,useImperativeHandle,useRef,useState} from 'react';
import {inputFormState,readInputFields} from './testInput.mjs';
import './test-input.css';

const stringify=input=>JSON.stringify(input,null,2);
const TestInput=forwardRef(function TestInput({algorithm,value,onChange,onValidityChange,prefix='',disabled=false,resetKey=0},ref){
  const [state,setState]=useState(()=>inputFormState(algorithm,value)),[advanced,setAdvanced]=useState(!!state.error);
  const uid=useId(),emitted=useRef(value),reset=useRef(resetKey);
  const decode=()=>{if(advanced){const source=inputFormState(algorithm,value),result=readInputFields(source.fields,source.raw,source.base);return {...result,error:source.error,valid:!source.error&&result.valid};}return readInputFields(state.fields,state.raw,state.base);};
  const decoded=decode();
  useEffect(()=>{
    if(value!==emitted.current||reset.current!==resetKey){const next=inputFormState(algorithm,value);setState(next);emitted.current=value;reset.current=resetKey;if(next.error)setAdvanced(true);}
  },[value,resetKey,algorithm.id]);
  const validityCallback=useRef(onValidityChange);validityCallback.current=onValidityChange;
  useEffect(()=>{validityCallback.current?.(decoded.valid);},[decoded.valid]);
  useImperativeHandle(ref,()=>({read(){const result=decode();if(!result.valid)throw new Error(prefix+(result.error||Object.entries(result.errors).map(([key,error])=>(state.fields.find(f=>f.key===key)?.label||key)+'：'+error).join('；')));return result.input;}}));
  const edit=(field,raw)=>{
    const next={...state,raw:{...state.raw,[field.key]:raw}},result=readInputFields(next.fields,next.raw,next.base);setState(next);onValidityChange?.(result.valid);
    if(result.valid){const text=stringify(result.input);emitted.current=text;onChange(text);}
  };
  const switchMode=next=>{
    if(next===advanced)return;
    if(!decoded.valid)return;
    const source=advanced?inputFormState(algorithm,value):{...state,base:decoded.input};
    if(!advanced){const text=stringify(decoded.input);emitted.current=text;onChange(text);}
    setState(source);setAdvanced(next);
  };
  return <div className="test-input-editor">
    <div className="test-input-heading"><b>测试输入</b><div className="input-mode-switch" aria-label={prefix+'输入方式'}><button type="button" aria-pressed={!advanced} disabled={disabled||advanced&&!decoded.valid} onClick={()=>switchMode(false)}>参数输入</button><button type="button" aria-pressed={advanced} disabled={disabled||!advanced&&!decoded.valid} onClick={()=>switchMode(true)}>高级 JSON</button></div></div>
    {advanced?<div className="advanced-input"><label htmlFor={uid+'-json'}>JSON 输入</label><textarea id={uid+'-json'} aria-label={prefix+'JSON 输入'} className="input-json" disabled={disabled} value={value} spellCheck={false} onChange={e=>{onChange(e.target.value);}}/>{!decoded.valid&&<p className="input-field-error" role="alert">{decoded.error||Object.values(decoded.errors).join('；')}</p>}</div>:<div className="simple-input-fields">{state.fields.map(field=>{
      const id=uid+'-'+field.key,error=decoded.errors[field.key],multiline=['numbers','edges','nested','tokens','object'].includes(field.kind);
      return <div className={'simple-input-field '+(multiline?'wide':'')} key={field.key}>
        {field.kind==='boolean'?<label className="simple-input-checkbox"><input type="checkbox" aria-label={prefix+field.label} checked={!!state.raw[field.key]} disabled={disabled} onChange={e=>edit(field,e.target.checked)}/>{field.label}</label>:<><label htmlFor={id}>{field.label}</label>{multiline?<textarea id={id} aria-label={prefix+field.label} data-input-key={field.key} className="simple-input" rows={field.kind==='edges'?4:field.kind==='nested'?3:2} value={state.raw[field.key]??''} disabled={disabled} spellCheck={false} aria-invalid={!!error} aria-describedby={id+'-hint'} onChange={e=>edit(field,e.target.value)}/>:<input id={id} aria-label={prefix+field.label} data-input-key={field.key} className="simple-input" type="text" inputMode={field.kind==='number'?'numeric':undefined} value={state.raw[field.key]??''} disabled={disabled} aria-invalid={!!error} aria-describedby={id+'-hint'} onChange={e=>edit(field,e.target.value)}/>}</>}
        <small id={id+'-hint'}>{error?<span className="input-field-error" role="alert">{error}</span>:field.hint}</small>
      </div>;
    })}</div>}
    {!advanced&&!decoded.valid&&<p className="input-invalid-note">请先修正标出的输入，再运行或保存当前用例。</p>}
    <p className="test-input-footnote">修改后重新运行生效。{!advanced&&'数列可直接粘贴，无需填写字段名或外层 JSON。'}</p>
  </div>;
});
export default TestInput;
