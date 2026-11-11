import pg from 'pg'; import fs from 'fs';
export const env={};for(const l of fs.readFileSync(new URL('../../.env', import.meta.url),'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in env))env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
export async function supa(){
  const u=new URL(env.SUPABASE_DB_URL); const pw=decodeURIComponent(u.password);
  const tries=[{host:u.hostname,port:5432,user:'postgres'},{host:'aws-1-us-east-1.pooler.supabase.com',port:5432,user:'postgres.otogohtujuituablqkeo'}];
  for(const t of tries){const c=new pg.Client({...t,password:pw,database:'postgres',ssl:{rejectUnauthorized:false},connectionTimeoutMillis:10000});
    try{await c.connect();console.error('connected via',t.host);return c;}catch(e){console.error('fail',t.host,e.code||e.message);}}
  throw new Error('no connection');
}
