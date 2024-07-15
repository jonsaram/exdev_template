package exdev.com.service;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import exdev.com.common.ExdevConstants;
import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.common.service.ExdevBaseService;

/**
 * This MovieServiceImpl class is an Implementation class to provide movie crud
 * functionality.
 * 
 * @author 이응규
 */
@Service("ApprovalService")
public class ApprovalService extends ExdevBaseService{
	
	@Autowired
	private ExdevCommonDao commonDao;
    
	@Autowired
	private ApprovalAfterService approvalAfterService;
    

    /** 
     * 내용        : 결재상신 입력
     *               결재테이블(TBL_EXP_APPROVAL)
     *               결재자 테이블(TBL_EXP_APPROVAL_USER)
     * @생 성 자   : 이응규
     * @생 성 일자 : 2024. 01. 16 : 최초 생성
     * @수 정 자   : 
     * @수 정 일자 :
     * @수 정 자
     */
    public Map<String, String> approvalComplete(Map map ) throws Exception {
        
        Map<String, String> returnMap = new HashMap<String, String>();
        

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd kk:mm:ss");
        String strDate = dateFormat.format(Calendar.getInstance().getTime());
        
        String approvalId = (String)map.get("approvalId");
        String approvalUserId = (String)map.get("approvalUserId");
        String state = (String)map.get("state");
        
        if( approvalId.length() < 1 || approvalUserId.length() < 1  ) {
            returnMap.put("msg", ExdevConstants.REQUEST_FAIL);      
            return returnMap;
        }
        
        Map<String, String> apprUserMap = new HashMap<String, String>();
        apprUserMap.put("approvalId", approvalId);
        apprUserMap.put("approvalUserId", approvalUserId);
        apprUserMap.put("state", (String)map.get("state"));
        apprUserMap.put("updateUser", approvalUserId);
        apprUserMap.put("updateDate", strDate);
        
        int result = commonDao.update("approval.updateApprovalUser", apprUserMap);
        
        if( result > 0  ) {
            returnMap.put("msg", ExdevConstants.REQUEST_SUCCESS);    
        }else {
            returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
        }
               
        
        
        return returnMap;
    }
    

    /** 
     * 내용        : 결재상태 입력
     *               결재테이블(TBL_EXP_APPROVAL)
     * @생 성 자   : 이응규
     * @생 성 일자 : 2024. 02. 01 : 최초 생성
     * @수 정 자   : 
     * @수 정 일자 :
     * @수 정 자
     */
    public Map<String, String> apprUpdate(Map map ) throws Exception {
        
        Map<String, String> returnMap = new HashMap<String, String>();
        
        int result = 0;
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd kk:mm:ss");
        String strDate = dateFormat.format(Calendar.getInstance().getTime());
        String approvalId = (String)map.get("approvalId");
        
        Map<String, String> apprUserMap = new HashMap<String, String>();
        apprUserMap.put("approvalId", approvalId);
        apprUserMap.put("updateDate", strDate);
        
        List<Map> list = commonDao.getList("approval.getApprovalState", apprUserMap);
        for(Map apprMap : list) {
        
            if( "COMPLETE".equals((String)apprMap.get("APPR_STATE")) ) {
                Map<String, String> apprMap1 = new HashMap<String, String>();
                
                apprMap1.put("uuid", approvalId);
                apprMap1.put("state", (String)map.get("state"));
                apprMap1.put("updateDate", strDate);
                
                result = commonDao.update("approval.updateApproval", apprMap1);
            }
        }
        if( result > 0  ) {
            returnMap.put("msg", ExdevConstants.REQUEST_SUCCESS);    
        }else {
            returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
        }
        
        return returnMap;
    }
    /** 
     * 내용        : 결재결완료
     * @생 성 자   : 이응규
     * @생 성 일자 : 2024. 02. 01 : 최초 생성
     * @수 정 자   : 
     * @수 정 일자 :
     * @수 정 자
     */
    public Map<String, String> insertApproval(Map<String, String> apprMap, List<Map<String, Object>> apprUserList ) throws Exception {
        
        Map<String, String> returnMap = new HashMap<String, String>();
        
        int result1 = 0;
        
        int result = commonDao.insert("approval.insertApproval", apprMap);
        if( result == 1 ) {
          
            
            for(Map<String, Object> apprUserMap : apprUserList){
                
                String userId       = (String)apprUserMap.get("user_id");
                String apprType     = (String)apprUserMap.get("apprType");
                
                Map<String, String> apprUseInsertMap = new HashMap<String, String>();
                
                apprUseInsertMap.put("approvalId", apprMap.get("approvalId"));
                apprUseInsertMap.put("approvalUserId", userId);
                apprUseInsertMap.put("apprType", apprType);
                apprUseInsertMap.put("approvalComment", "");
                apprUseInsertMap.put("createDate", apprMap.get("createDate"));
                result1 += commonDao.insert("approval.insertApprovalUser", apprUseInsertMap);

            }
            
            if( result1 == apprUserList.size() ) {
                returnMap.put("msg", ExdevConstants.REQUEST_SUCCESS);   
            }else {
                returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
            }   
            
            
        }else {
            returnMap.put("msg", ExdevConstants.REQUEST_FAIL);       
        }
        
        return returnMap;
    }
    public Map approvalAfterProcess(Map map ) throws Exception {
    	
    	return approvalAfterService.approvalAfterProcess(map);
    }
	
    
	
}
