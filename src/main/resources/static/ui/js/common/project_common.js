var G_VAL = {
	 SP_CSTM_ID 		: ""
	,COMMON_CODE_MAP 	: {}
	,session			: {}
	,PAGE_AUTH_MAP		: {}
}

var C_COM = {
	 mousePos 	: { x : 0, y : 0 }
	,lateFn		: {}
	,keypressListenerCallbackFn : {}
	,KEY_CODE	: {
		 "ENTER" 	: 13
		,"DEL"		: 46
	 }
	,sessionConfirmCheck : ""
	,_DEFAULT_FIX : 0	// 소수점 기본 자리수
	 // Session저장
	,init : function() {
		$(window).bind("mousedown", function(e){
			C_COM.mousePos.x = e.pageX;
			C_COM.mousePos.y = e.pageY;
		});
		// 키 입력에 대한 Event 처리
		$(window).bind("keyup",function() {
			var pageId 	= C_PM.getCurrentPageId();
			var cFn		= C_COM.keypressListenerCallbackFn[pageId];
			if(typeof cFn == "function") cFn(event.keyCode);
		});
		
		// 공통 코드 읽어 오기
		//C_COM.initCommonCode();
	 }
	,initCommonCode() {
		// 공통 코드 읽어 오기
        let parm = {
             queryId        : "common.getCommonCodeList"
            ,requestParm    : {}
        }
        C_COM.requestQuery(parm, function(resultData) {
			var commonCodeMap = {}

			$.each(resultData.data, function() {
				if(isEmpty(commonCodeMap[this.GRP_CODE_ID])) {
					commonCodeMap[this.GRP_CODE_ID] = {
						 codeList 	: []
						,codeMap	: {}			
					}
				}
				commonCodeMap[this.GRP_CODE_ID].codeList.push([this.CODE_ID, this.CODE_NM]);
				commonCodeMap[this.GRP_CODE_ID].codeMap[this.CODE_ID] = this;
			});
			
			G_VAL.COMMON_CODE_MAP = commonCodeMap;
        });      
	 }
	,getCodeList : function(grpCodeId) {
		var codeInfo = G_VAL.COMMON_CODE_MAP[grpCodeId];
		if(isEmpty(codeInfo)) {
			return [];
		}
		return codeInfo.codeList;
	 }
	,getCodeAttr : function(grpCodeId, codeId) {
		var codeInfo = G_VAL.COMMON_CODE_MAP[grpCodeId];
		if(isEmpty(codeInfo)) {
			return {};
		}
		if(isValid(codeId)) {
			return codeInfo.codeMap[codeId];	
		} else {
			return codeInfo.codeMap;
		}
	 }  
	,getCodeMap : function(grpCodeId) {
		let codeMap = C_COM.getCodeAttr(grpCodeId);
		if(isEmpty(codeMap)) {
			return {}
		} else {
			let retMap = {};
			$.each(codeMap, function(key, obj) {
				retMap[key] = obj.CODE_NM
			});
			return retMap;
		}
	 }  
	,addKeypressListener : function(pageId, callback) {
		if(typeof callback != "function") {
			alert('addKeypressListener 호출시 함수를 전달해야 합니다.');
			return;
		}
		C_COM.keypressListenerCallbackFn[pageId] = callback;
	 }
	,getClickPosition : function() {
		return C_COM.mousePos;
	 }
	,saveSessionData : function(sessionId, sessionData)
	 {
		if(	Object.prototype.toString.call(sessionData) == '[object Object]' || 
			Object.prototype.toString.call(sessionData) == '[object Array]'  )
		{
			sessionData = JSON.stringify(sessionData)
		}
		sessionStorage.setItem(sessionId, sessionData);
	 }
	 // Session Load
	,loadSessionData : function (sessionId, valid)
	 {
		var result = sessionStorage.getItem(sessionId);

		if(valid == true) sessionStorage.removeItem(sessionId);
		try {
			var retObj = JSON.parse(result);
			return retObj;
		} catch (e) {
			return result;
		}
	 }
	 // 로컬 스토리지에 정보 저장
	,saveLocalData : function(localId, localData) {
		if(	Object.prototype.toString.call(localData) == '[object Object]' || 
			Object.prototype.toString.call(localData) == '[object Array]'  )
		{
			localData = JSON.stringify(localData)
		}
		localStorage.setItem(localId, localData);
	 }
	 // 로컬 스토리지에서 정보 읽기
	,loadLocalData : function (localId, valid) {
		var result = localStorage.getItem(localId);

		if(valid == true) localStorage.removeItem(localId);
		try {
			var retObj = JSON.parse(result);
			return retObj;
		} catch (e) {
			return result;
		}
	 }
	,deleteLocalData : function (localId) {
		localStorage.removeItem(localId);
	 }
	 // Service 요청
	,requestService		: function(parm, callback, errCallback) {
		// 서버 전송 Info
		try{
			if(isEmpty(parm)) parm = {};
			
			var sendParm = {
				 targetUrl 	: _WEB_ROOT_URL + "/requestService.do"
				,data		: parm
			}
			// LoadingBar 사용 옵션 추가 20210219
			
			if(isValid(callback)) {
				if(parm.noLoadingBar != "Y") C_COM.showLoadingBar();
				ajaxRequest(sendParm, function(resultData) {
					setTimeout(function() {
						if(parm.noLoadingBar != "Y") C_COM.hideLoadingBar();
					}, 300);
					
					if(resultData.state == "S") {
						if(typeof callback == "function") callback(resultData);
					} else if(resultData.state == "NO_SESSION"){
						if(C_COM.sessionConfirmCheck != "Y") {
							C_POP.alert('Session 정보가 없습니다.\n\n로그인 화면으로 이동합니다.');
							C_COM.sessionConfirmCheck = "Y";
							location.href="/";
						}
						return null;
					} else {
						if(resultData.STATUS == "FAIL") {
							C_POP.alert(resultData.STATUS_MESSAGE);
							if(resultData.STATUS_MESSAGE == "No Authority Request.") location.reload();
						} else {
							if(typeof errCallback == "function") {
								errCallback(resultData);
							} else {
								C_POP.alert(resultData.msg);
							}
						}
						return null;
					}
				});
			} else {
				var resultData = ajaxRequest(sendParm);
				if(resultData.state == "S") {
					return resultData;
				} else if(resultData.state == "NO_SESSION"){
					if(C_COM.sessionConfirmCheck != "Y") {
						C_POP.alert('Session 정보가 없습니다.\n\n로그인 화면으로 이동합니다.');
						C_COM.sessionConfirmCheck = "Y";
						location.href="/";
					}
					return null;
				} else {
					C_POP.alert(resultData.msg);
					return null;
				}
			}
		} catch(e){
			alert(e);
		}
	 }
	 // Service 요청
	,requestQuery		: function(parm, callback, errCallback) {
		// 서버 전송 Info
		try{
			if(isEmpty(parm)) parm = {};
			
			var targetUrl = _WEB_ROOT_URL + "/requestQuery.do"
			
			// 여러 쿼리를 동시에 가져올 경우
			if(isValid(parm.queryGroup)) {
				targetUrl = _WEB_ROOT_URL + "/requestQueryGroup.do"
			}
			
			var sendParm = {
				 targetUrl 	: targetUrl
				,data		: parm
			}

			if(isValid(callback)) {
				if(parm.noLoadingBar != "Y") C_COM.showLoadingBar();
				ajaxRequest(sendParm, function(resultData) {
					setTimeout(function() {
						if(parm.noLoadingBar != "Y") C_COM.hideLoadingBar();	
					}, 300);
					if(resultData.state == "S") {
						if(typeof callback == "function") callback(resultData);
					} else if(resultData.state == "NO_SESSION"){
						if(C_COM.sessionConfirmCheck != "Y") {
							C_POP.alert('Session 정보가 없습니다.\n\n로그인 화면으로 이동합니다.');
							C_COM.sessionConfirmCheck = "Y";
							location.href="/";
						}
						return null;
					} else {
						if(typeof errCallback == "function") {
							errCallback(resultData);
						} else {
							C_POP.alert(resultData.msg);
						}
						return null;
					}
				});
				sleep(30);
			} else {
				var resultData = ajaxRequest(sendParm);
				if(resultData.state == "S") {
					return resultData;
				} else {
					if(resultData.STATUS == "FAIL") {
						C_POP.alert(resultData.STATUS_MESSAGE);
						if(resultData.STATUS_MESSAGE == "No Authority Request.") location.reload();
					} else {
						C_POP.alert(resultData.msg);
					}
					return null;
				}
			}
		} catch(e){

		}
	 }
	,getHtmlFile : function(path) {
		var url  = _WEB_ROOT_URL + "/" + path;
		var parm = {
			 targetUrl 	: url
			,dataType	: "text"
			,method		: "get"
		}
		var html = ajaxRequest(parm);
		return html;
	 }
	,getTxtFile : function(path) {
		var url  = _WEB_ROOT_URL + path;
		
		var parm = {
			 targetUrl 	: url
			,dataType 	: "text"	
		}
		var html = ajaxRequest(parm);
		return html;
	 }
	// table rendering
	,renderHtml : function(pid, parm) {
		if(isEmpty(parm.templateId)) parm.templateId = parm.targetId;
		
		if(isValid(parm.listColumn)) {
			parm.list = parm[parm.listColumn]; // 기본 지정 리트스 컬럼
		} 
		
		if(isEmpty(parm.list)) parm.list = [];
		
		if(isValid(parm.maxrow)) {
			parm.list = parm.list.slice(0, parm.maxrow);
		}
		if(isValid(parm.targetTotalId)) {
			$("#" + pid + " #" + parm.targetTotalId).html(addComma(parm.list.length));
		}
		var html = "";
		var noDataTemplateCnt = $("#" + pid + " #" + parm.templateId + "_noData_template").length;
		if( isValid(parm.data) || parm.list.length > 0 || noDataTemplateCnt == 0) html = $("#" + pid + " #" + parm.templateId + "_template"			).render(parm);
		else {
			if($("#" + pid + " #" + parm.templateId + "_noData_template"	).length > 0) {
				html = $("#" + pid + " #" + parm.templateId + "_noData_template"	).render(parm);
			}
		}
		
		if(parm.append == "Y") {
			$("#" + pid + " #" + parm.targetId).append(html);
		} else if(parm.prepend == "Y") {
			$("#" + pid + " #" + parm.targetId).prepend(html);
		} else {
			$("#" + pid + " #" + parm.targetId).html(html);
		}
		
		C_COM.makeNumberTypeToInput("#" + pid + " #" + parm.targetId);
		
		C_COM.preInitTemplate(pid, parm.targetId);
		
	}
	// 입력 창을 숫자만 입력되도록 처리
	,makeNumberTypeToInput : function(domObj) {
		$(domObj).find("input[number]").each(function() {
			$(this).addClass	("tr"			);
			$(this).attr		("maxlength", 20);
			$(this).unbind		("keydown"		);
			$(this).bind		("keydown", function() {
				var val = $(this).val();
				if(val == "" || isNumber(val)) $(this).attr("preval", val);
			});
			$(this).unbind		("keyup"		);
			$(this).bind		("keyup", function() {
				var val = $(this).nval();
				if(val != "-" && val != "" && !isNumber(val)) {
					var preval = $(this).attr("preval");
					$(this).val(preval);
				} else if( val != "" && val != "-" && val != "-0") {
					val = val.replaceAll(",", "");
					var lastCharCheck = val.substring(val.length - 1);
					var fix = $(this).attr("fix");

					if(isEmpty(fix)) fix = C_COM._DEFAULT_FIX;
					
					fix = Number(fix);
					
					if(lastCharCheck == "."){
						if(fix == 0) {
							var preval = $(this).attr("preval");
							$(this).val(preval);
						}
					} else {
						// 소수점 아래에서 0이 입력됬을 경우
						var narr = val.split(".");
						if(isValid(narr[1]) && lastCharCheck == "0" && fix > 0) {
							val = narr[0] + "." + narr[1].substring(0, fix);
						} else {
							var xx1	= Math.pow(10, fix);
							
							// PC 계산 오류에 의한 버그 방어 코드(floor를 사용할 경우 10.12 -> 10.199999999.. -> 10.11 오류 발생)
							var xx2	= xx1 + 0.0000000000000000000001;		
							
							// 붙여넣기 여부 확인
							var pasteCheck = $(this).attr("paste");
							if(pasteCheck == "Y") {
								// 붙여 넣기 인경우 반올림  처리
								val = Math.round(val * xx2) / xx1;
								$(this).attr("paste", "");
							} else {
								// 일반 입력시 버림 처리(음수인경우 역으로 계산)
								if(val < 0)	val = Math.ceil (val * xx2) / xx1;
								else		val = Math.floor(val * xx2) / xx1;
							}
						}
						$(this).val(addComma(val));
					}
				}
			});
			$(this).unbind		("paste"		);
			$(this).bind		("paste", function(event) {
				// 붙여 넣기를 할경우 Flag Setting하여 반올림 처리하도록 함.
				$(this).attr("paste", "Y");
			});
		});
	 }
	,makeUniqueId : function() {
		var parm = {
			 serviceId 				: "ExdevCommonService.makeUniqueId"
			,requestParm			: {}
		}
		
		var retData = C_COM.requestService(parm);
		return retData.data.id;
	 }
	,registLateFn : function(fnId, fn, waitTime) {
		C_COM.lateFn[fnId] = fn;
		setTimeout(function() {
			if(isValid(C_COM.lateFn[fnId])) C_COM.lateFn[fnId] = undefined;
		}, waitTime);
	 }
	,excuteLateFn : function(fnId) {
		if(typeof C_COM.lateFn[fnId] == "function") C_COM.lateFn[fnId]();
		C_COM.lateFn[fnId] = undefined;
	 }
	,excelDownloadFromTable : function(domId) {
		var html = $("#" + domId).html();
		
		$("#excelCopyTmpTable").html(html);
		
		$("#excelCopyTmpTable a").each(function() {
			$(this).wrap("<span></span>");
			var val = $(this).html();
			$(this).parent().html(val);
		});
		$("#excelCopyTmpTable").show();
		copyToClipboard("excelCopyTmpTable");
		$("#xcelCopyTmpTable").hide();
		C_POP.alert('본문이 클립보드에 복사되었습니다.\n엑셀에 붙여넣기 하여 사용하세요.');
		$("#excelCopyTmpTable").html("");
	 }
	,loadingDepth : 0
	,showLoadingBar : function() {
		$("#loadingBar").show();
		C_COM.loadingDepth++;
	 }
	,hideLoadingBar : function() {
		C_COM.loadingDepth--;
		if(C_COM.loadingDepth < 1) {
			C_COM.loadingDepth = 0;
			$("#loadingBar").hide();
		}
	 }
	,getCurrentTemplateId : function() {
		var templateId = C_POP.getCurrentPopupId();
		if(isEmpty(templateId)) templateId = C_PM.getCurrentPageId();
		return templateId
	 }
	,showLeftMenu : function() {
		$("#lnb_MenuList").show();
	 }
	,hideLeftMenu : function() {
		$("#lnb_MenuList").hide();
	 }
	//Template 사용하는 모든페이지에 대해 초기화
	,preInitTemplate : function(templateId, secondTemplateId) {

	 }
	,excelUploadCallbackFn : undefined
	// Excel Upload To Table
	,selectExcelUploadToTable : function(excelUploadCallbackFn) {
		
		C_COM.excelUploadCallbackFn = excelUploadCallbackFn;
		
		$("#_common_excelFileInput").remove();
		
		$("body").append(`<input id="_common_excelFileInput" type="file" onchange="C_COM.excelFileUpload();" style="display:none"/>`);
		
		$("#_common_excelFileInput").trigger("click");
	 }
	,excelFileUpload : function() {
		const fileInput = $('#_common_excelFileInput')[0];
	    const file = fileInput.files[0];

	    const formData = new FormData();
	    formData.append('file', file);
		
		C_COM.showLoadingBar();
	    $.ajax({
	        url: '/commonExcelUpload.do',
	        type: 'POST',
	        data: formData,
	        contentType: false,
	        processData: false,
	        success: function(response) {
				C_COM.hideLoadingBar();
				if(typeof C_COM.excelUploadCallbackFn == "function" ) C_COM.excelUploadCallbackFn(response);
				else {
					C_POP.alert('Excel Upload에 성공 하였습니다.');	
				}
			}
	        ,error: function(error) {
				C_COM.hideLoadingBar();
				if(typeof C_COM.excelUploadCallbackFn == "function" ) C_COM.excelUploadCallbackFn(error);
				else {
					C_POP.alert('Excel Upload에 실패 하였습니다.');	
				}
	        }
	    });
	 }
	,getFileId : function(GRP_FILE_ID, OWNER_CD, callback) {
		if(isEmpty(GRP_FILE_ID)) {
			alert('File Group ID가 유효하지 않습니다.');
			return;
		} else if	(isEmpty(OWNER_CD)) {
			alert('File Owner ID가 유효하지 않습니다.');
			return;
		} else if	(isEmpty(callback)) {
			alert('Callback Function이 필요합니다.');
			return;
		}		
		
		var parm = {
			 queryId 		: "Filemng.getFileList"
			,requestParm	: {GRP_FILE_ID : GRP_FILE_ID, OWNER_CD : OWNER_CD}
		}
		C_COM.requestQuery(parm, function(resultData) {
			callback(resultData.data);
		});
	 }
	,fileDownload : function(fileId) {
		location.href="/filedownload.do?FILE_ID=" + fileId;	
	 }
	,getImageUrl : function(fileId) {
		return "/filedownload.do?FILE_ID=" + fileId;
	 }
	,clearFileGroup : function(GRP_FILE_ID, OWNER_CD, callback) {
		if			(isEmpty(GRP_FILE_ID)) {
			alert('File Group ID가 유효하지 않습니다.');
			reutrn;
		} else if	(isEmpty(OWNER_CD)) {
			alert('File Owner ID가 유효하지 않습니다.');
			reutrn;
		} else if	(isEmpty(callback)) {
			alert('Callback Function이 필요합니다.');
			reutrn;
		}		
		
		var parm = {
			 queryId 		: "Filemng.clearFileList"
			,requestParm	: {GRP_FILE_ID : GRP_FILE_ID, OWNER_CD : OWNER_CD}
		}
		C_COM.requestQuery(parm, function(resultData) {
			callback(resultData);
		});
	 }
	,makeArrayTwoColumn : function(list, column1, column2) {
		
		if(isEmpty(list)) {
			return [];
		}
		if(isEmpty(column1) || isEmpty(column2)) {
			C_POP.alert('C_COM.makeArrayTwoColumn Function의 Parameter값을 확인하세요.');
			return [];
		}
		
		let retList = [];
		$.each(list, function() {
			let arr = [this[column1], this[column2]];
			retList.push(arr);
		});
		return retList;
		
	 }
	,saveWorkHistory : function(userId, content) {
		var parm = {
			 queryId 		: "operation.saveWorkHistory"
			,requestParm	: {
				 WH_ID			: C_COM.makeUniqueId()
				,USER_ID 		: userId
				,WORK_CONTENT	: content
			}
		}

		C_COM.requestQuery(parm, function(resultData) {

		});
	 }
	,addAlarm : function(parm, callback) {
		var rparm = {
			 queryId 		: "common.addAlarm"
			,requestParm	: {
				 ALARM_ID		: C_COM.makeUniqueId()
				,TARGET_USER_ID : parm.userId
				,CONTENT		: parm.content
				,DIRECT_EXEC	: parm.directExec
			}
		}

		C_COM.requestQuery(rparm, function(resultData) {
			if(typeof callback == "function") callback();
		});
	 }
}















