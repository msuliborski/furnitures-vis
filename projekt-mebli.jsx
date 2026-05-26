import { useState, useEffect, useLayoutEffect, useRef } from "react";

const STORAGE_KEY = "projekt-mebli.v1";

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const d = JSON.parse(raw);
    return d && typeof d === "object" ? d : {};
  } catch {
    return {};
  }
}

function writePatch(patch) {
  try {
    const cur = readState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cur, ...patch }));
  } catch (_) {}
}

function validView(tab, view) {
  if (tab === 0) return view === "front" || view === "side" || view === "both";
  if (tab === 4) return view === "all";
  return view === "front" || view === "side" || view === "top" || view === "all";
}

const T = 25;
const IW1 = 2200 - 2*T;
const dx1 = (f) => Math.round(IW1*f);

// ══ CABINET 1: Regał ══
const REGAL = {
  id:1, name:"Regał na książki", outerW:2200, outerH:2545, depthTop:350, depthBot:600, depth:600, legH:100,
  desc:"Regał na książki z litego drewna. Na szczycie będą rośliny, w środku głównie książki, na dolnej części za drzwiami schowek na gry planszowe i kuwetę kota.",
  material:"Lite drewno — dąb / iglaste fornirowane dębem", back:"Brak",
  // rows: GÓRA → DÓŁ. Suma clearH + 7×T = 2495 = outerH-2T (zachowaj przy zmianach!)
  rows:[
    {clearH:200,dividers:[dx1(1/3),dx1(5/6)]},            // rząd 0 — 200mm (góra)
    {clearH:200,dividers:[dx1(1/6),dx1(2/3)]},            // rząd 1 — 200mm
    {clearH:300,dividers:[dx1(1/3),dx1(5/6)]},            // rząd 2 — 300mm
    {clearH:300,dividers:[dx1(1/6),dx1(2/3)]},            // rząd 3 — 300mm
    {clearH:350,dividers:[dx1(1/3),dx1(5/6)]},            // rząd 4 — 350mm
    {clearH:350,dividers:[dx1(1/2),dx1(5/6)],partialShelfAbove:true}, // rząd 5 — 350mm, niepełna półka nad (do 5/6)
    {clearH:310,dividers:[dx1(1/3),dx1(2/3)],isCabinet:true}, // rząd 6 — 310mm SZAFKA (górna część za drzwiami)
    {clearH:310,dividers:[dx1(1/3),dx1(2/3)],isCabinet:true}, // rząd 7 — 310mm SZAFKA (dolna część za drzwiami)
  ],
  partialShelfEnd:dx1(5/6), cabShelfFrac:2/3,
  doors:[
    {fromFrac:0,toFrac:1/3,handleSide:"right",opensDir:"left"},
    {fromFrac:1/3,toFrac:2/3,handleSide:"right",opensDir:"left"},
    {fromFrac:2/3,toFrac:1,handleSide:"left",opensDir:"right"},
  ],
  specs:[["Materiał","Lite drewno dębowe / tańsze drewno + fornir dębowy"],["Grubość",`${T}mm`],["Plecy","Brak"],
    ["Głęb. góra","350mm"],["Głęb. dół","600mm"],["Nóżki","100mm"],
    ["Szafki","3× drzwiczki, P bez półki"],["Półki","6 otwartych + 2 za drzwiami"]],
};

// ══ CABINET 2: Szafa garderobiana A ══
// 2760×2910×500, 5 segments each 20%
const W2=2760, H2=2910, D2=500;
const IW2=W2-2*T; // 2710
const N_DIV=3; // 3 full-height dividers (between seg 1-2, 2-3, 3-4)
const SEG=Math.round((IW2-N_DIV*T)/5); // ~527mm

const SZAFA = {
  id:2, name:"Szafa w korytarzu", outerW:W2, outerH:H2, depth:D2, legH:0,
  desc:"Duża szafa na korytarzu schowana częściowo we wnęce. Wykonana ze standardowej deski meblowej, biała, opcjonalnie z frontami ozdobionymi szlifem. W środku duże górne półki, wieszaki na ubrania, na dole w każdym segmencie szuflady.",
  segW:SEG, innerW:IW2,
  specs:[["Materiał","Płyta meblowa biała"],["Grubość",`${T}mm`],["Plecy","HDF 3mm"],
    ["Głębokość",`${D2}mm`],["Segmenty",`5 × ~${SEG}mm`],
    ["Seg. 1","Szuflada 60cm + przestrzeń z drzwiami + przestrzeń z drzwiami (półka dzieląca) 66cm"],
    ["Seg. 2","2× szuflada 30cm + przestrzeń z drzwiami (4 półki dzielące) + góra drzwi 66cm"],
    ["Seg. 3","2× szuflada 30cm + przestrzeń z drzwiami (półka dzieląca i wieszak) + przestrzeń z drzwiami 66cm"],
    ["Seg. 4+5","2× szeroka szuflada 30cm + przestrzeń z drzwiami (półka dzieląca i wieszak) + przestrzeń z drzwiami (półka dzieląca) 66cm"]],
};

// ══ CABINET 3: Szafka łazienkowa ══
const W3=790, H3=2480, D3=440;
const IW3=W3-2*T; // 740
const ID3=D3-2*T; // 390
const LAZIENKA = {
  id:3, name:"Szafka łazienkowa", outerW:W3, outerH:H3, depth:D3, legH:0,
  desc:"Szafka łazienkowa zakrywająca młynek. W wyższych partiach półki na papier toaletowy, akcesoria umywalkowe oraz chemię i mniej przydatne na co dzień rzeczy. Znajduje się w rogu łazienki w dość trudno dostępnym miejscu między geberitem a umywalką.",
  material:"Płyta MDF, fornir drewniany ciemny brąz", back:"HDF 3mm",
  // Front (790mm): 0-700 magnet doors, 700-1000 open shelf, 1000-1400 wall, 1400-2480 door+4 shelves
  // Side (440mm): 0-1000 wall, 1000-1400 open shelf, 1400-2480 wall
  specs:[["Materiał","Płyta MDF, fornir ciemny brąz"],["Grubość",`${T}mm`],
    ["Plecy","HDF 3mm"],["Wymiary",`${W3}×${H3}×${D3}mm`],
    ["Dostęp","Z dwóch stron (front 790mm + bok 440mm)"],
    ["0–750mm","Młynek od toalety, drzwiczki na magnesy (zdejmowane)"],
    ["750–1000mm","Otwarta półka (front 790mm)"],
    ["1000–1400mm","Otwarta półka (bok 440mm)"],
    ["1400–2480mm","Drzwi otwierane w lewo, 4 półki"],
    ["Geberit","170mm szer., 1220mm wys. (z lewej)"],
    ["Półki boczne","Prawy bok, powyżej 1m, otwarte"],
    ["Lampa","ø150mm, ściana, środek 1830mm"]],
};

// ══ CABINET 4: Szafka na buty ══
// Bottom (0-1200): trapezoid 680×530×250 (front=680, back=530, depth=250, left-offset=150)
// Top (1200-2000): column 530×180 glued to back + right edge
// Countertop (blat) at 1200mm
const W4F=680, W4B=530, D4=250, H4=2000;
const BLAT_H=1200;
const TOP_W=530, TOP_D=180;
const BUTY = {
  id:4, name:"Szafka na buty (przedpokój)", outerW:W4F, outerH:H4, depth:D4, frontW:W4F, backW:W4B, legH:0,
  desc:"Szafka na buty stojąca tuż przy wejściu, przy dość krzywej i nieregularnej ścianie. Ma zakryte półki na buty, blat oraz otwarte i zakryte półki w górnej kolumnie.",
  offset: W4F-W4B, // 150mm — left side angle offset
  blatH: BLAT_H, topW: TOP_W, topD: TOP_D,
  specs:[["Materiał","Płyta meblowa biała, czerwone akcenty"],["Grubość",`${T}mm`],
    ["Front (dół)",`${W4F}mm`],["Tył (dół)",`${W4B}mm`],["Głębokość dolna",`${D4}mm`],
    ["Wysokość",`${H4}mm`],["Blat",`na ${BLAT_H}mm`],
    ["Kolumna górna",`${TOP_W}×${TOP_D}mm (do tyłu + prawo)`],
    ["Dół","Drzwi dwuskrzydłowe (gałki w środku) + 3 półki"],
    ["Góra","2× półka otwarta (200mm) + drzwi + 1 półka"]],
};

// ══ SECTION 5: Małe półki do wnęki kuchennej ══
const WNEKA = {
  id:5, name:"Małe półki do wnęki kuchennej",
  outerW:null, outerH:null, depth:18, legH:0,
  dims:"5 elementów · grubość 18mm",
  desc:"Półki i maskownice do wnęki kuchennej — dodają podłogę, półki lub zakrywają ścianę. Montaż utrudniony ze względu na wąską przestrzeń i nieregularne ściany, lecz możliwe umocowanie przy istniejących szafkach wiszących.",
  specs:[
    ["Materiał","Płyta meblowa biała, oklejona ABS (standard meblowy 18mm)"],
    ["Grubość","18mm"],
    ["Ilość","5 szt."],
    ["Wnęka dolna — podłoga",      "trapez prostokątny 600×100/75mm"],
    ["Wnęka górna — półka dół",    "trapez prostokątny 600×130/110mm"],
    ["Wnęka górna — półka środek", "trapez prostokątny 600×130/110mm"],
    ["Wnęka górna — półka góra",   "trapez prostokątny 600×130/110mm"],
    ["Wnęka górna — plecy",        "prostokąt 1200×110mm"],
  ],
};

// ══ SHARED ══
const Dim = ({x1,y1,x2,y2,label,offset=0,side="right",color="#c8a050",fontSize=10}) => {
  const isV=Math.abs(x1-x2)<1;
  if(isV){const ox=side==="right"?offset:-offset;return(<g>
    <line x1={x1+ox} y1={y1} x2={x2+ox} y2={y2} stroke={color} strokeWidth={0.6}/>
    <line x1={x1+ox-3} y1={y1} x2={x1+ox+3} y2={y1} stroke={color} strokeWidth={0.6}/>
    <line x1={x2+ox-3} y1={y2} x2={x2+ox+3} y2={y2} stroke={color} strokeWidth={0.6}/>
    <line x1={x1} y1={y1} x2={x1+ox*.85} y2={y1} stroke={color} strokeWidth={.3} strokeDasharray="2,2"/>
    <line x1={x2} y1={y2} x2={x2+ox*.85} y2={y2} stroke={color} strokeWidth={.3} strokeDasharray="2,2"/>
    <text x={x1+ox+(side==="right"?5:-5)} y={(y1+y2)/2} fill={color} fontSize={fontSize} fontFamily="'DM Mono',monospace" dominantBaseline="middle" textAnchor={side==="right"?"start":"end"}>{label}</text>
  </g>);}
  const oy=side==="bottom"?offset:-offset;return(<g>
    <line x1={x1} y1={y1+oy} x2={x2} y2={y2+oy} stroke={color} strokeWidth={0.6}/>
    <line x1={x1} y1={y1+oy-3} x2={x1} y2={y1+oy+3} stroke={color} strokeWidth={0.6}/>
    <line x1={x2} y1={y2+oy-3} x2={x2} y2={y2+oy+3} stroke={color} strokeWidth={0.6}/>
    <line x1={x1} y1={y1} x2={x1} y2={y1+oy*.85} stroke={color} strokeWidth={.3} strokeDasharray="2,2"/>
    <line x1={x2} y1={y2} x2={x2} y2={y2+oy*.85} stroke={color} strokeWidth={.3} strokeDasharray="2,2"/>
    <text x={(x1+x2)/2} y={y1+oy+(side==="bottom"?13:-5)} fill={color} fontSize={fontSize} fontFamily="'DM Mono',monospace" textAnchor="middle">{label}</text>
  </g>);
};
const MatRow = ({label,value}) => (
  <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:5}}>
    <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:"#6a6a5e",textTransform:"uppercase",letterSpacing:1,minWidth:100}}>{label}</span>
    <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#d0cabb"}}>{value}</span>
  </div>
);

