package exdev.com;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

public class ExdevCommonAPI {

	/**
	 * 고유 아이디 생성
	 * @return
	 */
	public static String makeUniqueID() {
		return makeUniqueID(20);
	}
	public static String makeUniqueID(int feat) {
		Calendar c = Calendar.getInstance();
		long t = c.getTimeInMillis();
		long addt = Long.parseLong((Math.round(Math.random() * 1000000000)) + "");
		String result = Long.toHexString(t) + Long.toHexString(addt);
		if(result.length() > feat) result = result.substring(0,feat);
		if(result.length() < feat) result = fillZero2(result, feat);
		return result;
	}

	public static String fillZero(String s, int cnt) {
		int c = s.length();
		for (int i = 0; i < cnt - c; i++) {
			s = "0" + s;
		}
		return s;
	}

	public static String fillZero2(String s, int cnt) {
		int c = s.length();
		for (int i = 0; i < cnt - c; i++) {
			s = s + "0";
		}
		return s;
	}

	/**
	 * 오늘날짜 구하기
	 * @return
	 */
	public static String getToday(String format) {
		if(!ExdevCommonAPI.isValid(format)) format = "yyyy-MM-dd HH:mm";
		Date date = new Date();
        SimpleDateFormat sdformat = new SimpleDateFormat(format);
        return sdformat.format(date);
	}

	/**
	 * 문자열 유효성 검증
	 * 위성열 20140425
	 * @param data
	 * @return
	 */
	public static boolean isValid(Object data) {
		if(data == null) return false;
		if(data.toString().length() == 0) return false;
		return true;
	}
	
	/*
	 *  dataList -> Grid Data로 변환 해줌
	 */
	// dataList 	=> [
	//			{ "ITEM1" : "v10" , "ITEM2" : "v20" },
	//			{ "ITEM1" : "v11" , "ITEM2" : "v21" },
	//		 ]
	//
	// 반환되는 값 :
	// returnJson => Map Type
	//			{
	//			  "rows": [
	//			    {
	//			      "id": "S1",
	//			      "data": [
	//			        "v10",
	//			        "v20",
	//			      ]
	//			    },
	//			    {
	//			      "id": "S2",
	//			      "data": [
	//			        "v11",
	//			        "v21",
	//			      ]
	//			    }
	//			  ]
	//			}
	/*
	 예제
	 
	resultList = (List<Map>)commonDao.getList("xxx", obj);
	
	Map gridMap = CommonAPI.mergeDataForList(resultList);
	 
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static final Map mergeDataForList( List<Map> dataList) throws Exception
	{
		List<Map<String,Object>> resultList = null;
		
		Map resultMap = null;

		try
		{
			resultList = new ArrayList<Map<String,Object>>();
			if(dataList.size() <= 0) return new HashMap();
			
			Map<String,Object> mapGridData = null;

			String gridId = "";
			for(int i = 0; i < dataList.size(); i++){
				Map<String,Object> rowData = (Map<String, Object>)dataList.get(i);

				gridId = "S"+i;

				Object[] gridData = rowData.values().toArray();

				mapGridData = new HashMap<String,Object>();
				mapGridData.put("id", gridId );
				mapGridData.put("data", gridData );

				resultList.add(mapGridData);
			}
			
			resultMap = new HashMap<String, Object>();
			
			resultMap.put("rows", resultList);

		}
		catch( Exception e )
		{
			e.printStackTrace();
			throw e;
		}

		return resultMap;
	}

	public static ArrayList<String> getArrayLIstFromSplit(String strValue, String splitter)
	{
		ArrayList<String> list = new ArrayList<String>();

		if ("null".equals(strValue) || strValue == null ||	strValue.length() == 0 || splitter == null)
			return list;

		int nOrd = strValue.indexOf(splitter);
		while (nOrd != -1)
		{	String splitWord = strValue.substring(0, nOrd);
			splitWord = splitWord.trim();
			list.add(new String(splitWord));
			int lastOrd = nOrd + splitter.length();
			strValue = strValue.substring(lastOrd);
			nOrd = strValue.indexOf(splitter);
		}
		strValue = strValue.trim();
		if(strValue!=null && !strValue.equals(""))
			list.add(new String(strValue));

		return list;
	}
	public static String checkNull(Object str, String converted) throws Exception{
		if (str == null || "".equals(str) || str.equals("null") || str.toString().length() == 0){
			return converted;
		}
		else{
			return str.toString();
		}
	}
	/**
	 * 스트링이 null일경우 공백으로 리턴해준다.
	 * @param str
	 * @return
	 * @throws Exception
	 */
	public static String checkNull(String str) throws Exception{
		return checkNull(str, "");
	}
	/**
	 * 문자열들을 '' 으로 감싼다.
	 * ex) 1,2,3,4 => '1','2','3','4'
	 * @param source
	 * @return
	 */
	public static String wrapToQuotes(String source) {
		if(source == null) return null;
		return "'" + source.replaceAll(",", "','") + "'";
	}
	