/**
 * 작성자 : 위성열 
 * 작성일 : 
 * Page 관리 Class
 */
var C_PM = {
	 eventFn 		: {}
	,currentPageId 	: ""
	,pageParmInfo	: {}
	,homeId			: _ROOT_PAGEID
	/*
	 * 작성자 : 위성열 
	 * 작성일 : 
	 * 설  명 : Page를 이동한다.
	 * Paramter 설명
	 * - pageId : 이동할 Page ID
	 */
	,movePage : function(pageId, parm) {

		if(parm == undefined) parm = {};
		parm.pageId = pageId;
		
		var clearCheck = parm.clearCheck;
		
		if(!isValid(pageId)) {
			alert('Page ID가 없습니다.');
			return;
		}
		// Page ID에 해당하는 Url의 html을 가져온다.
		var urlBody	= pageId.replaceAll("_", "/");
		var url 	= "ui/" + urlBody + ".html";
		var html 	= C_COM.getHtmlFile(url);
		try {
			if(html == "error") {
				alert("메뉴 화면이 없거나, 메뉴 이동 중 오류가 발생 했습니다. <br/><br/> 관리자에게 문의 하세요.");
				return;
			}
			var token = html.split("/");
		} catch(e) {
			alert('Page ID에 해당하는 Content가 없거나, Page에 오류가 있습니다.');
			return;
		}
		
		// 다른 Page를 Import해서 사용할 수 있도록 한다.
		if(token[0] == "import") {
			urlBody	= token[1].replaceAll("_", "/");
			url 	= "ui/" + urlBody + ".html";
			html 	= C_COM.getHtmlFile(url);
			if(isValid(token[2])) {
				eval("parm = $.extend(parm, " + token[2] + ");");
			}
		}
		
		if(isEmpty(html)) {
			C_POP.alert('Import 하려는 Page ID가 존재 하지 않습니다.\n\nPage ID를 확인하시기 바랍니다.');
			return;
		}

		C_PM.pageParmInfo[pageId] = parm;
		
		var prePageId = this.getCurrentPageId();
		
		if(isValid(prePageId)) {
			eval("if (typeof " + prePageId + ".destroy == 'function') " + prePageId + ".destroy();");
		}
		
		// 현재 Page 등록
		this.setCurrentPageId(pageId);
		
		// 가상의 Document에 가져온 html 을 Setting한다.
		var docDiv = $("<div></div>");
		$(docDiv).html(html);
		
		// html에서 최상위Div에 pageId를 id로 부여한다.(unique값)
		$("div", docDiv).eq(0).attr("id"	, pageId);
		// html에서 최상위Div에 Page Block이라는 Name을 부여한다.(전체 page 동일값 pageBlockDiv);
		$("div", docDiv).eq(0).attr("name"	, "pageBlockDiv");

		// 기존 Page는 숨긴다.
		$("div[name=pageBlockDiv]").hide();
		
		// 동일한 PageId로 이미 Loading되어 있으면 삭제한다.
		$("#" + pageId).remove();

		// 이동할 Page를 Load 한다.
		var htmlSrc = $(docDiv).html();
		
		htmlSrc = htmlSrc.render("<@", ">", parm);

		$("#bodyBlock").append(htmlSrc);
		
		// 이동할 Page의 Page Set Object를 가져온다.
		//var pageObj = fn_getObjectFromString(pageId);
		
		// 현재 Page를 저장한다.
		C_PM.setCurrentPageId(pageId);
		
		// 페이지 이동에 대한 History저장
		C_HM.pushPageStack(pageId);
		
		// 현재 구성된 Page의 스크립트 실행전 공통 초기화
		C_PM.preInitPage(pageId);

		// onLoadPage로 설정된 Function 실행
		if(typeof C_PM.eventFn[pageId] == "function") C_PM.eventFn[pageId](parm);
		
		// 현재 구성된 Page의 스크립트 실행 후 공통 초기화
		C_PM.afterInitPage(pageId);
	}
	// Page에 Load시 스크립트 실행전 공통 설정을 한다.
	,preInitPage : function(pageId, targetDomId) {
		C_COM.preInitTemplate(pageId);
		
	 }
	// Page에 Load시 스크립트 실행 후 공통 설정을 한다.
	,afterInitPage : function(pageId) {
	 }
	,setCurrentPageId : function(pageId) {
		C_COM.saveSessionData("PAGE_ID", pageId);
	 }
	,getCurrentPageId : function() {
		return C_COM.loadSessionData("PAGE_ID");
	 }
	,onLoadPage : function(pageId, callback) {
		C_PM.eventFn[pageId] = callback;
	 }
	,goHome : function() {
		C_HM.clear();
		C_PM.movePage(C_PM.homeId);
	 }
	,reloadPage : function() {
		var cPageId = C_PM.getCurrentPageId(); 
		var pageId = C_HM.historyBack();
		var parm = C_PM.pageParmInfo[cPageId];
		C_PM.movePage(cPageId, parm);
	 }
	,replacePage : function(pageId, parm) {
		C_HM.historyBack();
		C_PM.movePage(pageId, parm);
	 }
};
// C_PM 초기화 루틴
(function() {
	C_COM.saveSessionData("PAGE_ID", "");
})();

