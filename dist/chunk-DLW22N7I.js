import{a as T}from"./chunk-67VWNTXN.js";import{a as A}from"./chunk-T7RCTQQC.js";import{a as E,b as F}from"./chunk-EEWDEGYN.js";import{e}from"./chunk-666PJRMV.js";import"./chunk-HCCYM72S.js";import{a as W}from"./chunk-2A5H5HUA.js";import{a as D}from"./chunk-MDOQS4TE.js";import"./chunk-G7BOERRR.js";import"./chunk-JOSE7QCS.js";import{b as k}from"./chunk-RYDNL5MS.js";import{d as M,e as O,i as S,j as P}from"./chunk-DYNRCCWW.js";import"./chunk-RZHEX5A7.js";import{Cb as w,Hb as l,Ib as d,Nb as y,Rb as h,Sb as r,ab as g,bb as b,bc as m,ec as u,fa as C,fc as f,gc as _,lc as v,qa as a,ra as c,rb as x,xb as p}from"./chunk-ZEAAPN4P.js";import"./chunk-MG3ERZGY.js";function V(s,L){if(s&1){let n=y();l(0,"div",1)(1,"label"),m(2,"Widget type"),d(),l(3,"ng-select",2),_("ngModelChange",function(t){a(n);let o=r();return f(o.type,t)||(o.type=t),c(t)}),h("change",function(){a(n);let t=r();return c(t.onTypeChange())}),d(),l(4,"label"),m(5,"Data source"),d(),l(6,"dsw-input",3),_("ngModelChange",function(t){a(n);let o=r();return f(o.model.dataSource,t)||(o.model.dataSource=t),c(t)}),h("keydown.enter",function(){a(n);let t=r();return c(t.onDatasourceChanged())})("choose",function(){a(n);let t=r();return c(t.onSelectDataSource())}),d(),l(7,"label"),m(8,"Reference to"),d(),l(9,"ng-select",4),_("ngModelChange",function(t){a(n);let o=r();return f(o.model.dataLink,t)||(o.model.dataLink=t),c(t)}),h("change",function(){a(n);let t=r();return c(t.onLinkChange())}),d()()}if(s&2){let n=r();g(3),u("ngModel",n.type),p("items",n.widgetTypes)("clearable",!1)("closeOnSelect",!0),g(3),p("required",n.invalid.includes("datasource")),u("ngModel",n.model.dataSource),p("chooseButton",!0),g(3),p("items",n.widgetList),u("ngModel",n.model.dataLink),p("clearable",!1)("closeOnSelect",!0)}}var J=(()=>{class s{constructor(n,i,t){this.ms=n,this.eds=i,this.ds=t,this.invalid=[],this.widgetList=[],this.widgetTypes=[e.pivot,e.columnChart,e.columnChartStacked,e.columnChart3D,e.barChart,e.barChartStacked,e.lineChart,e.lineChartMarkers,e.comboChart,e.hilowChart,e.areaChart,e.bubbleChart,e.xyChart,e.pieChart,e.pieChart3D,e.donutChart,e.donutChart3D,e.treeMapChart,e.bullseyeChart,e.timeChart,e.regular,e.textMeter,e.map]}ngOnInit(){this.widgetList=this.eds.getWidgetsList([this.model?.name??""]),this.type=e[this.model?.type?.toLowerCase()??""]}onSelectDataSource(){this.ms.show({title:"Choose data source",component:import("./chunk-E7UQVLOG.js"),buttons:[{label:"Cancel",autoClose:!0}],closeByEsc:!0,search:"",minHeight:!0,outputs:{select:n=>{this.model&&(this.model.dataSource=n.value+"."+n.type),this.onDatasourceChanged()}}})}ngOnDestroy(){this.eds.cancelEditing()}onTypeChange(){this.model&&(this.model.type=Object.entries(e).find(n=>n[1]===this.type)?.[0]||"",this.eds.updateEditedWidget({widget:this.model,reCreate:!0}))}onDatasourceChanged(){this.model&&this.eds.generateWidgetMdx(this.model).then(()=>{this.model&&this.eds.updateEditedWidget({widget:this.model,refreshData:!0})})}onLinkChange(){this.model&&this.eds.updateEditedWidget({widget:this.model,reCreate:!0})}onSave(){this.model&&this.eds.save(this.model)}static{this.\u0275fac=function(i){return new(i||s)(b(D),b(W),b(k))}}static{this.\u0275cmp=C({type:s,selectors:[["dsw-type-and-ds"]],inputs:{model:"model",invalid:"invalid"},standalone:!0,features:[v],decls:3,vars:3,consts:[[3,"apply","isWidgetEditorWarning","isBack"],[1,"container"],["bindLabel","label",1,"dsw",3,"ngModelChange","change","ngModel","items","clearable","closeOnSelect"],[3,"ngModelChange","keydown.enter","choose","required","ngModel","chooseButton"],["bindLabel","label","bindValue","name",1,"dsw",3,"ngModelChange","change","items","ngModel","clearable","closeOnSelect"]],template:function(i,t){i&1&&(l(0,"dsw-sidebar-actions",0),h("apply",function(){return t.onSave()}),m(1,` Type & Datasource
`),d(),x(2,V,10,11,"div",1)),i&2&&(p("isWidgetEditorWarning",!0)("isBack",!0),g(2),w(t.model?2:-1))},dependencies:[A,F,E,P,M,S,O,T],styles:["[_ngcontent-%COMP%]:root{--cl-bg: #F5F5F5;--cl-accent: #1A73E8;--cl-btn-hover: #76abf1;--cl-hover: #E8F0FE;--cl-txt: #555555;--input-border-radius: 13px;--cl-btn-main: #5cb85c;--cl-btn-main-txt: #fff;--cl-btn-main-border: #4cae4c;--cl-btn-main-hover: #6eca6e;--cl-btn-secondary: #e6e6e6;--cl-btn-secondary-txt: #cccccc;--cl-btn-secondary-border: #b4b2b2;--cl-btn-secondary-hover: #dbdbdb;--icon-filter: none;--cl1: #b6e6ff;--cl2: #f7bfb7;--cl3: #bceca8;--cl4: #fff9a8;--cl5: #ffc593;--cl6: #f9b1ab;--cl7: #9de7fb;--cl8: #a8b8f9;--cl9: #9df1ae;--cl-header-bg: #FFFFFF;--cl-header-border: #F5F5F5;--cl-header-txt: #606367;--cl-header-ico: var(--cl-header-txt);--cl-header-btn-active: var(--cl-header-bg);--cl-header-btn-hover: var(--cl-bg);--cl-header-btn-hover-darken: var(--cl-hover);--header-height: 64px;--menu-item-icon-filter: none;--cl-sidebar-bg: #F5F5F5;--cl-sidebar-txt: #606367;--tile-border: none;--tile-border-radius: 10px;--tile-header-height: 28px;--cl-modal-bg: white;--fc0: #606367;--fc1: black;--fc2: red;--fc3: white;--fc4: green;--fc5: blue;--cl-widget-bg: white;--cl-widget-header-btn-active: #A9FFA1;--cl-widget-header-border: none;--cl-text-widget-font: #6b6464;--cl-widget-header-bg: var(--cl-header-bg);--cl-widget-header-txt: var(--cl-header-txt);--cl-widget-filter-txt: #606367;--cl-widget-filter-bg: var(--cl-header-bg);--widget-header-btn-opacity: 1;--widget-header-btn-filter: none;--widget-header-btn-active-filter: contrast(.7) sepia(1) brightness(1) hue-rotate(-898deg) contrast(9);--cl-input-bg: white;--cl-input-border: #EBEBEA;--cl-check-border: #606367;--cl-input-placeholder: rgba(96, 99, 103, .6);--cl-input-text: #606367;--cl-input-height: 26px;--cl-pivot-cell-border: rgb(208, 208, 208);--cl-pivot-cell-hover: #FFF7D7;--pivot-row-hover: inset 0 0 30px #fff5b9;--sidebar-width: 322px;--cl-scrollbar: #606367}[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;padding-bottom:20px;transition:transform 2s linear;min-width:var(--sidebar-width)}.container[_ngcontent-%COMP%]{height:100%;overflow-y:auto;padding-left:20px;flex:1 1 100%}.container[_ngcontent-%COMP%]::-webkit-scrollbar{width:20px;height:4px}.container[_ngcontent-%COMP%]::-webkit-scrollbar-track{border-left:solid 16px var(--cl-bg);background:#ebebea}.container[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{border-left:solid 16px var(--cl-bg);border-radius:0;background:#1c1d2066}label[_ngcontent-%COMP%]{display:flex;justify-content:space-between;font-family:Oxygen;color:var(--cl-sidebar-txt);margin-top:10px;margin-bottom:2px;font-size:14px;width:calc(100% - 4px)}input[_ngcontent-%COMP%]{margin-bottom:4px}.divider[_ngcontent-%COMP%]{display:block;width:100%;clear:both}.btn-section[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;background-color:#fff;padding:10px;color:#1a73e8;font-size:14px;line-height:16px;border:1px solid #EBEBEA;border-radius:4px;width:100%;cursor:pointer;transition:background-color .3s linear}.btn-section[_ngcontent-%COMP%]:not(.disabled):hover{background-color:#1a73e80d}.btn-section[_ngcontent-%COMP%]:not(.disabled):active{transform:translateY(1px)}.headline[_ngcontent-%COMP%]{text-align:center;margin-bottom:10px}.navigation[_ngcontent-%COMP%]{margin-top:20px}.navigation[_ngcontent-%COMP%] > .btn-section[_ngcontent-%COMP%]:not(:last-child){margin-bottom:4px}.navigation[_ngcontent-%COMP%] > .headline[_ngcontent-%COMP%]{margin-top:20px}.disabled[_ngcontent-%COMP%]{cursor:default;filter:grayscale(1);opacity:.5}.footer[_ngcontent-%COMP%]{padding-left:20px}.footer[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:first-child{margin-top:20px}.footer[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{width:100%}.color-rect[_ngcontent-%COMP%]{-webkit-user-select:none;user-select:none;display:inline-flex;position:relative;align-items:center;justify-content:center;cursor:pointer;width:32px;height:32px;margin-right:4px;margin-bottom:4px;border:var(--tile-border);font-size:24px;outline-offset:-2px;float:left;background-size:60%}.color-rect[_ngcontent-%COMP%]:hover{outline:1px solid var(--cl-accent)}.color-rect.active[_ngcontent-%COMP%]{outline:3px solid var(--cl-accent)}.color-rect.small[_ngcontent-%COMP%]{width:32px}"]})}}return s})();export{J as TypeAndDatasourceComponent};