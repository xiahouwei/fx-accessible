(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["systemSetting"],{"3edb":function(t,e,n){"use strict";n.r(e);var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"sys-wrap"},[n("w-header",{attrs:{title:"系统设置",border:!0}}),n("div",{staticClass:"sys-content"},[n("van-cell-group",[n("van-cell",{attrs:{title:"字体大小",value:t.fomatterFontType(t.fontSize),"value-class":"info-item-value","is-link":""},on:{click:t.onFontSizeClick}})],1)],1),n("van-actionsheet",{attrs:{actions:t.stateActions,"cancel-text":"取消"},on:{select:t.onStateSelect},model:{value:t.stateActionShow,callback:function(e){t.stateActionShow=e},expression:"stateActionShow"}})],1)},o=[],s=n("cebc"),c=n("2f62"),a={name:"systemSetting",components:{},data:function(){return{fontSize:"",stateActionShow:!1,stateActions:[{id:"normal",name:"小"},{id:"big",name:"中"},{id:"large",name:"大"}]}},computed:Object(s["a"])({},Object(c["c"])({fontSizeType:function(t){return t.stylusDynamic.fontSizeType}}),{fomatterFontType:function(t){return function(t){return"big"===t?"中":"large"===t?"大":"小"}}}),mounted:function(){this.fontSize=this.fontSizeType},methods:{onFontSizeClick:function(){this.stateActionShow=!0},onStateSelect:function(t){this.fontSize=t.id,this.$store.commit({type:"SET_STYLUS_DYNAMIC",fontSizeType:t.id}),this.stateActionShow=!1}}},l=a,r=(n("8113"),n("2877")),u=Object(r["a"])(l,i,o,!1,null,"6b80ef16",null);e["default"]=u.exports},"7d62":function(t,e,n){},8113:function(t,e,n){"use strict";var i=n("7d62"),o=n.n(i);o.a}}]);
//# sourceMappingURL=systemSetting.0d98bf20.js.map