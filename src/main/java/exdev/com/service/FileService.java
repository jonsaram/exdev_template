package exdev.com.service;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import exdev.com.common.ExdevConstants;
import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.common.service.ExdevBaseService;
import exdev.com.common.vo.SessionVO;


/** 
 * 파일저장 서비스
 * @생 성 자   : 이응규
 * @생 성 일자 : 2024. 01. 17
 * @수 정 자   : 
 * @수 정 일자 :
 * @수 정 자
 */
@Service("FileService")
public class FileService extends ExdevBaseService{
	
	@Autowired
	private ExdevCommonDao commonDao;

    @Autowired
    private Environment env;

    /** 
     * 멀티 파일삭제 서비스
     * @생 성 자   : 이응규
     * @생 성 일자 : 2024. 01. 18 : 최초 생성
     * @수 정 자   : 
     * @수 정 일자 :
     * @수 정 자   :
     */
	@SuppressWarnings({ "rawtypes", "unchecked" })
    public Map fileDeleteMulti(HttpServletRequest request, String[] uuidArry) throws Exception {
	    
	    Map<String, String> returnMap 	= new HashMap<String, String>();
		String fileDirectoryPath 		= ExdevConstants.FILE_DIRECTORY_PATH;
	    
	    try {
            for(  String uuid:uuidArry ) {
                Map uuidMap = new HashMap();
                uuidMap.put("uuid" , uuid  );
                List<Map> list = commonDao.getList("Sample.getFile", uuidMap);
                int result = 0;
                
                for(Map fileMap : list) {
                    new File(fileDirectoryPath +File.separator+  fileMap.get("FILE_PATH") +File.separator+ fileMap.get("STORED_FILE_NAME")).delete();
                    result += commonDao.delete("Sample.deleteFile", uuidMap);
                }
            }
        
            returnMap.put("msg",ExdevConstants.REQUEST_SUCCESS);
	    } catch (Exception e) {
            e.printStackTrace();
            returnMap.put("msg",ExdevConstants.REQUEST_FAIL);
        }
        return returnMap;
    }

    /** 
     * 파일조회 서비스
     * @생 성 자   : 이응규
     * @생 성 일자 : 2024. 02. 02 : 최초 생성
     * @수 정 자   : 
     * @수 정 일자 :
     * @수 정 자   :
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public List<Map> getfile(Map map) throws Exception {
        
        List<Map> list = commonDao.getList("Sample.getFile", map);
        return list;
    }
    
	/** 
	 * 멀티 파일저장 서비스
	 * @생 성 자   : 이응규
	 * @생 성 일자 : 2024. 01. 17 : 최초 생성
	 * @수 정 자   : 
	 * @수 정 일자 :
	 * @수 정 자
	 */
/*    
	public Map fileUploadMulti( HttpServletRequest request, List<MultipartFile> multiFileList, String  groupUuId, String[] uuids, String  uploadPath) throws Exception {
		
		Map<String, String> returnMap = new HashMap<String, String>();
		
		String root = request.getSession().getServletContext().getRealPath("resources");
        String path = root +File.separator+ uploadPath;
        
        
		File fileCheck = new File(path);
		if(!fileCheck.exists()) fileCheck.mkdirs();
		
        List<Map<String, String>> fileList = new ArrayList<>();
		
		for(int i = 0; i < multiFileList.size(); i++) {
			String originFile = multiFileList.get(i).getOriginalFilename();
			long fileSize = multiFileList.get(i).getSize();
			String ext = originFile.substring(originFile.lastIndexOf("."));
			String uuid = uuids[i];
			
			String changeFile = uuid + ext;
			
			Map<String, String> map = new HashMap<>();
			map.put("uuid", uuid);
			map.put("originFile", originFile);
			map.put("changeFile", changeFile);
			map.put("filePath", uploadPath);
			map.put("fileType", ext);
			map.put("fileSize", Long.toString(fileSize));
			fileList.add(map);
		}
		int result = 0;
		// 파일업로드
		try {
			for(int i = 0; i < multiFileList.size(); i++) {
				File uploadFile = new File(path +File.separator+  fileList.get(i).get("changeFile"));
				multiFileList.get(i).transferTo(uploadFile);
				
				/***************************************************************************/
				/* 테이블 입력    테이블 입력    테이블 입력    테이블 입력    테이블 입력    * /
				SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd kk:mm:ss");
				String strDate = dateFormat.format(Calendar.getInstance().getTime());
	            
				HashMap<String,String> insertMap = new HashMap<String,String>();
				insertMap.put("uuid", fileList.get(i).get("uuid"));
				insertMap.put("grpUuid", groupUuId);
				insertMap.put("orgFileName", fileList.get(i).get("originFile"));
				insertMap.put("storedFileName", fileList.get(i).get("changeFile"));
				insertMap.put("filePath", fileList.get(i).get("filePath"));
				insertMap.put("fileSize", fileList.get(i).get("fileSize"));
				insertMap.put("fileType", fileList.get(i).get("fileType"));
				insertMap.put("createUser", "createUser");
				insertMap.put("createDate", strDate);
				
				result += commonDao.insert("Sample.setFile", insertMap);
				
				/* 테이블 입력    테이블 입력    테이블 입력    테이블 입력    테이블 입력    * /
				/*************************************************************************** /
			}
			if( result == multiFileList.size()) {
				returnMap.put("msg", ExdevConstants.REQUEST_SUCCESS);	
			}else {
				for(int i = 0; i < multiFileList.size(); i++) {
					new File(path +File.separator+ fileList.get(i).get("changeFile")).delete();
				}
				returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
			}	
			
		} catch (Exception e) {
		    // 만약 업로드 실패하면 파일 삭제
			for(int i = 0; i < multiFileList.size(); i++) {
				new File(path +File.separator+ fileList.get(i).get("changeFile")).delete();
			}
			e.printStackTrace();
			returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
		}
		return returnMap;
	}
*/