// Page History 관리 프로세스 
var C_HM = {
	 eventFn		: {}	
	,pageStack 		: []
	,running		: false
	,pushPageStack	: function(pageId) {
		var newList = [];
		$.each(C_HM.pageStack, function() {
			var item = this + "";
			if(item != pageId) newList.push(item);
		});
		newList.push(pageId);
		C_HM.pageStack = newList;
	 }
	,popPageStack	: function() {
		var tStack= C_HM.pageStack.slice(0, -1);
		if(tStack.length > 0) {
			C_HM.pageStack = tStack;
			var pageId = C_HM.pageStack[C_HM.pageStack.length - 1];
			return pageId;
		} else {
			return null;
		}
	 }
	,historyBack	: function(returnParm) {
		if(C_HM.running) return;
		C_HM.running = true;

		var pageId = C_HM.popPageStack();

		if(isEmpty(pageId)) {
			C_HM.running = false;
			return;
		}
		var csPageId = C_PM.getCurrentPageId();
		// 현재 Page의 Destory를 실행한다.
		eval("var pObj = " + csPageId);
		if(typeof pObj.destroy == "function") pObj.destroy();
		
		// 현재 Page를 Resource에서 삭제한다.
		$("#" + csPageId).remove();
		
		C_PM.setCurrentPageId(pageId);
		
		$("#" + pageId).show();
		
		if(isEmpty(returnParm)) returnParm = {};
		
		if(typeof C_HM.eventFn[pageId] == "function") C_HM.eventFn[pageId](csPageId, returnParm);

		C_HM.running = false;
	 }
	,onReturn 	: function(pageId, callback) {
		C_HM.eventFn[pageId] = callback;
	 }
	,clear		: function() {
		var csPageId = C_PM.getCurrentPageId();
		// 현재 Page의 Destory를 실행한다.
		eval("var pObj = " + csPageId);
		if(typeof pObj.destroy == "function") pObj.destroy();
		// 현재 Page를 Resource에서 삭제한다.
		$("#" + csPageId).remove();
		
		var pageId = C_HM.popPageStack();
		while(pageId != null) {
			
			eval("var pObj = " + pageId);
			if(typeof pObj.destroy == "function") pObj.destroy();
			// 현재 Page를 Resource에서 삭제한다.
			$("#" + pageId).remove();
			
			pageId = C_HM.popPageStack();
		}
	 }
}

