
const fs=require('fs'),path=require('path'),crypto=require('crypto'),https=require('https');
const ROOT='/workspace';
const ND=path.join(ROOT,'node_modules/next/dist/compiled/@next/font/dist/google');
const {validateGoogleFontFunctionCall}=require(path.join(ND,'validate-google-font-function-call.js'));
const {getFontAxes}=require(path.join(ND,'get-font-axes.js'));
const {getGoogleFontsUrl}=require(path.join(ND,'get-google-fonts-url.js'));
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36';
function get(url){return new Promise((res,rej)=>{https.get(url,{headers:{'User-Agent':UA}},r=>{if(r.statusCode!==200)return rej(new Error('GET '+url+' -> '+r.statusCode));const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);});}
function walk(d,out){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='node_modules'||e.name.startsWith('.'))continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p,out);else if(/\.(tsx?|jsx?|mjs|cjs)$/.test(e.name))out.push(p);}return out;}
const files=walk(ROOT,[]);
const calls=[];
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  const im=[...src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/g)];
  for(const m of im){
    for(const spec of m[1].split(',')){
      const mm=spec.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?$/);
      if(!mm)continue;
      const exported=mm[1], local=mm[2]??mm[1];
      const callRe=new RegExp('\\b'+local+'\\s*\\(','g');
      let cm;
      while((cm=callRe.exec(src))){
        let i=cm.index+cm[0].length,depth=1,start=i;
        while(i<src.length&&depth>0){if(src[i]==='(')depth++;else if(src[i]===')')depth--;i++;}
        const argText=src.slice(start,i-1).trim();
        if(!argText.startsWith('{'))continue;
        calls.push({fn:exported,file:f,argText});
      }
    }
  }
}
const mock={};
const outDir=path.join(ROOT,'.factory-fonts');
fs.mkdirSync(outDir,{recursive:true});
(async()=>{
  for(const c of calls){
    let args;
    try{args=(new Function('return ('+c.argText+')'))();}catch(e){console.error('unparseable font args in '+c.file+': '+e.message);continue;}
    const v=validateGoogleFontFunctionCall(c.fn,args);
    const axes=getFontAxes(v.fontFamily,v.weights,v.styles,v.selectedVariableAxes);
    const url=getGoogleFontsUrl(v.fontFamily,axes,v.display);
    if(mock[url])continue;
    let css=(await get(url)).toString('utf8');
    const urls=[...css.matchAll(/url\((https?:[^)]+)\)/g)].map(u=>u[1]);
    for(const u of urls){
      const name=crypto.createHash('sha256').update(u).digest('hex').slice(0,16)+'.woff2';
      const dest=path.join(outDir,name);
      if(!fs.existsSync(dest))fs.writeFileSync(dest,await get(u));
      // Loopback URL: --network none still has the lo interface, so a static server
      // inside the same container serves the REAL bytes to Turbopack's
      // Rust fetch (which ignores the JS-level fetchFontFile mock).
      css=css.split(u).join('http://127.0.0.1:41234/'+name);
    }
    mock[url]=css;
  }
  fs.writeFileSync(path.join(outDir,'mock.json'),JSON.stringify(mock));
  console.log('provisioned '+Object.keys(mock).length+' font responses, '+fs.readdirSync(outDir).filter(f=>f.endsWith('.woff2')).length+' woff2 files');
})().catch(e=>{console.error(e);process.exit(1);});