	/* List Map을 JsonString 으로 변경 */
	@SuppressWarnings({ "rawtypes" })
	public static String mapToJsonString (List<Map> resultList , String TotalCount , String Pos ) throws Exception{
		
		String StrJson = "";
		
		StrJson = StrJson +  "{";
		StrJson = StrJson +  " total_count:'" + TotalCount + "',pos:'" + Pos + "' ,";
		StrJson = StrJson +  " rows:[";
		
		for(int i=0; i< resultList.size(); i++){
			
			Map map = (Map)resultList.get(i);
			
			StrJson = StrJson + "{id:" + Integer.toString((i+1)) + ",";
			//String itemCode  = 	(String)map.get("ITEM_CODE");
			
			StrJson = StrJson + "data:[";
			
			int j = 0;
			
			for ( Object Value : map.values()){
				
				j = j + 1;
				
				if(Value == null){
					StrJson = StrJson + "\"\"";
				}else{
					StrJson = StrJson + "\"" + Value.toString() + "\"";
				}
			
				if ( j != map.size()){
					StrJson = StrJson + ",";
				}
					
			}
			
			StrJson = StrJson + "]";
			
			if ( (i + 1) == resultList.size() ){
				StrJson = StrJson + "}";
			}
			else {
				StrJson = StrJson + "},";
			}
				
		}

		StrJson = StrJson + "]}";
		
		return StrJson;
	}

	public static String render(String sd, String ed, Map dataMap, String src) {
		Integer cursorPos = 0;
		
		int exitLoopCheck = 0;
		
		String result = src;
		
		
		while(true) {
			Integer startIdx 	= result.indexOf(sd, cursorPos);
			Integer endIdx 		= result.indexOf(ed, startIdx);
			
			if(startIdx < 0 || endIdx < 0) break;
			
			String target 	= result.substring(startIdx, endIdx + ed.length());
			String fkey		= result.substring(startIdx + sd.length(), endIdx);
			
			String [] opt		= fkey.split(":");
			String fnKey		= opt[0];
			String key 			= opt[1]; 
			
			String cdata	= String.valueOf(dataMap.get(key.trim()));
			
			if("numb".equals(fnKey)) {
				DecimalFormat df = new DecimalFormat("###,###,###.##"); 
				cdata = df.format(Double.parseDouble(cdata));
			}
			
			if(cdata == null || cdata == "null") cdata = "";
			
			result = result.replace(target,  cdata);
			
			cursorPos = endIdx - target.length();

			if(exitLoopCheck++ > 10000) break;
		}
		
		return result;
	}
	/**
	 * 오늘 날짜의 주차를 가져온다.
	 * @param dateStr
	 * @return
	 */
	public static String getDateWeek() {
		
		String today = ExdevCommonAPI.getToday("yyyyMMdd");
		
		return ExdevCommonAPI.getDateWeek(today);
	}
	/**
	 * 해당 날짜의 주차를 가져온다.
	 * @param dateStr
	 * @return
	 */
	public static String getDateWeek(String dateStr) {
		String yyyyStr 	= dateStr.substring(0, 4);
		String mmStr 	= dateStr.substring(4, 6);
		String ddStr 	= dateStr.substring(6, 8);
		
		Integer yyyy 	= Integer.parseInt(yyyyStr 	);
		Integer mm 		= Integer.parseInt(mmStr 	) - 1;
		Integer dd 		= Integer.parseInt(ddStr 	);
		
		Calendar cal = Calendar.getInstance();
		cal.set(yyyy, mm, dd);
		cal.setFirstDayOfWeek(Calendar.SUNDAY);
		cal.setMinimalDaysInFirstWeek(4);
		cal.get(Calendar.WEEK_OF_YEAR);		
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM");
		String date = formatter.format(cal.getTime());

		Integer week = cal.get(Calendar.WEEK_OF_YEAR);
		// TODO : 년도가 걸쳐있을때 년월 처리
		if		(mm == 11 && week < 25) {yyyy++;mm=0 ;dd=1;}
		else if	(mm == 0  && week > 25) {yyyy--;mm=11;dd=1;}
		
		cal.set(yyyy, mm, dd);
		date = formatter.format(cal.getTime());

		return date + " W" + ExdevCommonAPI.fillZero(week + "", 2);
	}

	public static String getLoginId (HttpServletRequest request ) throws Exception{
		HttpSession	session = request.getSession();
		String loginId = (String)session.getAttribute("LOGIN_ID");
		return loginId;
	}
}
