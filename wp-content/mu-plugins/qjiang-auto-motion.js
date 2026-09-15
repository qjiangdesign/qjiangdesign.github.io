(() => {
 'use strict';
 const root=document.querySelector('[data-auto-motion]'); if(!root)return;
 const canvas=root.querySelector('canvas'), ctx=canvas.getContext('2d'); if(!ctx)return;
 const scenes=[["默认状态", "STANDBY", "三束银白色粒子向心汇聚，沿光环舒展，保持安静而鲜活的呼吸。"], ["启动", "START", "中心先点亮，三束光依次展开，最后闭合外环，进入就绪状态。"], ["加速", "ACCELERATE", "车辆向前加速，光核向后偏移，呈现乘坐者的推背感。"], ["减速制动", "BRAKE", "车辆减速，光核向前压缩，随后回弹，呈现制动的惯性感受。"], ["左转", "TURN LEFT", "车辆左转，光核向右侧偏移，表达横向惯性。"], ["右转", "TURN RIGHT", "车辆右转，光核向左侧偏移，表达横向惯性。"], ["向左变道", "LANE LEFT", "粒子平顺地跨越轨道，完成横向位移后重新汇聚。"], ["向右变道", "LANE RIGHT", "粒子平顺地跨越轨道，完成横向位移后重新汇聚。"], ["自适应跟车", "FOLLOW", "前后两组光场保持间距，柔和响应彼此的节奏。"], ["避障绕行", "AVOID", "流线在中央障碍周围分流，随后重新合拢。"], ["行人让行", "YIELD", "光场向两侧打开，降低流速，为通行留出空间。"], ["路口等待", "WAIT", "粒子环低频呼吸，保持清晰而克制的等待状态。"], ["汇入车流", "MERGE", "两股流线逐步靠近，平滑合并为同一条轨迹。"], ["倒车", "REVERSE", "光流反向回卷，提示车辆正在后退。"], ["自动泊车", "PARK", "粒子沿弧线进入边界，缓缓收束为有序的停驻形态。"], ["颠簸路面", "BUMPY", "流场局部起伏，层叠波纹传递路面变化。"], ["变更目的地", "REROUTE", "粒子解构旧轨道，再沿新的方向重新组织。"], ["确认目的地", "CONFIRM", "中心发出柔和回响，光环依次向外扩散。"], ["已到达", "ARRIVED", "回到默认三向形态，外环连续发出两次柔和脉冲，提示旅程完成。"]];
 const buttons=root.querySelector('[data-scenes]');
 scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=s[0];b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>select(i));buttons.append(b);});
 let styleIndex=1;
 const styles=[["舒缓",.65,.32],["标准",1,.55],["动感",1.4,.78],["紧急",1.9,1]];
 let active=0, transition=2, time=0, last=0, raf=0, visible=false, paused=matchMedia('(prefers-reduced-motion: reduce)').matches, w=0,h=0;
 const pause=root.querySelector('[data-pause]'), status=root.querySelector('[data-status]');
 const styleBar=document.createElement('div');styleBar.className='qj-driving-style';styleBar.setAttribute('role','group');styleBar.setAttribute('aria-label','驾驶风格');
 const styleLabel=document.createElement('span');styleLabel.textContent='驾驶风格';styleBar.append(styleLabel);
 styles.forEach((st,i)=>{const b=document.createElement('button');b.type='button';b.textContent=st[0];b.setAttribute('aria-pressed',String(i===styleIndex));b.addEventListener('click',()=>{styleIndex=i;Array.from(styleBar.querySelectorAll('button')).forEach((el,j)=>el.setAttribute('aria-pressed',String(i===j)));select(active);});styleBar.append(b);});
 root.querySelector('.qj-motion-controls').prepend(styleBar);
 const gLabel=document.createElement('span');gLabel.className='qj-g-label';gLabel.textContent='';root.querySelector('.qj-motion-stage').append(gLabel);
 const rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const particles=Array.from({length:4800},(_,i)=>({u:rand(i),v:rand(i+5000),z:rand(i+10000),arm:i%3,x:0,y:0,fromX:0,fromY:0}));
 const stars=Array.from({length:950},(_,i)=>({u:rand(i+21000),v:rand(i+24000),z:rand(i+27000)}));
 const ease=v=>v*v*v*(v*(v*6-15)+10);
 function select(i){particles.forEach(p=>{p.fromX=p.x;p.fromY=p.y;});active=i;time=0;transition=0;Array.from(buttons.children).forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));root.querySelector('[data-name]').textContent=scenes[i][0];root.querySelector('[data-code]').textContent=String(i+1).padStart(2,'0')+' / '+scenes[i][1];draw(paused?0:.016);schedule();}
 function schedule(){if(!raf&&visible&&!paused&&!document.hidden)raf=requestAnimationFrame(frame);}
 function frame(now){raf=0;const dt=last?Math.min((now-last)/1000,.04):.016;last=now;time+=dt;transition+=dt;draw(dt);schedule();}
 function draw(dt){
 ctx.globalCompositeOperation='source-over';ctx.fillStyle='#030509';ctx.fillRect(0,0,w,h);
 const size=Math.min(w,h)*.34,cx=w/2,cy=h/2,key=scenes[active][1];
 const speed=styles[styleIndex][1],strength=styles[styleIndex][2],t=time*speed;
 const tint=[[204,230,255],[132,193,255],[169,142,255],[255,181,108]][styleIndex],rgb=tint.join(',');
 const morph=dt?ease(Math.min(transition/(1.1/speed),1)):1;
 const beat=t%5.6;
 // Smooth load onset, hold, release, then a small damped rebound.
 let load=beat<1.4?ease(beat/1.4):beat<2.3?1:beat<3.7?1-ease((beat-2.3)/1.4):-Math.sin((beat-3.7)*5)*Math.exp(-(beat-3.7)*3)*.12;
 const g=load*strength,gx=key==='TURN LEFT'?g:key==='TURN RIGHT'?-g:0,gy=key==='ACCELERATE'?g:key==='BRAKE'?-g:0;
 const inertial=['ACCELERATE','BRAKE','TURN LEFT','TURN RIGHT'].includes(key);
 gLabel.textContent=['冰银 · 舒缓','冷蓝 · 标准','紫蓝 · 动感','琥珀 · 紧急'][styleIndex];
 const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,size*1.5);bg.addColorStop(0,'#101b2b');bg.addColorStop(1,'#030509');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.globalCompositeOperation='lighter';
 // Depth-separated stars and a tilted spiral dust disk surround the state form.
 for(let i=0;i<stars.length;i++){
  const st=stars[i],angle=st.u*Math.PI*2+t*(.014+.022*st.z);
  let sx,sy,opacity;
  if(i<430){sx=st.u*w;sy=st.v*h;opacity=.10+.20*st.z;}
  else{const radius=size*(.45+st.v*1.18),spiral=angle+st.v*3.8;
   const xx=Math.cos(spiral)*radius,yy=Math.sin(spiral)*radius*.38;
   sx=cx+xx*.94-yy*.34;sy=cy+xx*.34+yy*.94;opacity=(.07+.29*st.z)*(1-st.v*.5);
  }
  const twinkle=.55+.45*Math.sin(time*(.5+st.z)+st.u*50)**2;
  ctx.fillStyle=`rgba(${rgb},${opacity*twinkle})`;ctx.beginPath();ctx.arc(sx,sy,.3+st.z*.75,0,Math.PI*2);ctx.fill();
  if(st.z>.985){ctx.strokeStyle=`rgba(220,235,255,${opacity*twinkle*.65})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);ctx.stroke();}
 }
 // Traveling arcs give the field a luminous direction and changing rhythm.
 for(let j=0;j<3;j++){
  const angle=t*(.24+j*.08)-.09*Math.sin(t*1.3)+j*2.094;
  ctx.strokeStyle=`rgba(${rgb},${.14+.08*Math.sin(t+j)})`;ctx.lineWidth=1.1;
  ctx.beginPath();ctx.arc(cx,cy,size*(.92+j*.035),angle,angle+.5);ctx.stroke();
 }
 for(const p of particles){
  const q=p.u;
  const flow=t*.18-.045*Math.sin(t*1.7);
  const a=p.v*Math.PI*2+flow*(p.z>.5?1:-.55);
  const shimmer=.5+.5*Math.sin(p.u*42-t*2.1+p.z*12);
  const thick=(p.z-.5)*(.035+.018*shimmer);
  let x=0,y=0,alpha=(.23+p.z*.52)*(.65+.35*shimmer);
  const star=['STANDBY','START','ARRIVED'].includes(key);
  if(star){
   if(q<.32){const rr=.9+thick;x=Math.cos(a)*rr;y=Math.sin(a)*rr;alpha*=.75+.25*shimmer;
    if(key==='START')alpha*=ease(Math.max(0,Math.min((t-1.8)/.9,1)));
   }else{const d=((q-.32)/.68+t*.12)%1,ang=p.arm*Math.PI*2/3-Math.PI/2,lateral=(p.v-.5)*Math.pow(1-d,1.8)*.25;
    x=Math.cos(ang)*d*.9+Math.cos(ang+Math.PI/2)*lateral;y=Math.sin(ang)*d*.9+Math.sin(ang+Math.PI/2)*lateral;
    if(key==='START'){const reveal=ease(Math.max(0,Math.min((t-p.arm*.3)/1.1,1)));alpha*=1-ease(Math.max(0,Math.min((d-reveal)*14,1)));}
   }
   if(key==='ARRIVED')alpha*=.72+.28*Math.pow(Math.sin(t*2),2);
  }else if(inertial){
   const r=.69+thick*2+.025*Math.sin(a*3-t*1.3);
   x=Math.cos(a)*r;y=Math.sin(a)*r;
   if(gy){y=y*(1+Math.abs(g)*.28)+gy*.20; x*=1-Math.abs(g)*.13;
    x+=.065*Math.sin(a*4-t*2)*Math.abs(g);y+=gy*.22*Math.pow(Math.abs(Math.cos(a)),2);}
   if(gx){const bend=gx*.6;const xx=x;x=xx*Math.cos(bend)-y*Math.sin(bend)+gx*.19;
    y=xx*Math.sin(bend)+y*Math.cos(bend);x+=gx*.21*Math.sin(a)*Math.sin(a);}
   if(q>.84){x*=1+(q-.84)*1.1;y*=1+(q-.84)*1.1;alpha*=.38;}
  }else{
   const r=.70+thick+.022*Math.sin(a*3-t*.8)+.012*Math.sin(a*5+t*1.2);x=Math.cos(a)*r;y=Math.sin(a)*r;
   const cycle=ease((1-Math.cos(t*1.15))/2);
   switch(key){
    case 'LANE LEFT':case 'LANE RIGHT':{const dir=key==='LANE LEFT'?-1:1;x=x*.52+dir*.4*(2*cycle-1);y*=.85;break;}
    case 'FOLLOW':x*=.50;y=y*.38+(q<.5?-.38:.38);break;
    case 'AVOID':x=Math.cos(a)*(.36+.35*Math.abs(Math.sin(a)))+thick;y=Math.sin(a)*.9;break;
    case 'YIELD':x=x*.38+Math.sign(x)*.40;y*=.66;break;
    case 'WAIT':x*=.8;y*=.8;alpha*=.7+.3*Math.pow(Math.sin(t*.7),2);break;
    case 'MERGE':x=x*.35+(q<.5?-1:1)*.42*(1-cycle);y*=1.05;break;
    case 'REVERSE':x*=.55;y=y*.75+.28*load;break;
    case 'PARK':x=Math.sign(x)*Math.pow(Math.abs(x),.35)*.67;y=Math.sign(y)*Math.pow(Math.abs(y),.35)*.85;break;
    case 'BUMPY':{const ripple=(.06+.12*strength)*(Math.sin(a*3-t*4.2)+.5*Math.sin(a*7+t*6.1)+.3*Math.cos(a*11-t*3));
    x=Math.cos(a)*(r+ripple);y=Math.sin(a)*(r+ripple*.8)+.055*strength*Math.sin(t*9+a*2);break;}
    case 'REROUTE':{const angle=cycle*Math.PI*.5,xx=x*.55;x=xx*Math.cos(angle)-y*Math.sin(angle);y=xx*Math.sin(angle)+y*Math.cos(angle);break;}
    case 'CONFIRM':x*=.65+.4*cycle;y*=.65+.4*cycle;alpha*=1-.6*cycle;break;
   }
  }
  // Fine orbiting dust adds depth without changing the readable silhouette.
  if(p.z>.91){const drift=(p.z-.91)*1.7;
   x+=Math.cos(a*2+t*.7)*drift;y+=Math.sin(a*2+t*.7)*drift;
   alpha*=.42;
  }
  const tx=cx+x*size,ty=cy+y*size,px=p.x,py=p.y;
  p.x=p.fromX&&morph<1?p.fromX+(tx-p.fromX)*morph:tx;p.y=p.fromY&&morph<1?p.fromY+(ty-p.fromY)*morph:ty;
  if(dt&&px&&Math.hypot(p.x-px,p.y-py)<25){ctx.strokeStyle=`rgba(${rgb},${alpha*.36})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(px-(p.x-px)*2,py-(p.y-py)*2);ctx.lineTo(p.x,p.y);ctx.stroke();}
  ctx.fillStyle=`rgba(${rgb},${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,.4+p.z*.8,0,Math.PI*2);ctx.fill();
  if(p.z>.955){
   const halo=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,7);
   halo.addColorStop(0,`rgba(${rgb},${alpha*.6})`);halo.addColorStop(1,'rgba(100,150,255,0)');
   ctx.fillStyle=halo;ctx.fillRect(p.x-7,p.y-7,14,14);
  }
 }
 // Silken, broken contour ribbons reinforce the flowing particle surface.
 if(inertial||key==='BUMPY')for(let ribbon=0;ribbon<3;ribbon++){
  ctx.beginPath();for(let j=0;j<=110;j++){const a=j/110*Math.PI*1.65+t*.13+ribbon*2.1;
   let rr=.70+ribbon*.014+.025*Math.sin(a*3-t*.8);
   if(key==='BUMPY')rr+=(.06+.12*strength)*(Math.sin(a*3-t*4.2)+.5*Math.sin(a*7+t*6.1)+.3*Math.cos(a*11-t*3));
   let xx=Math.cos(a)*rr,yy=Math.sin(a)*rr;
   if(inertial){if(gy){yy=yy*(1+Math.abs(g)*.28)+gy*.20+gy*.22*Math.cos(a)**2;xx*=1-Math.abs(g)*.13;}
    if(gx){let ox=xx;xx=ox*Math.cos(gx*.6)-yy*Math.sin(gx*.6)+gx*.19+gx*.21*Math.sin(a)**2;yy=ox*Math.sin(gx*.6)+yy*Math.cos(gx*.6);}}
   const X=cx+xx*size,Y=cy+yy*size;if(j===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);
  }ctx.strokeStyle=`rgba(${rgb},${.10-ribbon*.025})`;ctx.lineWidth=.8;ctx.stroke();
 }
 if(key==='ARRIVED')for(let k=0;k<2;k++){const v=(t-k*.65)%4;if(v>=0&&v<1.8){const u=v/1.8;ctx.strokeStyle=`rgba(${rgb},${.7*(1-u)})`;ctx.lineWidth=1.8*(1-u)+.3;ctx.beginPath();ctx.arc(cx,cy,size*(.9+.27*ease(u)),0,Math.PI*2);ctx.stroke();}}
 ctx.globalCompositeOperation='source-over';
 }
 function starKey(key){return ['STANDBY','START','ARRIVED'].includes(key);}
 function resize(){const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles.forEach(p=>p.x=0);draw(0);}
 function updatePause(){pause.textContent=paused?'播放动效 ↗':'暂停动效 Ⅱ';pause.setAttribute('aria-pressed',String(paused));status.textContent=paused?'已暂停':'实时演绎';}
 pause.addEventListener('click',()=>{paused=!paused;last=0;updatePause();if(paused){cancelAnimationFrame(raf);raf=0;}else schedule();});
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(raf);raf=0;last=0;}else schedule();},{threshold:.05}).observe(root);
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else schedule();});
 updatePause();resize();select(0);
})();
