package exdev.com.util;


import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;


@Service
public class FileUtil {

	private String fileName = "";
        
    // 프로젝트 내 지정된 경로에 파일을 저장하는 메소드
    // DB에는 업로드된 전체 경로명으로만 지정되기 때문에(업로드한 파일 자체는 경로에 저장됨)
    // fileUpload() 메소드에서 전체 경로를 리턴받아 DB에 경로 그대로 저장   
    public static HashMap<String, String> fileUploadMulti(String path, MultipartFile uploadFile) {
        
        String fileName = "";
        String newFilename= "";
        OutputStream out = null;
        PrintWriter printWriter = null;
        HashMap<String, String> map = new HashMap<String, String>();
        try {
            fileName = uploadFile.getOriginalFilename();
            byte[] bytes = uploadFile.getBytes();
            //"\/tomcat\/webapps\/ROOT\/File\/notice/"
            File file = new File(path);
            
            
            if (fileName != null && !fileName.equals("")) {
                if (file.exists()) {
                	//  파일명 앞에 업로드 시간 초단위로 붙여 파일명 중복을 방지
                	String orgFileName = getFileName( fileName );
                	String orgFileExt = getFileExt( fileName );
                	
                	newFilename = orgFileName+"_"+System.currentTimeMillis()+"."+orgFileExt;
                	file = new File( path+newFilename );
                }else {
                	
                }
            }
            
            
            out = new FileOutputStream(file);
            out.write(bytes);
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (out != null) {
                    out.close();
                }
                if (printWriter != null) {
                    printWriter.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        

        map.put("newFilename", newFilename);
        map.put("path", path);
        return map;
    }
    
    //  업로드 파일 저장 경로 얻는 메소드
    //  업로드한 파일의 경로가 도메인 별로 달라야 했기 때문에 도메인의 형을 비교하여 파일 저장 정로를 다르게 지정함
    public static String getSaveLocation(MultipartHttpServletRequest request) {
        
        String uploadPath = request.getSession().getServletContext().getRealPath("/");
        String attachPath = "";//Code.PATH_NOTICE;
        
        return uploadPath + attachPath;
    }

	/** 
     * 디렉토리 생성
     * @param String filePath : 생성할 디렉토리경로
     * @return boolean : 디렉토리 생성여부 (true: 생성 , false: 미생성 )
     * @생 성 자 : 이응규
     * @생 성 일 자 : 2007. 04. 17.
     * @수 정 자 : 
     * @수 정 일 자 :
     * @수 정
     * */
	public static boolean mkdir(String filePath,File thisfile) {
		
		if( thisfile.isDirectory() ){//해당디렉토리가 있는지 여부
			return false;
		}else{//디렉토리가 없으면 생성
			thisfile.mkdir(); 
			return true;
		}
	}
	/** 
     * 디렉토리안에 있는 파일삭제
     * @param File file : 
     * @return boolean : 파일삭제 여부 
     * @생 성 자 : 이응규
     * @생 성 일 자 : 2007. 05. 09.
     * @수 정 자 : 
     * @수 정 일 자 :
     * @수 정
     * */
	public static boolean fileDeleteInDir( File file ) {
		File[] filelist = null;
        
		if( file.isDirectory() ){//해당디렉토리가 있는지 여부
				filelist = file.listFiles();  					
				for(int i=0; i<filelist.length; i++){
					  if(filelist[i].isDirectory()){
					  	
					  } else{//파일삭제					  	
					       filelist[i].delete();
					  }    
				}
			return true;		
		}else{
			return false;// 파일디렉토리가 없을경우 
		}
	}

	/** 
     * 파일명.확장자 에서 파일명만 읽기
     * @param String fileName : 
     * @return String : 파일명
     * @생 성 자 : 이응규
     * @생 성 일 자 : 2020. 04. 14.
     * @수 정 자 : 
     * @수 정 일 자 :
     * @수 정
     * */
	public static String getFileName( String fileName ) {
		int pos = fileName .lastIndexOf(".");
		String _fileName = fileName.substring(0, pos);
		return _fileName;
	}

	/** 
     * 파일명.확장자 에서 확장자만 읽기
     * @param File file : 
     * @return String : 확장자 
     * @생 성 자 : 이응규
     * @생 성 일 자 : 2020. 04. 14.
     * @수 정 자 : 
     * @수 정 일 자 :
     * @수 정
     * */
	public static String getFileExt( String fileName ) {
		int pos = fileName .lastIndexOf(".");
		String ext = fileName.substring( pos + 1 );
		return ext;
	}
}
