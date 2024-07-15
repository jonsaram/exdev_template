	/**
	 *  문자열에 있는 특정문자패턴을 다른 문자패턴으로 바꾸는 함수.
	 */
	function replace(targetStr, searchStr, replaceStr)
	{
	    var len, i, tmpstr;

	    len = targetStr.length;
	    tmpstr = "";

	    for ( i = 0 ; i < len ; i++ ) {
	        if ( targetStr.charAt(i) != searchStr ) {
	            tmpstr = tmpstr + targetStr.charAt(i);
	        }
	        else {
	            tmpstr = tmpstr + replaceStr;
	        }
	    }
	    return tmpstr;
	}
	// 현재 날짜를 '20080101010101'형식으로 반환한다.
	// len은 필요한 자리수 만큼만 지정해준다. 	미지정인경우 8
	// getToday() 	=> 20110102
	// getToday(12) => 201101020304
	// getToday(14) => 20110102030405
	function getToday(len, gubun)
	{
		if(len == undefined) len = 8;
		var todate = new Date();
		var result = todate.getFullYear() + "-" + fillZero(parseInt(todate.getMonth()) + 1, 2) + "-" + fillZero(todate.getDate(), 2) + " " + fillZero(todate.getHours(), 2) + ":" + fillZero(todate.getMinutes(), 2) + ":" + fillZero(todate.getSeconds(), 2);
		
		if(isValid(gubun)) {
			result = getDateFormat(result, len, gubun);
		}
		return result;
	}

	// 날짜를 변환한다.
	function getDateToStr(todate, len, gubunStr)
	{
		if(len == undefined) len = 8;
		var result = todate.getFullYear() + "" + fillZero(parseInt(todate.getMonth()) + 1, 2) + "" + fillZero(todate.getDate(), 2) + fillZero(todate.getHours(), 2) + fillZero(todate.getMinutes(), 2) + fillZero(todate.getSeconds(), 2);
		result = result.substring(0, len);
		if(gubunStr != undefined) result = getDateFormat(result, len, gubunStr);
		return result;
	}

	// 정해진 자리수에 맞춰 앞쪽에 0을 채운다   
	function fillZero(ipt, cnt)
	{
		var tgt = ipt + "";
		while(tgt.length < cnt)
		{
			tgt = "0" + tgt;
		}
		return tgt;
	}
	
	// 날짜 문자열을 	14자리 -> '2010-05-05 11:22:33'
	// 					12자리 -> '2010-05-05 11:22'
	//					8자리  -> '2010-05-05' 
	//					6자리  -> '2010-05'
	//					의 형식으로 변환(문자열 자리수에 따라 자동 변환함)
	//					fixSeat를 지정해주면 자리수가 길어도 fixSeat자리수 만큼만 처리한다.
	function getDateFormat(dateStr, fixSeat, gubunStr)
	{
		if(gubunStr == undefined) gubunStr = "-";
		if(Object.prototype.toString.call(dateStr)  != '[object String]') return "";
		dateStr = dateStr.replaceAll(gubunStr, "");
		if(dateStr.length > fixSeat) {
			dateStr = dateStr.substring(0, fixSeat);
		}
		if(dateStr.length == 6)
			return dateStr.substring(0, 4) + gubunStr + dateStr.substring(4, 6);
		if(dateStr.length < 8) return null;
		var yyyy = dateStr.substring(0, 4);
		var mm = dateStr.substring(4, 6);
		var dd = dateStr.substring(6, 8);
		var result = yyyy + gubunStr + mm + gubunStr + dd;
		if(dateStr.length > 11)
		{
			var hh = dateStr.substring(8, 10);
			var ii = dateStr.substring(10, 12);
			result = result + " " + hh + ":" + ii;
		}
		if(dateStr.length == 14)
		{
			var ss = dateStr.substring(12, 14);
			result = result + ":" + ss;
		}
		return result;

	}
	function getDateByAddDayFromNow(tDay)
	{
		var tt = new Date(); //현재 날짜 및 시간
		tt.setDate(tt.getDate() + tDay);
		var result = "" + tt.getFullYear() + fillZero(tt.getMonth() + 1, 2) + fillZero(tt.getDate(), 2) + fillZero(tt.getHours(), 2) + fillZero(tt.getMinutes(), 2) + fillZero(tt.getSeconds(), 2);
		return result;
	}
	// 월을 증가시킨 날짜를 구한다.(년 월 일 까지)
	function getAddMonth(input, addValue)
	{
		var mflag = false;
		if(input.length==6) {
			mflag = true;
			input = input + "01";
		}
		var tt = new Date(input.toDateStr("-"));
		tt.setMonth(Number(tt.getMonth()) + Number(addValue));
		var result = "";
		if(mflag) 	result = "" + tt.getFullYear() + "-" + fillZero(tt.getMonth() + 1, 2);
		else		result = "" + tt.getFullYear() + "-" + fillZero(tt.getMonth() + 1, 2) + "-" + fillZero(tt.getDate(), 2);

		return result;
	}
	
	// 연을 증가시킨 날짜를 구한다.
	function getAddYear(tYear)
	{
		var tt = new Date();
		tt.setFullYear(tt.getFullYear()+ tYear);
		var result = "" + tt.getFullYear() + fillZero(tt.getMonth() + 1, 2) + fillZero(tt.getDate(), 2);
		return result;
	}
	// 날짜 유효성 Check
	function checkDate(str) {
		try {
			str = str + "";
			var result = str.replaceAll("-", "");
			var result = str.replaceAll(".", "");
			if(!isNumber(result)) return false;
			if(result.length != 8) return false;
			var p1 = result.substring(0, 4);
			var p2 = result.substring(4, 6);
			var p3 = result.substring(6, 8);
	
			if(p2 > 12 || p2 < 1) return false;
			
			var m31 = ["01", "03", "05", "07", "08", "10", "12"];
	
			if(p3 > "31" || p3 < "01") return false;
			
			if(!in_array(p2,  m31) && p3 > "30" ) return false;
			
			if( p2 == "02" && p3 > "29") return false;
			
			return true;
		} catch(e) {
			return false;
		}
	}
	// 날짜 차이를 일수로 계산한다.
	function getDateDiff(_date1, _date2) {
	    var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
	    var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);
	    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth(), diffDate_1.getDate());
	    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth(), diffDate_2.getDate());
	    var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
	    diff = Math.ceil(diff / (1000 * 3600 * 24));
	    return diff;
	}
	// 특정 주의 주차를 가져온다.
	function makeDateWeekFromWeek(week) {
		return makeDateWeekCnt(makeDateFromWeek(week));
	}
	// 특정 날짜의 주차를 가져온다.
	function makeDateWeekCnt(tDate) {
		if(isEmpty(tDate)) return tDate;
	    var eDate 		= tDate instanceof Date ? tDate : new Date(tDate);
	    tDate			= getDateToStr(eDate,8,"-");
	    var neDate		= new Date(eDate);
		var sWeek 		= eDate.getDay();
		var addDay 		= 3 - sWeek;				// 수요일 찾기
		neDate.setDate(neDate.getDate() + addDay);	// 수요일 세팅
	    var yyyy 		= eDate.getFullYear();
		var mm			= Number(eDate.getMonth()) + 1;
		var dd			= Number(eDate.getDate() )
	    var nyyyy 		= neDate.getFullYear();
	    var nmm			= neDate.getMonth() + 1;
	    var nmmStr		= fillZero(nmm, 2);
	    if(yyyy < nyyyy) {
			var date		= tDate 	+ "(" + nyyyy + " W01)";
			var week		= nyyyy 	+ "-" + nmmStr +" W01";
			return {
				 weekCnt 	: 1
				,weekStr 	: "W01"
				,date 		: date
				,week 		: week
				,overYear 	: true
				,dateObj	: neDate
				,nyyyymmdd 	: nyyyy + "-01-01"
				,yyyy 		: nyyyy
				,mm 		: nmm
				,dd 		: 1
				,uid		: week.replace(" ", "")
				,yy_mm 		: (nyyyy + "").substring(2, 4) + "." + nmmStr
			};
	    } else if(yyyy > nyyyy) {
	    	var obj 	= makeDateWeekCnt(nyyyy + "-12-31");
			obj.date = tDate + "(" + nyyyy + " " + obj.weekCnt + "W)";
			return obj;
	    } else {
			var sDate 		= new Date(yyyy + "-01-01");
			var sWeek 		= sDate.getDay();
			var addDay 		= 3 - sWeek;			// 수요일 찾기
			var addWeek		= (addDay > -1) ? 1 : 0;
			sDate.setDate(sDate.getDate() + addDay);// 수요일 세팅
			var distance 	= getDateDiff(sDate, eDate);
			var weekCnt 	= Math.floor((distance + 3) / 7) + addWeek;
			var date		= tDate + "(" + fillZero(weekCnt, 2) + "W)";
			var week		= yyyy 	+ "-" + nmmStr + " W" + fillZero(weekCnt, 2);
			
			return {
				 weekCnt 	: weekCnt
				,weekStr 	: "W" + fillZero(weekCnt, 2)
				,date 		: date
				,week 		: week
				,dateObj 	: eDate
				,yyyy 		: yyyy
				,mm 		: mm
				,dd 		: dd
				,uid		: week.replace(" ", "")
				,yy_mm 		: (yyyy + "").substring(2, 4) + "." + nmmStr
			};
	    }
	}
	// 주차정보로 주차에 해당하는 날짜 중 하나를 지정한다.(달력에서 해당 주차를 찾을때 사용)
	function makeDateFromWeek(week) {
		if(isEmpty(week)) return week;
		try {
			var darray = week.split(" ");
			var yyyy = darray[0].substring(0, 4);
			var sDate = new Date(yyyy + "-01-01");
			var sWeek 		= sDate.getDay();
			var addWeek		= sWeek < 5 ? 0 : 1;
			var tDay = (Number(darray[1].substring(1,3)) + addWeek - 1) * 7;
			sDate.setDate(sDate.getDate() + tDay);		
			var tDateStr = getDateToStr(sDate,8,"-");
			return tDateStr;
		} catch(e) {
			return week;
		}
	}
	function getNextWeek(week, reqObjFlag) {
		var sd = makeDateFromWeek(week);
		var nd = new Date(sd);
		nd.setDate(nd.getDate() + 7);
		var wObj = makeDateWeekCnt(nd);
		if(reqObjFlag) 	return wObj;
		else			return wObj.week;
	}
	
	function getPrevWeek(week, reqObjFlag) {
		var sd = makeDateFromWeek(week);
		var nd = new Date(sd);
		nd.setDate(nd.getDate() - 7);
		var wObj = makeDateWeekCnt(nd);
		if(reqObjFlag) 	return wObj;
		else			return wObj.week;
	}
	
	String.prototype.trim = function() {
		return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
	}
	String.prototype.replaceAll = function(source, target) {
		return this.split(source).join(target);
	}
	String.prototype.toDateStr = function(gubun) {
		var dateStr = this.replaceAll("-", "").replaceAll("/", "");
		if(gubun == undefined) gubun = "-";
		var yyyy 	= dateStr.substr(0, 4);
		var mm 		= dateStr.substr(4, 2);
		var dd 		= dateStr.substr(6, 2);
		var result = yyyy + gubun + mm + gubun + dd;
		return result;
	}
	/**
	 * 특정 영역의 문자열의 내용을 가져온다.
	 */
	String.prototype.getRangeChar = function(sd, ed) {
		var src = this + "";
		
		if(!isValid(src) || !isValid(sd) || !isValid(ed)) return "";

		var startIdx 	= src.indexOf(sd);
		var endIdx 		= src.indexOf(ed, startIdx);
		
		if(startIdx < 0 || endIdx < 0) return null;
		
		var target = src.substring(startIdx + sd.length, endIdx);

		return target;
	}
	
	String.prototype.render = function(sd, ed, parm) {
		var src = this + "";

		src = src.replaceAll("&lt;", "<");
		src = src.replaceAll("&gt;", ">");
		
		if(!isValid(src) || !isValid(sd) || !isValid(ed)) return "";
		var cursorPos = 0;
		while(true) {
			var startIdx 	= src.indexOf(sd, cursorPos);
			var endIdx 		= src.indexOf(ed, startIdx);
			
			if(startIdx < 0 || endIdx < 0) break;


			var target 		= src.substring(startIdx, endIdx + ed.length);
			var fKey		= src.substring(startIdx + sd.length, endIdx);
			var fKeySpt		= fKey.split("|");
			var key 		= fKeySpt[0];
			var defaultStr	= fKeySpt[1] == undefined ? "" : fKeySpt[1];
			var addParm;
			if(isValid(fKeySpt[2])) {
				addParm = fKeySpt[2].split(",");
			}
			
			var dest = getParseObject(key, parm);

			if(dest == undefined) {
				if(defaultStr != "") dest = defaultStr;
			}
			dest = __render(dest, addParm, parm);
			if(isEmpty(dest))dest = "";

			if		( typeof dest == "number") dest = "" + dest;
			else if	( typeof dest == "object") dest = "object";
			
			dest = dest.replaceAll("\\n", "<br/>");
			dest = dest.replaceAll("\n", "<br/>");
			src = src.replaceAll(target, dest);

			cursorPos = endIdx - target.length;
		}
		return src;
	}
	
	// TD Merge
	function _mergeTableTD(tableId, index, parm) {
		var startIdx 	= parm.startIdx;
		var type		= parm.type;
		var startRowIdx	= parm.startRowIdx;
		if(index 		== undefined) index 		= 0;
		if(startIdx 	== undefined) startIdx 		= 1;
		if(type 		== undefined) type 			= 1;
		if(startRowIdx 	== undefined) startRowIdx 	= 1;
		if(startRowIdx < 1) {
			alert('startRowIdx는 1이상이어야 합니다.');
			return;
		}
		startRowIdx--;
		var rowSpanArray = [];
		var rowspan = 0;
		var lastIdx = 0;
		var targetBlockObj = $("#" + tableId + " tr").eq(0).parent();
		targetBlockObj.children().each(function(listIdx) {
			if(startRowIdx > listIdx) return true;
			var thisKey = "";
			for(var ii=(startIdx - 1); ii <= index; ii++ ) {
				try {
					thisKey += $(this).children().eq(ii).html().trim();
				} catch(e) {}
			}
			rowSpanArray[listIdx] = {};
			var preKey = null;
			if(listIdx > startRowIdx) preKey = rowSpanArray[listIdx - 1].key;
			
			if(preKey != null && thisKey == preKey) {
				rowSpanArray[listIdx].key 		= thisKey;
				rowSpanArray[listIdx].state 	= "D";
				rowspan++;
			} else {
				rowSpanArray[listIdx].key 		= thisKey;
				rowSpanArray[listIdx].state 	= "H";
				if(listIdx > 0) rowSpanArray[listIdx - rowspan].rowspan = rowspan;
				rowspan = 1;
			}
			lastIdx = listIdx;
		});
		if(rowSpanArray.length == 0) return true;
		rowSpanArray[lastIdx - rowspan + 1].rowspan = rowspan;
		if(type == 1) {
			targetBlockObj.children().each(function(listIdx) {
				if(startRowIdx > listIdx) return true;
				if(rowSpanArray[listIdx].state == "H") {
					$(this).children().eq(index).attr("rowspan", rowSpanArray[listIdx].rowspan);
				} else if(rowSpanArray[listIdx].state == "D") {
					$(this).children().eq(index).remove();
				}
			});
		} else {
			targetBlockObj.children().each(function(listIdx) {
				if(startRowIdx >= listIdx) return true;
				if(rowSpanArray[listIdx].state == "D") {
					$(this).children().eq(index).html("");
				}
			});
		}
	};
	/**
	 * Table Merge작업을 한다.
	 * 설명 : 	targetId에 해당하는 DOM에서 첫번째 tr Tage를 찾아, 해당 Tr에 속한 Table에서 Merge를 진행한다.
	 * 
	 * ex ) 
	 * var parm = {    
	 * 				startIdx 	: 1,	// 시작 Column (1부터 시작)
	 * 				endIdx		: 2,	// 끝 Column
	 * 				startRowIdx : 2		// 시작 Row(1부터 시작)
	 * } 
	 * mergeTableTD('testTable', parm);
	 */
	function mergeTableTD(targetId, parm) {
		var startIdx 	= parm.startIdx;
		var endIdx		= parm.endIdx;
		if(startIdx < 1) {
			alert('startIdx 는 1이상이어야 합니다.');
			return;
		}
		if(endIdx == undefined) endIdx = startIdx;
		endIdx--;
		for ( var ii = endIdx + 1; ii > (startIdx - 1); ii--) {
			this._mergeTableTD(targetId, ii - 1, parm);
		}
	};
	
	function mergeTableColumn(targetId) {
		var pval = null;
		var pidx = -1;
		var tdInfoList = [];
		var colspanCnt = 1;
		$("#" + targetId + " td, #" + targetId + " th").each(function(idx) {
			var cval = $(this).html();
			if(cval == pval) {
				tdInfoList[idx] = {
					removeYn : "Y"
				};
				colspanCnt++;
			} else {
				pval = cval;
				tdInfoList[idx] = {
					 removeYn 	: "N"
				};
				if(pidx > -1) tdInfoList[pidx].colspanCnt = colspanCnt;
				
				pidx		= idx;
				colspanCnt 	= 1;
			}
		});
		if(pidx > -1) tdInfoList[pidx].colspanCnt = colspanCnt;
		$("#" + targetId + " td, #" + targetId + " th").each(function(idx) {
			var tdInfo = tdInfoList[idx];
			if(tdInfo.removeYn == "Y") 	$(this).remove();
			else						$(this).attr("colspan", tdInfo.colspanCnt);
		});
	}
	
	/**
	 * 	Key 값에 따라 Object Tree에서 해당 Path를 찾음
	 * 	ex)
	 * 	parm = { 
	 * 		a : { b : 1 }
	 * 	}
	 * 	result = getParseObject("a.b", parm);			
	 * 
	 * 
	 * @param key
	 * @param parm
	 * @returns
	 */
	function getParseObject(key, parm) {
		var keyArray = key.split(".");
		var dest = parm[keyArray[0]];
		$.each(keyArray, function(idx) {
			if(idx == 0) return true;
			if(!isValid(dest)) return false;
			dest = dest[this];
		});
		return dest;
	}
	// String.prototype.render에서만 사용
	function __render(str, addParm, baseMap) {
		if(!isValid(addParm)) return str;
		str = str + "";
		$.each(addParm, function(idx) {
			var addStr 	= this + "";
			var token 	= addStr.getRangeChar("[", "]");
			if(isValid(token)) addStr = getParseObject(token, baseMap);
			str = str.replaceAll("{"+idx+"}", addStr);
		});
		return str;
	}
	
	Array.prototype.removeItem = function(itemName) {
		for(var ii=0;ii < this.length;ii++) {
			this[ii][itemName] = undefined;
		}
	};

	Array.prototype.remove = function(idx) {
	    return (idx<0 || idx>this.length) ? this : this.slice(0, idx).concat(this.slice(idx+1, this.length));
	};

	//배열 중복 제거  // 원래의 배열 값의 배열은 그대로 두고 리턴 배열 값을 중복 제거 한다.
	Array.prototype.unique = function()
	{
		var arrResult = new Array(this.length);
		for(var i=0; i <this.length; i++){
			arrResult[i]=this[i];
		}
		var a = {};
		for(var i=0; i <arrResult.length; i++){
			if(typeof a[arrResult[i]] == "undefined")
				a[arrResult[i]] = 1;
		}
		arrResult.length = 0;
		for(var i in a)
			arrResult[arrResult.length] = i;
		return arrResult;
	}
	// Object 배열에서 특정 Key에 해당하는 값을 배열로 리턴한다.
	Array.prototype.columnToArray = function(key)
	{
		var list = [];
		$.each(this, function() {
			list.push(this[key]);
		});
		return list;	
	}
	
	
	// 배열을 정렬한다.
	// ex)
	//	var list = [
	//	  	 { "ITEM" : "A", "VAL" : 4 }
	//	  	,{ "ITEM" : "D", "VAL" : 1 }
	//	  	,{ "ITEM" : "C", "VAL" : 2 }
	//		,{ "ITEM" : "B", "VAL" : 3 }
	//	];
	//	   	
	//	list.orderBy("ITEM", "asc");
	Array.prototype.orderBy = function(itemName, direct) {
		if(direct == undefined) direct = "ASC";
		
		this.sort(function(a, b) {
			if			(direct.toUpperCase() == "ASC") {
				return(a[itemName]<b[itemName])?-1:(a[itemName]>b[itemName])?1:0;
			} else if	(direct.toUpperCase() == "DESC") {
				return(a[itemName]<b[itemName])?1:(a[itemName]>b[itemName])?-1:0;
			} else {
				return 0;
			}
		}); 
	}
	
	$.fn.serializeJSON=function() {
	    var json = {};
	    var numNmMap = {}
	    $(this).find("[number]").each(function() {
	    	numNmMap[$(this).attr("name")] = "number";
	    });
	    jQuery.map($(this).serializeArray(), function(n, i){
	    	
	    	var val = n['value'] + "";
	    	
	    	if(numNmMap[n['name']] == "number") val = val.replaceAll("," , "");
	    	
	    	if(json[n['name']] == undefined) {
	    		json[n['name']] = nvl(val, "");
	    	} else {
	    		if(typeof json[n['name']] != "object") {
	    			json[n['name']] = [json[n['name']]];
	    		}
	    		json[n['name']].push(nvl(val, ""));
	    	}
	    });
	    return json;
	};
	
	/**
	 * <form ..></form> 안의 항목의 값을 Setting한다.
	 * 사용 법 : $('#formID').setFormData( { 항목1 : 항목값 , 항목2 : 항목값);
	 * 참조 : 	'checkbox'의 경우 name과 value가 모두 동일해야 check됨.
	 * 			'radio'의 경우 value가 동일한 항목이 선택됨.
	 */
	$.fn.setFormData = function(ol_data) {
		 
		$(this).find("input, select, textarea").each(function() {
			var itemName = $(this).attr("name");
			var setValue = ol_data[itemName];
			if(setValue == undefined) return true;
			var itemType = $(this).attr("type")
			var tagName = $(this).prop("tagName").toLowerCase();
			if(isValid(itemType)) 	itemType 	= itemType.toLowerCase();
			if(isValid(tagName )) 	tagName 	= tagName .toLowerCase();
			if		 (	itemType == "text" 	|| 
						itemType == "hidden" ||
						tagName	 == "textarea" ) {
				
				if(isNumber(setValue) && $(this).attr("number") == "") setValue = addComma(setValue);
				
				$(this).val(setValue);
			}
			else if (	itemType == "radio"	) {
				if	($(this).val() == setValue) $(this).attr("checked", true);
				else							 $(this).attr("checked", false);
			}
			else if (	tagName  == "select"	) {
				$(this).find("option").each(function() {
					if($(this).val() == setValue) $(this).attr("selected", true);
				});
			}
			else if (	itemType == "checkbox") {
				if($(this).val() == setValue) $(this).attr("checked", true);
			}
			if(itemType == "text") {
				var keyupMethod = $(this).attr("onKeyUp");
				if(isValid(keyupMethod)) eval(keyupMethod);
			}
		});
	};
	/**
	 * 화면의 Input Box를 모두 Text로 변환한다.
	 * targetDom은 가상의 Document을 대상으로 할 경우 지정해주며
	 * 생략할 경우 현재 Document를 대상으로 실행한다.
	 * 참고 : targetDom을 지정하는경우는 특수한 경우로 일반적으로 생략한다.
	 */
	$.fn.changeFormToView = function(targetDom) {
		$(this, targetDom).find("input, select, textarea").each(function() {
			var itemId 		= $(this).attr("id"		);
			var itemName 	= $(this).attr("name"	);
			var itemType 	= $(this).attr("type"	);
			var tagName 	= $(this).prop("tagName").toLowerCase();
			if(isValid(itemType)) 	itemType 	= itemType.toLowerCase();
			if(isValid(tagName )) 	tagName 	= tagName .toLowerCase();
			if		 (	itemType == "text" 	|| 
						tagName	 == "textarea" ) {
				var val = $(this).val();
				$(this).wrap("<span id='"+itemId+"' name='"+itemName+"'></span>");
				$(this).parent().html(val);
			}
			else if (	itemType == "radio" || itemType == "checkbox"	) {
				$(this).prop("disabled", true);
			}
			else if (	tagName  == "select"	) {
				var val = $(this).find("option:selected").text();
				$(this).wrap("<span id='"+itemId+"' name='"+itemName+"'></span>");
				$(this).parent().html(val);
			}
		});
	};
	
	// Object의 Member key를 소문자로 변경한다.
	function keyToLowerCase(obj) {
		if(Object.prototype.toString.call(obj)  == '[object Array]') {
			var rlist = [];
			$.each(obj, function() {
				rlist.push(__keyToLowerCase(this));
			});
			return rlist;
		} else {
			return __keyToLowerCase(obj);
		}
	}
	function __keyToLowerCase(obj) {
		var result = {}
		$.each(obj, function(key, value) {
			result[key.toLowerCase()] = value;
		});
		return result;
	}
	function keyToUpperCase(obj) {
		var result = {}
		$.each(obj, function(key, value) {
			result[key.toUpperCase()] = value;
		});
		return result;
	}
	// 레디오 버튼 선택된 값구하기.
	function fn_getRadio(rName)
	{
		return $("input[name=" + rName + "]:checked").val();
	}
	// 레디오 버튼 해당 되는값 찾아 선택하기
	// 레디오 버튼 해당 되는값 찾아 선택하기
	function fn_setRadio(rName, val)
	{
		$("input[name='" + rName + "']").each( function () {
			if	($(this).val() == val) $(this).attr("checked", true);
			else						$(this).attr("checked", false);
		});
	}
	// select box의 선택된 값을 읽어온다.
	function fn_getSelectBox(sName)
	{
		return $("select[name='" + sName + "'] option:selected").val();
	}
	// select box의 선택된 값의 Text를 읽어온다.
	function fn_getTextSelectBox(sName)
	{
		return $("select[name='" + sName + "'] option:selected").text();
	}
	// select box에 원하는 값으로 Setting한다.(name을 우선으로 찾고, 없으면 id로 찾는다.
	function fn_setSelectBox(domObj, sName, val)
	{
		if(typeof domObj == "string") domObj = $("#" + domObj);
		
		var executeCheck = false;
		$(domObj).find(" select[name='" + sName + "'] option").each(function() {
			if($(this).val() == val) $(this).attr("selected", true);
			executeCheck = true;
		});
		if(executeCheck) return;
		$(domObj).find("#" + sName + " option").each(function() {
			if($(this).val() == val) $(this).attr("selected", true);
		});
	}
	
	// 문자 유효성 체크
	function isValid(str)
	{
		if(Object.prototype.toString.call(str) 	== '[object Date]')	return true;
		
		if(str == null || str == undefined || (typeof str == "string" && (str + "").trim().length == 0 )) return false;
		
		if(Object.prototype.toString.call(str) 	== '[object Object]' && $.isEmptyObject(str)) return false;
		
		if(Object.prototype.toString.call(str) 	== '[object Array]'	 && str.length == 0) return false;
		
		return true;
	}

	function isEmpty(str)
	{
		return !isValid(str);
	}

	/**
	 * Array To json map
	 * arrayList 가 Object array이어야함.
	 */
	function arrayToMap(arrayList, key, valueColumn, defaultMap) {
		if(!isValid(arrayList)) return {};
		var returnMap = {};
		if(defaultMap != undefined) {
			returnMap = fn_copyObject(defaultMap);
		}
		$.each(arrayList, function() {
			if(!isValid(this[key])) return true;
			if(valueColumn == undefined) 	returnMap[this[key]] = this;
			else 							returnMap[this[key]] = this[valueColumn];
		});
		return returnMap;
	}
	
	

	// 스트링 Array 에 특정 스트링이 있는지 검사
	function in_array(str, arry)
	{
		if(Object.prototype.toString.call(str)  == '[object Number]') str = str + "";
		if(Object.prototype.toString.call(str)  != '[object String]') return false;
		if(Object.prototype.toString.call(arry) != '[object Array]') return false;
		
		for(var ii = 0; ii < arry.length ; ii++) if(arry[ii] == str) return true;
		
		return false;
	}
	
	//숫자 유효성 검사
	//받은 변수에 숫자외 다른 문자가 있는지 판별
	function isNumber(input) {
		if(isEmpty(input)) return false;
		input = (input + "").replaceAll(",", "");
		return $.isNumeric(input);
	}
	function hasCharsOnly(input,chars) {
		if(!isValid(input)) return false;
	    for (var inx = 0; inx < input.length; inx++) {
	       if (chars.indexOf(input.charAt(inx)) == -1){
	
	           return false;
	       }
	    }
	    return true;
	}
	
	function nvl(data, defaultStr) {
		if(isValid(data)) 	return data;
		else				return defaultStr;
	}
	
	// 숫자 컴마 찍기
	// 숫자 컴마 찍기
	function addComma(src)
	{

		if(!isNumber(src)) return src;
		
		src = "" + src;
		
		src = src.replaceAll(",", "");
		
		var mns = src.split("-");
		var mnsStr = "";
		if(mns.length == 2) {
			src 	= mns[1];
			mnsStr 	= "-";
		}
			
		var srcArr = src.split(".");
		
		src = Number(srcArr[0]);
		
		var fl = srcArr[1];
		
		if(fl == undefined) 	fl = "";
		else					fl = "." + fl;
		
		src = src + "";
	    var temp_str = src.replace(/,/g, ""); 

		for(var i = 0 , retValue = String() , stop = temp_str.length; i < stop ; i++)
		{
			retValue = ((i%3) == 0) && i != 0 ? temp_str.charAt((stop - i) -1) + "," + retValue : temp_str.charAt((stop - i) -1) + retValue; 
		}

		return mnsStr + retValue + fl;
	} 
	

	// OBJECT 배열에서 특정 ITEM(Key)의 값을 검색해서 일치하는 OBJECT를 모두 반환한다.
	// searchType : "E" => Equal, "L" => "Like"
	function fn_searchJsonObjectArray(objArray, searchKey, searchData, searchType)
	{
		if		(Object.prototype.toString.call(objArray) 	!= '[object Array]')	return null;
		if		(objArray.length == 0) 											return null;
		if		(objArray[0][searchKey] == undefined) 							return null;
		if		(Object.prototype.toString.call(searchData) == '[object String]'){
			var t = searchData;
			searchData = Array();
			searchData[0] = t;
		}
		if(searchType == undefined) searchType = "E";
		var result = Array();
		var idx = 0;
		for(var ii=0; ii < objArray.length; ii++)
		{
			if			(searchType == "E") {
				if( in_array( objArray[ii][searchKey], searchData)) result[idx++] = objArray[ii];
			} else if	(searchType == "L"){
				if(objArray[ii][searchKey].indexOf(searchData) > -1) result[idx++] = objArray[ii];
			}
		}
		return result;
	}
	
	function fn_getObjectFromString(valStr) {
		eval("var result = " + valStr);
		return result;
	}
	
	/**
	 * Object Copy
	 * ex) var target = Object.create(source);
	 */
	if (typeof Object.create !== 'function') {
		Object.create = function (o) {
			function F() { }
			F.prototype = o;
			return new F();
		};
	};
	/**
	 * Object Copy
	 * ex) var target = Object.create(source);
	 */
	function fn_copyObject(o) {
		var robj = {}
		robj = $.extend(robj,o);
		return robj;
	}
	function fn_copyFullObject(o) {
	    var copy = o,k;
	    if (o && typeof o === 'object') {
	        copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
	        for (k in o) {
	            copy[k] = fn_copyFullObject(o[k]);
	        }
	    }
	    return copy;
	}
	
	/**
	 * Array Copy
	 */
	function fn_copyArray(array) {
		if(Object.prototype.toString.call(array) != '[object Array]') return array;
		var robj = [];
		$.each(array, function() {
			robj.push(this);
		});
		return robj;
	}
	
	
	// Map To List
	function mapToList(map, itemNameList) {
		var listArray = [];
		$.each(map, function(key, value) {
			var idx = listArray.length;
			listArray[idx] = {};
			listArray[idx][itemNameList[0]] = key;
			if(typeof value == "object") {
				listArray[idx] = $.extend(listArray[idx], value);
			} else {
				listArray[idx][itemNameList[1]] = value;
			}
		});
		return listArray;
	}

	// OBJECT 배열에서 특정 ITEM(Key)의 값을 검색해서 일치하는 OBJECT를 제거한다.
	function fn_removeJsonObjectArray(objArray, searchKey, searchData)
	{
		if		(Object.prototype.toString.call(objArray) 	!= '[object Array]')	return null;
		if		(objArray.length == 0) 												return null;
		if		(objArray[0][searchKey] == undefined) 								return null;
		if		(Object.prototype.toString.call(searchData) == '[object String]'){
			var t = searchData;
			searchData = Array();
			searchData[0] = t;
		}
		var result = Array();
		var idx = 0;
		for(var ii=0; ii < objArray.length; ii++)
		{
			if( !in_array( objArray[ii][searchKey], searchData)) result[idx++] = objArray[ii];
		}
		return result;
	}
	function toArray(str) {
		if		(typeof str == "string")	return [str];
		else if	(isEmpty(str))				return [];
		return str;
	}
	
	// Object 배열을 특정 순서로 정렬한다.
	// ex
	//	var ids = "AA,BB,CC,DD";
	//	var list = [
	//		 {"ITEM1" : "BB", "ITEM2" : "xxxx1"}
	//		,{"ITEM1" : "DD", "ITEM2" : "xxxx2"}
	//		,{"ITEM1" : "CC", "ITEM2" : "xxxx3"}
	//		,{"ITEM1" : "AA", "ITEM2" : "xxxx4"}
	//	]
	//	sortObject(list, ids, "ITEM1")
	//	
	//	-- 결과 --
	//	[
	//		,{"ITEM1" : "AA", "ITEM2" : "xxxx4"}
	//		 {"ITEM1" : "BB", "ITEM2" : "xxxx1"}
	//		,{"ITEM1" : "CC", "ITEM2" : "xxxx3"}
	//		,{"ITEM1" : "DD", "ITEM2" : "xxxx2"}
	//	]
	function sortObject(list, ids, column) {
		var idArr 		= ids.split(",");
		var idMap 		= {}
		$.each(idArr, function(idx){
			idMap[this] = idx;
		});
		$.each(list, function()	{
			var order = idMap[this[column]];
			if(isEmpty(order)) order = 9999;
			this._order = order;
		});
		list.orderBy("_order", "asc");
		return list
	}
	
	function copyToClipboard(domId) {
		if(document.body.createTextRange) {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(document.getElementById(domId));
			textRange.execCommand("Copy");
		} else {
			window.getSelection().selectAllChildren(document.getElementById(domId));
			document.execCommand("Copy");
		}
	}

	function domCopy(domObj) {
		var cl = $(domObj).clone();
		$(domObj).find("select").each(function() {
			var sid = $(this).attr("id");
			var val = $(this).find("option:selected").val();
			fn_setSelectBox(cl, sid, val);
		});
		return cl;
	}
	
	// px 더하기
	function addPx(a, b) {
		a = (a + "").replace("px", "");
		b = (b + "").replace("px", "");
		sum = Number(a) + Number(b);
		if(isValid(sum)) 	return sum + "px";
		else 				return null;
	}
	// px를 Int로 변환
	function pxToInt(x) {
		if(isEmpty(x)) return x;
		try {
			return Number((x+"").replace("px", ""));
		}catch(e){
			return x;
		}
	}
	
	// Map Object에서 특정Member를 제거한다.
	function removeMember(obj, key) {
		let newObj = {};
		$.each(obj, function(orgKey, val) {
			if(key == orgKey) return true;
			newObj[orgKey] = val;
		});
		return newObj;
	}
	
	// 파일 확장자 가져오기
	function getExtension(filename) {
	  const parts = filename.split('.');
	  return parts.pop();
	}
	
	// 한글 단어의 마지막 글자에 받침이 있는지 확인하는 함수
	function hasConsonant(word) {
		let checkNum = /[0-9]/;
		let checkEng = /[a-zA-Z]/;
		let checkSpc = /[~!@#$%^&*()_+|<>?:{}]/;
		let checkKor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

	    // 마지막 글자의 유니코드 값
	    const charCode = word.charCodeAt(word.length - 1);
	    // 유니코드의 한글 범위 내에서 해당 코드의 받침 확인
	    const consonantCode = (charCode - 44032) % 28;
	    return consonantCode !== 0; // 0이면 받침 없음, 1 이상이면 받침 있음
	}
	function sleep(ms) {
		const wakeUpTime = Date.now() + ms;
		while (Date.now() < wakeUpTime) {}
	}	
	
	
	//Json Debugging
	//Json Debugging
	//Json Debugging
	//Json Debugging
	function dalert(obj, type) {
		var str = JSON.stringify(obj);
		if(type == 1) 	alert(obj);
		else			alert(str);
	}
	function dwrite(obj) {
		var str = obj;
		if(typeof obj == "object") str = JSON.stringify(obj);
		var org = $("#debugTextarea").val();
		if(!isValid(org)) org = ""; 
		$("#debugDiv").remove();
		$("body").append("<div class=list_wrap id=debugDiv style=margin-left:300px;margin-bottom:50px;z-index:99999;>");
		for(var i=1;i<50;i++)$("body").append("<br/>");
		$("body").append("<textarea id=debugTextarea cols=100 rows=20></textarea></div>");
		$("#debugTextarea").val(str + "\n\n" + org);
	}
	function dlog(obj, type) {
		var str = JSON.stringify(obj);
		if(type == 1) 	console.log(obj);
		else			console.log(str);
	}
	/**
	 * 문자 Null 체크 
	 * @param str
	 * @returns
	 */
	function gfn_isNull(str) {
		if (str == null) return true;
		if (str == "NaN") return true;
		if (str == "") return true;
		if (new String(str).valueOf() == "undefined") return true;    
		var chkStr = new String(str);
		if( chkStr.valueOf() == "undefined" ) return true;
		if (chkStr == null) return true;    
		if (chkStr == '') return true;    
		if (chkStr.toString().length == 0 ) return true;   
		return false; 
	}

	