	@SuppressWarnings("unchecked")
	public Map fileUploadMulti( HttpServletRequest request, List<MultipartFile> multiFileList, String  GRP_FILE_ID, String[] FILE_IDS, String  uploadPath, SessionVO sessionVo) throws Exception {
		
        Map returnMap = new HashMap();
		
//		String fileDirectoryPath 		= request.getSession().getServletContext().getRealPath("resources");
		String fileDirectoryPath 		= ExdevConstants.FILE_DIRECTORY_PATH;
		
        String path 		= fileDirectoryPath + File.separator + uploadPath;
        
		File fileCheck = new File(path);
		if(!fileCheck.exists()) fileCheck.mkdirs();
		
        List<Map> fileList = new ArrayList<>();
		
        String OWNER_CD 	= request.getParameter("OWNER_CD"	);
		for(int i = 0; i < multiFileList.size(); i++) {
			String ORG_FILE_NM 	= multiFileList.get(i).getOriginalFilename();
			long FILE_SIZE 		= multiFileList.get(i).getSize();
			String ext 			= ORG_FILE_NM.substring(ORG_FILE_NM.lastIndexOf("."));
			String FILE_ID 		= FILE_IDS[i];
			String STORED_FILE_NM = FILE_ID + ext;
	        String fullPath = path + File.separator + STORED_FILE_NM;
	        
			Map map = new HashMap<>();
			map.put("sessionVo"			, sessionVo		);
			map.put("GRP_FILE_ID"		, GRP_FILE_ID	);
			map.put("FILE_ID"			, FILE_ID		);
			map.put("ORG_FILE_NM"		, ORG_FILE_NM	);
			map.put("OWNER_CD"			, OWNER_CD		);
			map.put("STORED_FILE_NM"	, STORED_FILE_NM);
			map.put("FILE_PATH"			, fullPath		);
			map.put("FILE_TYPE"			, ext			);
			map.put("FILE_SIZE"			, Long.toString(FILE_SIZE));
			fileList.add(map);
		}
		int result = 0;
		// 파일업로드
		try {
			for(int i = 0; i < multiFileList.size(); i++) {
				
				Map insertMap = (Map)fileList.get(i);
				
				File uploadFile = new File((String)insertMap.get("FILE_PATH"));
				
				multiFileList.get(i).transferTo(uploadFile);
				
				/***************************************************************************/
				/* 테이블 입력    테이블 입력    테이블 입력    테이블 입력    테이블 입력    */
				result += commonDao.insert("Filemng.saveFileInfo", insertMap);
				/* 테이블 입력    테이블 입력    테이블 입력    테이블 입력    테이블 입력    */
				/***************************************************************************/
			}
			if( result == multiFileList.size()) {
				returnMap.put("msg", ExdevConstants.REQUEST_SUCCESS);	
			}else {
				for(int i = 0; i < multiFileList.size(); i++) {
					new File((String)fileList.get(i).get("FILE_PATH")).delete();
				}
				returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
			}	
			
		} catch (Exception e) {
		    // 만약 업로드 실패하면 파일 삭제
			for(int i = 0; i < multiFileList.size(); i++) {
				new File((String)fileList.get(i).get("FILE_PATH")).delete();
			}
			e.printStackTrace();
			returnMap.put("msg", ExdevConstants.REQUEST_FAIL);
		}
		return returnMap;
	}
}