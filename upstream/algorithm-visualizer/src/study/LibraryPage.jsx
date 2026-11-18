import React,{useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,Code2,Copy,Search} from 'lucide-react';
import ChapterLogo from './ChapterLogo.jsx';
import {adtCategories,operations,functionReferences} from './adtReference.mjs';
import './library.css';

function CopyButton({text,label}){
  const [status,setStatus]=useState('');
  useEffect(()=>{if(status){const timer=setTimeout(()=>setStatus(''),2200);return()=>clearTimeout(timer);}},[status]);
  const copy=async()=>{try{await navigator.clipboard.writeText(text);setStatus('已复制');}catch{setStatus('复制失败，请选中下方代码复制');}};
  return <div className="adt-copy"><button className="text-button" type="button" aria-label={label} onClick={copy}>{status==='已复制'?<Check size={14}/>:<Copy size={14}/>} {status==='已复制'?'已复制':'复制'}</button>{status&&<span className={'adt-copy-status'+(status==='已复制'?' sr-status':'')} role="status">{status}</span>}</div>;
}
function OperationCard({name,reference,category}){
  const data=operations[name];
  if(!reference)return <article className="card adt-operation"><h2>{name}</h2><p>当前运行环境未提供此接口。</p></article>;
  const allocation=name==='Push'||name==='EnQueue';
  const returns=allocation?(category.linked?'成功返回 OK；结点分配失败返回 OVERFLOW。':'成功返回 OK；容量已满时返回 ERROR。'):data.returns;
  return <article className="card adt-operation" id={'api-'+name}>
    <div className="adt-operation-heading"><div><h2><code>{name}</code></h2><span>{data.title}</span></div><span className="adt-type-tag">{reference.signature.split(' ')[0]}</span></div>
    <p className="adt-operation-summary">{data.summary}</p>
    <pre className="adt-signature"><code>{reference.signature};</code></pre>
    <details className="adt-usage"><summary>参数与调用示例 <span>{data.params.length} 个参数</span></summary>
      <dl className="adt-params">{data.params.map(p=><div key={p.name}><dt><code>{p.name}</code><span>{p.direction}</span></dt><dd>{p.description}</dd></div>)}</dl>
      <div className="adt-return"><b>返回值</b><p>{returns}</p></div>
      {data.note&&<p className="adt-note">{data.note}</p>}
      <div className="adt-example-title"><h3>调用示例</h3><CopyButton text={data.example} label={'复制 '+name+' 调用示例'}/></div>
      <pre className="adt-example"><code>{data.example}</code></pre>
      <details className="adt-implementation"><summary><Code2 size={14}/> 查看此接口的实现</summary><pre><code>{reference.source}</code></pre></details>
    </details>
  </article>;
}
export default function LibraryPage({adt,categoryId}){
  const [query,setQuery]=useState('');
  const category=adtCategories.find(c=>c.id===categoryId);
  const references=useMemo(()=>functionReferences(adt,!!category?.linked),[adt,category?.linked]);
  useEffect(()=>{setQuery('');},[categoryId]);
  const lookup=query.trim().toLowerCase();
  const filtered=category?.functions.filter(name=>(name+operations[name].title+operations[name].summary).toLowerCase().includes(lookup))||[];
  return <div className="adt-library">
    {category&&<nav className="adt-breadcrumb" aria-label="接口库导航"><a href="#/library"><ArrowLeft size={15}/> 全部 ADT</a><span>/</span><span>{category.title}</span></nav>}
    <div className="page-heading"><div><div className="eyebrow">ABSTRACT DATA TYPES</div><h1>{category?.title||'ADT 接口库'}</h1><p>{category?'按操作查看接口，展开卡片了解参数、返回值与调用方式。':'先选择一种数据结构，再按操作查看接口。'}</p></div><span className="badge">{category?category.functions.length+' 个接口':adtCategories.length+' 个板块 · '+Object.keys(operations).length+' 个基础接口'}</span></div>
    {categoryId&&!category?<section className="card empty-inline"><p>未找到这个 ADT 板块。</p><a className="text-button" href="#/library">返回接口库 <ArrowRight size={15}/></a></section>:!category?<>
      <div className="adt-category-grid">{adtCategories.map(c=><a key={c.id} className="card adt-category" href={'#/library/'+c.id} aria-label={'查看'+c.title+'接口'}><div className="adt-category-top"><ChapterLogo chapter={c.chapter}/><span>{c.storage}</span><ArrowRight size={18}/></div><h2>{c.title}</h2><code>{c.type}</code><p>{c.description}</p><div className="adt-function-preview">{c.functions.slice(0,3).map(name=><code key={name}>{name}</code>)}</div><div className="adt-category-footer"><span>{c.functions.length} 个接口</span><b>查看接口 <ArrowRight size={14}/></b></div></a>)}</div>
      <aside className="adt-overview-note"><b>调用前先确认两件事</b><p>对象是否已经初始化，以及参数需要传对象、指针还是地址。各板块会单独说明位置编号和存储约定。</p><p>做题时以当前题目的可用接口为准；被考查的操作可能禁用对应辅助函数。</p></aside>
    </>:<>
      <section className="card adt-category-context"><ChapterLogo chapter={category.chapter}/><div><h2><code>{category.type}</code><span>{category.storage}</span></h2><p>{category.convention}</p></div><details><summary>查看结构定义</summary><pre><code>{category.typeCode}</code></pre></details></section>
      <div className="adt-common-contract"><b>公共约定</b><span>OK = 1</span><span>ERROR = 0</span><span>OVERFLOW = -2</span><span>先初始化；输出参数传有效地址。</span></div>
      <div className="filter-bar adt-filter"><label className="search-field"><Search size={16}/><input aria-label="搜索当前 ADT 接口" placeholder="搜索接口名或操作，例如 Pop、取值…" value={query} onChange={e=>setQuery(e.target.value)}/></label><span>{filtered.length} / {category.functions.length} 个接口</span></div>
      <div className="adt-operation-grid">{filtered.map(name=><OperationCard key={category.id+name} name={name} reference={references.get(name)} category={category}/>)}</div>
      {!filtered.length&&<div className="card empty-inline"><p>没有匹配的接口，试试其他函数名或操作名称。</p><button className="text-button" onClick={()=>setQuery('')}>清空搜索</button></div>}
      <nav className="adt-other-categories" aria-label="切换 ADT 板块"><span>其他板块</span>{adtCategories.filter(c=>c.id!==category.id).map(c=><a key={c.id} href={'#/library/'+c.id}>{c.title}</a>)}</nav>
    </>}
  </div>;
}