// Popup
var C_POP = {
	 eventFn 			: {}
	,activeCnt 			: 0 
	,popupStack			: []
	,callbackMap		: {}
	,normalSizeMap		: {}
	,open	: function(popupId, parm, callback) {
		if(parm == undefined) parm = {};

		parm.popupId = popupId;
		
		parm.opener	 = C_COM.getCurrentTemplateId();
		
		C_POP.callbackMap[popupId] = callback;
		
		// Popup ID에 해당하는 Url의 html을 가져온다.
		var urlBody	= popupId.replaceAll("_", "/");
		var url 	= "ui/" + urlBody + ".html";
		var html 	= C_COM.getHtmlFile(url);
		
		if(isEmpty(html)) {
			C_POP.alert('Popup ID가 존재 하지 않습니다.\n\nPopup ID를 확인하시기 바랍니다.');
			return;
		}
		
		// 가상의 Document에 가져온 html 을 Setting한다.
		var docDiv = $("<div></div>");
		$(docDiv).html(html);
		// html에서 최상위Div에 popupId를 id로 부여한다.(unique값)
		$("div", docDiv).eq(0).attr("id"	, popupId);
		
		// 동일한 popupId로 이미 Loading되어 있으면 삭제한다.
		$("#" + popupId).remove();

		// 이동할 Popup를 Load 한다.
		var htmlSrc = $(docDiv).html();
		htmlSrc = htmlSrc.render("<@", ">", parm);
		
		$("body").append(htmlSrc);
		
		C_POP.pushPopupStack(popupId);
		
		$("#" + popupId).fadeIn();

		// onLoadPopup로 설정된 Function 실행
		if(typeof C_POP.eventFn[popupId] == "function") C_POP.eventFn[popupId](parm);
		
		// Page 내의 처리는 Popup도 Page와 동일하기 떄문에 C_PM의 initPage를 사용한다.
		C_POP.preInitPopup(popupId);
		
		if(parm.size == "MAX") {
			C_POP.maxSize(popupId);
		}
		//debugger;
		$(`#${popupId} .btn_zoomInOut`).unbind("click");
		$(`#${popupId} .btn_zoomInOut`).bind("click", function() {
			C_POP.toggleSize(popupId);
		});
		
	 }
	// Page에 Load시 스크립트 실행전 공통 설정을 한다.
	,preInitPopup : function(popupId) {
		C_COM.preInitTemplate(popupId);
	 }
	,close	: function(returnData) {
		var popupId = C_POP.getCurrentPopupId();
		C_POP.popPopupStack();

		$("#" + popupId).removeClass("active");
		if(typeof C_POP.callbackMap[popupId] == "function") C_POP.callbackMap[popupId](returnData);
		C_POP.callbackMap[popupId] = undefined;
		
		$("#" + popupId).remove();
		eval(popupId + " = undefined");
	 }
	,onLoadPopup : function(popupId, callback) {
		C_POP.eventFn[popupId] = callback;
	 }
	,pushPopupStack	: function(popupId) {
		var newList = [];
		$.each(C_POP.popupStack, function() {
			var item = this + "";
			if(item != popupId) newList.push(item);
		});
		newList.push(popupId);
		C_POP.popupStack = newList;
	 }
	,popPopupStack	: function() {
		C_POP.popupStack = C_POP.popupStack.slice(0, -1);
		if(C_POP.popupStack.length > 0) {
			var popupId = C_POP.popupStack[C_POP.popupStack.length - 1];
			return popupId;
		} else {
			return null;
		}
	 }
	,getCurrentPopupId : function() {
		if(C_POP.popupStack.length == 0 ) 	return null;
		else 								return C_POP.popupStack[C_POP.popupStack.length - 1];
	 }
	,getPopupState : function() {
		if(C_POP.popupStack.length > 0)	return "on";
		else							return "off";
	 }
	,alert : function(msg, callback) {
		alert(msg);
		if(typeof callback == "function") callback();
	 }
	,confirm : function(msg, okFn) {
		var flag = confirm(msg);
		if(flag) {
			if(typeof okFn == "function") okFn();
		}
	 }
	,maxSize : function(popupId) {
		// 창크기 최대화
		var normalWidth 	= $("#" + popupId + " .modal").css("width");
		var normalHeight 	= $("#" + popupId + " .modal").css("height");
			
		$("#" + popupId + " .modal").css("width"	, "97%");
		$("#" + popupId + " .modal").css("height"	, "97%");
		
		if(isEmpty(C_POP.normalSizeMap[popupId])) C_POP.normalSizeMap[popupId] = {};
		if(C_POP.normalSizeMap[popupId].popupState != "M") {
			C_POP.normalSizeMap[popupId] = {
				 normalWidth	: normalWidth
				,normalHeight	: normalHeight
				,popupState		: "M"
			}
		}
		
		$(`#${popupId} .btn_zoomInOut`).addClass("in");
		
		//if(isValid(maxDomId)	) $("#" + popupId + "#" + maxDomId		).hide();
		//if(isValid(normalDomId)	) $("#" + popupId + "#" + normalDomId	).show();
	 }
	,normalSize : function(popupId) {
		// 창크기 복원
		var normalWidth 	= C_POP.normalSizeMap[popupId].normalWidth;
		var normalHeight 	= C_POP.normalSizeMap[popupId].normalHeight;

		$("#" + popupId + " .modal").css("width"	, normalWidth);
		$("#" + popupId + " .modal").css("height"	, normalHeight);
		
		C_POP.normalSizeMap[popupId] = {
			 normalWidth	: normalWidth
			,normalHeight	: normalHeight
			,popupState		: "N"
		}
		
		$(`#${popupId} .btn_zoomInOut`).removeClass("in");
		
		//if(isValid(maxDomId)	) $("#" + popupId + " #" + maxDomId		).show();
		//if(isValid(normalDomId)	) $("#" + popupId + " #" + normalDomId	).hide();
	 }
	,toggleSize : function(popupId) {
		if(isEmpty(C_POP.normalSizeMap[popupId])) {
			C_POP.maxSize(popupId);
		} else {
			if(C_POP.normalSizeMap[popupId].popupState == "N") {
				C_POP.maxSize(popupId);
			} else {
				C_POP.normalSize(popupId);
			}
		}
	 }
}		

// UI 관련 공통

