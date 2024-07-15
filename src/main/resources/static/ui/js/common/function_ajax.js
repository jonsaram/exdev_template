	// Ajax URL Request (GET)
	// 'callback' 파라메터가 있는경우는 서버가 비동기 호출되며, callback함수로 결과 값을 리턴한다.
	// 'callback' 파라메터가 없는경우는 서버가 동기 호출 되며, 함수 수행이 끝나고 호출한곳으로 결과값을 리턴한다.
	function ajaxRequest(parm, callback)
	{
		// url만 넘어오는경우 url만 Setting한다.
		// 상세 설정이 필요한경우 parm에 담아서 보내야 한다.
		if(typeof parm == "string") parm = {targetUrl : parm};
		if(callback != undefined) parm.callback = callback;
		
		var targetUrl 	= parm.targetUrl;
		var jsonData 	= parm.jsonData;
		var callback 	= parm.callback;
		var method 		= parm.method;
		var p_async 	= parm.p_async;
		var dataType	= parm.dataType;
		var data 		= parm.data;
		
		if(callback == undefined) 	async = false;
		else						async = true;
		
		if(method 		== undefined) method 		= "post";
		if(p_async 		!= undefined) async 		= p_async;
		if(dataType		== undefined) dataType 		= "json";
		if(isEmpty(data) && method == "post") data 		= {};

		var result = null;
		
		var jsonStr = "{}"; 
		
		try {
			jsonStr = JSON.stringify(data);
		} catch(e) {
			alert('parameter가 json object가 아닙니다.');
			return;
		}

		$.ajax({
			type		: method,
			async		: async,
			url			: targetUrl,
			contentType	: "application/json; charset=UTF-8",
			dataType	: dataType,
			data		: jsonStr,
			success		: function(data){
				result = data;
				if(callback != undefined) callback(data);
			},
			error		: function(e, state){
				var result = { msg : e.status };
				if(callback != undefined) callback(result);
			}
		});
		return result;
	}
