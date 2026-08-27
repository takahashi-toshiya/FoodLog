"use client";

import { useMemo, useState } from "react";

type Meal = { id: number; section: string; name: string; kcal: number; p: number; f: number; c: number };
const starter: Meal[] = [
  { id: 1, section: "朝食", name: "オートミールとバナナ", kcal: 320, p: 11, f: 6, c: 58 },
  { id: 2, section: "朝食", name: "ギリシャヨーグルト", kcal: 100, p: 10, f: 0, c: 12 },
  { id: 3, section: "昼食", name: "鶏むね肉プレート", kcal: 650, p: 49, f: 18, c: 71 },
  { id: 4, section: "間食", name: "プロテイン", kcal: 118, p: 22, f: 2, c: 4 },
];
const saved = [
  { name: "プロテイン", detail: "118 kcal · P 22 / F 2 / C 4", p: "22", f: "2", c: "4" },
  { name: "ギリシャヨーグルト", detail: "100 kcal · P 10 / F 0 / C 12", p: "10", f: "0", c: "12" },
  { name: "玄米 150g", detail: "248 kcal · P 4 / F 2 / C 53", p: "4", f: "2", c: "53" },
];

export default function Home() {
  const [tab, setTab] = useState<"today" | "library" | "settings">("today");
  const [sheet, setSheet] = useState(false);
  const [mode, setMode] = useState<"input" | "saved" | "set">("input");
  const [date, setDate] = useState(0);
  const [meals, setMeals] = useState(starter);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", section: "夕食", p: "", f: "", c: "" });
  const totals = useMemo(() => meals.reduce((a,m)=>({kcal:a.kcal+m.kcal,p:a.p+m.p,f:a.f+m.f,c:a.c+m.c}),{kcal:0,p:0,f:0,c:0}),[meals]);
  const kcal = Math.round((+form.p||0)*4+(+form.f||0)*9+(+form.c||0)*4);
  const dateLabel = date===0 ? "8月24日 月曜日" : date<0 ? "8月23日 日曜日" : "8月25日 火曜日";
  const choose = (item: typeof saved[number]) => { setForm({name:item.name,section:"間食",p:item.p,f:item.f,c:item.c}); setMode("input"); };
  const saveMeal = () => {
    if(!form.name.trim()){ setNotice("食品・料理名を入力してください"); return; }
    setMeals([...meals,{id:Date.now(),section:form.section,name:form.name,kcal,p:+form.p||0,f:+form.f||0,c:+form.c||0}]);
    setForm({name:"",section:"夕食",p:"",f:"",c:""}); setSheet(false); setTab("today"); setNotice("食事を保存しました");
  };
  return <main className="stage">
    <section className="phone" aria-label="食事管理アプリのプロトタイプ">
      <div className="status"><span>9:41</span><span>● ᯤ ▰</span></div>
      {notice&&<button className="toast" onClick={()=>setNotice("")}>{notice}<span>×</span></button>}
      {tab==="today"&&<>
        <header className="topbar"><div><p>今日の記録</p><h1>{dateLabel}</h1></div><button aria-label="カレンダー">▦</button></header>
        <div className="dates"><button onClick={()=>setDate(-1)}>‹</button>{["土 22","日 23","月 24","火 25","水 26"].map((x,i)=><button key={x} className={i===2+date?"active":""} onClick={()=>setDate(i-2)}>{x}</button>)}<button onClick={()=>setDate(1)}>›</button></div>
        <div className="scroll">
          <section className="summary"><div className="ring" style={{"--angle":`${Math.min(totals.kcal/2000*360,360)}deg`} as React.CSSProperties}><div><strong>{totals.kcal.toLocaleString()}</strong><small>/ 2,000 kcal</small></div></div><div className="remain"><span>今日の残り</span><strong>{Math.max(2000-totals.kcal,0)}<small> kcal</small></strong><em>いいペースです</em></div><div className="macros">{[["P","たんぱく質",totals.p,120,"blue"],["F","脂質",totals.f,55,"amber"],["C","炭水化物",totals.c,250,"purple"]].map(([k,l,v,g,color])=><div className="macro" key={String(k)}><div><b className={String(color)}>{k}</b><span>{l}</span><strong>{v}<small> / {g}g</small></strong></div><i><u className={String(color)} style={{width:`${Math.min(Number(v)/Number(g)*100,100)}%`}}/></i></div>)}</div></section>
          <div className="section-title"><h2>食事</h2><span>{meals.length}件</span></div>
          {["朝食","昼食","夕食","間食"].map(section=>{const rows=meals.filter(m=>m.section===section);return <section className="meal-group" key={section}><div className="meal-head"><h3>{section}</h3><span>{rows.reduce((a,m)=>a+m.kcal,0)} kcal</span></div>{rows.length?rows.map(m=><button className="meal-row" key={m.id} onClick={()=>setNotice("記録をタップすると編集できます")}><span className="food-icon">{section==="朝食"?"☀":section==="昼食"?"☁":section==="夕食"?"☾":"◇"}</span><span><strong>{m.name}</strong><small>P {m.p} · F {m.f} · C {m.c}</small></span><b>{m.kcal}<small> kcal</small></b><i>›</i></button>):<button className="empty" onClick={()=>setSheet(true)}>＋ {section}を追加</button>}</section>})}
        </div><button className="fab" onClick={()=>setSheet(true)}>＋ 食事を追加</button>
      </>}
      {tab==="library"&&<><header className="topbar simple"><div><p>すばやく記録</p><h1>ライブラリ</h1></div><button>＋</button></header><div className="scroll page"><div className="seg"><button className="selected">よく使う食品</button><button>セット</button></div><label className="search">⌕ <input placeholder="食品を検索"/></label><p className="hint">項目を選ぶと、内容を確認して今日の食事に追加できます。</p>{saved.map((x,i)=><button className="library-card" key={x.name} onClick={()=>{choose(x);setSheet(true)}}><b className={["blue","purple","amber"][i]}>{x.name[0]}</b><span><strong>{x.name}</strong><small>{x.detail}</small></span><i>⋯</i></button>)}</div></>}
      {tab==="settings"&&<><header className="topbar simple"><div><p>あなたの基準</p><h1>設定</h1></div></header><div className="scroll page"><h2 className="label-title">1日の目標</h2><section className="settings-card">{[["カロリー","2,000 kcal"],["たんぱく質","120 g"],["脂質","55 g"],["炭水化物","250 g"]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}<button onClick={()=>setNotice("目標値を編集できます")}>目標を編集</button></section><h2 className="label-title">データ</h2><button className="nav-card" onClick={()=>setNotice("期間指定CSV出力画面を開きます")}><span>⇩</span><div><b>CSVを書き出す</b><small>期間を選んで食事明細を保存</small></div><i>›</i></button><p className="privacy">データは端末内に保存し、外部へ自動送信しません。</p></div></>}
      <nav className="bottom">{[["today","⌂","今日"],["library","▤","ライブラリ"],["settings","⚙","設定"]].map(x=><button key={x[0]} className={tab===x[0]?"current":""} onClick={()=>setTab(x[0] as typeof tab)}><b>{x[1]}</b><span>{x[2]}</span></button>)}</nav>
      {sheet&&<div className="overlay"><section className="sheet"><header><button onClick={()=>setSheet(false)}>×</button><h2>食事を追加</h2><button className="save" onClick={saveMeal}>保存</button></header><div className="seg add-tabs"><button className={mode==="input"?"selected":""} onClick={()=>setMode("input")}>直接入力</button><button className={mode==="saved"?"selected":""} onClick={()=>setMode("saved")}>よく使う</button><button className={mode==="set"?"selected":""} onClick={()=>setMode("set")}>セット</button></div>{mode==="input"?<div className="form"><div className="form-row"><label>日付<input value="2026/08/24" readOnly/></label><label>食事区分<select value={form.section} onChange={e=>setForm({...form,section:e.target.value})}>{["朝食","昼食","夕食","間食"].map(x=><option key={x}>{x}</option>)}</select></label></div><label>食品・料理名<input autoFocus placeholder="例：鮭おにぎり" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><div className="nutrition-title"><b>栄養素</b><em>入力すると自動計算</em></div><div className="nutri">{([['p','P','たんぱく質'],['f','F','脂質'],['c','C','炭水化物']] as const).map(([key,l,n])=><label key={key}><b>{l}</b><span>{n}</span><div><input inputMode="decimal" placeholder="0" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/><i>g</i></div></label>)}</div><div className="calorie"><span>カロリー <em>自動</em></span><strong>{kcal}<small> kcal</small></strong></div><label>メモ（任意）<textarea placeholder="量や補足など"/></label><button className="primary" onClick={saveMeal}>食事を保存</button></div>:<div className="picker"><p>{mode==="saved"?"登録済みの食品を選択":"セットを一度に追加"}</p>{mode==="saved"?saved.map(x=><button key={x.name} onClick={()=>choose(x)}><span>{x.name}</span><small>{x.detail}</small></button>):[["いつもの朝食","3品 · 520 kcal"],["トレーニング後","2品 · 366 kcal"]].map(x=><button key={x[0]} onClick={()=>{setNotice(`${x[0]}を追加しました`);setSheet(false)}}><span>{x[0]}</span><small>{x[1]}</small></button>)}</div>}</section></div>}
    </section>
    <aside><span>Interactive prototype</span><h2>食事記録の主要体験を確認できます</h2><p>日付切替、食事追加、よく使う食品の展開、画面タブの移動を操作できます。</p><ul><li>スマホ幅を想定したUI</li><li>ダミーデータで即時確認</li><li>要件定義と対応した画面構成</li></ul></aside>
  </main>;
}
