(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[843],{5511:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/app/[app_id]/[tab_id]/[record_id]/[related_object_name]/grid",function(){return n(5406)}])},8930:function(e,t,n){"use strict";n.d(t,{L:function(){return i}});var s=n(5893),a=n(7294);function i(e){var t=e.date,n=(0,a.useState)(),i=n[0],o=n[1],r=(0,a.useState)(""),c=r[0],d=r[1],l=function(e){return amisRequire("moment")(e).fromNow()};return(0,a.useEffect)((function(){i&&clearInterval(i),d(l(t)),o(setInterval((function(){d(l(t))}),6e4))}),[t]),(0,s.jsx)(s.Fragment,{children:c})}},2767:function(e,t,n){"use strict";n.d(t,{z:function(){return c}});var s=n(6042),a=n(5893),i=n(1095),o=n(4413),r=n(1163);function c(e){var t=(0,r.useRouter)(),n=e.button,c=e.data,d=e.className,l=e.scopeClassName,u=e.inMore,m=c.dataComponentId;if("amis_action"===n.type){var p={type:"page",bodyClassName:"p-0",body:[{type:"button",label:n.label,className:"".concat(u?"":"slds-button slds-button_neutral"," ").concat(d||""),onEvent:{click:{actions:JSON.parse(n.amis_actions)}}}],regions:["body"],data:(0,s.Z)({},c)};return(0,a.jsx)(i.k,{id:SteedosUI.getRefId({type:"button",appId:c.app_id,name:n.name}),schema:p,router:t,className:l})}return(0,a.jsx)("button",{onClick:function(){return(0,o.ht)(n,Object.assign({},c,{scope:SteedosUI.getRef(m)}))},className:"slds-button slds-button_neutral ".concat(d||""),children:n.label})}},5125:function(e,t,n){"use strict";n.d(t,{B:function(){return u}});var s=n(4924),a=n(5893),i=n(4413),o=n(1163),r=n(7294),c=n(2767),d=n(1095),l=n(8282);function u(e){var t,n,u=e.app_id,m=e.tab_id,p=e.schema,f=e.refId,h=e.foreign_key,_=e.record_id,b=e.object_name,g=e.masterObjectName,v=(0,r.useState)(null),x=v[0],j=v[1],y=(0,o.useRouter)();(0,r.useEffect)((function(){p&&p.uiSchema&&j((0,i.Iv)(p.uiSchema,{app_id:u,tab_id:m,router:y}))}),[p]);var N=(0,l.Z0)(),w={type:"page",bodyClassName:"p-0",body:[{type:"form",title:"\u8868\u5355",body:[{type:"input-file",label:"",name:"file",id:"u:a58d02614e04",btnLabel:"\u4e0a\u4f20",multiple:!1,maxLength:10,submitType:"asUpload",uploadType:"fileReceptor",proxy:!1,drag:!1,autoUpload:!0,useChunk:!1,joinValues:!1,extractValue:!1,valueField:"version_id",receiver:{url:"${context.rootUrl}/s3",headers:{Authorization:"Bearer ${context.tenantId},${context.authToken}"},method:"post",messages:{},dataType:"form-data",requestAdaptor:"\n                        api.data.append('record_id', '".concat(_,"');\n                        api.data.append('object_name', '").concat(g,"');\n                        api.data.append('space', '").concat(N.space,"');\n                        api.data.append('owner', '").concat(N.userId,"');\n                        api.data.append('owner_name', '").concat(N.name,"');\n                        return api;\n                      ")},onEvent:{success:{weight:0,actions:[{componentId:"u:5f901c0b917b",args:{},actionType:"clear"},{componentId:"",args:{msgType:"success",position:"top-right",closeButton:!0,showIcon:!0,msg:"\u4e0a\u4f20\u6210\u529f"},actionType:"toast"},{componentId:"",args:{},actionType:"custom",script:"\n                                SteedosUI.getRef('".concat(f,"').getComponentByName('page.listview_").concat(b,'\').handleAction({}, { actionType: "reload"})\n                            ')}]}}}],id:"u:5f901c0b917b",wrapWithPanel:!1}],regions:["body"],data:{}};return(0,a.jsx)(a.Fragment,{children:(null===p||void 0===p?void 0:p.uiSchema)&&(0,a.jsxs)(a.Fragment,{children:[(null===p||void 0===p||null===(t=p.uiSchema)||void 0===t||null===(n=t.permissions)||void 0===n?void 0:n.allowCreate)&&(0,a.jsxs)("li",{children:["cms_files"!=p.uiSchema.name&&(0,a.jsx)("button",{onClick:function(){if("cms_files"===p.uiSchema.name);else{var e="drawer";SteedosUI.Object.newRecord({onSubmitted:function(){SteedosUI.getRef(f).getComponentByName("page.listview_".concat(p.uiSchema.name)).handleAction({},{actionType:"reload"})},onCancel:function(){SteedosUI.getRef(f).getComponentByName("page.listview_".concat(p.uiSchema.name)).handleAction({},{actionType:"reload"})},data:{data:(0,s.Z)({},h,_)},appId:u,name:SteedosUI.getRefId({type:"".concat(e,"-form"),appId:u,name:"".concat(p.uiSchema.name)}),title:"\u65b0\u5efa ".concat(p.uiSchema.label),objectName:p.uiSchema.name,recordId:"new",type:e,options:{},router:y})}},className:"slds-button slds-button_neutral",children:"\u65b0\u5efa"}),"cms_files"===p.uiSchema.name&&(0,a.jsx)(d.k,{id:SteedosUI.getRefId({type:"button",appId:u,name:"upload"}),schema:w,router:y,className:"w-full"})]}),null===x||void 0===x?void 0:x.map((function(e){return(0,a.jsx)("li",{children:(0,a.jsx)(c.z,{button:e,data:{app_id:u,tab_id:m,object_name:p.uiSchema.name,dataComponentId:SteedosUI.getRefId({type:"listview",appId:u,name:p.uiSchema.name})}})},e.name)}))]})})}},4413:function(e,t,n){"use strict";n.d(t,{ht:function(){return p},Iv:function(){return l},vU:function(){return u},ud:function(){return m}});var s=n(6486),a=n.n(s),i="__G_L_O_B_A_L__",o=function(e){var t;return"string"===typeof e?1===(t=e.split(".")).length?"#":(t.pop(),t.join(".")):"#"},r=function(e,t){return"#"!==t&&t?"string"===typeof t?s.get(e,t):void console.error("path has to be a string"):e||{}},c=function(e,t){if(e._visible&&(a().startsWith(a().trim(e._visible),"function")?(window.eval("var fun = "+e._visible),e.visible=fun):function(e){var t,n,s;return"string"===typeof e&&(t=/^{{(.+)}}$/,n=/^{{(function.+)}}$/,s=/^{{(.+=>.+)}}$/,!("string"!==typeof e||!e.match(t)||e.match(n)||e.match(s)))}(e._visible)&&(e.visible=function(t){!function(e,t,n,s){var a,c,d,l,u,m=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};if(void 0===t&&(t={}),l=o(n),d=r(t,l)||{},"string"!==typeof e)return e;c=e.substring(2,e.length-2),u="\n  var $user=".concat(JSON.stringify(m),";   return ")+c.replace(/\bformData\b/g,JSON.stringify(t).replace(/\bglobal\b/g,i)).replace(/\bglobal\b/g,JSON.stringify(s)).replace(new RegExp("\\b"+i+"\\b","g"),"global").replace(/rootValue/g,JSON.stringify(d));try{Function(u)()}catch(p){return a=p,console.log(a,e,n),e}}(e._visible,t.record,"#",{now:new Date},t.userSession)})),!a().isFunction(e.visible))return e.visible;try{return e.visible(t)}catch(n){}},d=function(e,t){var n=e.permissions.disabled_actions,s=a().sortBy(a().values(e.actions),"sort");return a().has(e,"allow_customActions")&&(s=a().filter(s,(function(t){return a().include(e.allow_customActions,t.name)}))),a().has(e,"exclude_actions")&&(s=a().filter(s,(function(t){return!a().include(e.exclude_actions,t.name)}))),a().each(s,(function(e){t.isMobile&&["record","record_only"].indexOf(e.on)>-1&&"standard_edit"!=e.name&&("record_only"==e.on?e.on="record_only_more":e.on="record_more")})),t.isMobile&&["cms_files","cfs.files.filerecord"].indexOf(e.name)>-1&&a().map(s,(function(e){"standard_edit"===e.name&&(e.on="record_more"),"download"===e.name&&(e.on="record")})),a().filter(s,(function(e){return a().indexOf(n,e.name)<0}))},l=function(e,t){var n=d(e,t);return a().filter(n,(function(e){return"list"==e.on&&c(e,t)}))},u=function(e,t){var n=d(e,t);return a().filter(n,(function(e){return("record"==e.on||"record_only"==e.on)&&c(e,t)}))},m=function(e,t){var n=d(e,t);return a().filter(n,(function(e){return("record_more"==e.on||"record_only_more"==e.on)&&c(e,t)}))},p=function(e,t){if(e.todo)return a().isString(e.todo)&&a().startsWith(a().trim(e.todo),"function")&&(window.eval("var fun = "+e.todo),e.todo=fun),a().isFunction(e.todo)?e.todo.apply({},[t]):void 0}},5406:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return j}});var s=n(6042),a=n(9396),i=n(1351),o=n(5893),r=n(7294),c=n(6195),d=n(1095),l=n(1163),u=n(1664),m=n.n(u),p=n(8930),f=n(5125),h=n(6486),b=n(471),g=n(8390),v=function(e){var t,n,s,a=e.app_id,i=e.foreign_key,c=e.masterObjectName,d=e.object_name,l=e.record_id,u=e.schema,v=e.record,x=e.masterObjectUISchema,j=(0,r.useState)(),y=j[0],N=j[1],w=(0,r.useState)(),S=w[0],I=w[1],k=SteedosUI.getRefId({type:"related_list",appId:a,name:"".concat(d,"-").concat(i)});(0,r.useEffect)((function(){window.addEventListener("message",(function(e){"listview.loaded"===e.data.type&&setTimeout((function(){if(SteedosUI.getRef(k)&&SteedosUI.getRef(k).getComponentByName){var e=SteedosUI.getRef(k).getComponentByName("page.listview_".concat(d));N({count:e.props.data.count})}}),300)}))}),[]);var R=function(e){SteedosUI.getRef(k).getComponentByName("page.listview_".concat(d)).handleAction({},{actionType:"reload"})},U=u.uiSchema.list_views.all;return(0,o.jsxs)("div",{className:"slds-page-header slds-page-header_related-list bg-white shadow-none border-none p-0 pb-4",children:[(0,o.jsxs)("div",{className:"slds-page-header__row",children:[(0,o.jsxs)("div",{className:"slds-page-header__col-title",children:[(0,o.jsx)("nav",{role:"navigation","aria-label":"Breadcrumbs",children:(0,o.jsxs)("ol",{className:"slds-breadcrumb slds-list_horizontal",children:[(0,o.jsx)("li",{className:"slds-breadcrumb__item",children:(0,o.jsx)(m(),{href:"/app/".concat(a,"/").concat(c),children:(0,o.jsx)("a",{children:x.label})})}),(0,o.jsx)("li",{className:"slds-breadcrumb__item",children:(0,o.jsx)(m(),{href:"/app/".concat(a,"/").concat(c,"/view/").concat(l),children:(0,o.jsx)("a",{children:v[x.NAME_FIELD_KEY]})})})]})}),(0,o.jsx)("div",{className:"slds-media",children:(0,o.jsx)("div",{className:"slds-media__body",children:(0,o.jsx)("div",{className:"slds-page-header__name",children:(0,o.jsx)("div",{className:"slds-page-header__name-title",children:(0,o.jsx)("h1",{children:(0,o.jsx)("span",{className:"slds-page-header__title slds-truncate",title:"Contacts (will truncate)",children:null===u||void 0===u||null===(t=u.uiSchema)||void 0===t?void 0:t.label})})})})})})]}),(0,o.jsx)("div",{className:"slds-page-header__col-actions",children:(0,o.jsx)("div",{className:"slds-page-header__controls",children:(0,o.jsx)("div",{className:"slds-page-header__control",children:(0,o.jsxs)("ul",{className:"slds-button-group-list",id:"button-group-page-header-actions",children:[(0,o.jsx)(f.B,{foreign_key:i,record_id:l,refId:k,app_id:a,tab_id:d,object_name:d,masterObjectName:c,schema:u}),(0,o.jsx)("li",{children:(0,o.jsxs)(b.v,{as:"div",className:"slds-dropdown-trigger slds-dropdown-trigger_click",children:[(0,o.jsx)("div",{children:(0,o.jsx)(b.v.Button,{className:"slds-button slds-button_icon-border-filled slds-button_last",children:(0,o.jsx)("div",{children:(0,o.jsx)("svg",{focusable:"false","data-key":"down","aria-hidden":"true",className:"slds-button__icon",children:(0,o.jsx)("use",{xlinkHref:"/assets/icons/utility-sprite/svg/symbols.svg#down"})})})})}),(0,o.jsx)(g.u,{as:r.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95",children:(0,o.jsx)(b.v.Items,{className:"absolute right-0 z-10 mt-1 w-56 origin-top-right divide-y divide-gray-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:rounded-[2px]",children:(0,o.jsx)("div",{className:"",children:(0,o.jsx)(b.v.Item,{children:(null===u||void 0===u||null===(n=u.uiSchema)||void 0===n||null===(s=n.permissions)||void 0===s?void 0:s.allowDelete)&&(0,o.jsx)("button",{onClick:function(){var e=SteedosUI.getRef(k).getComponentByName("page.listview_".concat(d));_.isEmpty(e.props.store.toJSON().selectedItems)?e.handleAction({},{actionType:"toast",toast:{items:[{position:"top-right",body:"\u8bf7\u9009\u62e9\u8981\u5220\u9664\u7684\u9879"}]}}):e.handleBulkAction(e.props.store.toJSON().selectedItems,[],{},e.props.bulkActions[0])},className:"slds-dropdown__item group flex w-full items-center border-0 px-2 py-2",children:"\u5220\u9664"})})})})})]})})]})})})})]}),(0,o.jsxs)("div",{className:"slds-page-header__row",children:[(0,o.jsx)("div",{className:"slds-page-header__col-meta",children:y&&(0,o.jsxs)("p",{className:"slds",children:[y.count," \u9879 \u2022"," ",(0,o.jsx)(p.L,{date:y.dataUpdatedAt})]})}),(0,o.jsx)("div",{className:"slds-page-header__col-controls",children:(0,o.jsxs)("div",{className:"slds-page-header__controls",children:[(0,o.jsx)("div",{className:"slds-page-header__control",children:(0,o.jsxs)("button",{className:"slds-button slds-button_icon slds-button_icon-border-filled",title:"Refresh List",onClick:R,children:[(0,o.jsx)("svg",{className:"slds-button__icon","aria-hidden":"true",children:(0,o.jsx)("use",{xlinkHref:"/assets/icons/utility-sprite/svg/symbols.svg#refresh"})}),(0,o.jsx)("span",{className:"slds-assistive-text",children:"Refresh List"})]})}),(0,o.jsx)("div",{className:"slds-page-header__control",children:(0,o.jsx)("ul",{className:"slds-button-group-list",id:"button-group-page-header-controls",children:(0,o.jsx)("li",{children:(0,o.jsxs)("button",{className:"slds-button slds-button_icon-border-filled",type:"button",onClick:function(){SteedosUI.ListView.showFilter(u.uiSchema.name,{listView:U,data:{filters:SteedosUI.ListView.getVisibleFilter(U,S)},onFilterChange:function(e){SteedosUI.getRef(k).updateProps({data:(0,h.defaultsDeep)({filter:SteedosUI.ListView.getQueryFilter(U,e)},u.amisSchema.data)},(function(){R(),I(e)})),setTimeout((function(){R(),I(e)}),300)}})},children:[(0,o.jsx)("svg",{className:"slds-button__icon","aria-hidden":"true",children:(0,o.jsx)("use",{xlinkHref:"/assets/icons/utility-sprite/svg/symbols.svg#filterList"})}),(0,o.jsx)("span",{className:"slds-assistive-text",children:"\u8fc7\u6ee4\u5668"}),!(0,h.isEmpty)(S)&&(0,o.jsx)("span",{className:"slds-notification-badge slds-incoming-notification slds-show-notification min-h-[0.5rem] min-w-[0.5rem]"})]})})})})]})})]})]})};function x(e){var t=e.schema,n=e.object_name,a=e.foreign_key,i=e.app_id,r=(e.record_id,e.masterObjectName,(0,l.useRouter)()),c=SteedosUI.getRefId({type:"related_list",appId:i,name:"".concat(n,"-").concat(a)});return(0,o.jsxs)("article",{className:"slds-card slds-card_boundary bg-white shadow-none border-none border-slate-200",children:[t&&(0,o.jsx)(v,(0,s.Z)({refId:c},e)),(0,o.jsx)("div",{className:"border-t",children:t&&(0,o.jsx)(d.k,{id:c,schema:t.amisSchema,router:r,className:"steedos-listview"})})]})}function j(e){e=null!==e?e:(0,i.Z)(new TypeError("Cannot destructure undefined"));var t=(0,l.useRouter)(),n=(0,r.useState)(null),d=n[0],u=n[1],m=t.query,p=m.app_id,f=m.tab_id,h=m.record_id,_=m.related_object_name,b=m.related_field_name,g=(0,r.useState)(),v=g[0],j=g[1];return(0,r.useEffect)((function(){window.innerWidth<768?u("SMALL"):u("LARGE")}),[]),(0,r.useEffect)((function(){f&&d&&(0,c.I3)(p,f,_,b,h,d).then((function(e){j(e)}))}),[f,d]),(0,o.jsx)(o.Fragment,{children:v&&(0,o.jsx)(x,(0,a.Z)((0,s.Z)({},v),{app_id:p,record_id:h}),"".concat(v.object_name,"-").concat(v.foreign_key))})}},1351:function(e,t,n){"use strict";function s(e){throw e}n.d(t,{Z:function(){return s}})}},function(e){e.O(0,[774,888,179],(function(){return t=5511,e(e.s=t);var t}));var t=e.O();_N_E=t}]);