var C_UICOM = {
	 dataListMap 			: {} 	// selectBox 에서 선택한 내용 담기
	,useSelectBoxIdList 	: {}
	,listenerChangeFnMap	: {}
	,selectBoxOption		: {}
	,getData : function(targetId){

		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;

		return C_UICOM.dataListMap[templateTargetId];
		
	 }
	,_setDataListMap : function(targetId, valObj) {

		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;
		
		let preData = C_UICOM.dataListMap[templateTargetId];
		
		C_UICOM.dataListMap[templateTargetId] = valObj;	

		let fn = C_UICOM.listenerChangeFnMap[templateTargetId];

		if(isValid(fn)) {
			if(isEmpty(preData) || typeof preData == "string") {
				if(preData == valObj) return;
			} else if( typeof preData == "object") {
				if(JSON.stringify(preData) == JSON.stringify(valObj)) return;
			} else {
				return;
			}
			fn(C_UICOM.dataListMap[templateTargetId], targetId);	
		}
	 }
	// onchange 저장
	,addChangeListener : function(targetId, fn) {
		
		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;

		C_UICOM.listenerChangeFnMap[templateTargetId] = fn;
	 }  
	,removeChangeListener : function(targetId) {
		
		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;

		C_UICOM.listenerChangeFnMap[templateTargetId] = undefined;
	 }  
	,init : function() {
	    // 외부 링크
	    $(document).bind('click', function(e) {
	      var $clicked = $(e.target);
          var targetId = $clicked.attr("uid");
          if(isEmpty(targetId)) targetId = $clicked.parent().parent().attr("uid");
		  $.each(C_UICOM.useSelectBoxIdList, function(key, obj) {
			if(obj.targetId != targetId) {
				var pageWebUl = "#" + obj.templateId + " #" + obj.targetId + "_ul";
				if($(pageWebUl).hasClass("select_lst")) {
					$(pageWebUl).addClass("viewHide");
				} else {
					$(pageWebUl).hide();	
				}
			}
		  });
	    });
	 }
	,makeSelectBox : function(parm, type) {
		if(isEmpty(type)) type="single";
		C_UICOM.makeSelectBoxExec(parm, type)	 
	 }
	,toggleSingleSelectBox : function(targetId) {

		var templateId = C_COM.getCurrentTemplateId();
		var templateTargetId = templateId + targetId;
		
		let option = C_UICOM.selectBoxOption[templateTargetId];
		
		// 읽기 전용으로 Setting시 클릭 제어
		if(option.readOnly == "Y") {
			return;
		}
		var pageWebUl = "#" + templateId + " #" + targetId + "_ul ";
		$(pageWebUl).show();
		if ( $(pageWebUl).hasClass("viewHide") ) {
			$(pageWebUl).removeClass("viewHide")	
		} else {
			$(pageWebUl).addClass("viewHide");	
		}
	 }
	,makeSelectBoxExec : function(parm, type) {
		
		var defaultItem = parm.defaultItem
		var list 		= parm.data;
		var templateId 	= parm.templateId;
		var targetId 	= parm.targetId;

		if(isValid(defaultItem)) {
			nlist = [defaultItem];
			$.each(list,function(){nlist.push(this)});
			list = nlist;
		}
		
		if(isEmpty(templateId)) templateId = C_COM.getCurrentTemplateId();

		var templateWebId = "#" + templateId + " #" + targetId + " ";

		var templateTargetId = templateId + targetId;
		
		C_UICOM.selectBoxOption[templateTargetId] = parm;

		// SelectBox ID 등록		
		C_UICOM.useSelectBoxIdList[templateTargetId] = {templateId : templateId, targetId : targetId};
		
		C_UICOM.dataListMap[templateTargetId] = undefined;
		
		if( type == "single") {
			var rlist = [];
			$.each(list, function() {
				rlist.push({"CD":this[0], "NM":this[1]});
			});
			
			if(rlist.length == 0) {
				alert('Select Box Set Data가 없습니다.');
				return;
			}
			
			var rparm = {
				 targetId 		: targetId
				,firstItemCD	: rlist[0].CD
				,firstItemNm	: rlist[0].NM
				,list			: rlist
			}
			
			var html = $("#_comSinglebox_template").render(rparm)

			$(templateWebId).addClass("select_box").addClass("fl");

			$(templateWebId).html(html);

			C_UICOM.initSingleBox(targetId);
			
			C_UICOM._setDataListMap(targetId, rparm.firstItemCD); 
			
			
			
			

		} else {
			var rlist = [];
			$.each(list, function() {
				rlist.push({"CD":this[0], "NM":this[1]});
			});
			var rparm = {
				 targetId 		: targetId
				,list			: rlist
			}
			
			var html = $("#_comMultibox_template").render(rparm)

			$(templateWebId).addClass("dropdown").addClass("fl");

			$(templateWebId).html(html);
			
			$(templateWebId).css("z-index", 1);
			
			C_UICOM.initMultiBox(targetId);

		}
		
		C_UICOM.applyOption(targetId);
	 }
	,applyOption : function(targetId) {
		var templateId = C_COM.getCurrentTemplateId();

		var templateWebBtn = "#" + templateId + " #" + targetId + "_btn ";
		
		var templateTargetId = templateId + targetId;
		
		let option = C_UICOM.selectBoxOption[templateTargetId];
		
		if(option.readOnly == "Y") {
			$(templateWebBtn).addClass("disabled-bg");			
		} else {
			$(templateWebBtn).removeClass("disabled-bg");
		}
	 }
	,initSingleBox : function(targetId) {
		var templateId = C_COM.getCurrentTemplateId();

		var templateWebUl = "#" + templateId + " #" + targetId + "_ul ";
		
		var templateTargetId = templateId + targetId;

        var $open_ul = $(templateWebUl);
        $($open_ul).find("input[type=radio]").on("click", function(){
			C_UICOM.setDataSingleBox(this, targetId);
        });
        $($open_ul).find("input[type=radio]").on("focus", function(){
            var $var = $( this ).next().text();
            $( this ).parent().parent().prev().children().text( $var );
            $( this ).parent().parent().prev().children().addClass( "active" );
            $(this).next().addClass("active"); $(this).parent().siblings().find("label").removeClass("active");
        });
        $($open_ul).find("input[type=radio]").on("blur", function(){
            $( this ).parent().parent().prev().children().removeClass( "active" );
        });

		// Change 리스너 초기화
		C_UICOM.removeChangeListener(targetId);
	 }
	,setSingleBox : function(targetId, val) {
		var templateId = C_COM.getCurrentTemplateId();
		var templateWebId = "#" + templateId + " #" + targetId + " ";
		var templateUlId = "#" + templateId + " #" + targetId + "_ul ";
		var templateTargetId = templateId + targetId;
		
		let scrollTop = 0;
		$(templateWebId + " input").each(function(idx){
			if( idx > 1 ) scrollTop += 30;
			if( $(this).val() == val ) {
				C_UICOM.setDataSingleBox(this, targetId);
				$(templateUlId).scrollTop(scrollTop);
				return false;
			}
		});
	 }
	,setDataSingleBox : function(dom, targetId) {
		
		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;
		
        var $var = $( dom ).next().text();
        $( dom ).parent().parent().prev().children().text( $var );
        $( dom ).parent().parent().prev().children().addClass( "active" );
        $(dom).next().addClass("active"); $(dom).parent().siblings().find("label").removeClass("active");
        $( dom ).parent().parent().addClass("viewHide");
		var valList = $(dom).val();

		C_UICOM._setDataListMap(targetId, valList); 
		
	 }
	,setSelectBoxOption : function(targetId, key, val) {
		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;
		
		C_UICOM.selectBoxOption[templateTargetId][key] = val;
		
		C_UICOM.applyOption(targetId);
	 }
	,initMultiBox : function(targetId) {

		var templateId = C_COM.getCurrentTemplateId();

		var templateTargetId = templateId + targetId;
		
		let option = C_UICOM.selectBoxOption[templateTargetId];

		var pageWebId = "#" + templateId + " #" + targetId + " ";

	    /*============= 멀티선택 ================*/
		$(pageWebId + "button").unbind("click");
	    $(pageWebId + "button").bind("click", function(){
			// 읽기 전용으로 Setting시 클릭 제어
			if(option.readOnly == "Y") {
				return;
			}
	        $(this).parent().children().find("ul").slideToggle('fast');
	    });
	 }
	,clickMultiBox : function(targetId) {
		
		var templateId = C_COM.getCurrentTemplateId();
		
		var pageWebId = "#" + templateId + " #" + targetId + " ";

		var templateTargetId = templateId + targetId;
		
		var templatetext 	= "";
		var valList		= [];
		var selectCnt   = -1;
		var allCnt		= $(pageWebId + " input[type=checkbox]").length - 1;
		var idx = 1
		$(pageWebId + " input[type=checkbox]:checked").each(function() {
			var id	 = $(this).attr("id");
			if(id == `mutli${targetId}_all`) return true;  // 전체인경우 Skip
			var val  = $(this).val();
			var name = $(this).attr("nametext");
			if(templatetext == "") templatetext = name;
			valList.push(val);
			selectCnt = idx++;
		});
		if(selectCnt < 0) templatetext = "선택";
		if(selectCnt > 0) templatetext = templatetext + " 외 " + selectCnt;

		if(allCnt == selectCnt) {
			$(`#${templateId} #mutli${targetId}_all`).prop("checked", true);
		} else {
			$(`#${templateId} #mutli${targetId}_all`).prop("checked", false);
		}
		
		$(pageWebId + " .hida").html(templatetext);

		C_UICOM._setDataListMap(targetId, valList); 
		
	 }
	,clickMultiBoxAllCheck : function(targetId, thisDom) {
		var templateId = C_COM.getCurrentTemplateId();
		
		var pageWebId = "#" + templateId + " #" + targetId + " ";

		var templateTargetId = templateId + targetId;
		
		let check = $(thisDom).prop("checked");
		
		$(pageWebId + " input[type=checkbox]").prop("checked", check);
		
		C_UICOM.clickMultiBox(targetId);
		
	 }
	,setMultiBox : function(targetId, valList) {
		var templateId = C_COM.getCurrentTemplateId();
		var templateWebId = "#" + templateId + " #" + targetId + " ";
		
		if(typeof valList == "string") valList = [valList]
		$.each(valList, function() {
			$(templateWebId + " input[value='" + this + "']").prop("checked", true);
		});
		C_UICOM.clickMultiBox(targetId);
	 }
}