// ══ SHARED ANIMATED DOOR (module-level for stable identity / working transitions) ══
// ov = nakładka na ścianki/półki (px); hinge transformOrigin zostaje na oryginalnej krawędzi
const AnimDoor = ({x,y,w,h,hx,hy,open,r=1.8,ov=1}) => {
  const hingeLeft = hx > x + w/2;
  const ox2 = hingeLeft ? x : x+w;
  const tr = open ? "scaleX(0.08)" : "scaleX(1)";
  const st = {transformOrigin:`${ox2}px ${hy}px`, transform:tr, transition:"transform .6s cubic-bezier(.4,.0,.2,1)"};
  return <g style={st}><rect x={x-ov} y={y-ov} width={w+2*ov} height={h+2*ov} fill="rgba(75,70,60,.35)" stroke="#b0a080" strokeWidth={.7} rx={1}/><circle cx={hx} cy={hy} r={r} fill="#c8b888"/></g>;
};

// ══ SHARED ANIMATED DRAWER (subtle pull-out when open) ══
// ov = nakładka na ścianki/półki (px)
const AnimDrw = ({x,y,w,h,open,maxTranslate,ov=1}) => {
  const cx = x+w/2, cy = y+h/2;
  const dy = maxTranslate !== undefined ? Math.min(h*0.15, maxTranslate) : h*0.15;
  const tr = open ? `translate(0px, ${dy}px) scale(1.06)` : "translate(0,0) scale(1)";
  const st = {transformOrigin:`${cx}px ${cy}px`, transform:tr, transition:"transform .55s cubic-bezier(.4,.0,.2,1)"};
  return <g style={st}><rect x={x-ov} y={y-ov} width={w+2*ov} height={h+2*ov} fill="rgba(80,75,65,.35)" stroke="#9a9080" strokeWidth={.6} rx={1}/><circle cx={cx} cy={cy} r={1.8} fill="#c8b888"/></g>;
};

// ══ REGAL VIEWS ══
const RegalFront = ({doorsOpen,onToggle}) => {
  const S=.12,C=REGAL,sw=C.outerW*S,sh=C.outerH*S,t=T*S;
  const ox=60,oy=48,legH=C.legH*S,bodyTop=oy,bodyBot=oy+sh;
  const innerL=ox+t,innerR=ox+sw-t;
  let cursor=bodyTop+t; const rects=[];
  for(let i=0;i<C.rows.length;i++){const rh=C.rows[i].clearH*S;rects.push({top:cursor,bot:cursor+rh,...C.rows[i]});if(i<C.rows.length-1)cursor+=rh+t;}
  const cabRows=rects.filter(r=>r.isCabinet);
  const cabTopY=cabRows[0]?.top||bodyBot,cabBotY=cabRows[cabRows.length-1]?.bot||bodyBot;
  return(<svg viewBox={`-20 -5 ${sw+160} ${oy+sh+legH+68}`} width="100%" style={{maxWidth:620}}>
    {[ox+18,ox+sw-28].map((lx,i)=><rect key={i} x={lx} y={bodyBot} width={10} height={legH} fill="#5a5248" stroke="#888078" strokeWidth={.5} rx={1}/>)}
    <rect x={ox} y={bodyTop} width={sw} height={sh} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2} rx={1}/>
    {/* Dashed guide lines at unique divider positions, labeled above cabinet */}
    {(()=>{const allDxs=new Set();C.rows.forEach(r=>r.dividers.forEach(dx=>allDxs.add(dx)));const fracMap=[[1/6,"1/6"],[1/3,"1/3"],[1/2,"1/2"],[2/3,"2/3"],[5/6,"5/6"]];return[...allDxs].sort((a,b)=>a-b).map((dxP,i)=>{const x=innerL+dxP*S;const frac=dxP/IW1;const label=(fracMap.find(([v])=>Math.abs(v-frac)<.02)||[])[1]||"";return(<g key={`gl${i}`}><line x1={x} y1={bodyTop+t} x2={x} y2={bodyBot-t} stroke="#c8a050" strokeWidth={.5} strokeDasharray="3,4" opacity={.3}/>{label&&<text x={x} y={bodyTop-7} fill="#c8a050" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.7}>{label}</text>}</g>);});})()}
    <rect x={ox} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox+sw-t} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={bodyTop} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={bodyBot-t} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    {rects.map((r,i)=>{if(i>=C.rows.length-1)return null;const sy=r.bot,nr=C.rows[i+1];
      if(nr.partialShelfAbove)return <rect key={`s${i}`} x={innerL} y={sy} width={C.partialShelfEnd*S} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>;
      if(!r.isCabinet&&nr.isCabinet)return <rect key={`s${i}`} x={innerL} y={sy} width={innerR-innerL} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.6}/>;
      if(r.isCabinet&&nr.isCabinet){const sw2=dx1(C.cabShelfFrac)*S;return <rect key={`s${i}`} x={innerL} y={sy} width={sw2} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4} opacity={doorsOpen?1:.3}/>;}
      return <rect key={`s${i}`} x={innerL} y={sy} width={innerR-innerL} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>;
    })}
    {rects.filter(r=>!r.isCabinet).map((r,ri)=>(<g key={`d${ri}`}>{r.dividers.map((dxP,di)=>{
      const dvx=innerL+dxP*S;let dBot2=r.bot;if(ri===4&&dxP===dx1(5/6)){const r6=rects[5];if(r6)dBot2=r6.bot;}
      return <rect key={di} x={dvx-t/2} y={r.top} width={t} height={dBot2-r.top} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>;
    })}</g>))}
    {C.doors.map((door,di)=>{const dL=innerL+Math.round(IW1*door.fromFrac)*S,dR=innerL+Math.round(IW1*door.toFrac)*S,dW=dR-dL;
      const hx=door.handleSide==="right"?dR-12:dL+12,hy=(cabTopY+cabBotY)/2;
      const originX=door.opensDir==="left"?dL:dR;
      const tr=doorsOpen?"scaleX(0.08)":"scaleX(1)";
      const st={transformOrigin:`${originX}px ${hy}px`,transform:tr,transition:"transform .6s cubic-bezier(.4,.0,.2,1)"};
      return <g key={`dr${di}`} style={st}><rect x={dL+1.5} y={cabTopY+1.5} width={dW-3} height={cabBotY-cabTopY-3} fill="rgba(75,70,60,.45)" stroke="#b0a080" strokeWidth={.8} rx={1}/><circle cx={hx} cy={hy} r={2.5} fill="#c8b888"/></g>;
    })}
    {/* Cabinet-section dividers rendered ON TOP of doors (always visible, dimmed when closed) */}
    {cabRows.map((r,ri)=>(<g key={`cd${ri}`}>{r.dividers.map((dxP,di)=>{const dvx=innerL+dxP*S;
      return <g key={di} style={{opacity:doorsOpen?1:.35,transition:"opacity .6s ease"}}><rect x={dvx-t/2} y={r.top} width={t} height={r.bot-r.top} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/></g>;
    })}</g>))}
    <rect x={innerL} y={cabTopY} width={innerR-innerL} height={cabBotY-cabTopY} fill="transparent" style={{cursor:"pointer"}} onClick={onToggle}/>
    {rects.map((r,i)=><Dim key={`rd${i}`} x1={ox+sw} y1={r.top} x2={ox+sw} y2={r.bot} label={`${r.clearH}`} offset={20} side="right" color={r.isCabinet?"#8a7a60":"#7a7a70"} fontSize={8}/>)}
    <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${C.outerH}`} offset={46} side="left" fontSize={9}/>
    <Dim x1={ox} y1={cabTopY} x2={ox} y2={cabBotY} label="645" offset={28} side="left" color="#7a7a70" fontSize={7}/>
    <Dim x1={ox} y1={bodyBot} x2={ox} y2={bodyBot+legH} label={`${C.legH}`} offset={24} side="left" color="#7a7a70" fontSize={8}/>
    <Dim x1={ox} y1={bodyBot} x2={ox+sw} y2={bodyBot} label={`${C.outerW}`} offset={legH+32} side="bottom"/>
    <Dim x1={innerL} y1={bodyBot} x2={innerR} y2={bodyBot} label={`${IW1}`} offset={legH+48} side="bottom" color="#7a7a70" fontSize={7}/>
    <text x={ox+sw/2} y={bodyTop-22} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z PRZODU</text>
  </svg>);
};
const RegalSide = () => {
  const S=.12,C=REGAL,sh=C.outerH*S,dTop=C.depthTop*S,dBot=C.depthBot*S,t=T*S,legH=C.legH*S;
  const ox=35,oy=50,bodyTop=oy,bodyBot=oy+sh;
  let cursor=bodyTop+t,cabDivY=bodyBot;const shelfYs=[];
  for(let i=0;i<REGAL.rows.length;i++){cursor+=REGAL.rows[i].clearH*S;if(i<REGAL.rows.length-1){if(!REGAL.rows[i].isCabinet&&REGAL.rows[i+1].isCabinet)cabDivY=cursor;if(!REGAL.rows[i+1].isCabinet&&!REGAL.rows[i].isCabinet&&i<5)shelfYs.push(cursor);cursor+=t;}}
  return(<svg viewBox={`-25 -10 ${dBot+115} ${oy+sh+legH+55}`} width="100%" style={{maxWidth:260}}>
    {[ox+5,ox+dBot-15].map((lx,i)=><rect key={i} x={lx} y={bodyBot} width={8} height={legH} fill="#5a5248" stroke="#888078" strokeWidth={.5} rx={1}/>)}
    <rect x={ox} y={cabDivY} width={dBot} height={bodyBot-cabDivY} fill="#2e2c28" stroke="#9a9080" strokeWidth={1} rx={1}/>
    <rect x={ox} y={bodyTop} width={dTop} height={cabDivY-bodyTop} fill="#2e2c28" stroke="#9a9080" strokeWidth={1} rx={1}/>
    <line x1={ox+dTop} y1={cabDivY} x2={ox+dBot} y2={cabDivY} stroke="#9a9080" strokeWidth={.8}/>
    <rect x={ox} y={bodyTop} width={dTop} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={bodyBot-t} width={dBot} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={cabDivY} width={dBot} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.5}/>
    {shelfYs.map((sy,i)=><rect key={i} x={ox} y={sy} width={dTop-1} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.3}/>)}
    <rect x={ox} y={(cabDivY+t+bodyBot-t)/2-t/2} width={dBot-1} height={t} fill="#353330" stroke="#9a9080" strokeWidth={.3}/>
    {/* Back panel on bottom section */}
    <rect x={ox+dBot-2} y={cabDivY} width={2} height={bodyBot-cabDivY} fill="#454540" stroke="#9a9080" strokeWidth={.3}/>
    <text x={ox-4} y={(cabDivY+bodyBot)/2} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="end" dominantBaseline="middle" opacity={.5}>plecy HDF 3mm</text>
    <text x={ox-4} y={bodyTop+40} fill="#9a9080" fontSize={7} fontFamily="'DM Mono',monospace" textAnchor="end" opacity={.6}>bez pleców</text>
    <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${REGAL.outerH}`} offset={38} side="left"/>
    <Dim x1={ox} y1={cabDivY} x2={ox} y2={bodyBot-t} label="645" offset={22} side="left" color="#7a7a70" fontSize={7}/>
    <Dim x1={ox} y1={bodyTop} x2={ox+dTop} y2={bodyTop} label={`${REGAL.depthTop}`} offset={18} side="top" fontSize={8}/>
    <Dim x1={ox} y1={bodyBot} x2={ox+dBot} y2={bodyBot} label={`${REGAL.depthBot}`} offset={legH+20} side="bottom" fontSize={8}/>
    <Dim x1={ox+dBot} y1={bodyBot} x2={ox+dBot} y2={bodyBot+legH} label="100" offset={12} side="right" color="#7a7a70" fontSize={7}/>
    <text x={ox+dBot/2} y={bodyTop-36} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z BOKU</text>
  </svg>);
};

