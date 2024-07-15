package exdev.com.common.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExdevBaseService
{
	public static final String REQUEST_SUCCESS 	= "S";
	public static final String REQUEST_FAIL 		= "F";
	public static final String REQUEST_NO_SESSION	= "NO_SESSION";

	protected Map 		resultInfo = null;
	protected List<Map>	resultList = null;
	
	//공통코드 : 일정관리 반복주기 
	public static enum SCHEDULE_LOOP_TYPE {	NOT_REPEAT, DAY, WEEK, MONTH, QUARTER, YEAR	}
	/**
	 * 서비스 결과 리턴
	 * @param state
	 * @param retMsg
	 * @param returnData
	 * @return
	 */
	public static Map makeResult(String state, String retMsg, Object returnData) {
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("state"	, state);
		map.put("msg"	, retMsg);
		map.put("data"	, returnData);
		return map;
	}

}