/*
var C_UICOM_backup = {
	 calendarParm 	: {}
	,commonDataMap 	: {
		"MTB" : {} // 멀티 박스용 Data 저장소
	 }
	,makeSelectBox 	: function(parm) {
		var pageId			= parm.pageId		;
		var domId       	= parm.domId        ;
		var itemList		= parm.itemList     ;
		var defaultItem		= parm.defaultItem  ;
		var targetColumns	= parm.targetColumns;
		
		var tList = fn_copyArray(itemList);
		
		if(isEmpty(tList)) tList = [];
		
		if(isValid(targetColumns)) {
			var cdnm = targetColumns[0];
			var nmnm = targetColumns[1];
			$.each(tList, function() {
				this.CD = this[cdnm];
				this.NM = this[nmnm];
			});
		}
		if(isValid(defaultItem)) {
			tList.splice(0,0, {CD : "", NM : defaultItem});
		}
	
		html = $("#select_template").render({list : tList});
		$("#" + pageId + " #" + domId).html(html);
	 }
	,makeWeekCalendar : function(pageId, domId, parm) {
		var domObj = "#" + pageId + " #" + domId;
		if(isEmpty(parm)) parm = {};
		parm.domId	 		= $(domObj).attr("id"			);
		parm.showWeek 		= $(domObj).attr("showWeek"		);
		parm.selectWeek 	= $(domObj).attr("selectWeek"	);
		parm.dateType 		= $(domObj).attr("dateType"		);
		parm.defaultDate	= $(domObj).attr("defaultDate"	);

		(parm.showWeek 		== "Y") ? parm.showWeek 	= true : parm.showWeek 		= false;
		(parm.selectWeek 	== "Y") ? parm.selectWeek	= true : parm.selectWeek	= false;

		if(parm.defaultDate == "today"	) parm.defaultDate 	= getToday(8,"-");
		
		if(isEmpty(parm.defaultDate	)) parm.defaultDate	= ""	;
		if(isEmpty(parm.dateType	)) parm.dateType 	= "N"	;
		if(isEmpty(parm.showWeek	)) parm.showWeek 	= false	;
		if(isEmpty(parm.selectWeek	)) parm.selectWeek 	= false	;
		
		C_UICOM.calendarParm[pageId + domId] = parm;
		
		$("#" + pageId + " #" + domId).datepicker({
			 changeMonth 		: true
			,changeYear 		: true
			,firstDay 			: 7
			,dateFormat 		: "yy-mm-dd"
			,showOtherMonths	: true //빈 공간에 현재월의 앞뒤월의 날짜를 표시
	        ,showMonthAfterYear	: true //년도 먼저 나오고, 뒤에 월 표시
			,monthNamesShort	: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] //달력의 월 부분 Tooltip 텍스트
	        ,dayNamesMin		: ["SUN","MON","TUE","WED","THU","FRI","SAT"] //달력의 요일 부분 텍스트
	        ,dayNames			: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]//달력의 요일 부분 Tooltip 텍스트
	        ,showWeek			: parm.showWeek
	        ,selectWeek			: parm.selectWeek
		    ,onSelect: function(dateText, inst) 
		    {
		    	var date 	= $(this).val();
		    	var obj 	= makeDateWeekCnt(date)
		    	var parm 	= C_UICOM.calendarParm[pageId + domId];
		    	
		    	if(parm.selectWeek && obj.overYear) {
			    	obj = makeDateWeekCnt(obj.nyyyymmdd)
		    	}
		    	if		(parm.dateType == "D"	) $(this).val(obj.date);
		    	else if	(parm.dateType == "W"	) $(this).val(obj.week);
		    	else					  		  $(this).val(date);
		    	$(this).trigger("change");
		    }		    
		});
    	if		(parm.dateType == "D"	) $("#" + pageId + " #" + domId).val(makeDateWeekCnt(parm.defaultDate).date);
    	else if	(parm.dateType == "W"	) $("#" + pageId + " #" + domId).val(makeDateWeekCnt(parm.defaultDate).week);
    	else					  	  	  $("#" + pageId + " #" + domId).val(parm.defaultDate);
	 }
	,getValFromWeekCalendar : function(pageId, domId) {
		var val = $("#" + pageId + " #" + domId).val();
		return val.split("(")[0];
	 }
	,init : function() {
		var html = "";
		html += '	<script type="text/x-jsrender" id="select_template">                											\n';
		html += '		{{for list}}                                                    											\n';
		html += '		<option value="{{:CD}}">{{:NM}}</option>                        											\n';
		html += '		{{/for}}                                                        											\n';
		html += '	</' + 'script>                                                      											\n';	

		$("body").append(html);
	 }
	,tableScrolling : function(pid, subId) {
		if(isEmpty(subId)) subId = "";
		$("#" + pid + " #nonScrollTable" + subId).prop("scrollTop"	, $("#" + pid + " #scrollTable" + subId).prop("scrollTop"	));
		$("#" + pid + " #topTable"		 + subId).prop("scrollLeft"	, $("#" + pid + " #scrollTable" + subId).prop("scrollLeft"	));
	 } 
}
*/
var C_PAGING = {
	 defaultListRange 	: 10
	,defaultPageRange 	: 10
	,listRange			: {}	// 리스트 범위
	,pageRange			: {}	// Page 범위
	,listDomId			: {}	// 리스트가 표시되는 Dom Id
	,pagingDomId		: {}	// Page가 표시되는 Dom Id
	,totalCntDomId		: {}	// Page가 표시되는 Dom Id
	,queryId			: {}
	,parmObj			: {}
	,parmFn				: {}
	,onPageClickCallback: {}
	,makeListFn			: {}
	,allDataList		: {}
	,pageInfo			: {}
	,create 			: function(parm) {
		var pageId 		= parm.pageId;
		var listDomId 	= parm.listDomId;
		var key = pageId + listDomId;
		if(isEmpty(parm.listRange)) parm.listRange = C_PAGING.defaultListRange;
		if(isEmpty(parm.pageRange)) parm.pageRange = C_PAGING.defaultPageRange;

		C_PAGING.listRange				[key] = parm.listRange 			; 
		C_PAGING.pageRange				[key] = parm.pageRange 			;
		C_PAGING.listDomId				[key] = parm.listDomId     		;
		C_PAGING.pagingDomId			[key] = parm.pagingDomId     	;
		C_PAGING.totalCntDomId			[key] = parm.totalCntDomId     	;
		C_PAGING.queryId				[key] = parm.queryId   			;
		C_PAGING.parmObj				[key] = parm.parmObj		   	;
		C_PAGING.parmFn					[key] = parm.parmFn			   	;
		C_PAGING.onPageClickCallback	[key] = parm.onPageClickCallback;
		C_PAGING.makeListFn				[key] = parm.makeListFn			;
		
		C_PAGING.makePageList(pageId, listDomId, 1);
	 }
	,goSearch		: function(pageId, listDomId) {
		C_PAGING.makePageList(pageId, listDomId, 1);
	 }
	,makePageList	: function(pageId, listDomId, pageIdx) {
		var key = pageId + listDomId;
		
		var pagingDomId = C_PAGING.pagingDomId[key];
		
		var option = {
			 currentPage	: Number(pageIdx)
			,listRange		: C_PAGING.listRange[key]
			,pageRange		: C_PAGING.pageRange[key]
		}
		
		// 호출한 페이지에서 제공하는 Parm을 option에 Setting한다.
		if(isValid(C_PAGING.parmObj[key])) {
			option.parm = C_PAGING.parmObj[key];
		} else if(typeof C_PAGING.parmFn[key] == "function") {
			option.parm = C_PAGING.parmFn[key]();
		} else {
			option.parm = {};
		}
		var parm = {
			 serviceId 	: "ExdevCommonService.getPagingList"
			,requestParm: {
				 queryId	: C_PAGING.queryId[key]
				,option 	: option
			 }
			,useLoadingBar	: true
		}
		C_COM.requestService(parm, function(resultData) {

			var totalPage 		= resultData.data.totalPage;
			
			var totalCnt		= resultData.data.totalCnt;
			
			if(isEmpty(totalCnt)) totalCnt = 0;

			var maxNextPage 	= Math.floor(totalPage / option.pageRange)
			var startPageIdx	= Math.floor((pageIdx - 1) / option.pageRange) * option.pageRange + 1
			var	endPageIdx		= startPageIdx + option.pageRange - 1;
			if(endPageIdx > totalPage) endPageIdx = totalPage;
			
			var prevPageIdx		= startPageIdx 	- 1;
			var nextPageIdx		= endPageIdx 	+ 1;
			
			
			var pageListHtml	 = "";
			
			
			var pageListHtml	 	 = ``;
			
			if(pageIdx > 1) {
				pageListHtml 	+= `	<a href="javascript:C_PAGING.makePageList('${pageId}', '${listDomId}', 1)" class="btn_pg_first">첫번째 페이지</a>`;
			} else {
				pageListHtml 	+= `	<a href="javascript:" class="btn_pg_first disabled">첫번째 페이지</a>`;
			}
			if(startPageIdx > option.pageRange) {
				pageListHtml 	+= `	<a href="javascript:C_PAGING.makePageList('${pageId}', '${listDomId}', ${prevPageIdx})" class="btn_pg_prev">이전 페이지</a>`;
			} else {
				pageListHtml 	+= `	<a href="javascript:" class="btn_pg_prev disabled">이전 페이지</a>`;
			}
			for(var ii = startPageIdx; ii <= endPageIdx; ii++) {
				var acrive = "";
				if(ii == pageIdx) {
					pageListHtml 	+= `	<strong title="현재 페이지">${pageIdx}</strong>`;
					
				} else {
					pageListHtml 	+= `	<a href="javascript:C_PAGING.makePageList('${pageId}', '${listDomId}', ${ii})">${ii}</a>`;
				}
			}
			if(endPageIdx < totalPage) {
				pageListHtml 	+= `	<a href="javascript:C_PAGING.makePageList('${pageId}', '${listDomId}', ${nextPageIdx})" class="btn_pg_next">다음 페이지</a>`;
			} else {
				pageListHtml 	+= `	<a href="javascript:" class="btn_pg_next disabled">다음 페이지</a>`;
			}
			if(pageIdx < totalPage) {
				pageListHtml 	+= `	<a href="javascript:C_PAGING.makePageList('${pageId}', '${listDomId}', ${totalPage})" class="btn_pg_last">마지막 페이지</a>`;
			} else {
				pageListHtml 	+= `	<a href="javascript:" class="btn_pg_last disabled">마지막 페이지</a>`;
			}
			
			$("#" + pageId + " #" + pagingDomId).html(pageListHtml);
			
			var list = resultData.data.pageList;
			if(typeof C_PAGING.makeListFn[key] == "function") list = C_PAGING.makeListFn[key](list);
			
			var rparm = {
				 targetId 		: C_PAGING.listDomId[key]
				,list			: resultData.data.pageList
			}
			C_COM.renderHtml(pageId, rparm);
			
			if(isValid(C_PAGING.totalCntDomId[key])) {
				$("#" + pageId + " #" + C_PAGING.totalCntDomId[key]).html(totalCnt);
			}
			
			
			
			if(typeof C_PAGING.onPageClickCallback[key] == "function") C_PAGING.onPageClickCallback[key](resultData.data);
		});
	 }
	 // Local Paging 
	,renderHtml : function(pageId, parm) {
		
		if(isValid(parm.list)) {
			$.each(parm.list, function(idx) {
				if(idx == 0 && isValid(this.rownum)) return false;
				parm.list[idx].rownum = idx + 1;
			});
		} else parm.list = []; 
		
		

		var listDomId 	= parm.targetId;
		var key = pageId + listDomId;
		if(isEmpty(parm.listRange)) parm.listRange = C_PAGING.defaultListRange;
		if(isEmpty(parm.pageRange)) parm.pageRange = C_PAGING.defaultPageRange;
	
		C_PAGING.listRange				[key] = parm.listRange 			; 
		C_PAGING.pageRange				[key] = parm.pageRange 			;
		C_PAGING.listDomId				[key] = parm.listDomId     		;
		C_PAGING.pagingDomId			[key] = parm.pagingDomId     	;
		C_PAGING.totalCntDomId			[key] = parm.totalCntDomId     	;
		C_PAGING.onPageClickCallback	[key] = parm.onPageClickCallback;
		C_PAGING.allDataList			[key] = parm.list				; //new
		
		let totalCnt = parm.list.length;
		
		C_PAGING.pageInfo				[key] = {
			 totalPage	: Math.ceil(totalCnt / parm.listRange)
			,totalCnt	: totalCnt
		}
		
		C_PAGING.makeRenderHtml(pageId, listDomId, 1);
	 }
	,makeRenderHtml : function(pageId, listDomId, pageIdx) {
		
		var key = pageId + listDomId;
		
		var pagingDomId = C_PAGING.pagingDomId[key];
		
		var option = {
			 currentPage	: Number(pageIdx)
			,listRange		: C_PAGING.listRange[key]
			,pageRange		: C_PAGING.pageRange[key]
		}

		let pageInfo 	= C_PAGING.pageInfo		[key];
		let allDataList	= C_PAGING.allDataList	[key];
		
		var totalPage 		= pageInfo.totalPage;
		
		var totalCnt		= pageInfo.totalCnt;
		
		if(isEmpty(totalCnt)) totalCnt = 0;

		var maxNextPage 	= Math.floor(totalPage / option.pageRange)
		var startPageIdx	= Math.floor((pageIdx - 1) / option.pageRange) * option.pageRange + 1
		var	endPageIdx		= startPageIdx + option.pageRange - 1;
		if(endPageIdx > totalPage) endPageIdx = totalPage;
		
		var prevPageIdx		= startPageIdx 	- 1;
		var nextPageIdx		= endPageIdx 	+ 1;
		
		var pageListHtml	  = ``;
		
		if(pageIdx > 1) {
			pageListHtml 	+= `	<a href="javascript:C_PAGING.makeRenderHtml('${pageId}', '${listDomId}', 1)" class="btn_pg_first">첫번째 페이지</a>`;
		} else {
			pageListHtml 	+= `	<a href="javascript:" class="btn_pg_first disabled">첫번째 페이지</a>`;
		}
		if(startPageIdx > option.pageRange) {
			pageListHtml 	+= `	<a href="javascript:C_PAGING.makeRenderHtml('${pageId}', '${listDomId}', ${prevPageIdx})" class="btn_pg_prev">이전 페이지</a>`;
		} else {
			pageListHtml 	+= `	<a href="javascript:" class="btn_pg_prev disabled">이전 페이지</a>`;
		}
		for(var ii = startPageIdx; ii <= endPageIdx; ii++) {
			var acrive = "";
			if(ii == pageIdx) {
				pageListHtml 	+= `	<strong title="현재 페이지">${pageIdx}</strong>`;
				
			} else {
				pageListHtml 	+= `	<a href="javascript:C_PAGING.makeRenderHtml('${pageId}', '${listDomId}', ${ii})">${ii}</a>`;
			}
		}
		if(endPageIdx < totalPage) {
			pageListHtml 	+= `	<a href="javascript:C_PAGING.makeRenderHtml('${pageId}', '${listDomId}', ${nextPageIdx})" class="btn_pg_next">다음 페이지</a>`;
		} else {
			pageListHtml 	+= `	<a href="javascript:" class="btn_pg_next disabled">다음 페이지</a>`;
		}
		if(pageIdx < totalPage) {
			pageListHtml 	+= `	<a href="javascript:C_PAGING.makeRenderHtml('${pageId}', '${listDomId}', ${totalPage})" class="btn_pg_last">마지막 페이지</a>`;
		} else {
			pageListHtml 	+= `	<a href="javascript:" class="btn_pg_last disabled">마지막 페이지</a>`;
		}
		
		$("#" + pageId + " #" + pagingDomId).html(pageListHtml);
		
		if(typeof C_PAGING.makeListFn[key] == "function") list = C_PAGING.makeListFn[key](list);
		
		let startListIdx	= (pageIdx - 1) * option.listRange 
		let endListIdx		= pageIdx * option.listRange 
		
		let list = [];
		
		$.each(allDataList, function(idx) {
			if(idx >= startListIdx && idx < endListIdx) {
				list.push(this);
			}
		});

		var rparm = {
			 targetId 		: listDomId
			,list			: list
		}
		C_COM.renderHtml(pageId, rparm);
		
		if(isValid(C_PAGING.totalCntDomId[key])) {
			$("#" + pageId + " #" + C_PAGING.totalCntDomId[key]).html(totalCnt);
		}
		
		if(typeof C_PAGING.onPageClickCallback[key] == "function") {
			
			let retParm = {
				 pageIdx 	: pageIdx
				,list		: list
			}
			
			C_PAGING.onPageClickCallback[key](retParm);	
		}
		
		C_COM.preInitTemplate(pageId, listDomId);
		
	}		
}

