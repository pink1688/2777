import { getSubtitles } from 'youtube-caption-extractor';
import { fetchTranscript } from 'youtube-transcript';
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
function clean(s){return String(s??'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim().slice(0,800)}
function convert(rows,key,divisor){return (Array.isArray(rows)?rows:[]).slice(0,15000).map(x=>({start:Number.isFinite(Number(x[key]))?Math.max(0,Number(x[key])/divisor):null,text:clean(x.text)})).filter(x=>x.text&&(x.start===null||x.start<36000))}
function blocked(t){return /LOGIN_REQUIRED|Sign in|not a bot|confirm.*bot|403|429|rate limit|thrott/i.test(t)}
function restricted(t){return /private|members.only|unavailable|deleted|not playable/i.test(t)}
export default async function handler(request){
 if(request.method==='GET')return reply(200,{service:'EGG_CAPTIONS_V3',ready:true,kind:'existing_youtube_captions_only'});
 if(request.method!=='POST')return reply(405,{error:'只支援 GET / POST'});
 if(!(request.headers.get('content-type')||'').startsWith('application/json'))return reply(415,{error:'需要 JSON'});
 let body;try{body=await request.json()}catch{return reply(400,{error:'JSON 格式不正確'})}
 const id=String(body?.videoId??'').trim();
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))return reply(400,{error:'影片 ID 格式有誤'});
 const errors=[];
 try{
  const captions=await getSubtitles({videoID:id,lang:'zh-TW'});
  const segments=convert(captions,'start',1);
  if(segments.length)return reply(200,{videoId:id,source:'YouTube 已有字幕（講者／正確性未經人工驗證）',method:'captions',segments});
  errors.push('captions:empty');
 }catch(e){errors.push('caption extractor: '+String(e?.message||e).slice(0,200))}
 try{
  const captions=await fetchTranscript(id);
  const segments=convert(captions,'offset',1);
  if(segments.length)return reply(200,{videoId:id,source:'YouTube 已有字幕（備援擷取；未經人工核對）',method:'captions_fallback',segments});
  errors.push('fallback:empty');
 }catch(e){errors.push('fallback: '+String(e?.message||e).slice(0,200))}
 const detail=errors.join(' | ').slice(0,380);
 if(blocked(detail))return reply(429,{error:'YouTube 暫時阻擋字幕讀取（登入驗證或流量限制）。可以重試或匯入 SRT/VTT。',code:'youtube_blocked',detail});
 if(restricted(detail))return reply(403,{error:'影片可能是會員限定、私人或已下架，無法讀取字幕。',code:'video_restricted',detail});
 return reply(422,{error:'這部影片沒有可取得的字幕。此功能不能直接從 YouTube 網址辨識聲音；可匯入字幕或有權使用的音訊檔。',code:'captions_unavailable',detail});
}
export const config={path:'/.netlify/functions/transcript'};
