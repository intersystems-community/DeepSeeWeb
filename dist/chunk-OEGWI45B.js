import{H as J,f as W,x as H}from"./chunk-GDT23CSW.js";import{Aa as z,Bb as D,Cb as v,Ea as $,F as q,Fb as _,Gb as x,Hb as d,Ib as s,Jb as y,Kc as I,Mb as L,Nb as g,Rb as f,Sb as l,Xb as M,Yb as P,Zb as S,ab as o,ac as R,bb as p,bc as T,dc as O,fa as k,lc as E,mc as V,nc as j,pa as A,qa as b,ra as u,rb as h,tc as N,xb as m,y as B,za as F,zb as C}from"./chunk-ZEAAPN4P.js";import{h as Q}from"./chunk-MG3ERZGY.js";var X=["elements"],Y=i=>({tab:i,edit:null});function ee(i,c){if(i&1){let e=g();d(0,"div",4,0),f("click",function(){let n=b(e).$implicit,r=l();return u(r.tabClick(n))}),T(2),s()}if(i&2){let e=c.$implicit,t=l();C("hidden-offscreen",e.hidden)("active",t.currentTab===e),o(2),O(" ",e.text," ")}}function te(i,c){if(i&1){let e=g();d(0,"div",5),f("click",function(n){b(e);let r=l();return u(r.onOpenTabsClick(n))}),y(1,"img",6),s()}}function ie(i,c){if(i&1){let e=g();d(0,"div",8),f("click",function(){let n=b(e).$implicit,r=l(2);return u(r.tabClick(n))}),T(1),s()}if(i&2){let e=c.$implicit,t=l(2);C("active",t.currentTab===e),m("routerLink","./")("queryParams",t.useQuery?V(5,Y,e.id):void 0),o(),O(" ",e.text," ")}}function ne(i,c){if(i&1&&(d(0,"div",3),_(1,ie,2,7,"div",7,D().trackByIdentity,!0),s()),i&2){let e=l();o(),x(e.hiddenTabs)}}var re=37;var K=(()=>{class i{constructor(e,t,n){this.el=e,this.cd=t,this.zone=n,this.tabs=[],this.useQuery=!1,this.currentTabChange=new F,this.isMoreButtonVisible=!1,this.isOpened=!1,this.trackByIdentity=(r,a)=>a.id,this.zone.runOutsideAngular(()=>{this.subClick=B(window,"click").subscribe(r=>{let a=r.target;for(;a;){if(a.classList.contains("btn-more"))return;if(!a.parentElement)break;a=a.parentElement}this.isOpened=!1}),this.subResize=B(window,"resize").pipe(q(50)).subscribe(r=>{this.recalcTabsVisibility(!0)})})}get hiddenTabs(){return this.tabs.filter(e=>e.hidden)}tabClick(e){this.currentTab=e,this.currentTabChange.emit(this.currentTab)}scrollToTabs(){this.el.nativeElement.scrollIntoView()}ngAfterViewInit(){this.recalcTabsVisibility()}ngOnChanges(e){let t=e.tabs;if(t.previousValue!==t.currentValue||t.previousValue?.length!==t.currentValue?.length){if(this.isArraysEqual(t.previousValue,t.currentValue))return;setTimeout(()=>{this.recalcTabsVisibility()})}}recalcTabsVisibility(e=!1){if(!this.elements)return;let t=this.el.nativeElement.offsetWidth,n=this.elements.toArray().map(a=>a.nativeElement),r=0;this.isMoreButtonVisible=!1,n.forEach((a,w)=>{let U=w===n.length-1,Z=a.getBoundingClientRect();r+=Z.width,r>t+8-(U?0:re)?(this.tabs[w].hidden=!0,this.isMoreButtonVisible=!0):this.tabs[w].hidden=!1}),e&&this.cd.detectChanges()}ngOnDestroy(){this.subClick&&this.subClick.unsubscribe(),this.subResize&&this.subResize.unsubscribe()}onOpenTabsClick(e){this.isOpened=!this.isOpened}isArraysEqual(e,t){if(!e||!t||e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}static{this.\u0275fac=function(t){return new(t||i)(p($),p(I),p(z))}}static{this.\u0275cmp=k({type:i,selectors:[["dsw-tabs"]],viewQuery:function(t,n){if(t&1&&M(X,5),t&2){let r;P(r=S())&&(n.elements=r)}},inputs:{tabs:"tabs",currentTab:"currentTab",useQuery:"useQuery"},outputs:{currentTabChange:"currentTabChange"},standalone:!0,features:[A,E],decls:4,vars:2,consts:[["elements",""],[1,"tab",3,"hidden-offscreen","active"],[1,"tab","btn-more"],[1,"dropdown"],[1,"tab",3,"click"],[1,"tab","btn-more",3,"click"],["src","/assets/img/more-horiz.svg"],["queryParamsHandling","merge",3,"active","routerLink","queryParams"],["queryParamsHandling","merge",3,"click","routerLink","queryParams"]],template:function(t,n){t&1&&(_(0,ee,3,5,"div",1,n.trackByIdentity,!0),h(2,te,2,0,"div",2)(3,ne,3,0,"div",3)),t&2&&(x(n.tabs),o(2),v(n.isMoreButtonVisible?2:-1),o(),v(n.isOpened?3:-1))},dependencies:[H],styles:['[_ngcontent-%COMP%]:root{--cl-bg: #F5F5F5;--cl-accent: #1A73E8;--cl-btn-hover: #76abf1;--cl-hover: #E8F0FE;--cl-txt: #555555;--input-border-radius: 13px;--cl-btn-main: #5cb85c;--cl-btn-main-txt: #fff;--cl-btn-main-border: #4cae4c;--cl-btn-main-hover: #6eca6e;--cl-btn-secondary: #e6e6e6;--cl-btn-secondary-txt: #cccccc;--cl-btn-secondary-border: #b4b2b2;--cl-btn-secondary-hover: #dbdbdb;--icon-filter: none;--cl1: #b6e6ff;--cl2: #f7bfb7;--cl3: #bceca8;--cl4: #fff9a8;--cl5: #ffc593;--cl6: #f9b1ab;--cl7: #9de7fb;--cl8: #a8b8f9;--cl9: #9df1ae;--cl-header-bg: #FFFFFF;--cl-header-border: #F5F5F5;--cl-header-txt: #606367;--cl-header-ico: var(--cl-header-txt);--cl-header-btn-active: var(--cl-header-bg);--cl-header-btn-hover: var(--cl-bg);--cl-header-btn-hover-darken: var(--cl-hover);--header-height: 64px;--menu-item-icon-filter: none;--cl-sidebar-bg: #F5F5F5;--cl-sidebar-txt: #606367;--tile-border: none;--tile-border-radius: 10px;--tile-header-height: 28px;--cl-modal-bg: white;--fc0: #606367;--fc1: black;--fc2: red;--fc3: white;--fc4: green;--fc5: blue;--cl-widget-bg: white;--cl-widget-header-btn-active: #A9FFA1;--cl-widget-header-border: none;--cl-text-widget-font: #6b6464;--cl-widget-header-bg: var(--cl-header-bg);--cl-widget-header-txt: var(--cl-header-txt);--cl-widget-filter-txt: #606367;--cl-widget-filter-bg: var(--cl-header-bg);--widget-header-btn-opacity: 1;--widget-header-btn-filter: none;--widget-header-btn-active-filter: contrast(.7) sepia(1) brightness(1) hue-rotate(-898deg) contrast(9);--cl-input-bg: white;--cl-input-border: #EBEBEA;--cl-check-border: #606367;--cl-input-placeholder: rgba(96, 99, 103, .6);--cl-input-text: #606367;--cl-input-height: 26px;--cl-pivot-cell-border: rgb(208, 208, 208);--cl-pivot-cell-hover: #FFF7D7;--pivot-row-hover: inset 0 0 30px #fff5b9;--sidebar-width: 322px;--cl-scrollbar: #606367}[_nghost-%COMP%]{position:relative;font-family:Oxygen;font-style:normal;font-weight:400;font-size:16px;line-height:24px;text-transform:uppercase;word-break:break-word;-webkit-user-select:none;user-select:none;color:var(--cl-input-text);text-align:center;display:flex;min-width:0;margin-bottom:10px;width:100%}[_nghost-%COMP%]:after{content:"";display:block;width:100%;height:1px;background-color:var(--cl-input-border);position:absolute;bottom:0}.tab[_ngcontent-%COMP%]{outline:none;cursor:pointer;position:relative;flex-shrink:0;padding-left:8px;padding-right:8px;padding-bottom:2px}.tab[_ngcontent-%COMP%]:first-child{margin-left:-8px}.tab.hidden-offscreen[_ngcontent-%COMP%]{position:absolute;left:-100000px;top:-100000px;visibility:hidden}.tab[_ngcontent-%COMP%]:after{display:none;position:absolute;content:" ";width:calc(100% - 16px);z-index:1;border-radius:4px}.tab.active[_ngcontent-%COMP%]:after{height:4px;background:var(--cl-accent)}.tab.active[_ngcontent-%COMP%]{color:var(--cl-input-text)}.tab.active[_ngcontent-%COMP%]:after{display:block}.tab[_ngcontent-%COMP%]:hover:not(.active){color:var(--cl-input-text)}.tab[_ngcontent-%COMP%]:hover:not(.active):after{display:block;background:var(--cl-input-text)}.btn-more[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;padding-left:16px;padding-right:16px;margin-left:auto}.btn-more[_ngcontent-%COMP%] > img[_ngcontent-%COMP%]{height:7px;opacity:.4}.dropdown[_ngcontent-%COMP%]{position:absolute;top:calc(100% + 4px);right:0;background-color:#fff;display:flex;flex-direction:column;box-shadow:0 0 10px #0000001f;border-radius:4px;z-index:1;overflow:hidden}.dropdown[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{padding:6px 16px}.dropdown[_ngcontent-%COMP%] > div.active[_ngcontent-%COMP%]{background-color:var(--cl-bg);color:var(--cl-input-text)}'],changeDetection:0})}}return i})();var ce=["table"],ae=i=>({data:i,level:0}),oe=(i,c)=>({data:i,level:c});function le(i,c){i&1&&y(0,"img",9)}function se(i,c){if(i&1){let e=g();d(0,"div",8),f("click",function(){let n=b(e).$implicit,r=l().level,a=l();return u(a.selectRow(n,r))}),h(1,le,1,0,"img",9),T(2),s()}if(i&2){let e=c.$implicit,t=l().level,n=l();C("selected",n.selected[t]===e),o(),v(e.children!=null&&e.children.length?1:-1),o(),O(" ",e.name," ")}}function de(i,c){if(i&1&&_(0,se,3,4,"div",7,D().trackByIndex,!0),i&2){let e=c.data;x(e)}}function he(i,c){i&1&&L(0)}function be(i,c){i&1&&L(0)}function ue(i,c){if(i&1&&(d(0,"div"),h(1,be,1,0,"ng-container",5),s()),i&2){let e=c.$implicit,t=c.$index;l();let n=R(3);o(),m("ngTemplateOutlet",n)("ngTemplateOutletContext",j(2,oe,e.children,t+1))}}function pe(i,c){i&1&&(d(0,"div",6),y(1,"img",10),s())}var Ie=(()=>{class i{constructor(e,t){this.ds=e,this.cd=t,this.select=new F,this.isLoading=!0,this.tabs=[{id:"pivot",text:"Pivot tables"},{id:"kpi",text:"KPI"},{id:"worksheets",text:"Worksheets"},{id:"metrics",text:"Metrics"}],this.currentTab=this.tabs[0],this.data=[],this.filteredData=[],this.selected=[],this.trackByIndex=(n,r)=>n}ngOnInit(){this.requestData(),this.subSearch=this._modal?.search.subscribe(e=>{this.applyFiltering(e)})}selectRow(e,t){if(!e.children){this.select.emit(e),this._modal?.close();return}this.selected[t]=e,this.selected.splice(t+1,this.selected.length-t),this.scrollToLast()}requestData(e){return Q(this,null,function*(){e||(e=this.currentTab),this.isLoading=!0,this.ds.requestListOfDataSources(e.id).then(t=>{this.retrieveData(t)}).catch(t=>{console.error(t)}).finally(()=>{this.isLoading=!1,this.cd.detectChanges()})})}ngOnDestroy(){clearTimeout(this.scrollTimeout),this.subSearch?.unsubscribe()}retrieveData(e){this.data=e.children,this.selected=[],this.applyFiltering()}scrollToLast(){clearTimeout(this.scrollTimeout),this.scrollTimeout=setTimeout(()=>{let e=this.table.nativeElement,t=this.table.nativeElement.children[0].offsetWidth;e.scroll({left:this.selected.length*t,behavior:"smooth"})},10)}applyFiltering(e=""){if(e=e.toString(),e===""){this.filteredData=this.data,this.cd.detectChanges();return}this.selected=[],this.filteredData=JSON.parse(JSON.stringify(this.data)),this.filterItems(this.filteredData,e.toLowerCase()),this.scrollToLast(),this.cd.detectChanges()}filterItems(e,t){let n=[];return e.forEach(r=>{if(!(r.children?.length&&this.filterItems(r.children,t))&&!r.name.toLowerCase().includes(t)){n.push(r);return}}),n.forEach(r=>{e.splice(e.indexOf(r),1)}),!!e.length}static{this.\u0275fac=function(t){return new(t||i)(p(J),p(I))}}static{this.\u0275cmp=k({type:i,selectors:[["dsw-ds-sel-dialog"]],viewQuery:function(t,n){if(t&1&&M(ce,5),t&2){let r;P(r=S())&&(n.table=r.first)}},inputs:{_modal:"_modal"},outputs:{select:"select"},standalone:!0,features:[E],decls:11,vars:8,consts:[["items",""],["table",""],[1,"header"],[3,"currentTabChange","tabs","currentTab","useQuery"],[1,"table"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"dsw-spinner"],[1,"row",3,"selected"],[1,"row",3,"click"],["src","assets/img/widget-icons/folder-1.svg"],["src","assets/img/spinner.svg"]],template:function(t,n){if(t&1){let r=g();d(0,"section",2)(1,"dsw-tabs",3),f("currentTabChange",function(w){return b(r),u(n.requestData(w))}),s()(),h(2,de,2,0,"ng-template",null,0,N),d(4,"section",4,1)(6,"div"),h(7,he,1,0,"ng-container",5),s(),_(8,ue,2,5,"div",null,n.trackByIndex,!0),h(10,pe,2,0,"div",6),s()}if(t&2){let r=R(3);o(),m("tabs",n.tabs)("currentTab",n.currentTab)("useQuery",!1),o(6),m("ngTemplateOutlet",r)("ngTemplateOutletContext",V(6,ae,n.filteredData)),o(),x(n.selected),o(2),v(n.isLoading?10:-1)}},dependencies:[K,W],styles:['@charset "UTF-8";[_ngcontent-%COMP%]:root{--cl-bg: #F5F5F5;--cl-accent: #1A73E8;--cl-btn-hover: #76abf1;--cl-hover: #E8F0FE;--cl-txt: #555555;--input-border-radius: 13px;--cl-btn-main: #5cb85c;--cl-btn-main-txt: #fff;--cl-btn-main-border: #4cae4c;--cl-btn-main-hover: #6eca6e;--cl-btn-secondary: #e6e6e6;--cl-btn-secondary-txt: #cccccc;--cl-btn-secondary-border: #b4b2b2;--cl-btn-secondary-hover: #dbdbdb;--icon-filter: none;--cl1: #b6e6ff;--cl2: #f7bfb7;--cl3: #bceca8;--cl4: #fff9a8;--cl5: #ffc593;--cl6: #f9b1ab;--cl7: #9de7fb;--cl8: #a8b8f9;--cl9: #9df1ae;--cl-header-bg: #FFFFFF;--cl-header-border: #F5F5F5;--cl-header-txt: #606367;--cl-header-ico: var(--cl-header-txt);--cl-header-btn-active: var(--cl-header-bg);--cl-header-btn-hover: var(--cl-bg);--cl-header-btn-hover-darken: var(--cl-hover);--header-height: 64px;--menu-item-icon-filter: none;--cl-sidebar-bg: #F5F5F5;--cl-sidebar-txt: #606367;--tile-border: none;--tile-border-radius: 10px;--tile-header-height: 28px;--cl-modal-bg: white;--fc0: #606367;--fc1: black;--fc2: red;--fc3: white;--fc4: green;--fc5: blue;--cl-widget-bg: white;--cl-widget-header-btn-active: #A9FFA1;--cl-widget-header-border: none;--cl-text-widget-font: #6b6464;--cl-widget-header-bg: var(--cl-header-bg);--cl-widget-header-txt: var(--cl-header-txt);--cl-widget-filter-txt: #606367;--cl-widget-filter-bg: var(--cl-header-bg);--widget-header-btn-opacity: 1;--widget-header-btn-filter: none;--widget-header-btn-active-filter: contrast(.7) sepia(1) brightness(1) hue-rotate(-898deg) contrast(9);--cl-input-bg: white;--cl-input-border: #EBEBEA;--cl-check-border: #606367;--cl-input-placeholder: rgba(96, 99, 103, .6);--cl-input-text: #606367;--cl-input-height: 26px;--cl-pivot-cell-border: rgb(208, 208, 208);--cl-pivot-cell-hover: #FFF7D7;--pivot-row-hover: inset 0 0 30px #fff5b9;--sidebar-width: 322px;--cl-scrollbar: #606367}[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;overflow:hidden}.header[_ngcontent-%COMP%]{flex-shrink:0}.table[_ngcontent-%COMP%]{position:relative;flex:1 1 100%;min-width:800px;min-height:0;display:flex;white-space:nowrap;overflow:hidden}.table[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{flex-shrink:0;flex-grow:1;flex-basis:25%;border-right:1px solid var(--cl-input-border);overflow:auto;min-width:25%;width:25%}.table[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]::-webkit-scrollbar{width:4px;height:4px}.table[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]::-webkit-scrollbar-track{background:#ebebea}.table[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{border-radius:0;background:#1c1d2066}.table[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:first-child{position:sticky;left:0;z-index:2;background:#fff}.row[_ngcontent-%COMP%]{-webkit-user-select:none;user-select:none;padding:5px 4px;cursor:pointer;align-items:center;color:var(--cl-widget-filter-txt);max-width:25em;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;position:relative}.row[_ngcontent-%COMP%]:hover{background-color:var(--cl-hover);color:var(--cl-header-txt)}.row.selected[_ngcontent-%COMP%]{color:var(--cl-accent);background-color:var(--cl-sidebar-bg)}.row[_ngcontent-%COMP%] > img[_ngcontent-%COMP%]{height:18px;vertical-align:text-top;margin-right:2px}'],changeDetection:0})}}return i})();export{Ie as DataSourceSelectorDialog};