// Table Widht 동적 조절 처리
// 사용법
// 사용할 Td에

/* 
var C_GRID = {
	 GAP			: 0
	,MIN_WIDTH		: 30
	,baseX			: 0
	,mouseDownState : false
	,targetTd		: {
		 leftDomGrp 	: undefined
		,rightDomGrp	: undefined
	 }
	,cell_left 	: function(obj) {
		if (event.offsetX < 5 && obj.cellIndex != 0) 	return true;
		else											return false;
	 }
	,cell_right : function(obj) {
		var width = $(obj).css("width").replaceAll("px", "");
		if (event.offsetX > Number(width) - 4) return true;
		else return false;
	 }
	,setDomInfo : function (domObj) {
		var itemColspanCnt		= $(domObj  ).attr("colspan");
		var itemTargetColId		= $(domObj	).attr("targetCol");
		var itemColDom			= $("#" + itemTargetColId);
		var itemColWidth		= $("#" + itemTargetColId).css("width");
		
		var itemDomGrp			= {};
		
		itemColWidth = itemColWidth.replace("%","").replace("px","");
		if(isValid(itemColspanCnt)) {
			var colObjArr 	= [itemColDom];
			var rateArr		= [itemColWidth];
			
			var nowDomObj	= itemColDom;
			var totalRate	= Number(itemColWidth);
			for(var ii=1;ii<itemColspanCnt;ii++) {
				nowDomObj = $(nowDomObj).next()[0];
				colObjArr.push(nowDomObj);
				var wd = $(nowDomObj).css("width").replace("%","").replace("px","");
				rateArr  .push(wd);
				totalRate += Number(wd);
			}
			$.each(rateArr, function(idx) {
				rateArr[idx] = this / totalRate * 100;
			});
			itemDomGrp = {
				 tdDomObj	: domObj
				,baseWidth	: addPx($(domObj).css("width"), C_GRID.GAP)
				,colspanCnt	: colObjArr.length
			 	,colDomArr	: colObjArr
			 	,rateArr	: rateArr
			}
		} else {
			itemDomGrp = {
				 tdDomObj	: domObj
				,baseWidth	: addPx($(domObj).css("width"), C_GRID.GAP)
				,colspanCnt	: 1
			 	,colDomArr	: [itemColDom]
			 	,rateArr	: [100]
			}
		}
		return itemDomGrp;
	 }
	,TCstartColResize : function(leftDom, rightDom) {
		C_GRID.mouseDownState	= true;
		
		C_GRID.targetTd.leftDomGrp	= C_GRID.setDomInfo(leftDom);
		C_GRID.targetTd.rightDomGrp	= C_GRID.setDomInfo(rightDom);
	 }
	,TCmoveColResize : function(e) {
		if (C_GRID.mouseDownState) {
			var distX = e.pageX - C_GRID.baseX; //이동한 간격
			
			if(isValid(C_GRID.targetTd.leftDomGrp) && isValid(C_GRID.targetTd.rightDomGrp)) {
				var ld_grp 			= C_GRID.targetTd.leftDomGrp;
				var leftWidth 		= ld_grp.baseWidth;
				var ajLeftWidth		= addPx(leftWidth	,distX);
				
				var rd_grp 			= C_GRID.targetTd.rightDomGrp;
				var rightWidth 		= rd_grp.baseWidth;
				var ajRightWidth	= addPx(rightWidth	,-distX);
				
				var leftMinWidth	= C_GRID.MIN_WIDTH * ld_grp.colspanCnt;
				var rightMinWidth	= C_GRID.MIN_WIDTH * rd_grp.colspanCnt;
				
				if(pxToInt(ajLeftWidth)  < leftMinWidth) return; 
				if(pxToInt(ajRightWidth) < rightMinWidth) return; 
				
				for(var ii=0;ii<ld_grp.colspanCnt;ii++) {
					var tint 	= Number(ajLeftWidth.replace("px", ""));
					var wd 		= Number(ld_grp.rateArr[ii]) * tint / 100;
					$(ld_grp.colDomArr[ii]).css("width", wd + "px"	);
				}

				for(var ii=0;ii<rd_grp.colspanCnt;ii++) {
					var tint 	= Number(ajRightWidth.replace("px", ""));
					var wd 		= Number(rd_grp.rateArr[ii]) * tint / 100;
					$(rd_grp.colDomArr[ii]).css("width", wd + "px"	);
				}
			}
		}
	 }
	,TCstopColResize : function(e) {
		C_GRID.mouseDownState 	= false;
		C_GRID.destroy();
	 }
	,destroy : function() {
		C_GRID.baseX = 0;
		if(isValid(C_GRID.targetTd.leftDomGrp)) {
			C_GRID.targetTd.leftDomGrp.tdDomObj.style.cursor = "";
		}
		if(isValid(C_GRID.targetTd.rightDomGrp)) {
			C_GRID.targetTd.rightDomGrp.tdDomObj.style.cursor = "";
		}
		C_GRID.targetTd = {};			
	 }
	,init : function() {
		$(window).bind("mousemove",function(e) {
			try {
				var tgtElement = window.event.srcElement;
				var targetCol = $(tgtElement).attr("targetCol");
				if (isValid(targetCol)) {
					//셀의 가장자리면 마우스 커서 변경
					if (C_GRID.cell_left(tgtElement)) {
						tgtElement.style.cursor = "col-resize";
					} else if(C_GRID.cell_right(tgtElement)) {
						var rightDom = $(tgtElement).next()[0];
						if(isValid(rightDom)) 	tgtElement.style.cursor = "col-resize";
						else					tgtElement.style.cursor = "";
					} else {
						if(!C_GRID.mouseDownState) tgtElement.style.cursor = "";
					}
					C_GRID.TCmoveColResize(e);
				} else {
					tgtElement.style.cursor = "";
				}
			} catch (e) {
				return true;
			}
		});
		$(window).bind("mousedown",function(e) {
			try {
				var tgtElement 	= window.event.srcElement;
				var leftDom;
				var rightDom;
				var targetCol = $(tgtElement).attr("targetCol");
				if (isValid(targetCol)) {
					if (C_GRID.cell_left(tgtElement)) {
						leftDom 	= $(tgtElement).prev()[0];
						rightDom	= tgtElement;
					} else if (C_GRID.cell_right(tgtElement)) {
						leftDom		= tgtElement;
						rightDom	= $(tgtElement).next()[0];
					} else {
						return true;//오른쪽도 왼쪽도 아니면 사이즈 조절 안함
					}
					C_GRID.baseX = e.pageX;
					C_GRID.TCstartColResize(leftDom, rightDom);
				}
			} catch (e) {
				dalert(e.message);
				return true;
			}
		});
		$(window).bind("mouseup",function(e) {
			try {
				var tgtElement = window.event.srcElement;
				var targetCol = $(tgtElement).attr("targetCol");
				if (isValid(targetCol)) {
					C_GRID.TCstopColResize(e);
				} else {
					C_GRID.mouseDownState 	= false;
					C_GRID.destroy();
				}
			} catch (e) {
				C_GRID.mouseDownState 	= false;
				C_GRID.destroy();
				return true;
			}
		});
		//리사이즈 도중 텍스트 선택 금지
		$(document).bind("selectstart", function() {
			try {
				if(isValid(C_GRID.targetTd.leftDomGrp) || isValid(C_GRID.targetTd.rightDomGrp)) {
					return false;
				}
			} catch (e) {
				return true;
			}
		});
	 }
}
*/

