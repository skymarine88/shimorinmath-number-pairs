let db=null;
export let storageMode='indexeddb';
export async function openStore(){
 try{db=await new Promise((resolve,reject)=>{const r=indexedDB.open('shimorinmath-vectors',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('blocked'));});}catch{storageMode='local';}
}
function mirror(){try{return JSON.parse(localStorage.getItem('shimorinmath-vectors-v1'));}catch{return null;}}
export async function readState(){
 const local=mirror();let stored=null;
 if(db)try{stored=await new Promise((res,rej)=>{const r=db.transaction('state').objectStore('state').get('main');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}catch{storageMode='local';}
 if(!stored)return local;if(!local)return stored;
 return (local.savedAt||'')>=(stored.savedAt||'')?local:stored;
}
export async function saveState(state){
 const snapshot=structuredClone(state);let mirrored=false;
 // Synchronous recovery snapshot also covers a reload immediately after a click.
 try{localStorage.setItem('shimorinmath-vectors-v1',JSON.stringify(snapshot));mirrored=true;}catch{}
 if(db)try{await new Promise((res,rej)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(snapshot,'main');tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});return true;}catch{storageMode='local';}
 if(mirrored)return true;storageMode='memory';return false;
}
