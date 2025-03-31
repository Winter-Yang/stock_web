import{h as B}from"./request-nnnmkeFF.js";import{_ as D,a as v,o as b,d as i,w as s,g as m,r as f,l as x,F as C,m as L,n as V,b as g,s as z,t as F,p as _}from"./index-DzOw8klO.js";class E{constructor(t){this.code=t.code||"",this.name=t.name||"",this.market=t.market||"",this.type=t.type||"",this.zf=t.info.zf}}class H{constructor(t){var r;this.date=t.date||"",this.block_list=((r=t.block_list)==null?void 0:r.map(n=>new E(n)))||[]}}const I=async(d="con")=>{try{const t=await B.get("https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/hot_block_list?type=con&field=zf");return console.log(t),data.map(r=>new H(r))}catch(t){throw console.error("获取热门板块数据失败:",t),t}},M={name:"HotBlockList",setup(){const d=f([]),t=f([]),r=f("con"),n=f(!1),y=e=>{const l=new Date(e);return`${l.getMonth()+1}/${l.getDate()}`},w=e=>e==null?"-":e>0?`+${e.toFixed(2)}%`:`${e.toFixed(2)}%`,u=(e,l)=>{const o=t.value.indexOf(l);return o<2?!1:t.value.slice(o-2,o+1).every(k=>e[k]>0)},h=e=>{const l=e.map(a=>a.date);t.value=l;const o={};return e.forEach(a=>{const k=a.date;a.block_list.forEach(c=>{o[c.code]||(o[c.code]={code:c.code,name:c.name,market:c.market,type:c.type}),o[c.code][k]=parseFloat(c.zf)})}),Object.values(o)},p=async()=>{n.value=!0;try{const e=await I(r.value);d.value=h(e)}catch(e){console.error("获取板块数据失败:",e)}finally{n.value=!1}};return x(()=>{p()}),{blockList:d,dateList:t,timeRange:r,loading:n,formatDate:y,formatPercent:w,isContinuousUp:u,fetchBlockData:p}}},N={class:"hot-block-list"},R={class:"block-header"};function U(d,t,r,n,y,w){const u=m("el-radio-button"),h=m("el-radio-group"),p=m("el-table-column"),e=m("el-table"),l=m("el-card");return b(),v("div",N,[i(l,{class:"block-card"},{header:s(()=>[g("div",R,[t[5]||(t[5]=g("h3",null,"热门板块涨跌幅",-1)),i(h,{modelValue:n.timeRange,"onUpdate:modelValue":t[0]||(t[0]=o=>n.timeRange=o),onChange:n.fetchBlockData},{default:s(()=>[i(u,{label:"con"},{default:s(()=>t[1]||(t[1]=[_("连续上涨")])),_:1}),i(u,{label:"day"},{default:s(()=>t[2]||(t[2]=[_("日榜")])),_:1}),i(u,{label:"week"},{default:s(()=>t[3]||(t[3]=[_("周榜")])),_:1}),i(u,{label:"month"},{default:s(()=>t[4]||(t[4]=[_("月榜")])),_:1})]),_:1},8,["modelValue","onChange"])])]),default:s(()=>[i(e,{data:n.blockList,style:{width:"100%"},height:"calc(100vh - 180px)","virtual-scrolling":!0,"row-height":54,border:""},{default:s(()=>[(b(!0),v(C,null,L(n.dateList,o=>(b(),V(p,{key:o,prop:o,label:n.formatDate(o),width:"100",align:"center"},{default:s(a=>[g("span",{class:z({"up-percent":a.row[o]>0,"down-percent":a.row[o]<0,"continuous-up":n.isContinuousUp(a.row,o)})},F(n.formatPercent(a.row[o])),3)]),_:2},1032,["prop","label"]))),128))]),_:1},8,["data"])]),_:1})])}const O=D(M,[["render",U],["__scopeId","data-v-ade66968"]]);export{O as default};