// ══════════════════════════════════
// SZAFA A FRONT VIEW — full redraw
// ══════════════════════════════════
const SzafaFront = ({doorsOpen,onToggle}) => {
  const S=.09;
  const sw=W2*S, sh=H2*S, t=T*S;
  const ox=55, oy=48;
  const bodyTop=oy, bodyBot=oy+sh;
  const innerL=ox+t, innerR=ox+sw-t;

  // floor→SVG y converter
  const fy=(floorMm)=> bodyBot - t - (floorMm-T)*S; // floorMm from actual floor, T=bottom board

  // Key horizontal lines (SVG y)
  const y2200=fy(2200); // main divider shelf
  const yMainTop=y2200-t; // above 2200 shelf = below main section
  const yFloor=bodyBot-t; // inner bottom

  // Segment x positions (left edges of inner segments)
  const segXs=[];
  let cx=innerL;
  for(let i=0;i<5;i++){segXs.push(cx); cx+=SEG*S; if(i<3)cx+=t;} // dividers between 0-1,1-2,2-3 only
  segXs.push(innerR); // right edge

  // Seg 4+5 combined left edge = segXs[3], right edge = innerR
  const seg45L=segXs[3], seg45R=innerR, seg45W=seg45R-seg45L;
  const seg45Mid=seg45L+seg45W/2; // split point in top section

  // Helper: shelf line
  const Shelf=({x,y,w,op=1})=><rect x={x} y={y} width={w} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4} opacity={op}/>;
  // Helper: drawer — use AnimDrw directly at call sites
  // Helper: rod
  const Rod=({x,y,w})=><g><line x1={x+6} y1={y} x2={x+w-6} y2={y} stroke="#aa9870" strokeWidth={1.2} strokeLinecap="round"/><circle cx={x+6} cy={y} r={1.5} fill="none" stroke="#aa9870" strokeWidth={.6}/><circle cx={x+w-6} cy={y} r={1.5} fill="none" stroke="#aa9870" strokeWidth={.6}/></g>;
  const Door = AnimDoor;

  const segW=SEG*S; // pixel width of one segment

  return(
    <svg viewBox={`-30 -5 ${sw+220} ${oy+sh+70}`} width="100%" style={{maxWidth:720}}>
      {/* Body */}
      <rect x={ox} y={bodyTop} width={sw} height={sh} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2} rx={1}/>
      <rect x={ox} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox+sw-t} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={bodyTop} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={bodyBot-t} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Back */}
      <rect x={innerL} y={bodyTop+t} width={innerR-innerL} height={1} fill="#454540" strokeWidth={0}/>

      {/* Full-width shelf at 2200 */}
      <Shelf x={innerL} y={y2200} w={innerR-innerL}/>

      {/* 3 full-height dividers (between seg 1-2, 2-3, 3-4); seg2-3 divider only below 2200 */}
      {[0,1,2].map(i=>{const dvx=segXs[i+1]; const dvTop=i===1?y2200+t:bodyTop+t; return <rect key={i} x={dvx} y={dvTop} width={t} height={bodyBot-t-dvTop} fill="#3d3b34" stroke="#9a9080" strokeWidth={.5}/>;
      })}

      {/* Partial divider between seg4+5 (only top section: above 2200) */}
      <rect x={seg45Mid-t/2} y={bodyTop+t} width={t} height={y2200-bodyTop-t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>

      {/* ═══ SEGMENT 1 ═══ */}
      {(()=>{
        const L=segXs[0], R=segXs[1], w=R-L;
        const yDrwTop=fy(600);
        const yShelf60=fy(600);
        const yTopMid=fy(Math.round((2200+H2-T)/2)); // shelf halfway in top section
        return <g>
          {/* Drawer 0-600 — maxTranslate ogranicza wysunięcie do 300mm-drawer (h*0.15 byłoby 2x za duże) */}
          <AnimDrw x={L} y={yDrwTop} w={w} h={yFloor-yDrwTop} open={doorsOpen} maxTranslate={300*S*0.15}/>
          {/* Shelf above drawer */}
          <Shelf x={L} y={yShelf60} w={w}/>
          {/* Door 600-2200 */}
          <Door x={L} y={y2200+t} w={w} h={yDrwTop-y2200-t} hx={L+w-10} hy={(y2200+t+yDrwTop)/2} open={doorsOpen}/>
          {/* Top shelf (mid) */}
          <Shelf x={L} y={yTopMid} w={w} op={doorsOpen?1:.3}/>
          {/* Top door (2200-top) */}
          <Door x={L} y={bodyTop+t} w={w} h={y2200-bodyTop-t} hx={L+w-10} hy={(bodyTop+t+y2200)/2} open={doorsOpen}/>
        </g>;
      })()}

      {/* ═══ SEGMENT 2 ═══ */}
      {(()=>{
        const L=segXs[1]+t, R=segXs[2], w=R-L;
        const yD1=fy(300), yD2=fy(600);
        const yShelf60=fy(600);
        // Even shelves: 938, 1275, 1613, 1950 (337.5mm apart from 600)
        const shY=[938,1275,1613,1950].map(h=>fy(h));
        return <g>
          <AnimDrw x={L} y={yD1} w={w} h={yFloor-yD1} open={doorsOpen}/>
          <AnimDrw x={L} y={yD2} w={w} h={yD1-yD2} open={doorsOpen}/>
          <Shelf x={L} y={yShelf60} w={w}/>
          {shY.map((sy,i)=><Shelf key={i} x={L} y={sy} w={w}/>)}
          {/* Main door 600-2200 opening left */}
          <Door x={L} y={y2200+t} w={w} h={yShelf60-y2200-t} hx={L+w-10} hy={(y2200+t+yShelf60)/2} open={doorsOpen}/>
          {/* Top door */}
          <Door x={L} y={bodyTop+t} w={w} h={y2200-bodyTop-t} hx={L+w-10} hy={(bodyTop+t+y2200)/2} open={doorsOpen}/>
        </g>;
      })()}

      {/* ═══ SEGMENT 3 ═══ */}
      {(()=>{
        const L=segXs[2]+t, R=segXs[3], w=R-L;
        const yD1=fy(300), yD2=fy(600);
        const yShelf60=fy(600);
        const yRod=fy(1900), yShelf=fy(1950);
        return <g>
          <AnimDrw x={L} y={yD1} w={w} h={yFloor-yD1} open={doorsOpen}/>
          <AnimDrw x={L} y={yD2} w={w} h={yD1-yD2} open={doorsOpen}/>
          <Shelf x={L} y={yShelf60} w={w}/>
          <Rod x={L} y={yRod} w={w}/>
          <Shelf x={L} y={yShelf} w={w}/>
          {/* Main door 600-2200 opening right */}
          <Door x={L} y={y2200+t} w={w} h={yShelf60-y2200-t} hx={L+10} hy={(y2200+t+yShelf60)/2} open={doorsOpen}/>
          {/* Top door — opening RIGHT */}
          <Door x={L} y={bodyTop+t} w={w} h={y2200-bodyTop-t} hx={L+10} hy={(bodyTop+t+y2200)/2} open={doorsOpen}/>
          <Dim x1={ox+sw} y1={yRod} x2={ox+sw} y2={yFloor+t} label="↑1900" offset={40} side="right" color="#8a7a60" fontSize={6}/>
        </g>;
      })()}

      {/* ═══ SEGMENTS 4+5 (combined lower) ═══ */}
      {(()=>{
        const L=seg45L, R=seg45R, w=seg45W;
        const yD1=fy(300), yD2=fy(600); // 2 szuflady jak w seg 2 i 3
        const yRod=fy(1900), yShelf=fy(1950);
        const halfW=(w-t)/2;
        const yTopMid=fy(Math.round((2200+H2-T)/2)); // mid-top shelf
        return <g>
          {/* Lower section: 2 drawers (0-300, 300-600) + shelf at 600 */}
          <AnimDrw x={L} y={yD1} w={w} h={yFloor-yD1} open={doorsOpen}/>
          <AnimDrw x={L} y={yD2} w={w} h={yD1-yD2} open={doorsOpen}/>
          <Shelf x={L} y={yD2} w={w}/>
          <Rod x={L} y={yRod} w={w}/>
          <Shelf x={L} y={yShelf} w={w}/>
          {/* Main doors (pair) covering 600-2200, drawers below */}
          <Door x={L} y={y2200+t} w={w/2} h={yD2-y2200-t} hx={L+w/2-10} hy={(y2200+t+yD2)/2} open={doorsOpen}/>
          <Door x={L+w/2} y={y2200+t} w={w/2} h={yD2-y2200-t} hx={L+w/2+10} hy={(y2200+t+yD2)/2} open={doorsOpen}/>
          {/* Top mid-shelf in each half */}
          <Shelf x={L} y={yTopMid} w={halfW} op={doorsOpen?1:.3}/>
          <Shelf x={seg45Mid+t/2} y={yTopMid} w={halfW} op={doorsOpen?1:.3}/>
          {/* Top doors: 2 single doors (one per half) */}
          <Door x={L} y={bodyTop+t} w={halfW} h={y2200-bodyTop-t} hx={seg45Mid-t/2-10} hy={(bodyTop+t+y2200)/2} open={doorsOpen}/>
          <Door x={seg45Mid+t/2} y={bodyTop+t} w={halfW} h={y2200-bodyTop-t} hx={seg45Mid+t/2+10} hy={(bodyTop+t+y2200)/2} open={doorsOpen}/>
        </g>;
      })()}

      {/* Click zone */}
      <rect x={ox} y={bodyTop} width={sw} height={sh} fill="transparent" style={{cursor:"pointer"}} onClick={onToggle}/>

      {/* ═══ DIMENSIONS ═══ */}
      {/* Overall height left */}
      <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${H2}`} offset={42} side="left" fontSize={9}/>
      {/* Height sections left */}
      <Dim x1={ox} y1={y2200} x2={ox} y2={yFloor+t} label="2200" offset={24} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={bodyTop+t} x2={ox} y2={y2200} label={`${H2-2*T-2200}`} offset={24} side="left" color="#7a7a70" fontSize={7}/>
      {/* Width */}
      <Dim x1={ox} y1={bodyBot} x2={ox+sw} y2={bodyBot} label={`${W2}`} offset={18} side="bottom"/>
      {/* Segment widths */}
      {[0,1,2].map(i=><Dim key={`sw${i}`} x1={segXs[i]} y1={bodyBot} x2={segXs[i+1]} y2={bodyBot} label={`${SEG}`} offset={36} side="bottom" color="#7a7a70" fontSize={6}/>)}
      <Dim x1={seg45L} y1={bodyBot} x2={seg45R} y2={bodyBot} label={`${SEG*2}`} offset={36} side="bottom" color="#7a7a70" fontSize={6}/>
      {/* Key heights on right */}
      <Dim x1={ox+sw} y1={bodyTop+t} x2={ox+sw} y2={y2200} label={`${H2-2*T-2200}`} offset={20} side="right" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox+sw} y1={fy(600)} x2={ox+sw} y2={yFloor} label="600" offset={20} side="right" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox+sw} y1={fy(300)} x2={ox+sw} y2={fy(600)} label="300" offset={55} side="right" color="#7a7a70" fontSize={6}/>
      <Dim x1={ox+sw} y1={fy(1950)} x2={ox+sw} y2={fy(2200)} label="250" offset={55} side="right" color="#7a7a70" fontSize={6}/>
      <Dim x1={ox+sw} y1={fy(1900)} x2={ox+sw} y2={fy(1950)} label="50" offset={72} side="right" color="#8a7a60" fontSize={5}/>
      <Dim x1={ox+sw} y1={y2200+t} x2={ox+sw} y2={yFloor} label="2200" offset={85} side="right" color="#7a7a70" fontSize={7}/>

      <text x={ox+sw/2} y={bodyTop-22} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z PRZODU</text>
    </svg>
  );
};

// ══ SZAFA SIDE ══
const SzafaSide = () => {
  const S=.09, sh=H2*S, sd=D2*S, t=T*S;
  const ox=35, oy=50;
  const bodyTop=oy, bodyBot=oy+sh;
  const y2200=bodyBot-t-(2200-T)*S;
  return(<svg viewBox={`-15 -10 ${sd+95} ${oy+sh+50}`} width="100%" style={{maxWidth:200}}>
    <rect x={ox} y={bodyTop} width={sd} height={sh} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2} rx={1}/>
    <rect x={ox} y={bodyTop} width={sd} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={bodyBot-t} width={sd} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={y2200} width={sd} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox+sd-2} y={bodyTop} width={2} height={sh} fill="#454540" stroke="#9a9080" strokeWidth={.3}/>
    <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${H2}`} offset={28} side="left"/>
    <Dim x1={ox} y1={y2200+t} x2={ox} y2={bodyBot-t} label="2200" offset={14} side="left" color="#7a7a70" fontSize={7}/>
    <Dim x1={ox} y1={bodyBot} x2={ox+sd} y2={bodyBot} label={`${D2}`} offset={18} side="bottom" fontSize={8}/>
    <text x={ox+sd/2} y={bodyTop-36} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z BOKU</text>
  </svg>);
};

