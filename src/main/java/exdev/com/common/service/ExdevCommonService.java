package exdev.com.common.service;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import exdev.com.ExdevCommonAPI;
import exdev.com.common.ExdevConstants;
import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.service.ApprovalService;
import exdev.com.service.EmailService;
import exdev.com.service.ExdevSampleService;

@Service("ExdevCommonService")
@Transactional(rollbackFor = { Exception.class }, propagation = Propagation.REQUIRED)
@SuppressWarnings("rawtypes")
public class ExdevCommonService extends ExdevBaseService
{
	@Autowired
	private ExdevSampleService 	sampleService;
	
	@Autowired
	private EmailService 	emailService;
	
	@Autowired
    private ApprovalService    approvalService;

	@Autowired
	private ExdevCommonDao commonDao;
	
	public Map requestService(Map map, HttpSession session) throws Exception {
		
		String 	serviceId 	= (String)map.get("serviceId");
		
		Map 	requestParm = (Map)map.get("requestParm");
		
		// Session이 필요하다면 여기서 넣어준다.
		requestParm.put("sessionVo", session.getAttribute(ExdevConstants.SESSION_ID));
		
		String [] token = serviceId.split("\\.");
		
		String classId 		= token[0];
		String methodId 	= token[1];
		
		Method targetMethod = null;
		Object targetService = null;
		
		/**
		 * 서비스 파일 추가시 SampleService 복사하여 추가한다.
		 */
		if("ExdevCommonService".equals(classId)) {
			targetService = this;
			targetMethod = ExdevCommonService.class.getMethod(methodId, Map.class);
		} else if("ExdevSampleService".equals(classId)) {
			targetService = sampleService;
			targetMethod = ExdevSampleService.class.getMethod(methodId, Map.class);
		} else if("EmailService".equals(classId)) {
			targetService = emailService;
			targetMethod = EmailService.class.getMethod(methodId, Map.class);
		} else if("ApprovalService".equals(classId)) {
            targetService = approvalService;
            targetMethod = ApprovalService.class.getMethod(methodId, Map.class);
        }
			
		
		Object resultObject = (Object)targetMethod.invoke(targetService, requestParm);
		
		resultInfo = makeResult(ExdevBaseService.REQUEST_SUCCESS, "", resultObject);
		
		return resultInfo;
	}
	@SuppressWarnings("unchecked")
	public Map requestQuery(Map map, HttpSession session) throws Exception {
		
		List<Map> resultList = new ArrayList<Map>();
		
		String 		queryId 		= (String)map.get("queryId");
		
		List<Map>	requestParmList = (List<Map>)map.get("requestParmList");

		
		// Data Update에만 사용한다.
		if(requestParmList != null) {
			for (Map requestParm : requestParmList) {
				
				Map	requestCommonParm = (Map)map.get("requestParm"); 
				
				// Session이 필요하다면 여기서 넣어준다.
				requestParm.put("sessionVo", session.getAttribute(ExdevConstants.SESSION_ID));
				
				if(ExdevCommonAPI.isValid(requestCommonParm)) {
					requestCommonParm.putAll(requestParm);
					requestParm = requestCommonParm;
				}
				
				Integer i = commonDao.update(queryId, requestParm);
				
				HashMap<String, Integer> hm = new HashMap<String, Integer>();
				hm.put("cnt", i);
				
				resultList.add(hm);
			}
		} else {
			Map			requestParm 	= (Map)map.get("requestParm");

			// Session이 필요하다면 여기서 넣어준다.
			requestParm.put("sessionVo", session.getAttribute(ExdevConstants.SESSION_ID));
			
			resultList = (List<Map>)commonDao.getList(queryId, requestParm);
		}
		resultInfo = makeResult(ExdevBaseService.REQUEST_SUCCESS, "", resultList);
		
		return resultInfo;
	}
	
	@SuppressWarnings("unchecked")
	public Map requestQueryGroup(Map map, HttpSession session) throws Exception {

		List<Map> resultList = new ArrayList<Map>();
		
		List<Map> 	queryGroup 	= (List<Map>)map.get("queryGroup");
		
		HashMap resultMap = new HashMap();
		int idx = 1;
		for (Map qmap : queryGroup) {
			String 	queryId 			= (String)qmap.get("queryId");
			List<Map>	requestParmList = (List<Map>)qmap.get("requestParmList");
			
			// Data Update에만 사용한다.
			if(requestParmList != null) {

				for (Map requestParm : requestParmList) {
					
					Map	requestCommonParm = (Map)qmap.get("requestParm"); 

					// Session이 필요하다면 여기서 넣어준다.
					requestParm.put("sessionVo", session.getAttribute(ExdevConstants.SESSION_ID));
					
					if(ExdevCommonAPI.isValid(requestCommonParm)) {
						requestCommonParm.putAll(requestParm);
						requestParm = requestCommonParm;
					}
					
					Integer i = commonDao.update(queryId, requestParm);
					
					HashMap<String, Integer> hm = new HashMap<String, Integer>();
					
					hm.put("cnt", i);
					
					resultList.add(hm);
				}
				if(ExdevCommonAPI.isValid(resultMap.get(queryId))) queryId = queryId + "_" + idx++;
				
				resultMap.put(queryId, resultList);
			} else {
				Map		requestParm = (Map)qmap.get("requestParm"); 

				// Session이 필요하다면 여기서 넣어준다.
				requestParm.put("sessionVo", session.getAttribute(ExdevConstants.SESSION_ID));
				
				resultList = (List<Map>)commonDao.getList(queryId, requestParm);
				
				if(ExdevCommonAPI.isValid(resultMap.get(queryId))) queryId = queryId + "_" + idx++;
				
				resultMap.put(queryId, resultList);
			}
		}

		resultInfo = makeResult(ExdevBaseService.REQUEST_SUCCESS, "", resultMap);
		
		return resultInfo;
	}
	
	@SuppressWarnings("unchecked")
	public Object getPagingList(Map map) throws Exception {
		
		String	queryId		= (String	)map .get("queryId"		);
		Map 	option		= (Map		)map .get("option"		);
		option.put("sessionVo", map.get("sessionVo"));
		
		Integer currentPage = (Integer)option.get("currentPage"	);
		Integer listRange 	= (Integer)option.get("listRange"	);
		
		Integer totalCnt 	= (Integer)commonDao.getObject(queryId + "_totalCnt", option);
		
		Integer totalPage	= totalCnt / listRange;
		Integer restCnt		= totalCnt % listRange;
		if(restCnt > 0) totalPage++;
		
		if(currentPage > totalPage) currentPage = totalPage;
		
		Integer startIdx	= (currentPage - 1) * listRange + 1	;
		Integer endIdx		= startIdx 			+ listRange - 1	;
		
		option.put("startIdx"	, startIdx	);
		option.put("endIdx"		, endIdx	);
		
		resultList = (List<Map>)commonDao.getList(queryId + "_paging", option);
		
		Map pageInfo = new HashMap();
		pageInfo.put("totalCnt"	, totalCnt	);
		pageInfo.put("totalPage", totalPage	);
		pageInfo.put("pageList"	, resultList);
		
		return pageInfo;
	}

	public Object makeUniqueId(Map map) throws Exception {
		
		String id = ExdevCommonAPI.makeUniqueID(16);
		
		map.put("id", id);
		
		return map;
	}

	//	@Scheduled(cron = "* * * * * ?") // 매월 15일 오전 10시 15분에 실행
//	public void batchClearRealTimeTable() {
//		System.out.println("aaa");
//	}	
}
