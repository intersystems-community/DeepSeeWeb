import{a as B}from"./chunk-46Q5OBLB.js";import{a as I}from"./chunk-TNJR2DGC.js";import{h as R}from"./chunk-NUM3NPQK.js";import"./chunk-V6EVLSKF.js";import"./chunk-WQ472VVB.js";import"./chunk-W7AFIDCE.js";import"./chunk-54YLOEMX.js";import"./chunk-NNQN4XTN.js";import"./chunk-EB65ROO7.js";import"./chunk-EAEBZZLM.js";import"./chunk-KZYWQXNG.js";import{a as T}from"./chunk-RNWIIYZZ.js";import{a as E}from"./chunk-SUAWKU6Z.js";import"./chunk-4PTSBRBG.js";import{b as F,d as O,e as A,j as k}from"./chunk-XYWIWAW2.js";import{D as v,E as x,I as y,J as M,K as P}from"./chunk-JIOS6KUH.js";import{$a as l,$b as u,Db as o,Eb as a,Nb as h,Xb as s,Yb as b,Zb as _,_b as m,ab as g,ac as f,cc as w,fa as S,hc as c,ic as d}from"./chunk-ZKAUCJHV.js";import"./chunk-DEPBX7UX.js";var Q=(()=>{let p=class p{constructor(r,n,e,i,t){this.sbs=r,this.ss=n,this.us=e,this.modal=i,this.i18n=t,this.settings=this.ss.getAppSettings(),this.model={isSaveFilters:this.settings.isSaveFilters===void 0?!0:this.settings.isSaveFilters,isRelatedFilters:this.settings.isRelatedFilters===void 0?!0:this.settings.isRelatedFilters,isTilePushDisabled:!!this.settings.isTilePushDisabled,colCount:this.settings.colCount||R}}ngOnInit(){}onCancel(){this.sbs.hide()}onApply(){this.applySettings(),this.sbs.hide()}readSettings(r){let n=r.target.files[0];if(!n)return;let e=new FileReader;e.onload=i=>{let t=JSON.parse(String.fromCharCode.apply(null,new Uint8Array(i.target.result)));this.ss.setAllSettings(t),this.ss.onSettingsChanged.emit(this.ss.getAppSettings()),this.sbs.hide(),this.modal.show(this.i18n.get("settingsImported"),()=>{window.location.reload()})},e.readAsArrayBuffer(n)}exportSettings(){let r=P+"."+new Date().toLocaleDateString()+".json",n=JSON.stringify(this.ss.getAllSettings());this.downloadFile(r,n)}resetSettings(){let r=n=>{delete n.userSettings,this.modal.show(this.i18n.get("settingsReset"),()=>{window.location.reload()})};r(sessionStorage);try{r(localStorage)}catch{}}applySettings(){this.settings.isSaveFilters=!!this.model.isSaveFilters,this.settings.isRelatedFilters=!!this.model.isRelatedFilters,this.settings.isTilePushDisabled=!!this.model.isTilePushDisabled,this.settings.colCount=this.model.colCount,this.ss.onSettingsChanged.emit(this.settings),this.ss.setAppSettings(this.settings)}downloadFile(r,n){let e=document.createElement("a");e.style.setProperty("display","none"),e.download=r;let i=new Blob([n],{type:"application/octet-stream"}),t=window.URL.createObjectURL(i);e.href=t,document.body.appendChild(e),e.click(),setTimeout(D=>{document.body.removeChild(e),window.URL.revokeObjectURL(t)},100)}};p.\u0275fac=function(n){return new(n||p)(g(E),g(M),g(y),g(T),g(x))},p.\u0275cmp=S({type:p,selectors:[["dsw-app-settings"]],standalone:!0,features:[w],decls:30,vars:25,consts:[[3,"cancel","apply"],[1,"container"],["type","number",3,"ngModelChange","ngModel"],["type","checkbox",3,"ngModelChange","ngModel"],["type","file","enctype","multipart/form-data",3,"change"],[1,"actions"],[1,"btn",3,"click"]],template:function(n,e){n&1&&(o(0,"dsw-sidebar-actions",0),h("cancel",function(){return e.onCancel()})("apply",function(){return e.onApply()}),s(1,"Settings"),a(),o(2,"div",1)(3,"label"),s(4),c(5,"i18n"),a(),o(6,"dsw-input",2),f("ngModelChange",function(t){return u(e.model.colCount,t)||(e.model.colCount=t),t}),a(),o(7,"label"),s(8),c(9,"i18n"),o(10,"input",3),f("ngModelChange",function(t){return u(e.model.isSaveFilters,t)||(e.model.isSaveFilters=t),t}),a()(),o(11,"label"),s(12),c(13,"i18n"),o(14,"input",3),f("ngModelChange",function(t){return u(e.model.isRelatedFilters,t)||(e.model.isRelatedFilters=t),t}),a()(),o(15,"label"),s(16),c(17,"i18n"),o(18,"input",3),f("ngModelChange",function(t){return u(e.model.isTilePushDisabled,t)||(e.model.isTilePushDisabled=t),t}),a()(),o(19,"label"),s(20),c(21,"i18n"),a(),o(22,"input",4),h("change",function(t){return e.readSettings(t)}),a(),o(23,"div",5)(24,"button",6),h("click",function(){return e.resetSettings()}),s(25),c(26,"i18n"),a(),o(27,"button",6),h("click",function(){return e.exportSettings()}),s(28),c(29,"i18n"),a()()()),n&2&&(l(4),b(d(5,11,"dashColumns")),l(2),m("ngModel",e.model.colCount),l(2),_("",d(9,13,"saveFilters")," "),l(2),m("ngModel",e.model.isSaveFilters),l(2),_("",d(13,15,"relatedFilters")," "),l(2),m("ngModel",e.model.isRelatedFilters),l(2),_("",d(17,17,"disableTilePush")," "),l(2),m("ngModel",e.model.isTilePushDisabled),l(2),b(d(21,19,"importSettings")),l(5),b(d(26,21,"resetSettings")),l(3),b(d(29,23,"exportSettings")))},dependencies:[I,B,k,F,O,A,v],styles:["[_ngcontent-%COMP%]:root{--cl-bg: #F5F5F5;--cl-accent: #1A73E8;--cl-btn-hover: #76abf1;--cl-hover: #E8F0FE;--cl-txt: #555555;--input-border-radius: 13px;--cl-btn-main: #5cb85c;--cl-btn-main-txt: #fff;--cl-btn-main-border: #4cae4c;--cl-btn-main-hover: #6eca6e;--cl-btn-secondary: #e6e6e6;--cl-btn-secondary-txt: #cccccc;--cl-btn-secondary-border: #b4b2b2;--cl-btn-secondary-hover: #dbdbdb;--icon-filter: none;--cl1: #b6e6ff;--cl2: #f7bfb7;--cl3: #bceca8;--cl4: #fff9a8;--cl5: #ffc593;--cl6: #f9b1ab;--cl7: #9de7fb;--cl8: #a8b8f9;--cl9: #9df1ae;--cl-header-bg: #FFFFFF;--cl-header-border: #F5F5F5;--cl-header-txt: #606367;--cl-header-ico: var(--cl-header-txt);--cl-header-btn-active: var(--cl-header-bg);--cl-header-btn-hover: var(--cl-bg);--cl-header-btn-hover-darken: var(--cl-hover);--header-height: 64px;--menu-item-icon-filter: none;--cl-sidebar-bg: #F5F5F5;--cl-sidebar-txt: #606367;--tile-border: none;--tile-border-radius: 10px;--tile-header-height: 28px;--cl-modal-bg: white;--fc0: #606367;--fc1: black;--fc2: red;--fc3: white;--fc4: green;--fc5: blue;--cl-widget-bg: white;--cl-widget-header-btn-active: #A9FFA1;--cl-widget-header-border: none;--cl-text-widget-font: #6b6464;--cl-widget-header-bg: var(--cl-header-bg);--cl-widget-header-txt: var(--cl-header-txt);--cl-widget-filter-txt: #606367;--cl-widget-filter-bg: var(--cl-header-bg);--widget-header-btn-opacity: 1;--widget-header-btn-filter: none;--widget-header-btn-active-filter: contrast(.7) sepia(1) brightness(1) hue-rotate(-898deg) contrast(9);--cl-input-bg: white;--cl-input-border: #EBEBEA;--cl-check-border: #606367;--cl-input-placeholder: rgba(96, 99, 103, .6);--cl-input-text: #606367;--cl-input-height: 26px;--cl-pivot-cell-border: rgb(208, 208, 208);--cl-pivot-cell-hover: #FFF7D7;--pivot-row-hover: inset 0 0 30px #fff5b9;--sidebar-width: 322px;--cl-scrollbar: #606367}[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;padding-bottom:20px;transition:transform 2s linear;min-width:var(--sidebar-width)}.container[_ngcontent-%COMP%]{height:100%;overflow-y:auto;padding-left:20px;flex:1 1 100%}.container[_ngcontent-%COMP%]::-webkit-scrollbar{width:20px;height:4px}.container[_ngcontent-%COMP%]::-webkit-scrollbar-track{border-left:solid 16px var(--cl-bg);background:#ebebea}.container[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{border-left:solid 16px var(--cl-bg);border-radius:0;background:#1c1d2066}label[_ngcontent-%COMP%]{display:flex;justify-content:space-between;font-family:Oxygen;color:var(--cl-sidebar-txt);margin-top:10px;margin-bottom:2px;font-size:14px;width:calc(100% - 4px)}input[_ngcontent-%COMP%]{margin-bottom:4px}.divider[_ngcontent-%COMP%]{display:block;width:100%;clear:both}.btn-section[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;background-color:#fff;padding:10px;color:#1a73e8;font-size:14px;line-height:16px;border:1px solid #EBEBEA;border-radius:4px;width:100%;cursor:pointer;transition:background-color .3s linear}.btn-section[_ngcontent-%COMP%]:not(.disabled):hover{background-color:#1a73e80d}.btn-section[_ngcontent-%COMP%]:not(.disabled):active{transform:translateY(1px)}.headline[_ngcontent-%COMP%]{text-align:center;margin-bottom:10px}.navigation[_ngcontent-%COMP%]{margin-top:20px}.navigation[_ngcontent-%COMP%] > .btn-section[_ngcontent-%COMP%]:not(:last-child){margin-bottom:4px}.navigation[_ngcontent-%COMP%] > .headline[_ngcontent-%COMP%]{margin-top:20px}.disabled[_ngcontent-%COMP%]{cursor:default;filter:grayscale(1);opacity:.5}.footer[_ngcontent-%COMP%]{padding-left:20px}.footer[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:first-child{margin-top:20px}.footer[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{width:100%}.color-rect[_ngcontent-%COMP%]{-webkit-user-select:none;user-select:none;display:inline-flex;position:relative;align-items:center;justify-content:center;cursor:pointer;width:32px;height:32px;margin-right:4px;margin-bottom:4px;border:var(--tile-border);font-size:24px;outline-offset:-2px;float:left;background-size:60%}.color-rect[_ngcontent-%COMP%]:hover{outline:1px solid var(--cl-accent)}.color-rect.active[_ngcontent-%COMP%]{outline:3px solid var(--cl-accent)}.color-rect.small[_ngcontent-%COMP%]{width:32px}",".actions[_ngcontent-%COMP%]{display:flex;justify-content:space-between;margin-top:20px;margin-bottom:10px}.actions[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{width:100%}.actions[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]:first-child{margin-right:5px}.actions[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]:last-child{margin-left:5px}"]});let C=p;return C})();export{Q as AppSettingsComponent};