// Comp Class
var C_COMP = {
	 eventFn 			: {}
	,callbackMap		: {}
	,import	: function(targetId, compId, parm, callback) {
		
		if(parm == undefined) parm = {};
		
		var templateId = parm.templateId;
		
		if(isEmpty(templateId)) templateId = C_COM.getCurrentTemplateId();
		
		var templateWebId = "#" + templateId + " #" + targetId + " ";
		
		
		// Comp ID에 해당하는 Url의 html을 가져온다.
		var urlBody	= compId.replaceAll("_", "/");
		var url 	= "ui/" + urlBody + ".html";
		var html 	= C_COM.getHtmlFile(url);
		
		if(isEmpty(html)) {
			C_POP.alert('Component ID가 존재 하지 않습니다.\n\nComponent ID를 확인하시기 바랍니다.');
			return;
		}

		compId = templateId + targetId;

		parm.compId = compId;
		
		parm.parentId = templateId;
		
		C_COMP.callbackMap[compId] = callback;
		
		// 가상의 Document에 가져온 html 을 Setting한다.
		var docDiv = $("<div></div>");
		$(docDiv).html(html);

		// html에서 최상위Div에 compId를 id로 부여한다.(unique값)
		if($("component", docDiv).length > 0) {
			$("component"	, docDiv).eq(0).attr("id"	, compId);
		} else {
			$("div"			, docDiv).eq(0).attr("id"	, compId);
		}
		
		// Import할 Comp를 Load 한다.
		var htmlSrc = $(docDiv, "#" + compId).html();
		
		htmlSrc = htmlSrc.render("<@", ">", parm);

		$(templateWebId).html(htmlSrc);
		
		// onLoadComp로 설정된 Function 실행
		if(typeof C_COMP.eventFn[compId] == "function") C_COMP.eventFn[compId](parm);
		
		// Page 내의 처리는 Comp도 Page와 동일하기 떄문에 C_PM의 initPage를 사용한다.
		C_COMP.preInitComp(compId);
		
		eval(templateId + "." + targetId + " = " + compId);
		
	 }
	// Page에 Load시 스크립트 실행전 공통 설정을 한다.
	,preInitComp : function(compId) {
		C_COM.preInitTemplate(compId);
	 }
	,onLoadComp : function(compId, callback) {
		C_COMP.eventFn[compId] = callback;
	 }
	,callback : function(compId, data) {
		if(typeof C_COMP.callbackMap[compId] == "function") C_COMP.callbackMap[compId](data);
	 }
	,getCompObj : function(compId) {
		try {
			var templateId = C_COM.getCurrentTemplateId();
			eval("let compObj = " + templateId + compId);
			return compObj;
		} catch(e) {
			alert('Component Object를 가져오는데 실패 했습니다.');
			return null;
		}
	 }
}


var C_ALARM = {
	 init			: function() {
     	let rparm = {
		  queryId 		: "common.getAlarmListCount"
		 ,requestParm	: {}
     	}
		C_COM.requestQuery(rparm, function(resultData) {
			let cnt = resultData.data[0].CNT;
			if(cnt == 0) {
				$("#alarmCount").hide();
			} else {
				$("#alarmCount").show();
				$("#alarmCount").html(cnt)
			}
		});
	 }  
	,showAlarmPopup : function()  {
		C_POP.open('popup_common_alarmPopup', {}, function(retData) {
						
			C_ALARM.init();
			
			
			
		});
	 }
}








// rs render 사용자 정의 function
//jsrender 사용자 정의 함수
$.views.converters({
	 // DateFormat 
	 dt 	: function(value) {return getDateFormat(value, 8);}								//YYYY-MM-dd HH:mm:ss
	,numb 	: function(value) {
		if(typeof value == "string" || typeof value == "number" ) 	return addComma(value);
		else														return nvl(value, "");
	 }
	,fix	: function(value) {
		if(typeof value == "number") {
			return value.toFixed(2)
		} else {
			return value
		}
	 }
	,toKb	: function(value) {
		if(typeof value == "number") {
			return Math.round(value / 10.24) / 100	
		} else {
			return "";
		}
			
	 }
});


// 숫자인경우 구두점 넣어서 입력됨, 구두점 제거 후 리턴됨
$.fn.nval = function(value){
	if(isValid(value)) {
		if(isNumber(value)) {
			$(this).val(addComma(value));
		} else {
			$(this).val(value);
		}
	} else {
		var val = $(this).val();
		if(typeof val == "string") 	return val.replaceAll(",", "");
		else						return val;
	}
};

//
// 최초 공통 설정 사항
//


// Browser 뒤로가기 방지

history.pushState(null, null, location.href);

var dupCheck = false;
window.onpopstate = function () {
	if(dupCheck) return;
	dupCheck = true;
    history.go(1);
    C_HM.historyBack();
    setTimeout(function() {
    	dupCheck = false;
    }, 500);
};


var C_WIN = {
	 callbackMap: {}
	,addListenerWindowResize : function(templateId, callback) {
		C_WIN.callbackMap[templateId] = callback;
	 }
	,onWindowResize : function() {
		var pageId = C_PM.getCurrentTemplateId();
		if(isValid(C_WIN.callbackMap[pageId])) {
			C_WIN.callbackMap[pageId]();
		}
	 }
} 

$(window).resize(function() {
	//hasYScrollBar();
	//hasXScrollBar();
	C_WIN.onWindowResize();
});


var hiddencommand 	= "SHOWPAGEID";
var debugcommand 	= "GODEBUG";
var hiddenconfirm 	= ""
$(function() {
	C_COM.init();
	C_UICOM.init();
	//C_ALARM.init();
	//C_GRID.init()
	$(window).bind("keydown",function() {
		
		hiddenconfirm += String.fromCharCode(event.keyCode);
		if(hiddenconfirm.length > 10) {
			hiddenconfirm = hiddenconfirm.substring(1,11);
		}
		if(hiddencommand == hiddenconfirm) {
			var templateId = C_COM.getCurrentTemplateId();
			alert(templateId);
		} else if(hiddenconfirm.indexOf(debugcommand) > -1 ) {
			C_PM.movePage("sample_index");
		}
	});
});