// ══ SZAFA TOP VIEW ══
const SzafaTop = () => {
  const S=.09, sw=W2*S, sd=D2*S, t=T*S;
  const ox=40, oy=35;
  const innerL=ox+t, innerR=ox+sw-t;
  const segXs=[]; let cx2=innerL;
  for(let i=0;i<5;i++){segXs.push(cx2);cx2+=SEG*S;if(i<3)cx2+=t;}
  const seg45L2=segXs[3], seg45Mid2=seg45L2+(innerR-seg45L2)/2;
  return(<svg viewBox={`-10 -5 ${sw+80} ${sd+90}`} width="100%" style={{maxWidth:500}}>
    <rect x={ox} y={oy} width={sw} height={sd} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2} rx={1}/>
    <rect x={ox} y={oy} width={t} height={sd} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox+sw-t} y={oy} width={t} height={sd} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
    <rect x={ox} y={oy+sd-2} width={sw} height={2} fill="#454540" stroke="#9a9080" strokeWidth={.3}/>
    {[0,1,2].map(i=>{const dvx=segXs[i+1];return <rect key={i} x={dvx} y={oy} width={t} height={sd} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>;})}
    <text x={ox+sw/2} y={oy+7} fill="#9a9080" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.5}>tył (HDF 3mm)</text>
    {["Seg.1","Seg.2","Seg.3"].map((l,i)=><text key={i} x={(segXs[i]+segXs[i+1])/2+t/2} y={oy+sd/2} fill="#9a9080" fontSize={7} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.5}>{l}</text>)}
    <text x={(seg45L2+innerR)/2} y={oy+sd/2} fill="#9a9080" fontSize={7} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.5}>Seg.4+5</text>
    <Dim x1={ox} y1={oy+sd} x2={ox+sw} y2={oy+sd} label={`${W2}`} offset={18} side="bottom"/>
    <Dim x1={ox} y1={oy} x2={ox} y2={oy+sd} label={`${D2}`} offset={28} side="left" fontSize={9}/>
    <text x={ox+sw/2} y={oy-12} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z GÓRY</text>
  </svg>);
};

