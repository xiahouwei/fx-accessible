(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["shopOrder~unifyOrder"],{"0c3e":function(t,e,i){"use strict";var n=i("bbb7"),o=i.n(n);o.a},"450d":function(t,e,i){"use strict";var n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"item-complete-block"},[i("w-header",{attrs:{title:t.title,leftOptions:t.leftOptions},on:{"on-click-back":t.onCloseClick}}),i("div",{staticClass:"clearfix"},[i("van-search",{attrs:{placeholder:"请输入搜索关键词",shape:"round"},on:{search:t.onConfirmKey},model:{value:t.searchKey,callback:function(e){t.searchKey=e},expression:"searchKey"}})],1),i("div",{ref:"details-content",staticClass:"item-list"},[i("van-tabs",{attrs:{"swipe-threshold":3,color:"#538FFD"},model:{value:t.activeName,callback:function(e){t.activeName=e},expression:"activeName"}},t._l(t.itemList,function(e){return i("van-tab",{key:e.id,attrs:{title:e.groupName}},[i("div",{staticClass:"item-btn-wrap"},[i("van-button",{attrs:{size:"small",plain:"1"===e.checkType,type:"primary"},on:{click:function(i){return t.onCheckClick(e,"0")}}},[t._v("未验收")]),i("van-button",{attrs:{size:"small",plain:"0"===e.checkType||!e.checkType,type:"primary"},on:{click:function(i){return t.onCheckClick(e,"1")}}},[t._v("已验收")])],1),i("div",{staticClass:"item-group-wrap"},[i("div",{staticClass:"item-group-detail"},t._l(t.detailFilter(e.groupDetails),function(n){return i("van-swipe-cell",{directives:[{name:"show",rawName:"v-show",value:n.checkFlag===e.checkType||!e.checkType&&"0"===n.checkFlag,expression:"(item.checkFlag === group.checkType) || (!group.checkType && item.checkFlag === '0')"}],key:n.id,ref:"details-content",refInFor:!0,staticClass:"store-row"},[i("ItemCompleteCell",{attrs:{itemData:n,isDisabled:t.isDisabled,disabledEditBtn:t.focusing},on:{"on-edit-click":t.onEditClick,"on-complete-click":t.onCompleteClick,"on-upload-click":t.onUploadClick}})],1)}),1)])])}),1)],1),i("van-popup",{attrs:{position:"bottom","lock-scroll":!1},on:{close:t.onNumberKeyboardClose},model:{value:t.numberKeyboardShow,callback:function(e){t.numberKeyboardShow=e},expression:"numberKeyboardShow"}},[i("itemNumberKeyboard",{attrs:{title:t.keyboardTitleCompted,unit:t.keyboardUnitCompted,amount:t.keyboardAmountCompted,pointSize:t.sysPointSize,intLength:t.numberLength},on:{"on-save-click":t.onKeyboardSave,change:t.onKeyboardChange,hide:t.onKeyboardHide}})],1),i("van-actionsheet",{attrs:{actions:t.uploadActions,"cancel-text":"取消"},on:{select:t.onUploadSelect},model:{value:t.uploadActionShow,callback:function(e){t.uploadActionShow=e},expression:"uploadActionShow"}})],1)},o=[],a=i("795b"),s=i.n(a),c=i("59ad"),r=i.n(c),l=(i("6762"),i("2fdb"),i("28a5"),i("f499")),u=i.n(l),d=(i("7f7f"),i("7514"),i("cebc")),m=i("2f62"),h=(i("9541"),function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"item-info-cell"},[i("div",{staticClass:"info-wrap"},[i("div",{staticClass:"info-item-wrap"},[i("div",{staticClass:"info-item fx-ellipsis"},[t._v(t._s(t.itemData.goodsDTO.name))]),i("div",{staticClass:"info-item fx-ellipsis"},[t._v(t._s(t.itemData.inHouseDTO.name))]),"0"===t.itemData.checkFlag?i("div",{staticClass:"info-item"},[i("span",[t._v("出库数：")]),i("span",[t._v(t._s(t.itemData.rawAmount))]),i("span",[t._v(t._s(t.itemData.unitDTO.name))])]):i("div",{staticClass:"info-item"},[i("span",[t._v("订货：")]),i("span",[t._v(t._s(t.itemData.outOrderAmount))]),i("span",[t._v(t._s(t.itemData.unitDTO.name))])])]),"0"===t.itemData.checkFlag?i("div",{staticClass:"info-item"},[i("van-button",{attrs:{round:"",size:"small",type:"primary",disabled:t.isDisabled},on:{click:function(e){return t.onCompleteClick()}}},[t._v("\n\t\t\t\t验收\n\t\t\t")])],1):i("div",{staticClass:"info-item"},[i("span",[t._v("验收：")]),i("span",[t._v(t._s(t.itemData.checkAmount))]),i("span",[t._v(t._s(t.itemData.unitDTO.name))])])]),i("div",{staticClass:"btn-wrap"},[i("div",{staticClass:"icon-wrap pho-btn"},[i("van-icon",{staticClass:"btn-style",attrs:{name:"photograph",size:"20px",color:"#538FFD"},on:{click:function(e){return t.onUploadClick()}}})],1),i("div",{staticClass:"icon-wrap"},[i("van-icon",{staticClass:"btn-style",attrs:{name:"edit",size:"20px",color:"#538FFD"},on:{click:function(e){return t.onEditClick()}}})],1)])])}),b=[],f={name:"ItemCompleteCell",props:{itemData:{type:Object,default:function(){return{}}},isDisabled:Boolean},data:function(){return{}},methods:{onEditClick:function(t){!this.isDisabled&&this.$emit("on-edit-click",this.itemData)},onUploadClick:function(){!this.isDisabled&&this.$emit("on-upload-click",this.itemData)},onCompleteClick:function(){!this.isDisabled&&this.$emit("on-complete-click",this.itemData)}}},p=f,v=(i("0c3e"),i("2877")),k=Object(v["a"])(p,h,b,!1,null,"02922d30",null),C=k.exports,y=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"item-number-keyboard fx-shadow-up"},[i("div",{staticClass:"number-keyboard-title"},[i("div",{staticClass:"title-name fx-ellipsis"},[t._v(t._s(t.title))]),i("div",{staticClass:"title-amount"},[t._v(t._s(t.amount))]),i("div",{staticClass:"title-unit",on:{click:t.onUnitClick}},[i("span",{staticClass:"title-unit-text fx-ellipsis"},[t._v(t._s(t.unit))]),i("i",{directives:[{name:"show",rawName:"v-show",value:t.unitEdit,expression:"unitEdit"}],staticClass:"title-unit-select"})])]),i("div",{staticClass:"number-keyboard-content"},[i("div",{staticClass:"keyboard-number"},[i("div",{staticClass:"keyboard-number-row"},[i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("1")}}},[t._v("1")]),i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("2")}}},[t._v("2")]),i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("3")}}},[t._v("3")]),i("i",{staticClass:"keyboard-btn-1 keyboard-btn-hide fx-Pseudo-btn",on:{click:t.hideKeyboardBtnClick}})]),i("div",{staticClass:"keyboard-number-row"},[i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("4")}}},[t._v("4")]),i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("5")}}},[t._v("5")]),i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("6")}}},[t._v("6")]),i("i",{staticClass:"keyboard-btn-1 keyboard-btn-del fx-Pseudo-btn",on:{click:t.delBtnClick}})]),i("div",{staticClass:"keyboard-number-end-row"},[i("div",{staticClass:"keyboard-number-left"},[i("div",{staticClass:"keyboard-number-row"},[i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("7")}}},[t._v("7")]),i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("8")}}},[t._v("8")]),i("i",{staticClass:"keyboard-btn-1 fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("9")}}},[t._v("9")])]),i("div",{staticClass:"keyboard-number-row"},[i("i",{staticClass:"keyboard-btn-2 keyboard-btn-zero fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick("0")}}},[t._v("0")]),i("i",{staticClass:"keyboard-btn-1 keyboard-btn-dot fx-Pseudo-btn",on:{click:function(e){return t.numberBtnClick(".")}}},[t._v(".")])])]),i("div",{staticClass:"keyboard-number-right",on:{click:t.onSaveClick}},[t._v("确认")])])])])])},g=[],w=(i("3b2b"),i("c5f6"),{name:"itemNumberKeyboard",props:{title:String,unit:String,amount:[String,Number],unitEdit:{type:Boolean,default:!1},integer:Boolean,pointSize:{type:[String,Number],default:4},intLength:{type:[String,Number],default:8}},computed:{computedNumberReg:function(){return new RegExp("^\\d+(\\.|\\.\\d{1,".concat(this.pointSize-1,"})?$"))}},methods:{numberBtnClick:function(t){this.$emit("input",t),this.$emit("change",this.getAddValue(t))},delBtnClick:function(t){this.$emit("delete"),this.$emit("change",this.getDelValue(t))},hideKeyboardBtnClick:function(){this.$emit("hide")},onUnitClick:function(){this.$emit("on-unit-unitEdit")},onSaveClick:function(){this.$emit("on-save-click")},getAddValue:function(t){var e=this.amount+"";return-1===e.indexOf(".")&&e.length>=this.intLength&&"."!==t||-1!==e.indexOf(".")&&("."===t||!this.computedNumberReg.test(e))||"."===t&&this.integer?e:("0"===e&&"."!==t?e=t:e+=t,e)},getDelValue:function(t){var e=this.amount+"";return"0"===e?e:(e=1===e.length?"0":e.substr(0,e.length-1),e)}}}),D=w,x=(i("c2cd"),Object(v["a"])(D,y,g,!1,null,"485e7033",null)),I=x.exports,S={name:"itemCompletePop",components:{ItemCompleteCell:C,itemNumberKeyboard:I},props:{billId:String,data:{type:Array,default:function(){return[]}},isDisabled:Boolean,visibleFlag:Boolean,searchKeywords:String,title:String,getCheckList:{type:Function,default:function(){console.log("prop function")}},completeHandle:{type:Function,default:function(){console.log("prop function")}}},data:function(){return{focusing:!1,leftOptions:{showBackBtn:!0,preventGoBack:!0},searchKey:"",rowActiveItem:{},itemRowEditPopShow:!1,itemEditRowData:{},unitActions:[],unitActionShow:!1,activeStoreNames:[],itemList:[],searchItemId:"",activeName:0,numberKeyboardShow:!1,uploadItem:{},uploadActionShow:!1,uploadActions:[{id:0,name:"拍摄"},{id:1,name:"从手机相册选择"}]}},watch:{visibleFlag:{handler:function(t){t&&this.createDetails(this.data)},immediate:!0}},computed:Object(d["a"])({},Object(m["c"])({sysPointSize:"sysPointSize",numberLength:"numberLength",loginerId:function(t){return t.loginer.loginerId},loginerShopId:function(t){return t.loginer.loginerShopId}}),{keyboardTitleCompted:function(){var t=this;if(this.rowActiveItem.id){var e=this.itemList[this.activeName].groupDetails.find(function(e){return e.id===t.rowActiveItem.id});return e.goodsDTO.name}return""},keyboardUnitCompted:function(){var t=this;if(this.rowActiveItem.id){var e=this.itemList[this.activeName].groupDetails.find(function(e){return e.id===t.rowActiveItem.id});return e.unitDTO.name}return""},keyboardAmountCompted:function(){var t=this;if(this.rowActiveItem.id){var e=this.itemList[this.activeName].groupDetails.find(function(e){return e.id===t.rowActiveItem.id});return e.checkAmount}return"0"}}),methods:{createDetails:function(t,e,i){this.searchKey="",i&&t[e]&&(t[e].checkType=i),this.itemList=JSON.parse(u()(t)),this.searchItemId="",this.activeName=e||0},detailFilter:function(t){var e=this;return t.filter(function(t){return!!e.searchKeywords.split(",").find(function(i){if(t.goodsDTO[i].includes(e.searchKey))return!e.searchItemId||t.goodsDTO.id===e.searchItemId})})},onCloseClick:function(){if(this.focusing)return!1;this.$emit("update:visibleFlag",!1),this.$emit("on-complete-change")},getItemByRedCode:function(t){var e=this;if(!this.visibleFlag)return!1;this.getItemByCode(t).then(function(t){var i=t.billAndDetails[0];if(0===i.length)return e.$fxToast.top("当前仓库无此品项!"),!1;for(var n=null,o=0;o<e.itemList.length;o++)if(n=e.itemList[o].groupDetails.find(function(t){return t.goodsDTO.id===i.goodsDTO.id}),n)break;n?(e.searchItemId=n.goodsDTO.id,e.itemUpdate(i)):e.$fxToast.top("无此品项!"),e.searchKey=""})},itemUpdate:function(t){for(var e=null,i=0;i<this.itemList.length;i++)if(e=this.itemList[i].groupDetails.find(function(e){return e.goodsDTO.id===t.goodsDTO.id&&"0"===e.checkFlag}),e)break;var n=e.unitDTO,o=t.unitDTO,a=o.value/n.value,s=e.goodsDTO.countValue*a;e.checkAmount=this.toFixedNumberSize(s)},toFixedNumberSize:function(t){return r()(this.$fxUtils.toFixedSHW(t,this.sysPointSize))},getItemByCode:function(t){var e=this;return new s.a(function(i){var n={m:"getGoodsByBarCode4Modify",barCodes:t};e.$fxHttp.requestGet({url:"".concat(e.$fxBaseApi.url,"/accounts/").concat(e.loginerShopId,"/users/").concat(e.loginerId,"/goods"),data:n}).then(function(t){i(t)})})},onConfirmKey:function(){if(""!==this.searchKey)return!0;this.searchItemId=""},onCheckClick:function(t,e){this.$set(t,"checkType",e)},onUploadClick:function(t){this.uploadItem=t,this.uploadActionShow=!0},onUploadSelect:function(t){var e=this;this.uploadActionShow=!1;var i="";0===t.id?this.$fxCordova.camera.getPictureByCamera().then(function(t){i="data:image/jpeg;base64,"+t,e.uploadImge(i)}):this.$fxCordova.camera.getPictureByLibrary().then(function(t){i="data:image/jpeg;base64,"+t,e.uploadImge(i)})},uploadImge:function(t){var e=this;return new s.a(function(i){var n={"input_files[]":[t],del_filename:[]};e.$fxHttp.requestPost({url:"".concat(e.$fxBaseApi.url,"/upload/detailId/").concat(e.uploadItem.id,"/uploadDetailPicturesMultipleWithMaxCount"),data:n}).then(function(t){e.getCheckList().then(function(t){e.$fxToast.success("照片上传成功！"),e.createDetails(t.billDetailGroup,e.activeName,e.itemList[e.activeName].checkType||"")}),i(t)})})},onCompleteClick:function(t,e){var i=this,n=0;n=void 0!==e?e:t.rawAmount;var o={groupId:this.itemList[this.activeName].groupId,groupAmount:n,data:t,checkFlag:this.rowActiveItem.checkFlag};this.completeHandle(t,o,this.billId).then(function(t){i.getCheckList().then(function(t){i.rowActiveItem={},i.numberKeyboardShow=!1,i.createDetails(t.billDetailGroup,i.activeName,i.itemList[i.activeName].checkType||""),i.$fxToast.success("验收成功")})})},onEditClick:function(t){this.rowActiveItem=JSON.parse(u()(t)),this.numberKeyboardShow=!0},onKeyboardSave:function(){var t=this,e=this.itemList[this.activeName].groupDetails.find(function(e){return e.id===t.rowActiveItem.id});this.onCompleteClick(e,e.checkAmount)},onKeyboardChange:function(t){this.changeSelectItem(t)},onKeyboardHide:function(){this.changeSelectItem(this.rowActiveItem.checkAmount),this.numberKeyboardShow=!1,this.rowActiveItem={}},onNumberKeyboardClose:function(){this.changeSelectItem(this.rowActiveItem.checkAmount),this.rowActiveItem={}},changeSelectItem:function(t){var e=this,i=this.toFixedNumberSize(t),n=this.itemList[this.activeName].groupDetails.find(function(t){return t.id===e.rowActiveItem.id});if(!n)return!1;n.checkAmount=t,n.inMoney=this.toFixedNumberSize(r()(n.price)*r()(i)),n.taxInMoney=this.toFixedNumberSize(r()(n.inMoney)*r()(n.tax)),n.inMoneyWithTax=this.toFixedNumberSize(r()(n.inMoney)+r()(n.taxInMoney))}}},_=S,A=(i("6611"),i("efe7"),Object(v["a"])(_,n,o,!1,null,"0590a5a6",null));e["a"]=A.exports},6372:function(t,e,i){},6611:function(t,e,i){"use strict";var n=i("6372"),o=i.n(n);o.a},9541:function(t,e,i){"use strict"},b7db:function(t,e,i){},bbb7:function(t,e,i){},c2cd:function(t,e,i){"use strict";var n=i("f1e6"),o=i.n(n);o.a},efe7:function(t,e,i){"use strict";var n=i("b7db"),o=i.n(n);o.a},f1e6:function(t,e,i){}}]);
//# sourceMappingURL=shopOrder~unifyOrder.887dbcce.js.map