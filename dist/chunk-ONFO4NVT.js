import{b as k,d as E,e as I,j as P}from"./chunk-DYNRCCWW.js";import{I as O,J as T}from"./chunk-RZHEX5A7.js";import{Cb as F,Hb as h,Ib as r,Jb as M,Nb as S,Rb as g,Sb as s,ab as o,bb as u,bc as p,cc as _,ec as m,fa as C,fc as b,gc as f,lc as D,pa as x,qa as d,ra as c,rb as v,xb as w,zb as y}from"./chunk-ZEAAPN4P.js";function V(l,z){if(l&1){let t=S();h(0,"label")(1,"input",1),f("ngModelChange",function(e){d(t);let i=s();return b(i.denyResize,e)||(i.denyResize=e),c(e)}),g("change",function(){d(t);let e=s();return c(e.onFormatChange())}),r(),p(2,"Deny widget resizing"),r(),h(3,"label")(4,"input",1),f("ngModelChange",function(e){d(t);let i=s();return b(i.denyMove,e)||(i.denyMove=e),c(e)}),g("change",function(){d(t);let e=s();return c(e.onFormatChange())}),r(),p(5,"Deny widget moving"),r(),h(6,"label")(7,"input",1),f("ngModelChange",function(e){d(t);let i=s();return b(i.preventFilters,e)||(i.preventFilters=e),c(e)}),g("change",function(){d(t);let e=s();return c(e.onFormatChange())}),r(),p(8,"Ignore filters"),r()}if(l&2){let t=s();o(),m("ngModel",t.denyResize),o(3),m("ngModel",t.denyMove),o(3),m("ngModel",t.preventFilters)}}var j=(()=>{class l{constructor(t,n){this.us=t,this.ss=n,this.title="Share dashboard",this.btnTitle="Copy link",this.shareUrl="",this.isSmall=!1,this.hideOptions=!1,this.isCopied=!1,this.asBase64=!1,this.denyResize=!1,this.denyMove=!1,this.preventFilters=!1,this.url="",this.onCopy=()=>{},this.asBase64=this.ss.storage.getItem("dsw-share-format-base64")==="1",this.denyResize=this.ss.storage.getItem("dsw-share-format-denyResize")==="1",this.denyMove=this.ss.storage.getItem("dsw-share-format-denyMove")==="1",this.preventFilters=this.ss.storage.getItem("dsw-share-format-preventFilters")==="1"}ngOnInit(){this.convertLink()}ngOnChanges(t){t.shareUrl&&t.shareUrl.previousValue!==t.shareUrl.currentValue&&this.convertLink()}onCopyClick(){this.us.copyToClipboard(this.url),this.isCopied=!0,clearTimeout(this.timeout),this.timeout=setTimeout(()=>{this.isCopied=!1},2e3),this.onCopy()}ngOnDestroy(){clearTimeout(this.timeout)}onFormatChange(){this.ss.storage.setItem("dsw-share-format-base64",this.asBase64?"1":"0"),this.ss.storage.setItem("dsw-share-format-denyMove",this.denyMove?"1":"0"),this.ss.storage.setItem("dsw-share-format-denyResize",this.denyResize?"1":"0"),this.ss.storage.setItem("dsw-share-format-preventFilters",this.preventFilters?"1":"0"),this.convertLink()}convertLink(){this.url=this.shareUrl;let t=this.shareUrl.split("?"),n=t[1];if(!n)return;let e=n.split("&");e=e.map(i=>{let a=i.split("=");return a[0]==="FILTERS"?(this.asBase64&&(a[1]=encodeURIComponent(btoa(a[1]))),this.preventFilters?"":a.join("=")):i}),this.denyMove&&e.push("nodrag=1"),this.denyResize&&e.push("noresize=1"),this.preventFilters&&e.push("nofilters=1"),t[1]=e.filter(i=>!!i).join("&"),this.url=t.join("?")}static{this.\u0275fac=function(n){return new(n||l)(u(O),u(T))}}static{this.\u0275cmp=C({type:l,selectors:[["dsw-share-dashboard"]],inputs:{title:"title",btnTitle:"btnTitle",shareUrl:"shareUrl",isSmall:"isSmall",hideOptions:"hideOptions",_modal:"_modal"},standalone:!0,features:[x,D],decls:10,vars:7,consts:[["type","text",3,"value"],["type","checkbox",3,"ngModelChange","change","ngModel"],[1,"btn",3,"click"]],template:function(n,e){n&1&&(h(0,"div")(1,"p"),p(2),r(),M(3,"textarea",0),h(4,"label")(5,"input",1),f("ngModelChange",function(a){return b(e.asBase64,a)||(e.asBase64=a),a}),g("change",function(){return e.onFormatChange()}),r(),p(6,"Filters as Base64"),r(),v(7,V,9,3),h(8,"button",2),g("click",function(){return e.onCopyClick()}),p(9),r()()),n&2&&(o(2),_(e.title),o(),y("small",e.isSmall),w("value",e.url),o(2),m("ngModel",e.asBase64),o(2),F(e.hideOptions?-1:7),o(2),_(e.isCopied?"Copied!":e.btnTitle))},dependencies:[P,k,E,I],styles:["[_ngcontent-%COMP%]:root{--cl-bg: #F5F5F5;--cl-accent: #1A73E8;--cl-btn-hover: #76abf1;--cl-hover: #E8F0FE;--cl-txt: #555555;--input-border-radius: 13px;--cl-btn-main: #5cb85c;--cl-btn-main-txt: #fff;--cl-btn-main-border: #4cae4c;--cl-btn-main-hover: #6eca6e;--cl-btn-secondary: #e6e6e6;--cl-btn-secondary-txt: #cccccc;--cl-btn-secondary-border: #b4b2b2;--cl-btn-secondary-hover: #dbdbdb;--icon-filter: none;--cl1: #b6e6ff;--cl2: #f7bfb7;--cl3: #bceca8;--cl4: #fff9a8;--cl5: #ffc593;--cl6: #f9b1ab;--cl7: #9de7fb;--cl8: #a8b8f9;--cl9: #9df1ae;--cl-header-bg: #FFFFFF;--cl-header-border: #F5F5F5;--cl-header-txt: #606367;--cl-header-ico: var(--cl-header-txt);--cl-header-btn-active: var(--cl-header-bg);--cl-header-btn-hover: var(--cl-bg);--cl-header-btn-hover-darken: var(--cl-hover);--header-height: 64px;--menu-item-icon-filter: none;--cl-sidebar-bg: #F5F5F5;--cl-sidebar-txt: #606367;--tile-border: none;--tile-border-radius: 10px;--tile-header-height: 28px;--cl-modal-bg: white;--fc0: #606367;--fc1: black;--fc2: red;--fc3: white;--fc4: green;--fc5: blue;--cl-widget-bg: white;--cl-widget-header-btn-active: #A9FFA1;--cl-widget-header-border: none;--cl-text-widget-font: #6b6464;--cl-widget-header-bg: var(--cl-header-bg);--cl-widget-header-txt: var(--cl-header-txt);--cl-widget-filter-txt: #606367;--cl-widget-filter-bg: var(--cl-header-bg);--widget-header-btn-opacity: 1;--widget-header-btn-filter: none;--widget-header-btn-active-filter: contrast(.7) sepia(1) brightness(1) hue-rotate(-898deg) contrast(9);--cl-input-bg: white;--cl-input-border: #EBEBEA;--cl-check-border: #606367;--cl-input-placeholder: rgba(96, 99, 103, .6);--cl-input-text: #606367;--cl-input-height: 26px;--cl-pivot-cell-border: rgb(208, 208, 208);--cl-pivot-cell-hover: #FFF7D7;--pivot-row-hover: inset 0 0 30px #fff5b9;--sidebar-width: 322px;--cl-scrollbar: #606367}[_nghost-%COMP%]{z-index:4;text-align:left;padding:20px}div[_ngcontent-%COMP%]{background:#fff;box-shadow:0 0 10px #0000001a;border-radius:10px;padding:20px}p[_ngcontent-%COMP%]{font-family:Oxygen;font-weight:500;font-size:14px;line-height:16px;color:var(--cl-header-txt);margin-top:0;margin-bottom:20px}input[_ngcontent-%COMP%], textarea[_ngcontent-%COMP%]{margin-bottom:10px;min-width:200px;color:var(--cl-header-txt);font-size:12px;line-height:14px}textarea[_ngcontent-%COMP%]{min-height:120px}textarea.small[_ngcontent-%COMP%]{min-height:80px}button[_ngcontent-%COMP%]{width:100%}input[_ngcontent-%COMP%]{min-width:16px;width:16px;display:inline-block;margin:0 4px 0 0;vertical-align:bottom}label[_ngcontent-%COMP%]{display:block;margin-bottom:10px;font-weight:400}"],changeDetection:0})}}return l})();export{j as a};