// ══════════════════════════════════════
// LAZIENKA VIEWS
// ══════════════════════════════════════
const LazienkaFront = ({doorsOpen,onToggle}) => {
  const S=.16;
  const sw=W3*S, sh=H3*S, t=T*S;
  const ox=55, oy=48;
  const bodyTop=oy, bodyBot=oy+sh;
  const innerL=ox+t, innerR=ox+sw-t, innerW=IW3*S;
  const fy=(mm)=> bodyBot - t - mm*S;
  const yFloor=bodyBot-t;

  const y700=fy(750), y1000=fy(1000), y1220=fy(1220);
  const GEB_TOP_MM=1220;              // góra obudowy Geberitu [mm od podłogi] — zmień tu żeby przesunąć granicę
  const TOP_DOOR_BOTTOM_MM=GEB_TOP_MM+10; // dolna krawędź sekcji drzwiowej (10mm nad górą Geberitu)
  const yTopDoorBot=fy(TOP_DOOR_BOTTOM_MM);
  const yWallEnd=yTopDoorBot; // prawa ścianka (półki) kończy się razem z drzwiami
  const SIDE_ACCESS_EXTRA=25*S; // make "dostęp z boku" panel wider by 25mm
  const sideAccessH=TOP_DOOR_BOTTOM_MM-1000; // wysokość strefy „dostęp z boku” (1000 → linia drzwi)
  const yShelfBot=fy(1000-sideAccessH); // dół strefy prawych półek = o sideAccessH niżej niż y1000

  // Geberit: 170mm wide on left, 0-1220mm
  const GEB_W=170*S;
  const gebR=innerL+GEB_W;
  const MAG_GEB_GAP_MM=25; // odstęp między Geberitem a drzwiczkami na magnesy
  const magDoorL=gebR+MAG_GEB_GAP_MM*S;
  const magDoorW=innerR-magDoorL;
  const SHELF_W=200*S; // floating shelves on RIGHT
  const shiftedR=innerR-SHELF_W; // right wall above 1000mm (shifted left)
  const doorL=gebR+30*S, doorR=shiftedR, doorW=doorR-doorL;
  const wallAboveGebR=doorL; // ścianka nad Geberitem rozciąga się do drzwi

  // 4 półki w sekcji drzwiowej: topClear/5 = odstęp. Zmień /5 na inną liczbę lub wpisz fy() ręcznie
  const topClear=H3-2*T-TOP_DOOR_BOTTOM_MM; // = 1200mm (2480-50-1230)
  const shGap=topClear/5; // = 240mm, półki co shGap: fy(1470), fy(1710), fy(1950), fy(2190)
  const topShelfYs=[1,2,3,4].map(i=>fy(TOP_DOOR_BOTTOM_MM+shGap*i));

  // Floating shelves on RIGHT: 1st (top), 4th, 5th (at door-bottom)
  const floatShelfYs=[fy(2190), fy(1470), fy(TOP_DOOR_BOTTOM_MM)];

  const Shelf=({x,y,w,op=1})=><rect x={x} y={y} width={w} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4} opacity={op}/>;
  const Door = AnimDoor;

  const yLamp=fy(1830);
  const lampR=75*S; // 150mm diameter

  return(
    <svg viewBox={`-60 -5 ${sw+420} ${oy+sh+55}`} width="100%" style={{maxWidth:720}}>
      {/* Body background: stepped shape — krok wcięcia przy y1000 */}
      {/* Bottom part: full width 0-1000mm */}
      <rect x={ox} y={y1000} width={sw} height={bodyBot-y1000} fill="#2e2c28" stroke="none"/>
      {/* Upper part: narrower (to shiftedR+t) */}
      <rect x={ox} y={bodyTop} width={shiftedR+t-ox} height={y1000-bodyTop} fill="#2e2c28" stroke="none"/>
      {/* Outline */}
      <path d={`M ${ox} ${bodyBot} V ${bodyTop} H ${shiftedR+t} V ${y1000} H ${ox+sw} V ${bodyBot} Z`} fill="none" stroke="#9a9080" strokeWidth={1.2}/>

      {/* Left wall */}
      <rect x={ox} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Right wall bottom (full width, up to 1000mm) */}
      <rect x={ox+sw-t} y={y1000} width={t} height={bodyBot-y1000} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Right wall upper (shifted left, ends at 1000mm) */}
      <rect x={shiftedR} y={bodyTop} width={t} height={y1000-bodyTop} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Top board (shorter) */}
      <rect x={ox} y={bodyTop} width={shiftedR+t-ox} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Bottom board (full width) */}
      <rect x={ox} y={bodyBot-t} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Full-width shelves at 700, 1000 */}
      <Shelf x={innerL} y={y700} w={innerW}/>
      <Shelf x={innerL} y={y1000} w={innerW}/>


      {/* 4 top shelves behind door */}
      {topShelfYs.map((sy,i)=><Shelf key={i} x={innerL} y={sy} w={doorR-innerL} op={doorsOpen?1:.3}/>)}

      {/* ── Floating shelves on RIGHT above 1000mm (attached to shiftedR wall) ── */}
      {floatShelfYs.map((sy,i)=>(
        <rect key={`fs${i}`} x={shiftedR+t} y={sy} width={SHELF_W-t-2} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.3}/>
      ))}

      {/* Lamp (wall-mounted, ø150mm, center at 1830mm) */}
      <circle cx={shiftedR+t+SHELF_W/2} cy={yLamp} r={lampR} fill="rgba(200,160,80,.08)" stroke="#c8a050" strokeWidth={.5} strokeDasharray="2,2"/>
      <circle cx={shiftedR+t+SHELF_W/2} cy={yLamp} r={2} fill="#c8a050" opacity={.5}/>
      <text x={shiftedR+t+SHELF_W/2} y={yLamp+lampR+7} fill="#c8a050" fontSize={4} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.6}>lampa ø150</text>
      <text x={shiftedR+t+SHELF_W/2} y={yLamp+lampR+13} fill="#c8a050" fontSize={3.5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.4}>↑1830mm</text>

      {/* Left wall above geberit (1220-top) — extends to doorL */}
      <rect x={innerL} y={bodyTop+t} width={wallAboveGebR-innerL} height={yTopDoorBot-bodyTop-t} fill="#33312c" stroke="#9a9080" strokeWidth={.3}/>
      {/* Shelf edges visible through the wall */}
      {topShelfYs.map((sy,i)=><rect key={`se${i}`} x={innerL} y={sy} width={wallAboveGebR-innerL} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.3} opacity={.4}/>)}

      {/* ── BOTTOM 0-700: drzwiczki na magnesy (25mm od Geberitu) — zanikają ── */}
      <text x={magDoorL+magDoorW/2} y={(y700+t+yFloor)/2} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={doorsOpen?.5:0} style={{transition:"opacity .6s ease"}}>młynek od toalety</text>
      <g style={{opacity:doorsOpen?0:1,transition:"opacity .6s ease",pointerEvents:doorsOpen?"none":"auto"}}>
        <rect x={magDoorL} y={y700+t+t} width={magDoorW-t} height={yFloor-y700-t-2*t} fill="rgba(75,70,60,.3)" stroke="#b0a080" strokeWidth={.7} rx={1}/>
        <circle cx={magDoorL+(magDoorW-t)/3} cy={(y700+t+t+yFloor-t)/2} r={2} fill="#c8b888"/>
        <circle cx={magDoorL+(magDoorW-t)*2/3} cy={(y700+t+t+yFloor-t)/2} r={2} fill="#c8b888"/>
        <text x={magDoorL+(magDoorW-t)/2} y={(y700+t+t+yFloor-t)/2+12} fill="#9a9080" fontSize={4.5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.4}>na magnesy (zdejmowane)</text>
      </g>

      {/* ── 700-1000: open shelf ── */}
      <text x={(gebR+innerR)/2} y={(y700+y1000+t)/2} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.5}>otwarta półka</text>

      {/* ── 1000 → linia drzwi: ściana (dostęp z boku), obniżona jak dół górnych drzwi ── */}
      <rect x={innerL} y={yTopDoorBot+t} width={shiftedR-innerL} height={y1000-yTopDoorBot-t} fill="#33312c" stroke="#9a9080" strokeWidth={.3}/>
      <text x={(innerL+innerR)/2} y={(y1000+yTopDoorBot+t)/2-3} fill="#6a6a5e" fontSize={4.5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.5}>
        <tspan x={(innerL+innerR)/2} dy="0">przestrzeń dostępna</tspan>
        <tspan x={(innerL+innerR)/2} dy="6">po otwarciu drzwi</tspan>
      </text>

      {/* ── od linii drzwi w górę: drzwi (wąska strefa) — +t/2 w dół ── */}
      <Door x={doorL} y={bodyTop+t} w={doorW} h={yTopDoorBot-bodyTop-t/2} hx={doorR-10} hy={(bodyTop+t+yTopDoorBot+t/2)/2} open={doorsOpen}/>

      {/* ═══ GEBERIT (in front of cabinet left side) ═══ */}
      <rect x={ox+10*S-2} y={y1220} width={GEB_W+4} height={yFloor-y1220+t} fill="#44403a" stroke="#7a7a70" strokeWidth={1}/>
      {Array.from({length:8}).map((_,i)=>{
        const ly=y1220+5+i*((yFloor-y1220)/8);
        return <line key={i} x1={ox+10*S} y1={ly} x2={ox+10*S+GEB_W} y2={ly+8} stroke="#6a6860" strokeWidth={.4} opacity={.5}/>;
      })}
      <text x={ox+10*S+GEB_W/2} y={(y1220+yFloor)/2} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.7} letterSpacing={1}>GEBERIT</text>
      <text x={ox+10*S+GEB_W/2} y={(y1220+yFloor)/2+8} fill="#9a9080" fontSize={4} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.4}>170×1220mm</text>

      {/* ═══ UMYWALKA (right, outside cabinet) ═══ */}
      {(()=>{
        // Umywalka styka się bezpośrednio z szafą (bez szczeliny)
        const SINK_W=1400*S;
        const SINK_H=990*S;
        const SINK_FLOAT=250*S;
        const xSink=ox+sw;
        const ySinkTop=bodyBot-SINK_H-t;
        const sinkH=Math.max(1, SINK_H-SINK_FLOAT);
        // Wcięcie góry: 35mm krawędź, 70mm w dół, poziomo, 70mm w górę, 35mm krawędź
        const RIM=35*S, DROP=70*S, r=0.8;
        const xL=xSink, xR=xSink+SINK_W;
        const xLi=xL+RIM, xRi=xR-RIM;
        const yTop=ySinkTop, yDrop=ySinkTop+DROP, yBot=ySinkTop+sinkH;
        const sinkPath=`M ${xL} ${yTop} L ${xLi-r} ${yTop} A ${r} ${r} 0 0 1 ${xLi} ${yTop+r} L ${xLi} ${yDrop-r} A ${r} ${r} 0 0 0 ${xLi+r} ${yDrop} L ${xRi-r} ${yDrop} A ${r} ${r} 0 0 0 ${xRi} ${yDrop-r} L ${xRi} ${yTop+r} A ${r} ${r} 0 0 1 ${xRi+r} ${yTop} L ${xR} ${yTop} L ${xR} ${yBot} L ${xL} ${yBot} Z`;
        const yMid=(yDrop+yBot)/2;
        return (
          <g>
            <path d={sinkPath} fill="rgba(120,120,120,.08)" stroke="#7a7a70" strokeWidth={.9}/>
            {Array.from({length:14}).map((_,i)=>{
              const y1=yDrop+2+i*((yBot-yDrop-4)/14);
              return <line key={i} x1={xSink+6} y1={y1} x2={xSink+SINK_W-6} y2={y1+12} stroke="#7a7a70" strokeWidth={.45} opacity={.45}/>;
            })}
            <text x={xSink+SINK_W/2} y={yMid} fill="#9a9080" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.75} letterSpacing={1}>UMYWALKA</text>
            <text x={xSink+SINK_W/2} y={yMid+12} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.55}>1400×990 (dół +250)</text>
          </g>
        );
      })()}

      {/* Click zone */}
      <rect x={ox} y={bodyTop} width={sw} height={sh} fill="transparent" style={{cursor:"pointer"}} onClick={onToggle}/>

      {/* ═══ DIMS ═══ */}
      <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${H3}`} offset={42} side="left" fontSize={9}/>
      <Dim x1={ox} y1={y700+t} x2={ox} y2={yFloor} label="750" offset={24} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={y1000+t} x2={ox} y2={y700} label="250" offset={24} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={yTopDoorBot+t} x2={ox} y2={y1000} label={`${sideAccessH}`} offset={24} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={bodyTop+t} x2={ox} y2={yTopDoorBot} label={`${H3-2*T-TOP_DOOR_BOTTOM_MM}`} offset={24} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={bodyBot} x2={ox+sw} y2={bodyBot} label={`${W3}`} offset={18} side="bottom"/>
      <Dim x1={doorL} y1={bodyBot} x2={doorR} y2={bodyBot} label={`${IW3-170-150}`} offset={34} side="bottom" color="#7a7a70" fontSize={6}/>
      <Dim x1={ox+sw} y1={bodyTop+t} x2={ox+sw} y2={bodyBot-t} label={`${H3-2*T}`} offset={32} side="right" color="#7a7a70" fontSize={7}/>
      <text x={ox+sw/2} y={bodyTop-20} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z PRZODU (790mm)</text>
    </svg>
  );
};

const LazienkaSide = () => {
  const S=.16;
  const sh=H3*S, sw=D3*S, t=T*S;
  const ox=40, oy=48;
  const bodyTop=oy, bodyBot=oy+sh;
  const fy=(mm)=> bodyBot - t - mm*S;
  const y750=fy(750), y1000=fy(1000);
  const TOP_DOOR_BOTTOM_MM=1220+10;
  const yTopDoorBot=fy(TOP_DOOR_BOTTOM_MM);
  const sideAccessH=TOP_DOOR_BOTTOM_MM-1000;
  const innerL=ox+t, innerR=ox+sw-t, innerW=ID3*S;

  return(
    <svg viewBox={`-20 -5 ${sw+100} ${oy+sh+55}`} width="100%" style={{maxWidth:280}}>
      {/* Body */}
      <rect x={ox} y={bodyTop} width={sw} height={sh} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2} rx={1}/>
      <rect x={ox} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox+sw-t} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={bodyTop} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={bodyBot-t} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>

      {/* Półki 750, 1000 i linia górnych drzwi */}
      <rect x={innerL} y={y750} width={innerW} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>
      <rect x={innerL} y={y1000} width={innerW} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>
      <rect x={innerL} y={yTopDoorBot} width={innerW} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>

      {/* 0-750: ściana */}
      <rect x={innerL} y={y750+t} width={innerW} height={bodyBot-t-y750-t} fill="#33312c" stroke="#9a9080" strokeWidth={.3}/>
      <text x={ox+sw/2} y={(y750+t+bodyBot-t)/2} fill="#6a6a5e" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.5}>ściana</text>

      {/* 750-1000: dostęp z przodu */}
      <text x={ox+sw/2} y={(y750+y1000+t)/2-3} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.5}>
        <tspan x={ox+sw/2} dy="0">dostęp z przodu</tspan>
        <tspan x={ox+sw/2} dy="7">po otwarciu drzwi</tspan>
      </text>

      {/* 1000 → linia drzwi: otwarta półka (dostęp z boku) */}
      <text x={ox+sw/2} y={(y1000+yTopDoorBot+t)/2} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.5}>otwarta półka</text>

      {/* Nad linią drzwi: ściana + półki + lampa */}
      <rect x={innerL} y={bodyTop+t} width={innerW} height={yTopDoorBot-bodyTop-t} fill="#33312c" stroke="#9a9080" strokeWidth={.3}/>
      <text x={ox+sw/2} y={(bodyTop+t+yTopDoorBot)/2} fill="#6a6a5e" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.5}>ściana</text>

      {/* Floating shelves: 1 (góra), 4 (dół), 5 (przy dnie drzwi) */}
      {[2190, 1470, 1230].map((mm,i) => (
        <rect key={i} x={innerL} y={fy(mm)} width={innerW} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4} opacity={.7}/>
      ))}

      {/* Lampa ø150mm, środek 1830mm — 5cm od koła do prawej ścianki */}
      {(() => {
        const yLamp=fy(1830);
        const lampR=75*S;
        const lampCx=ox+sw-50*S-lampR;
        return <g>
          <circle cx={lampCx} cy={yLamp} r={lampR} fill="rgba(200,160,80,.08)" stroke="#c8a050" strokeWidth={.5} strokeDasharray="2,2"/>
          <circle cx={lampCx} cy={yLamp} r={2} fill="#c8a050" opacity={.5}/>
          <text x={lampCx} y={yLamp+lampR+7} fill="#c8a050" fontSize={4} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.6}>lampa ø150</text>
        </g>;
      })()}

      {/* Dims */}
      <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${H3}`} offset={42} side="left" fontSize={9}/>
      <Dim x1={ox} y1={bodyTop+t} x2={ox} y2={bodyBot-t} label={`${H3-2*T}`} offset={28} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={y750+t} x2={ox} y2={bodyBot-t} label="750" offset={18} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={y1000+t} x2={ox} y2={y750} label="250" offset={18} side="left" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={yTopDoorBot+t} x2={ox} y2={y1000} label={`${sideAccessH}`} offset={18} side="left" color="#7a7a70" fontSize={7}/>
      {/* Shelf-by-shelf dims: tylko zachowane półki (1230, 1470, 2190, top) */}
      {(() => {
        const pts=[1230, 1470, 2190, H3-T];
        return pts.slice(0,-1).map((h,i) => {
          const nextH=pts[i+1];
          return <Dim key={`sd${i}`} x1={ox+sw} y1={fy(nextH)} x2={ox+sw} y2={fy(h)} label={`${Math.round(nextH-h)}`} offset={18} side="right" color="#7a7a70" fontSize={6}/>;
        });
      })()}
      <Dim x1={ox} y1={bodyBot} x2={ox+sw} y2={bodyBot} label={`${D3}`} offset={18} side="bottom"/>
      <text x={ox+sw/2} y={bodyTop-20} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z BOKU</text>
    </svg>
  );
};

