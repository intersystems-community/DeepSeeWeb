import{Da as s,X as r,g as c}from"./chunk-ZKAUCJHV.js";import{h as i}from"./chunk-DEPBX7UX.js";var l=(()=>{let e=class e{constructor(){this.sidebarToggle=new c(void 0),this.onAnimStart=new s,this.onAnimEnd=new s,this.stack=[]}hide(){this.resetComponentStack(),this.sidebarToggle.next(void 0)}showComponent(t){return i(this,null,function*(){if(!t){this.hide();return}if(t.component&&t.component.then){yield t.component;let n=yield t.component;t.component=n[Object.keys(n)[0]]}if(t?.single&&this.stack.find(a=>a.component===t?.component)){this.sidebarToggle.next(t);return}t?.component&&this.stack.push(t),t&&this.sidebarToggle.next(t)})}popComponent(){this.stack.pop();let t=this.stack.pop()||null;this.showComponent(t)}resetComponentStack(){this.stack=[]}};e.\u0275fac=function(n){return new(n||e)},e.\u0275prov=r({token:e,factory:e.\u0275fac,providedIn:"root"});let o=e;return o})();export{l as a};
