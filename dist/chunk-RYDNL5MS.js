import{F as c,J as f}from"./chunk-RZHEX5A7.js";import{X as o,aa as n,g as r,za as l}from"./chunk-ZEAAPN4P.js";var p=(()=>{class e{constructor(){this.emitter=new l}broadcast(t,s){this.emitter.emit({message:t,value:s})}subscribe(t,s){return this.emitter.subscribe(i=>{i.message===t&&s(i.value)})}static{this.\u0275fac=function(s){return new(s||e)}}static{this.\u0275prov=o({token:e,factory:e.\u0275fac,providedIn:"root"})}}return e})();var v=(()=>{class e{constructor(t){this.ss=t,this.current=new r(""),this.dashboard=new r(null),this.widgets=[],this.allWidgets=[]}setWidgets(t){this.widgets=t}getWidgets(){return this.widgets}getWidgetsWithoutEmpty(t=[]){return this.widgets.filter(s=>s.type!==c.const.emptyWidgetClass&&!t.includes(s.name))}setAllWidgets(t){this.allWidgets=t}getAllWidgets(){return this.allWidgets}saveWidgetPositionAndSize(t){let s=this.ss.getWidgetsSettings(t.dashboard),i=t.name;s[i]||(s[i]={}),isNaN(t.x)||(s[i].col=t.x),isNaN(t.y)||(s[i].row=t.y),isNaN(t.cols)||(s[i].sizeX=t.cols),isNaN(t.rows)||(s[i].sizeY=t.rows),this.ss.setWidgetsSettings(s,t.dashboard)}generateDisplayInfo(t){if(t.displayInfo)return;let s=1,i=1,a=this.dashboard.value;a&&(s=Math.floor(12/a.displayInfo.gridCols),s<1&&(s=1),i<1&&(i=1));let h={topCol:Math.floor((t.x||0)/s),leftRow:Math.floor((t.y||0)/i),colWidth:Math.floor((t.cols||1)/s),rowHeight:Math.floor(t.rows||1)};t.displayInfo=h}static{this.\u0275fac=function(s){return new(s||e)(n(f))}}static{this.\u0275prov=o({token:e,factory:e.\u0275fac,providedIn:"root"})}}return e})();export{p as a,v as b};