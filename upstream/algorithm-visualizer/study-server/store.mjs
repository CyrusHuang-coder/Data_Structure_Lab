import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export function createStore(dir) {
  mkdirSync(dir,{recursive:true});
  const db=new DatabaseSync(path.join(dir,'study.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (kind TEXT, id TEXT, value TEXT NOT NULL, updated TEXT NOT NULL, PRIMARY KEY(kind,id));');
  return {
    list(kind){return db.prepare('SELECT id,value,updated FROM records WHERE kind=? ORDER BY updated DESC').all(kind).map(r=>({id:r.id,...JSON.parse(r.value),updated:r.updated}));},
    get(kind,id){const row=db.prepare('SELECT value FROM records WHERE kind=? AND id=?').get(kind,id);return row?JSON.parse(row.value):null;},
    put(kind,id,value){db.prepare('INSERT INTO records VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET value=excluded.value,updated=excluded.updated').run(kind,id,JSON.stringify(value),new Date().toISOString());return value;},
    remove(kind,id){db.prepare('DELETE FROM records WHERE kind=? AND id=?').run(kind,id);},
    backup(){return {schemaVersion:1,createdAt:new Date().toISOString(),records:db.prepare('SELECT * FROM records').all().filter(r=>r.kind!=='secret')};},
    restore(data){if(data?.schemaVersion!==1||!Array.isArray(data.records)||data.records.length>10000)throw new Error('备份格式不正确');const rows=data.records.map(r=>{if(!['draft','progress','note','case','layout','settings','history','submission','problem','mistake'].includes(r.kind)||typeof r.id!=='string'||typeof r.value!=='string'||r.value.length>500000)throw new Error('备份记录不合法');JSON.parse(r.value);return r;});db.exec('BEGIN');try{for(const r of rows)db.prepare('INSERT OR REPLACE INTO records VALUES(?,?,?,?)').run(r.kind,r.id,r.value,r.updated||new Date().toISOString());db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}},
    close(){db.close();}
  };
}