const LazienkaTop = () => {
  const S=.16;
  const sw=W3*S, sd=D3*S, t=T*S;
  const SHELF_W_MM=200;
  const shelfZone=SHELF_W_MM*S;
  const bodyW=sw-shelfZone; // szerokość korpusu (bez półek)
  const ox=40, oy=45;
  const innerL=ox+t;
  const wallR=ox+bodyW; // prawa ścianka korpusu
  const shelfR=wallR+shelfZone; // koniec półek
  const cornerR=100*S; // zaokrąglenie półek na dole
  return(
    <svg viewBox={`-45 -25 ${shelfR-ox+120} ${sd+100}`} width="100%" style={{maxWidth:400}}>
      {/* Cabinet body */}
      <rect x={ox} y={oy} width={bodyW} height={sd} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2} rx={1}/>
      <rect x={ox} y={oy} width={t} height={sd} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={wallR-t} y={oy} width={t} height={sd} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={oy} width={bodyW} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={oy+sd-t} width={bodyW} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Back (top in this view) */}
      <rect x={ox} y={oy} width={bodyW} height={2} fill="#454540" stroke="#9a9080" strokeWidth={.3}/>
      <text x={ox+bodyW/2} y={oy-6} fill="#9a9080" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="middle" opacity={.5}>tył (HDF 3mm)</text>

      {/* Front (bottom in this view) */}
      <text x={ox+bodyW/2} y={oy+sd+14} fill="#c8a050" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="middle">↓ front</text>

      {/* Shelves extending from right wall — 440mm deep, rounded bottom-right corner */}
      <path d={`M ${wallR} ${oy} H ${shelfR} V ${oy+sd-cornerR} Q ${shelfR} ${oy+sd} ${shelfR-cornerR} ${oy+sd} H ${wallR} Z`} fill="#2e2c28" stroke="#9a9080" strokeWidth={.8}/>
      <text x={wallR+shelfZone/2} y={oy+sd/2} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle" dominantBaseline="middle" opacity={.6}>półki</text>

      {/* Side access label */}
      <text x={shelfR+8} y={oy+sd/2} fill="#c8a050" fontSize={6} fontFamily="'DM Mono',monospace" dominantBaseline="middle">bok</text>

      <Dim x1={ox} y1={oy+sd+2} x2={ox+bodyW} y2={oy+sd+2} label={`${W3-SHELF_W_MM}`} offset={22} side="bottom" color="#7a7a70" fontSize={7}/>
      <Dim x1={wallR} y1={oy+sd+2} x2={shelfR} y2={oy+sd+2} label={`${SHELF_W_MM}`} offset={22} side="bottom" color="#7a7a70" fontSize={7}/>
      <Dim x1={ox} y1={oy} x2={ox} y2={oy+sd} label={`${D3}`} offset={30} side="left" fontSize={9}/>
      <text x={(ox+shelfR)/2} y={oy-18} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z GÓRY</text>
    </svg>
  );
};

