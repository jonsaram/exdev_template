package exdev.com.common.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import exdev.com.common.ExdevConstants;
import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.common.vo.SessionVO;
import exdev.com.service.FileService;

/**
 * @author 위성열
 */
@Controller("FilemngController")
public class FilemngController {

	@Autowired
	private FileService fileService;
	
	@Autowired
	private ExdevCommonDao commonDao;

	@SuppressWarnings({ "unused", "rawtypes", "unchecked" })
	@PostMapping("/multiFileUpload.do")
	public @ResponseBody Map<String, Object> multiFileUpload(@RequestParam("attach_file") List<MultipartFile> multiFileList,			
            HttpServletRequest request, HttpSession session)  throws Exception {
		
        SessionVO sessionVo = (SessionVO)session.getAttribute(ExdevConstants.SESSION_ID);
        
        String spCstmId = sessionVo.getSpCstmId();
        
        Map<String, String> returnFileMap 			= new HashMap<String, String>();
        Map<String, Object> returnMap 				= new HashMap<String, Object>();
        
        String GRP_FILE_ID 	= request.getParameter("GRP_FILE_ID");
        String OWNER_CD 	= request.getParameter("OWNER_CD"	);
        String uploadPath	= ExdevConstants.FILE_UPLOAD_PATH + File.separator + spCstmId + File.separator + OWNER_CD;
		String[] FILE_IDS	= request.getParameterValues("FILE_IDS");
		
		returnFileMap = fileService.fileUploadMulti( request, multiFileList, GRP_FILE_ID, FILE_IDS, uploadPath, sessionVo);
		
		if( ExdevConstants.REQUEST_SUCCESS.equals(returnFileMap.get("msg").toString())) {
			
		    returnMap.put("msg", "파일 업로드에 성공하였습니다.");
            
            List<String> list = new ArrayList<String>();
            for(int i =0; i < FILE_IDS.length; i++ ) {
                list.add(FILE_IDS[i]);
            }
            returnMap.put("list", list);
			
		}else{
            returnMap.put("msg", "파일 업로드에 실패하였습니다.");
            
		}
		
		return returnMap;
	}

	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@RequestMapping("filedownload.do")
    public void filedownload(HttpServletRequest request, HttpSession session, HttpServletResponse response) throws Exception {
		
        String FILE_ID 	= (String)request.getParameter("FILE_ID");
        
		Map		requestParm = new HashMap();
		
		requestParm.put("FILE_ID", FILE_ID);
		
		Map fileInfo = (Map)commonDao.getObject("Filemng.getFileInfo", requestParm);
		
		String filePath = (String)fileInfo.get("FILE_PATH");
		
		String orgFileName = (String)fileInfo.get("ORG_FILE_NM");
		
        File f = new File(filePath);
        
        
        // file 다운로드 설정
        response.setContentType("application/download");
        response.setContentLength((int)f.length());
        response.setHeader("Content-disposition", "attachment;filename=\"" + orgFileName + "\"");
        // response 객체를 통해서 서버로부터 파일 다운로드
        OutputStream os = response.getOutputStream();
        // 파일 입력 객체 생성
        FileInputStream fis = new FileInputStream(f);
        FileCopyUtils.copy(fis, os);
        fis.close();
        os.close();
	}
}
