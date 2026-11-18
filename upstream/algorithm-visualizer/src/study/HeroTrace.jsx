import React from 'react';

// Snapshot immediately after line 6, on the second iteration of list reversal.
const lines = [
  'while (curr != NULL)',
  '{',
  '    // 保存后继，避免反转后丢失剩余链表',
  '    next = curr->next;',
  '    // 当前节点指向已反转部分',
  '    curr->next = prev;',
  '    // 两个工作指针向后移动',
  '    prev = curr;',
  '    curr = next;',
  '}',
];

export default function HeroTrace() {
  return <div className="hero-illustration">
    <div className="hero-trace">
      <div className="hero-trace-header"><span className="hero-trace-file">C / 单链表反转</span><span className="hero-trace-badge">执行示意</span></div>
      <div className="hero-trace-code" aria-label="反转链表的循环代码，第六行刚执行完毕">{lines.map((line, i) => <div key={i} className={'hero-trace-line'+(i===5?' is-current':'')+(line.trimStart().startsWith('//')?' is-comment':'')}><span className="hero-trace-number" aria-hidden="true">{i+1}</span><code>{line}</code>{i===5&&<span className="hero-trace-marker" aria-hidden="true">←</span>}</div>)}</div>
      <div className="hero-trace-caption"><span>第 6 行执行后</span><span>连接方向已更新</span></div>
      <svg className="hero-trace-graph" viewBox="0 0 340 96" role="img" aria-label="prev 指向节点 1，curr 指向节点 2，next 指向节点 3；节点 2 指向节点 1，节点 1 和节点 3 指向 NULL">
        <defs><marker id="hero-trace-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" strokeWidth="1.5"/></marker></defs>
        <g className="hero-trace-labels"><text x="94" y="16">prev</text><text x="185" y="16">curr</text><text x="283" y="16">next</text></g>
        <g className="hero-trace-links" markerEnd="url(#hero-trace-arrow)"><path d="M72 49 H39"/><path className="hero-trace-changed" d="M163 49 H118"/><path d="M283 68 V81 H323"/></g>
        <text className="hero-trace-null" x="20" y="53">∅</text><text className="hero-trace-null" x="332" y="85">∅</text>
        <g className="hero-trace-node"><rect x="72" y="29" width="44" height="39" rx="10"/><text x="94" y="54">1</text></g>
        <g className="hero-trace-node hero-trace-active"><rect x="163" y="29" width="44" height="39" rx="10"/><text x="185" y="54">2</text></g>
        <g className="hero-trace-node"><rect x="261" y="29" width="44" height="39" rx="10"/><text x="283" y="54">3</text></g>
      </svg>
    </div>
  </div>;
}