// ══════════════════════════════════════
// BUTY VIEWS
// ══════════════════════════════════════
const ButyFront = ({doorsOpen=false, onToggle}={}) => {
  const S=.20;
  const sw=W4F*S, sh=H4*S, t=T*S, ofs=BUTY.offset*S;
  const BLAT_T=38*S; // blat thickness 38mm
  const ox=50, oy=40;
  const bodyTop=oy, bodyBot=oy+sh;
  const fy=(mm)=>bodyBot - mm*S;
  // Key levels
  const yBlatTop=fy(BLAT_H), yBlatBot=yBlatTop+BLAT_T;
  // Górna kolumna (1200–2000mm): 2 otwarte półki + drzwi z 1 półką w środku
  const yUp1=fy(1400);           // otwarta półka nr 1 (1400mm od podłogi)
  const yUp2=fy(1600);           // otwarta półka nr 2 (1600mm) — też dolna krawędź drzwi górnych
  const yUpDoorShelf=fy(1800);   // półka wewnątrz drzwi górnych (1800mm)
  // Upper column starts at x=ox+ofs (cofnięta o 150mm od lewej, aż do prawej krawędzi)
  const upL=ox+ofs, upR=ox+sw;
  // Dolna szafka (0–1200mm): 3 półki + drzwi dwuskrzydłowe
  const yLow1=fy(300), yLow2=fy(600), yLow3=fy(900); // półki wewnętrzne (widoczne gdy drzwi otwarte)
  const midX=ox+sw/2;
  const ov=t/2; // nakładka drzwi na ścianki (jak AnimDoor/AnimDrw)
  return(
    <svg onClick={onToggle} viewBox={`-25 -25 ${sw+145} ${oy+sh+60}`} width="100%" style={{maxWidth:400,cursor:onToggle?"pointer":"default"}}>
      {/* Upper body (narrower) */}
      <rect x={upL} y={bodyTop} width={sw-ofs} height={yBlatTop-bodyTop} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2}/>
      {/* Lower body (full width) */}
      <rect x={ox} y={yBlatBot} width={sw} height={bodyBot-yBlatBot} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2}/>
      {/* Blat */}
      <rect x={ox} y={yBlatTop} width={sw} height={BLAT_T} fill="#3a3830" stroke="#9a9080" strokeWidth={.6}/>
      <text x={ox+sw-3} y={yBlatTop-3} fill="#9a9080" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="end">BLAT</text>

      {/* Upper sides + top */}
      <rect x={upL} y={bodyTop} width={t} height={yBlatTop-bodyTop} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={upR-t} y={bodyTop} width={t} height={yBlatTop-bodyTop} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={upL} y={bodyTop} width={sw-ofs} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>

      {/* Lower sides + bottom */}
      <rect x={ox} y={yBlatBot} width={t} height={bodyBot-yBlatBot} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox+sw-t} y={yBlatBot} width={t} height={bodyBot-yBlatBot} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      <rect x={ox} y={bodyBot-t} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>

      {/* Upper open shelves (visible) at 1400, 1600 */}
      <rect x={upL+t} y={yUp1-t/2} width={sw-ofs-2*t} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>
      <rect x={upL+t} y={yUp2-t/2} width={sw-ofs-2*t} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4}/>
      {/* Upper interior shelf (25mm) at 1800 — dim when door closed */}
      <rect x={upL+t} y={yUpDoorShelf-t/2} width={sw-ofs-2*t} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4} opacity={doorsOpen?1:.3}/>

      {/* Upper door (top..1600), hinge LEFT, handle RIGHT */}
      {(()=>{ const dX=upL+t, dY=bodyTop+t, dW=sw-ofs-2*t, dH=yUp2-t/2-dY;
        const open=doorsOpen?"scaleX(0.08)":"scaleX(1)";
        return (
          <g onClick={onToggle} style={{cursor:onToggle?"pointer":"default",transformOrigin:`${dX}px ${dY+dH/2}px`,transform:open,transition:"transform .6s cubic-bezier(.4,.0,.2,1)"}}>
            <rect x={dX-ov} y={dY-ov} width={dW+2*ov} height={dH+2*ov} fill="rgba(75,70,60,.45)" stroke="#b0a080" strokeWidth={.8} rx={1}/>
            <circle cx={dX+dW-6} cy={dY+dH/2} r={2.5} fill="#c8b888"/>
          </g>
        );
      })()}

      {/* Lower interior shelves (25mm) at 300/600/900 — dim when doors closed */}
      {[yLow1,yLow2,yLow3].map((sy,i)=>(
        <rect key={i} x={ox+t} y={sy-t/2} width={sw-2*t} height={t} fill="#3d3b34" stroke="#9a9080" strokeWidth={.4} opacity={doorsOpen?1:.3}/>
      ))}

      {/* Lower doors (double), hinges on OUTSIDE edges, handles in CENTER */}
      {(()=>{ const dY=yBlatBot, dH=bodyBot-t-dY, dW=(sw-2*t)/2;
        const lX=ox+t, rX=midX;
        const open=doorsOpen?"scaleX(0.08)":"scaleX(1)";
        const cy=dY+dH/2;
        return (<>
          <g onClick={onToggle} style={{cursor:onToggle?"pointer":"default",transformOrigin:`${lX}px ${cy}px`,transform:open,transition:"transform .6s cubic-bezier(.4,.0,.2,1)"}}>
            <rect x={lX-ov} y={dY-ov} width={dW+ov} height={dH+2*ov} fill="rgba(75,70,60,.45)" stroke="#b0a080" strokeWidth={.8} rx={1}/>
            <circle cx={lX+dW-6} cy={cy} r={2.5} fill="#c8b888"/>
          </g>
          <g onClick={onToggle} style={{cursor:onToggle?"pointer":"default",transformOrigin:`${rX+dW}px ${cy}px`,transform:open,transition:"transform .6s cubic-bezier(.4,.0,.2,1)"}}>
            <rect x={rX} y={dY-ov} width={dW+ov} height={dH+2*ov} fill="rgba(75,70,60,.45)" stroke="#b0a080" strokeWidth={.8} rx={1}/>
            <circle cx={rX+6} cy={cy} r={2.5} fill="#c8b888"/>
          </g>
        </>);
      })()}
      {/* Dimensions (right side, vertical) */}
      <Dim x1={ox+sw} y1={bodyBot} x2={ox+sw} y2={yBlatBot} label={`${BLAT_H}`} offset={20} side="right" fontSize={8}/>
      <Dim x1={ox+sw} y1={yBlatTop} x2={ox+sw} y2={bodyTop} label={`${H4-BLAT_H}`} offset={20} side="right" fontSize={8}/>
      {/* Left */}
      <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${H4}`} offset={32} side="left" fontSize={9}/>
      {/* Bottom widths */}
      <Dim x1={ox} y1={bodyBot} x2={ox+sw} y2={bodyBot} label={`${W4F}`} offset={18} side="bottom"/>
      <Dim x1={upL} y1={bodyTop} x2={upR} y2={bodyTop} label={`${TOP_W}`} offset={14} side="top" fontSize={8}/>
      <Dim x1={ox} y1={bodyTop} x2={upL} y2={bodyTop} label={`${BUTY.offset}`} offset={14} side="top" color="#7a7a70" fontSize={7}/>

      <text x={ox+sw/2} y={bodyTop-30} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z PRZODU</text>
    </svg>
  );
};

const ButySide = () => {
  const S=.20;
  const sw=D4*S, sh=H4*S, t=T*S;
  const ox=40, oy=40;
  const bodyTop=oy, bodyBot=oy+sh;
  const fy=(mm)=>bodyBot - mm*S;
  const BLAT_T=38*S;
  const yBlatTop=fy(BLAT_H), yBlatBot=yBlatTop+BLAT_T;
  const upFront=ox+TOP_D*S; // upper front x (step back from full front)
  // Body points: back-top → top → upper-front → step → lower-front → bottom-right → back-bottom
  const pts=`${ox},${bodyTop} ${upFront},${bodyTop} ${upFront},${yBlatTop} ${ox+sw},${yBlatTop} ${ox+sw},${bodyBot} ${ox},${bodyBot}`;
  return(
    <svg viewBox={`-25 -25 ${sw+90} ${oy+sh+55}`} width="100%" style={{maxWidth:200}}>
      <polygon points={pts} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2}/>
      {/* Blat */}
      <rect x={ox} y={yBlatTop} width={sw} height={BLAT_T} fill="#3a3830" stroke="#9a9080" strokeWidth={.6}/>
      {/* Back wall shade */}
      <rect x={ox} y={bodyTop} width={t} height={sh} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Bottom */}
      <rect x={ox} y={bodyBot-t} width={sw} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Top (upper) */}
      <rect x={ox} y={bodyTop} width={TOP_D*S} height={t} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Lower front edge */}
      <rect x={ox+sw-t} y={yBlatBot} width={t} height={bodyBot-yBlatBot} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>
      {/* Upper front edge */}
      <rect x={upFront-t} y={bodyTop} width={t} height={yBlatTop-bodyTop} fill="#3a3830" stroke="#9a9080" strokeWidth={.5}/>

      {/* Labels */}
      <text x={ox-3} y={(bodyTop+bodyBot)/2} fill="#9a9080" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="end" transform={`rotate(-90 ${ox-3} ${(bodyTop+bodyBot)/2})`}>← tył</text>
      <text x={ox+sw+3} y={yBlatBot+(bodyBot-yBlatBot)/2} fill="#9a9080" fontSize={6} fontFamily="'DM Mono',monospace" transform={`rotate(-90 ${ox+sw+3} ${yBlatBot+(bodyBot-yBlatBot)/2})`}>front →</text>

      {/* Dimensions */}
      <Dim x1={ox} y1={bodyTop} x2={ox} y2={bodyBot} label={`${H4}`} offset={28} side="left" fontSize={9}/>
      <Dim x1={ox} y1={bodyBot} x2={ox+sw} y2={bodyBot} label={`${D4}`} offset={18} side="bottom"/>
      <Dim x1={ox} y1={bodyTop} x2={upFront} y2={bodyTop} label={`${TOP_D}`} offset={14} side="top" fontSize={8}/>
      <Dim x1={ox+sw} y1={yBlatBot} x2={ox+sw} y2={bodyBot} label={`${BLAT_H}`} offset={18} side="right" fontSize={8}/>
      <Dim x1={ox+sw} y1={bodyTop} x2={ox+sw} y2={yBlatTop} label={`${H4-BLAT_H}`} offset={18} side="right" fontSize={8}/>

      <text x={ox+sw/2} y={bodyTop-30} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z BOKU</text>
    </svg>
  );
};

const ButyTop = () => {
  const S=.22;
  const fW=W4F*S, bW=W4B*S, sd=D4*S, t=T*S;
  const ofs=BUTY.offset*S; // 150mm offset
  const tW=TOP_W*S, tD=TOP_D*S;
  const ox=60, oy=55;
  const pts = `${ox},${oy+sd} ${ox+fW},${oy+sd} ${ox+fW},${oy} ${ox+ofs},${oy}`;
  // Upper column rect: from x=ox+ofs (same as back-left) to x=ox+fW (right), y=oy (back) to y=oy+tD
  const upX=ox+ofs, upY=oy, upW=tW, upH=tD;
  return(
    <svg viewBox={`-20 -30 ${fW+155} ${sd+160}`} width="100%" style={{maxWidth:440}}>
      {/* Trapezoid (lower section seen from above) */}
      <polygon points={pts} fill="#2e2c28" stroke="#9a9080" strokeWidth={1.2}/>
      {/* Upper column (glued to back + right) — drawn on top, lighter */}
      <rect x={upX} y={upY} width={upW} height={upH} fill="#4a4238" stroke="#c8a050" strokeWidth={1.2} opacity={.9}/>
      <text x={upX+upW/2} y={upY+upH/2+3} fill="#c8a050" fontSize={7} fontFamily="'DM Mono',monospace" textAnchor="middle">KOLUMNA GÓRNA</text>
      <text x={upX+upW/2} y={upY+upH/2+12} fill="#c8a050" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle">{`${TOP_W}×${TOP_D}`}</text>

      {/* Labels */}
      <text x={ox+fW/2} y={oy+sd+16} fill="#c8a050" fontSize={7} fontFamily="'DM Mono',monospace" textAnchor="middle">↓ front</text>
      <text x={ox+ofs/2} y={oy+sd/2+3} fill="#9a9080" fontSize={5} fontFamily="'DM Mono',monospace" textAnchor="middle">(blat)</text>

      {/* Dims */}
      <Dim x1={ox} y1={oy+sd} x2={ox+fW} y2={oy+sd} label={`${W4F}`} offset={22} side="bottom"/>
      <Dim x1={ox+ofs} y1={oy} x2={ox+fW} y2={oy} label={`${W4B}`} offset={16} side="top" fontSize={8}/>
      <Dim x1={ox+fW} y1={oy} x2={ox+fW} y2={oy+sd} label={`${D4}`} offset={18} side="right" fontSize={9}/>
      <Dim x1={ox+fW} y1={upY} x2={ox+fW} y2={upY+upH} label={`${TOP_D}`} offset={38} side="right" color="#7a7a70" fontSize={7}/>
      {/* Offset dim */}
      <Dim x1={ox} y1={oy+sd} x2={ox+ofs} y2={oy+sd} label={`${BUTY.offset}`} offset={38} side="bottom" color="#7a7a70" fontSize={7}/>

      <text x={ox+fW/2} y={oy-32} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>WIDOK Z GÓRY</text>
    </svg>
  );
};

// ══ WNEKA VIEW ══
const WnekaView = () => {
  const S = 0.4; // 1mm = 0.4px

  // type "trap": right trapezoid (right angles at both bottom corners, slanted top)
  //   horizontal layout: bok = long bottom edge, base = right side, top = left side
  //   points: TL(0, (base-top)*S), TR(bok*S, 0), BR(bok*S, base*S)←90°, BL(0, base*S)
  // type "rect": simple rectangle, h = long dim (horizontal), w = short dim (vertical)
  const shapes = [
    { idx:1, label:"Wnęka dolna — podłoga",      type:"trap", base:100, top:75,  bok:600 },
    { idx:2, label:"Wnęka górna — półka dół",    type:"trap", base:130, top:110, bok:600 },
    { idx:3, label:"Wnęka górna — półka środek", type:"trap", base:130, top:110, bok:600 },
    { idx:4, label:"Wnęka górna — półka góra",   type:"trap", base:130, top:110, bok:600 },
    { idx:5, label:"Wnęka górna — plecy",         type:"rect", w:110,   h:1200           },
  ];

  const ox=60, oy=52, rowH=120, lOff=14;
  const dR=22, dL=20, dB=20, ra=4;
  const vW = ox + 1200*S + dR + 80;  // widest = plecy 480px
  const vH = oy + shapes.length * rowH + 50;

  return (
    <svg viewBox={`-30 -20 ${vW+30} ${vH}`} width="100%" style={{maxWidth:660}}>
      <text x={ox+300*S} y={oy-30} fill="#c8a050" fontSize={9} fontFamily="'DM Mono',monospace" textAnchor="middle" letterSpacing={2}>ELEMENTY — WIDOK 2D</text>
      <text x={ox+300*S} y={oy-18} fill="#6a6a5e" fontSize={6} fontFamily="'DM Mono',monospace" textAnchor="middle">płyta meblowa biała · 18mm · ABS</text>
      {shapes.map((sh, i) => {
        const rowY = oy + i * rowH;
        if (sh.type === "trap") {
          const bPx=sh.base*S, bkPx=sh.bok*S, dPx=(sh.base-sh.top)*S;
          const pts=`0,${dPx} ${bkPx},0 ${bkPx},${bPx} 0,${bPx}`;
          return (
            <g key={sh.idx} transform={`translate(${ox},${rowY})`}>
              <text x={0} y={0} fill="#d0cabb" fontSize={7} fontFamily="'DM Mono',monospace">
                <tspan fill="#c8a050" fontSize={6}>{`0${sh.idx}  `}</tspan>{sh.label}
              </text>
              <g transform={`translate(0,${lOff})`}>
                <polygon points={pts} fill="#3a3830" stroke="#9a9080" strokeWidth={0.7}/>
                {/* right-angle marker BR */}
                <path d={`M ${bkPx-ra},${bPx} L ${bkPx-ra},${bPx-ra} L ${bkPx},${bPx-ra}`} fill="none" stroke="#c8a050" strokeWidth={0.6}/>
                {/* right-angle marker BL */}
                <path d={`M ${ra},${bPx} L ${ra},${bPx-ra} L 0,${bPx-ra}`} fill="none" stroke="#c8a050" strokeWidth={0.6}/>
                <Dim x1={0} y1={bPx} x2={bkPx} y2={bPx} label={`${sh.bok}`} offset={dB} side="bottom" fontSize={7}/>
                <Dim x1={bkPx} y1={0} x2={bkPx} y2={bPx} label={`${sh.base}`} offset={dR} side="right" fontSize={7}/>
                <Dim x1={0} y1={dPx} x2={0} y2={bPx} label={`${sh.top}`} offset={dL} side="left" fontSize={7}/>
              </g>
            </g>
          );
        } else {
          const hPx=sh.h*S, wPx=sh.w*S;
          return (
            <g key={sh.idx} transform={`translate(${ox},${rowY})`}>
              <text x={0} y={0} fill="#d0cabb" fontSize={7} fontFamily="'DM Mono',monospace">
                <tspan fill="#c8a050" fontSize={6}>{`0${sh.idx}  `}</tspan>{sh.label}
              </text>
              <g transform={`translate(0,${lOff})`}>
                <rect x={0} y={0} width={hPx} height={wPx} fill="#3a3830" stroke="#9a9080" strokeWidth={0.7}/>
                <Dim x1={0} y1={wPx} x2={hPx} y2={wPx} label={`${sh.h}`} offset={dB} side="bottom" fontSize={7}/>
                <Dim x1={hPx} y1={0} x2={hPx} y2={wPx} label={`${sh.w}`} offset={dR} side="right" fontSize={7}/>
              </g>
            </g>
          );
        }
      })}
    </svg>
  );
};

// ══ MAIN APP ══
export default function App() {
  const s0 = readState();
  const tabNum = Number(s0.tab);
  const clampedTab = Math.min(4, Math.max(0, Number.isFinite(tabNum) ? tabNum : 0));
  const [tab, setTab] = useState(clampedTab);
  const [doorsOpen, setDoorsOpen] = useState(!!s0.doorsOpen);
  const [theme, setTheme] = useState(s0.theme === "light" ? "light" : "dark");
  const [printAll, setPrintAll] = useState(false);
  const [view, setView] = useState(() => {
    const v = typeof s0.view === "string" ? s0.view : "front";
    return validView(clampedTab, v) ? v : "front";
  });
  const mounted = useRef(false);

  const isLight = theme === "light";
  const T_ = {
    bg: isLight ? "#f5f3ed" : "#1b1a18",
    card: isLight ? "#ffffff" : "#24231f",
    text: isLight ? "#2a2a28" : "#e8e4d8",
    muted: isLight ? "#6a6a5e" : "#9a9688",
    border: isLight ? "#d8d4c6" : "#3d3c35",
    btnBg: isLight ? "#ffffff" : "#2c2b26",
    accent: "#c8a050",
    accentBg: isLight ? "rgba(200,160,80,.15)" : "rgba(200,160,80,.1)",
  };

  useLayoutEffect(() => {
    const y = readState().scrollY;
    if (typeof y === "number" && !Number.isNaN(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
    mounted.current = true;
  }, []);

  useEffect(() => {
    writePatch({ tab, view, doorsOpen, theme });
  }, [tab, view, doorsOpen, theme]);

  useEffect(() => {
    if (!printAll) return;
    const prevTitle = document.title;
    document.title = "Projekt mebli - wszystkie szafy";
    const done = () => { setPrintAll(false); document.title = prevTitle; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    return () => { cancelAnimationFrame(id); window.removeEventListener("afterprint", done); document.title = prevTitle; };
  }, [printAll]);

  const exportPdf = () => setPrintAll(true);

  useEffect(() => {
    let t = 0;
    const onScroll = () => {
      if (!mounted.current) return;
      clearTimeout(t);
      t = window.setTimeout(() => writePatch({ scrollY: window.scrollY }), 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onUnload = () => writePatch({ scrollY: window.scrollY });
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onUnload);
      clearTimeout(t);
    };
  }, []);

  const cabinets=[REGAL,SZAFA,LAZIENKA,BUTY,WNEKA];
  const cab=cabinets[tab];
  return(
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:T_.bg,color:T_.text,minHeight:"100vh",padding:"24px 20px",boxSizing:"border-box"}}>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-card { background: #fff !important; break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:T_.accent,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>Projekt mebli</div>
          <h1 style={{fontSize:24,fontWeight:700,margin:0}}>Przegląd szaf</h1>
        </div>
        <div className="no-print" style={{display:"flex",gap:8}}>
          <button onClick={()=>setTheme(isLight?"dark":"light")} style={{
            padding:"8px 14px",border:`1px solid ${T_.border}`,background:T_.btnBg,color:T_.muted,
            borderRadius:6,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,
          }}>{isLight?"🌙 Ciemny":"☀️ Jasny"}</button>
          <button onClick={exportPdf} style={{
            padding:"8px 14px",border:`1px solid ${T_.accent}`,background:T_.accentBg,color:T_.accent,
            borderRadius:6,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,
          }}>📄 Eksport PDF</button>
        </div>
      </div>
      <div className="no-print" style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {cabinets.map((c,i)=>(
          <button key={i} onClick={()=>{setDoorsOpen(false);setTab(i);setView((v)=>(validView(i,v)?v:i===4?"all":"front"));}} style={{
            padding:"10px 18px",border:tab===i?`1.5px solid ${T_.accent}`:`1px solid ${T_.border}`,
            background:tab===i?T_.accentBg:T_.btnBg,color:tab===i?T_.accent:T_.muted,
            borderRadius:8,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:tab===i?500:400,
          }}>{`0${c.id}`} &nbsp;{c.name}</button>
        ))}
      </div>
      {!printAll && (
      <div className="print-card" style={{background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16}}>
          <div>
            <h2 style={{margin:0,fontSize:20,fontWeight:600}}>{cab.name}</h2>
            <p style={{margin:"4px 0",fontSize:12,color:T_.muted,fontFamily:"'DM Mono',monospace"}}>
              {cab.dims ?? `${cab.outerW}×${cab.outerH}×${cab.depth}mm${cab.legH>0?` · nóżki ${cab.legH}mm`:""}`}
            </p>
          </div>
        </div>
        {cab.desc&&<><div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:T_.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Opis</div><p style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#d0cabb",margin:"0 0 16px",lineHeight:1.65}}>{cab.desc}</p></>}
        <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:T_.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Specyfikacja</div>
        {cab.specs.map(([l,v],i)=><MatRow key={i} label={l} value={v}/>)}
      </div>
      )}
      <div className="no-print" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {(tab===0?["front","side","both"]:tab===4?["all"]:["front","side","top","all"]).map(v=>(
          <button key={v} onClick={()=>setView(v)} style={{
            padding:"8px 14px",border:view===v?`1.5px solid ${T_.accent}`:`1px solid ${T_.border}`,
            background:view===v?T_.accentBg:T_.btnBg,color:view===v?T_.accent:T_.muted,
            borderRadius:6,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,
          }}>{({front:"Przód",side:"Bok",top:"Góra",both:"Oba",all:"Wszystkie"})[v]}</button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={()=>setDoorsOpen(!doorsOpen)} style={{
          padding:"8px 14px",border:`1px solid ${doorsOpen?T_.accent:T_.border}`,
          background:doorsOpen?T_.accentBg:T_.btnBg,color:doorsOpen?T_.accent:T_.muted,
          borderRadius:6,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11,
        }}>{doorsOpen?"🔓 Zamknij":"🔒 Otwórz"}</button>
      </div>
      {printAll && [0,1,2,3,4].map(ti => {
        const c = cabinets[ti];
        const card = {background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20};
        return (
          <div key={ti} style={{marginBottom:24,pageBreakBefore: ti>0?"always":"auto"}}>
            <div className="print-card" style={{...card,marginBottom:16}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:600}}>{`0${c.id} · ${c.name}`}</h2>
              <p style={{margin:"4px 0 12px",fontSize:12,color:T_.muted,fontFamily:"'DM Mono',monospace"}}>
                {c.dims ?? `${c.outerW}×${c.outerH}×${c.depth}mm${c.legH>0?` · nóżki ${c.legH}mm`:""}`}
              </p>
              {c.desc&&<><div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:T_.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Opis</div><p style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#d0cabb",margin:"0 0 16px",lineHeight:1.65}}>{c.desc}</p></>}
              <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:T_.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Specyfikacja</div>
              {c.specs.map(([l,v],i)=><MatRow key={i} label={l} value={v}/>)}
            </div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {ti===0 && <><div className="print-card" style={{...card,flex:"1 1 400px",maxWidth:660}}><RegalFront doorsOpen={false}/></div><div className="print-card" style={{...card,flex:"0 1 260px"}}><RegalSide/></div></>}
              {ti===1 && <><div className="print-card" style={{...card,flex:"1 1 420px",maxWidth:760}}><SzafaFront doorsOpen={false}/></div><div className="print-card" style={{...card,flex:"0 1 200px"}}><SzafaSide/></div><div className="print-card" style={{...card,flex:"1 1 400px",maxWidth:540}}><SzafaTop/></div></>}
              {ti===2 && <><div className="print-card" style={{...card,flex:"1 1 300px",maxWidth:760}}><LazienkaFront doorsOpen={false}/></div><div className="print-card" style={{...card,flex:"0 1 200px"}}><LazienkaSide/></div><div className="print-card" style={{...card,flex:"1 1 280px",maxWidth:440}}><LazienkaTop/></div></>}
              {ti===3 && <><div className="print-card" style={{...card,flex:"1 1 300px",maxWidth:440}}><ButyFront doorsOpen={doorsOpen} onToggle={()=>setDoorsOpen(!doorsOpen)}/></div><div className="print-card" style={{...card,flex:"0 1 160px"}}><ButySide/></div><div className="print-card" style={{...card,flex:"1 1 350px",maxWidth:480}}><ButyTop/></div></>}
              {ti===4 && <div className="print-card" style={{...card,flex:"1 1 400px",maxWidth:680}}><WnekaView/></div>}
            </div>
          </div>
        );
      })}
      {!printAll && (
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        {tab===0&&(view==="front"||view==="both")&&<div className="print-card" style={{flex:"1 1 400px",maxWidth:660,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><RegalFront doorsOpen={doorsOpen} onToggle={()=>setDoorsOpen(!doorsOpen)}/></div>}
        {tab===0&&(view==="side"||view==="both")&&<div className="print-card" style={{flex:"0 1 260px",background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><RegalSide/></div>}
        {tab===1&&(view==="front"||view==="all")&&<div className="print-card" style={{flex:"1 1 420px",maxWidth:760,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><SzafaFront doorsOpen={doorsOpen} onToggle={()=>setDoorsOpen(!doorsOpen)}/></div>}
        {tab===1&&(view==="side"||view==="all")&&<div className="print-card" style={{flex:"0 1 200px",background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><SzafaSide/></div>}
        {tab===1&&(view==="top"||view==="all")&&<div className="print-card" style={{flex:"1 1 400px",maxWidth:540,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><SzafaTop/></div>}
        {tab===2&&(view==="front"||view==="all")&&<div className="print-card" style={{flex:"1 1 300px",maxWidth:760,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><LazienkaFront doorsOpen={doorsOpen} onToggle={()=>setDoorsOpen(!doorsOpen)}/></div>}
        {tab===2&&(view==="side"||view==="all")&&<div className="print-card" style={{flex:"0 1 200px",background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><LazienkaSide/></div>}
        {tab===2&&(view==="top"||view==="all")&&<div className="print-card" style={{flex:"1 1 280px",maxWidth:440,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><LazienkaTop/></div>}
        {tab===3&&(view==="front"||view==="all")&&<div className="print-card" style={{flex:"1 1 300px",maxWidth:440,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><ButyFront doorsOpen={doorsOpen} onToggle={()=>setDoorsOpen(!doorsOpen)}/></div>}
        {tab===3&&(view==="side"||view==="all")&&<div className="print-card" style={{flex:"0 1 160px",background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><ButySide/></div>}
        {tab===3&&(view==="top"||view==="all")&&<div className="print-card" style={{flex:"1 1 350px",maxWidth:480,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><ButyTop/></div>}
        {tab===4&&view==="all"&&<div className="print-card" style={{flex:"1 1 400px",maxWidth:680,background:T_.card,border:`1px solid ${T_.border}`,borderRadius:4,padding:20}}><WnekaView/></div>}
      </div>
      )}
    </div>
  );
}
