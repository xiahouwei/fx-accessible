(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["reportDqjcb4cld"],{"4cdb":function(e,t,i){"use strict";var a=i("a7a2"),n=i.n(a);n.a},a2bd:function(e,t,i){"use strict";i.r(t);var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("reportFormContainer",{ref:"reportForm",attrs:{reportFormConfig:e.reportFormConfig,reportPlans:e.reportPlans,getReportParams:e.getReportParams,filterPopShow:e.filterPopShow,reportFormId:e.reportFormId,showSearchBar:""},on:{"update:filterPopShow":function(t){e.filterPopShow=t},"update:filter-pop-show":function(t){e.filterPopShow=t}}},[i("filterPop",{attrs:{slot:"slot-filter",visibleFlag:e.filterPopShow,filterParams:e.filterParams},on:{"update:visibleFlag":function(t){e.filterPopShow=t},"update:visible-flag":function(t){e.filterPopShow=t},"update:filterParams":function(t){e.filterParams=t},"update:filter-params":function(t){e.filterParams=t},"on-confirm":e.filterConfirm},slot:"slot-filter"})],1)},n=[],r=(i("7f7f"),i("c5f6"),i("795b")),o=i.n(r),l=i("cebc"),s=(i("96cf"),i("3b8d")),m=i("2f62"),c=i("fe17"),u=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("filterPopComp",{on:{"on-close":e.onCloseClick,"on-confirm":e.onConfirmClick,"on-reset":e.onResetClick}},[i("van-cell-group",{attrs:{slot:"solt-filter-cell"},slot:"solt-filter-cell"},[i("filterCell",{attrs:{title:"中心名称",value:e.shopName,showCloseBtn:!!e.shopNameId},on:{"on-click":function(t){return e.onFilterCellClick("shopNamePopShow")},"on-clear":function(t){return e.onFilterCellClear(["shopName","store"])}}}),i("filterCell",{attrs:{title:"中心仓库",value:e.store,showCloseBtn:!!e.storeId},on:{"on-click":function(t){return e.onFilterCellClick("storePopShow")},"on-clear":function(t){return e.onFilterCellClear("store")}}}),i("filterCell",{attrs:{title:"品项大类",value:e.dlName,showCloseBtn:!!e.dlNameId},on:{"on-click":function(t){return e.onFilterCellClick("dlNamePopShow")},"on-clear":function(t){return e.onFilterCellClear(["dlName","lbName","itemName"])}}}),i("filterCell",{attrs:{title:"品项类别",value:e.lbName,showCloseBtn:!!e.lbNameId},on:{"on-click":function(t){return e.onFilterCellClick("lbNamePopShow")},"on-clear":function(t){return e.onFilterCellClear(["lbName","itemName"])}}}),i("filterCell",{attrs:{title:"品项名称",value:e.itemName,showCloseBtn:!!e.itemNameId},on:{"on-click":function(t){return e.onFilterCellClick("itemNamePopShow")},"on-clear":function(t){return e.onFilterCellClear("itemName")}}}),i("filterCell",{staticClass:"dates-class",attrs:{title:"生产日期",value:e.detes,showCloseBtn:!!e.detes},on:{"on-clear":function(t){return e.onFilterCellClear("dates")}}}),i("van-cell",{attrs:{title:"起始时间",value:e.makeTimeOn,"is-link":""},on:{click:e.onBeginDateClick}}),i("van-cell",{attrs:{title:"结束时间",value:e.makeTimeOff,"is-link":""},on:{click:e.endDateClick}}),i("w-cell",{attrs:{title:"结存数量"}},[i("w-number-input",{attrs:{defaultValue:e.defaultValue,pointSize:e.pointSize,isEmptyValue:e.isEmptyValue,type:e.inputType},model:{value:e.startAmount,callback:function(t){e.startAmount=t},expression:"startAmount"}}),e._v("  至 \n\t\t\t"),i("w-number-input",{attrs:{defaultValue:e.defaultValue,pointSize:e.pointSize,isEmptyValue:e.isEmptyValue,type:e.inputType},model:{value:e.endAmount,callback:function(t){e.endAmount=t},expression:"endAmount"}})],1),i("filterCell",{attrs:{title:"财务分类",value:e.ftName,showCloseBtn:!!e.ftNameId},on:{"on-click":function(t){return e.onFilterCellClick("ftNamePopShow")},"on-clear":function(t){return e.onFilterCellClear("ftName")}}})],1),i("van-popup",{attrs:{position:"bottom"},model:{value:e.datePickerShow,callback:function(t){e.datePickerShow=t},expression:"datePickerShow"}},[i("datePicker",{attrs:{visibleFlag:e.datePickerShow,currentDate:e.currentDate},on:{"update:visibleFlag":function(t){e.datePickerShow=t},"update:visible-flag":function(t){e.datePickerShow=t},confirm:e.dateConfirmhandle}})],1),i("filterListPopup",{attrs:{title:"中心检索",rollingLoad:!0,getDataApi:e.getCenterListData},on:{"on-select":function(t){return e.onFilterSelect(arguments,"shopName")}},model:{value:e.shopNamePopShow,callback:function(t){e.shopNamePopShow=t},expression:"shopNamePopShow"}}),i("filterListPopup",{attrs:{title:"中心仓库检索",rollingLoad:!0,getDataApi:e.getCenterStoreListData},on:{"on-select":function(t){return e.onFilterSelect(arguments,"store")}},model:{value:e.storePopShow,callback:function(t){e.storePopShow=t},expression:"storePopShow"}}),i("filterListPopup",{attrs:{title:"品项大类检索",rollingLoad:!0,getDataApi:e.getBigClassListData},on:{"on-select":function(t){return e.onFilterSelect(arguments,"dlName")}},model:{value:e.dlNamePopShow,callback:function(t){e.dlNamePopShow=t},expression:"dlNamePopShow"}}),i("filterListPopup",{attrs:{title:"品项类别检索",rollingLoad:!0,getDataApi:e.getSmallClassListData},on:{"on-select":function(t){return e.onFilterSelect(arguments,"lbName")}},model:{value:e.lbNamePopShow,callback:function(t){e.lbNamePopShow=t},expression:"lbNamePopShow"}}),i("filterListPopup",{attrs:{title:"品项检索",rollingLoad:!0,getDataApi:e.getItemListData},on:{"on-select":function(t){return e.onFilterSelect(arguments,"itemName")}},model:{value:e.itemNamePopShow,callback:function(t){e.itemNamePopShow=t},expression:"itemNamePopShow"}}),i("filterListPopup",{attrs:{title:"财务分类检索",rollingLoad:!0,getDataApi:e.getFinancialTypeListData},on:{"on-select":function(t){return e.onFilterSelect(arguments,"ftName")}},model:{value:e.ftNamePopShow,callback:function(t){e.ftNamePopShow=t},expression:"ftNamePopShow"}})],1)},f=[],h=(i("ac6a"),i("768b")),p=i("cd56"),d=i("a343"),g=i("3a5e"),k=i("eb03"),N=["shopName","store","dlName","lbName","itemName","ftName"],P={name:"filterPop",components:{filterPopComp:p["a"],datePicker:d["a"],filterCell:g["a"],filterListPopup:k["a"]},props:{visibleFlag:Boolean,filterParams:{type:Object,default:function(){return{}}}},data:function(){return{leftOptions:{showBackBtn:!0,preventGoBack:!0},dateType:"",currentDate:new Date,makeTimeOn:this.$fxUtils.setDate(),makeTimeOff:this.$fxUtils.setDate(),shopName:"请选择",shopNameId:"",store:"请选择",storeId:"",dlName:"请选择",dlNameId:"",lbName:"请选择",lbNameId:"",itemName:"请选择",itemNameId:"",startAmount:"",endAmount:"",ftName:"请选择",ftNameId:"",shopNamePopShow:!1,datePickerShow:!1,storePopShow:!1,dlNamePopShow:!1,lbNamePopShow:!1,itemNamePopShow:!1,ftNamePopShow:!1,pointSize:4,defaultValue:"",inputWidth:"200",isEmptyValue:!0,inputType:"text"}},created:function(){},watch:{visibleFlag:{handler:function(e){e&&(this.$fxUtils.isEmptyObjSHW(this.filterParams)?this.resetHandler():this.setFilterParams())},immediate:!0}},computed:Object(l["a"])({},Object(m["c"])({sysPointSize:"sysPointSize",numberLength:"numberLength",maxAmount:"maxAmount",loginerShopId:function(e){return e.loginer.loginerShopId},loginerShopName:function(e){return e.loginer.loginerShopName},loginerId:function(e){return e.loginer.loginerId},loginerOrganType:function(e){return e.loginer.loginerOrganType}}),{shopCellDisable:function(){return this.$fxStateMiddleware.stateIs("loginerOrganType")(["shop","shopName","area"])(this.loginerOrganType)},detes:function(){return this.makeTimeOn||this.makeTimeOff?this.makeTimeOn+"至"+this.makeTimeOff:""}}),methods:{getFilterParams:function(){return{makeTimeOn:this.makeTimeOn,makeTimeOff:this.makeTimeOff,shopName:this.shopName,shopNameId:this.shopNameId,store:this.store,storeId:this.storeId,dlName:this.dlName,dlNameId:this.dlNameId,lbName:this.lbName,lbNameId:this.lbNameId,itemName:this.itemName,itemNameId:this.itemNameId,startAmount:this.startAmount,endAmount:this.endAmount,ftName:this.ftName,ftNameId:this.ftNameId}},onCloseClick:function(){this.$emit("update:visibleFlag",!1)},onConfirmClick:function(){this.$emit("update:visibleFlag",!1),this.$emit("update:filterParams",this.getFilterParams()),this.$emit("on-confirm",this.getFilterParams())},onResetClick:function(){this.resetHandler()},resetHandler:function(){this.makeTimeOn="".concat(this.$fxUtils.setDate()),this.makeTimeOff="".concat(this.$fxUtils.setDate()),this.startAmount="",this.endAmount="",this.resetFilterCell(N)},setFilterParams:function(){var e=this;N.forEach(function(t){e.filterParams[t]?(e[t]=e.filterParams[t],e["".concat(t,"Id")]=e.filterParams["".concat(t,"Id")]):e.resetFilterCell(t)})},onBeginDateClick:function(){this.dateType="begin",this.makeTimeOn&&(this.currentDate=new Date(this.makeTimeOn)),this.datePickerShow=!0},endDateClick:function(){this.dateType="end",this.makeTimeOff&&(this.currentDate=new Date(this.makeTimeOff)),this.datePickerShow=!0},dateConfirmhandle:function(e){"begin"===this.dateType?(this.makeTimeOn=this.$fxUtils.setDate(e),this.makeTimeOff&&this.$fxUtils.compareDateRange(this.makeTimeOn,this.makeTimeOff,31)||(this.makeTimeOff=this.setDateRange(this.makeTimeOn,31))):"end"===this.dateType&&(this.makeTimeOff=this.$fxUtils.setDate(e),this.makeTimeOn&&this.$fxUtils.compareDateRange(this.makeTimeOn,this.makeTimeOff,31)||(this.makeTimeOn=this.setDateRange(this.makeTimeOff,-31))),this.datePickerShow=!1},setDateRange:function(e,t){return this.$fxUtils.setDate(this.$fxUtils.getCustomAssignDate(e,t))},onFilterCellClick:function(e){this[e]=!0},onFilterCellClear:function(e){this.resetFilterCell(e)},onFilterSelect:function(e,t){var i=Object(h["a"])(e,1),a=i[0];this[t]=a.name,this["".concat(t,"Id")]=a.id,this.selectAfterHandler(t)},selectAfterHandler:function(e){switch(e){case"shopName":this.resetFilterCell("store");break;case"dlName":this.resetFilterCell(["lbName","itemName"]);break;case"lbName":this.resetFilterCell("itemName");break}},resetFilterCell:function(e){var t=this;if("dates"===e)this.datesResetFilterCell();else{var i=[].concat(e);i.forEach(function(e){t[e]="请选择",t["".concat(e,"Id")]=""})}},datesResetFilterCell:function(){this.makeTimeOn="",this.makeTimeOff=""},getCenterListData:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0,a={keyword:e,start:t,size:i};return this.$fxApi("reportForm.getRdcs")(a)},getCenterStoreListData:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0,a={keyword:e,pid:this.shopNameId,start:t,size:i};return this.getDataApi("allhouse",a)},getBigClassListData:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0,a={keyword:e,start:t,size:i};return this.getDataApi("goodstype4big",a)},getSmallClassListData:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0,a={keyword:e,pid:this.dlNameId,start:t,size:i};return this.getDataApi("goodstype4small",a)},getItemListData:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0,a={keyword:e,start:t,size:i,bigClassId:this.dlNameId,smallClassId:this.lbNameId};return this.getDataApi("allgoods",a)},getFinancialTypeListData:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0,a={keyword:e,start:t,size:i};return this.getDataApi("allfinacetype",a)},getDataApi:function(e,t){return this.$fxApi("reportForm.getCommonFilter")(e,t)}}},C=P,w=(i("4cdb"),i("2877")),b=Object(w["a"])(C,u,f,!1,null,"9b2c903a",null),v=b.exports,S="ZXKC_100010",F={name:"report-dqjcb4cld",components:{reportFormContainer:c["a"],filterPop:v},data:function(){var e=this.$fxCommon.getReportFormConfig(S);return{reportFormConfig:e,filterPopShow:!1,filterParams:{},reportPlans:[],reportFormId:S}},mounted:function(){var e=Object(s["a"])(regeneratorRuntime.mark(function e(){var t;return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,this.getReportPlans();case 2:t=e.sent,this.reportPlans=t,this.$refs.reportForm.init({reportPlan:this.reportPlans[0],getReportParams:this.getReportParams});case 5:case"end":return e.stop()}},e,this)}));function t(){return e.apply(this,arguments)}return t}(),computed:Object(l["a"])({},Object(m["c"])({loginerShopId:function(e){return e.loginer.loginerShopId},loginerShopName:function(e){return e.loginer.loginerShopName},loginerOrganType:function(e){return e.loginer.loginerOrganType}}),Object(m["b"])(["reportPlansGetter"])),methods:{filterConfirm:function(e){var t=this;this.filterParamsCheck(e).then(function(){t.getReportParams(e).then(function(e){t.$refs.reportForm.refreshReportForm(e)})})},getReportParams:function(){var e=Object(s["a"])(regeneratorRuntime.mark(function e(){var t,i=arguments;return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:if(t=i.length>0&&void 0!==i[0]?i[0]:{},!this.$fxUtils.isEmptyObjSHW(t)){e.next=7;break}return e.next=4,this.getReportParamsDefault();case 4:e.t0=e.sent,e.next=8;break;case 7:e.t0={makeTimeOn:t.makeTimeOn?"".concat(t.makeTimeOn," 00:00:00"):"",makeTimeOff:t.makeTimeOff?"".concat(t.makeTimeOff," 23:59:59"):"",shopName:"请选择"!==t.shopName?t.shopName:"",storeId:t.storeId,dlName:"请选择"!==t.dlName?t.dlName:"",lbName:"请选择"!==t.lbName?t.lbName:"",itemName:"请选择"!==t.itemName?t.itemName:"",startAmount:t.startAmount,endAmount:t.endAmount,ftName:"请选择"!==t.ftName?t.ftName:"",agg:{}};case 8:return e.abrupt("return",e.t0);case 9:case"end":return e.stop()}},e,this)}));function t(){return e.apply(this,arguments)}return t}(),filterParamsCheck:function(e){var t=this;return new o.a(function(i,a){e.startAmount||e.endAmount?e.startAmount?e.endAmount?Number(e.startAmount)>Number(e.endAmount)?(t.filterPopShow=!0,t.$fxToast.fail("结存数量的最小数量不能大于结存数量的最大数量")):i():(t.filterPopShow=!0,t.$fxToast.fail("请填写结存数量的最大数量")):(t.filterPopShow=!0,t.$fxToast.fail("请填写结存数量的最小数量")):i()})},getReportParamsDefault:function(){var e=Object(s["a"])(regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",{makeTimeOn:"".concat(this.$fxUtils.setDate()," 00:00:00"),makeTimeOff:"".concat(this.$fxUtils.setDate()," 23:59:59"),agg:{jCCurrentAmount:"sum",aJCCurrentAmount:"sum"}});case 1:case"end":return e.stop()}},e,this)}));function t(){return e.apply(this,arguments)}return t}(),getDefaultShopHandler:function(){var e=this;return new o.a(function(t,i){e.getShopListData().then(function(a){if(a.length>0)t({shop:a[0].name,shopId:a[0].id});else{var n="当前没有可查询机构";e.$fxToast.fail(n).then(function(){i(n)})}})})},getShopListData:function(){var e={keyword:null,start:0,size:1};return this.$fxApi("reportForm.getShop")(e)},setDefaultCenter:function(e,t){this.filterParams.center=e,this.filterParams.centerId=t},getReportPlans:function(){var e=this;return new o.a(function(t){e.$fxApi("reportForm.get4CldPlanList")(S).then(function(e){t(e)})})}}},D=F,O=Object(w["a"])(D,a,n,!1,null,null,null);t["default"]=O.exports},a343:function(e,t,i){"use strict";var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("van-datetime-picker",e._g({attrs:{type:"date",formatter:e.dataPickerFormatter},on:{cancel:e.onCancelClick},model:{value:e.$attrs.currentDate,callback:function(t){e.$set(e.$attrs,"currentDate",t)},expression:"$attrs.currentDate"}},e.$listeners))},n=[],r={name:"datePicker",props:{visibleFlag:Boolean},methods:{dataPickerFormatter:function(e,t){return"".concat(t,"year"===e?"年":"month"===e?"月":"日")},onCancelClick:function(){this.$emit("update:visibleFlag",!1)}}},o=r,l=i("2877"),s=Object(l["a"])(o,a,n,!1,null,null,null);t["a"]=s.exports},a7a2:function(e,t,i){}}]);
//# sourceMappingURL=reportDqjcb4cld.bda72622.js.map