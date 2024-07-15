package exdev.com.service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

import javax.servlet.http.HttpSession;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;

import exdev.com.ExdevCommonAPI;
import exdev.com.common.ExdevConstants;
import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.common.service.ExdevBaseService;
import exdev.com.common.service.ExdevCommonService;
import exdev.com.common.vo.SessionVO;

@Service("ExcelService")
public class ExcelService  extends ExdevBaseService{
	
	
	@Autowired
	private ExdevCommonService commonService;

	@Autowired
	private ExdevCommonDao commonDao;
	
	
	public @ResponseBody Map<String, Object> upload(@RequestParam("file") MultipartFile file, HttpSession session) throws Exception {

		SessionVO sessionVo = (SessionVO) session.getAttribute(ExdevConstants.SESSION_ID);
	    Map<String, Object> resultMap = new HashMap<>();
	    resultMap.put("sessionVo", sessionVo);
	    resultMap.put("filename", file.getOriginalFilename());

	    try {
	        Workbook workbook = WorkbookFactory.create(file.getInputStream());
	        Sheet sheet = workbook.getSheetAt(0);
	        
	        List<Map<String, Object>> excelDataMapList = new ArrayList<>();
	        List<String> headerList = new ArrayList<>();
	        boolean headerRow = true;
	        
	        for (Row row : sheet) {
	            Map<String, Object> cellMap = new LinkedHashMap<>();
	            
	            for (int i = 0; i < row.getLastCellNum(); i++) {
	                Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	                if (headerRow) {
	                    headerList.add(cell.toString());
	                } else {
	                    cellMap.put(headerList.get(i), cell.toString());
	                }
	            }
	            
	            if (!headerRow) {
	                excelDataMapList.add(cellMap);
	            }
	            headerRow = false;
	        }

            workbook.close();

            Gson gson = new Gson();
            String json = gson.toJson(excelDataMapList);
            resultMap.put("msg","");
    		resultMap.put("data",json);
            resultMap.put("state","S");
    		
            return resultMap;
            
        } catch (Exception e) {
            e.printStackTrace();
            resultMap.put("msg","");
            resultMap.put("state","");

            return resultMap;
        }
	}
	/**
	 * 위성열 
	 * 20240308
	 * @param file
	 * @param session
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public @ResponseBody Map<String, Object> commonExcelUpload(@RequestParam("file") MultipartFile file, HttpSession session) throws Exception {
		
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        int cnt = workbook.getNumberOfSheets();
        Map resultMap = null;
        for (int ii = 0; ii < cnt; ii++) {
    		resultMap = commonExcelUploadExec(file, session, ii);
    		resultMap.put("sheetNum", ii);
    		// error Check
    		String state = (String)resultMap.get("state");
    		if("E".equals(state)) break;
		}
		return resultMap;
	}
	@SuppressWarnings("unchecked")
	public @ResponseBody Map<String, Object> commonExcelUploadExec(@RequestParam("file") MultipartFile file, HttpSession session, int sheetNum) throws Exception {

		SessionVO sessionVo = (SessionVO) session.getAttribute(ExdevConstants.SESSION_ID);
	    Map<String, Object> resultMap = new HashMap<>();
	    resultMap.put("sessionVo", sessionVo);
	    resultMap.put("filename", file.getOriginalFilename());

        int idx = 0;

        try {
	        Workbook workbook = WorkbookFactory.create(file.getInputStream());
	        Sheet sheet = workbook.getSheetAt(sheetNum);

	        List<Map<String, Object>> 	excelDataMapList 	= new ArrayList<>();
	        List<String> 				headerList 			= new ArrayList<>();
	        HashMap 					optionMap			= new HashMap();
	        String 						tableName 			= "";
	        String 						prmKeyNumStr		= "";
	        String 						prmKeyNumAttr	[]	= null;
	        String 						prmKeyAttr		[]	= null;
	        String 						clearCheck 			= "";
	        String 						dupleProcess		= "";
	        String 						backupYn			= "";
	        
	        for (Row row : sheet) {
	        	
	        	// 첫행,두번째행은 설명으로 Skip 
	        	if(idx <= 1) {
		        	// 첫Cell이 skip이면 Sheet 종료  
	        		if(idx == 0) {
		                Cell cell1 	 = row.getCell(0, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
		        		String sheetCommand = cell1.toString();
		        		if("skip".equals(sheetCommand)) {
		                    resultMap.put("msg","");
		            		resultMap.put("data","skip");
		                    resultMap.put("state","S");
		                    return resultMap;
		        		}
	        		}
	        	// 세번째행은 Table Name 읽어서 CODE에서 Column 정보 가져옴 및 기타 옵션 가져옴
	        	} else if(idx == 2) {
	                Cell cell1 = row.getCell(0, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	                Cell cell2 = row.getCell(1, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	                Cell cell3 = row.getCell(2, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	                Cell cell4 = row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	                Cell cell5 = row.getCell(4, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	                
	        		tableName 	 = cell1.toString();
	        		if(!ExdevCommonAPI.isValid(tableName)) {
	        			// 코드관리에서 Table Column정의가 없는 경우 오류 처리
	        			throw new Exception(sheetNum + "번째 Sheet의 Format이 형식에 맞지 않습니다.");
	        			
	        		}
	        		
	        		prmKeyNumStr = cell2.toString();
	        		if(ExdevCommonAPI.isValid(prmKeyNumStr)) {
	        			prmKeyNumAttr 	= prmKeyNumStr.split("/");
	        			prmKeyAttr		= new String[prmKeyNumAttr.length];
	            		for (int i=0;i<prmKeyNumAttr.length;i++) {
	            			prmKeyNumAttr[i] = prmKeyNumAttr[i].replaceAll(".0", ""); 
						}
	        		}
	        		clearCheck 	 = cell3.toString();
	        		dupleProcess = cell4.toString();
	        		backupYn	 = cell5.toString();
	        		
	        		optionMap.put("TABLE_NAME"		, tableName);
	        		optionMap.put("BK_TABLE_NAME"	, tableName + "_EXBACKUP");
	        		optionMap.put("CLEAR_CHECK"		, clearCheck);
	        		optionMap.put("DUPLE_PROCESS"	, dupleProcess);
	        		optionMap.put("BACKUP_DATE"		, ExdevCommonAPI.getToday("yyyyMMddHHmmss"));
	        		optionMap.put("sessionVo", sessionVo);
	        		
	        		// Table에 해당하는 Column읽어온다.
	            	Map lm = (Map)commonDao.getObject("common.getExcelUploadColumnList", optionMap);
	            	
	            	if( lm == null) {
	        			// 코드관리에서 Table Column정의가 없는 경우 오류 처리
	        			throw new Exception("Table의 헤더가 Excel Upload Column 관리 Table에 등록되어 있지 않습니다.\n\n[3,A] Cell의 Table명이 Excel Upload관리 메뉴에 등록 되어 있어야 합니다.");
	            	} else {
	            		String columnList = (String)lm.get("COLUMN_LIST");
	            		String columnArray [] = columnList.split("/");
	            		int cidx = 1;
	            		int keyIdx = 0;
	            		for (String column : columnArray) {
		            		headerList.add(column);
		            		for (String num : prmKeyNumAttr) {
								if((cidx + "").equals(num)) {
									//엑셀에서 지정한 Primary Key를 구한다.
									prmKeyAttr[keyIdx++] = column;
									break;
								}
							}
		            		cidx++;
						}
	            	}
	            // 네번째 행은 Header 처리 및 옵션 처리
	        	} else if (idx == 3) {
	        		int cellcnt = row.getLastCellNum();
	        		int headerCnt = headerList.size();
	        		if(cellcnt < headerCnt) {
	        			// 컬럼 개수가 일치하지 않아 오류처리
	        			throw new Exception("Column개수가 일치하지 않습니다.");
	        		}

	        		boolean check = true;
	        		for (int ii=0; ii < headerCnt;ii++ ) {
	        			String rgColumn = headerList.get(ii);
	        			Cell cell = row.getCell(ii, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
	        			String rowColumn = cell.toString();
	        			if(!rgColumn.equals(rowColumn)) {
	        				check = false;
	        				break;
	        			}
	        		}
	        		if(!check) {
		        		// 등록된 Column과 일치하지 않는 경우
	        			throw new Exception("등록된 Column Name과 일치하지 않습니다.");
	        		}
	        		
	        		// 기존 Data 지우고 새로 upload인경우 처리
	        		if("Y".equals(clearCheck)) {

	        			// Backup 옵션 확인
	        			if(!"N".equals(backupYn)) {
	        				// 기존 Data Backukp 후 Clear함
	        				List tabCntList = (List)commonDao.getList("common.existTableName", optionMap);
	        				Integer tabCnt = tabCntList.size();
	        				if(tabCnt == 1) {
	        					// Backup Table이 이미 존재하는 경우
	        					commonDao.update("common.insertBackupTable"	, optionMap);
	        					optionMap.put("BK_TYPE", "INSERT");
	        					commonDao.update("common.insertBackupLog"	, optionMap);
	        				} else {
	        					// Backup Table이 없는 경우
	        					commonDao.update("common.createBackupTable"	, optionMap);
	        					optionMap.put("BK_TYPE", "CREATE");
	        					commonDao.update("common.insertBackupLog"	, optionMap);
	        				}
		        			// 백업 완료
	        			}
	        			
	        			// 기존 Data를 지운다.
        				commonDao.update("common.deleteTable"				, optionMap);
	        		}
	        	// 다섯번째 행은 컬럼 Comment
	        	} else if (idx == 4) {
	        		
		        // 여섯번째 행부터 Data
	            } else if (idx > 4) {

		            Map<String, Object> cellMap = new LinkedHashMap<>();

		            for (int i = 0; i < headerList.size(); i++) {
		                Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
		                
		                String cellValue = cell.toString();
		                
		                String column = headerList.get(i);
	            		String [] columnArry = column.split(":");

	            		if(columnArry.length > 1 && "D".equals(columnArry[1])) {
                            
	            			Date date = cell.getDateCellValue();
	            			if(date == null) {
	            				cellValue = "";
	            			} else {
	                            // yyyy-MM-dd 형식으로 변환
	                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	                            String formattedDate = sdf.format(date);
	                            cellValue = formattedDate;
	            			}
	            		} else if(cell.getCellType() == CellType.NUMERIC) {
	                		
	            			cell.setCellType(CellType.STRING);
	            			
	            			cellValue = cell.getStringCellValue();
	            			
	            			Double 	dcellValue 	= Double.parseDouble(cellValue);
	                		Long 	lcellValue 	= Math.round(dcellValue);
	                		
	                		String compStr = lcellValue + ".0";
	                		if(compStr.equals(cellValue.toString())) {
	                			cellValue = String.valueOf(lcellValue);
	                		}
	                		
	            		}
	                    cellMap.put(headerList.get(i), cellValue);
		            }
		            
	                excelDataMapList.add(cellMap);
	            }
	        	idx++;
	        }
            workbook.close();
            
            // 중복 Check
            String dupleNum = checkExcelDataValid(excelDataMapList, prmKeyAttr);
            if(dupleNum != null) {
            	resultMap.put("dupleNum", dupleNum);
    			resultMap.put("errorType", "excel_duple");
            	throw new Exception("Excel Data에 중복 Data가 있습니다.");
            }
            
            for (Map<String, Object> map : excelDataMapList) {
            	List<Map> setInfoList 	= new ArrayList<Map>();
            	List<Map> setUpdateList = new ArrayList<Map>();
            	for (String column : headerList) {
            		HashMap infoMap = new HashMap(); 
            		
            		String [] columnArry = column.split(":");
            		String columnNm 	= columnArry[0];
            		String columnType	= "X";
            		if(columnArry.length > 1) columnType = columnArry[1];
            		
            		String value = (String)map.get(column);
            		if(value == null) value = "";
            		
            		infoMap.put("header"		, columnNm);
            		infoMap.put("columnType"	, columnType);
            		infoMap.put("data"			, value);
            		setInfoList.add(infoMap);
            		
            		boolean keyCheck = false;
            		for (String key : prmKeyAttr) {
						if(key.equals(column)) keyCheck = true;
					}
            		if(!keyCheck) {
            			setUpdateList.add(infoMap);
            		}
				}
            	HashMap imap = new HashMap();
            	imap.put("tableName"	, tableName	);
            	imap.put("setInfoList"	, setInfoList);
            	imap.put("prmKeyAttr"	, prmKeyAttr);
            	imap.put("setUpdateList", setUpdateList);
            	imap.put("sessionVo"	, sessionVo	);
            	
            	if("OVERWRITE".equals(dupleProcess)) {
            		// 덮어쓰기
                	commonDao.update("common.excelOverwriteToTable", imap);
            	} else {
            		// Primary Key 중복인 경우 Error리턴
            		commonDao.update("common.excelUploadToTable", imap);
            	}
            	
            	
			}
            Gson gson = new Gson();
            String json = gson.toJson(excelDataMapList);
            resultMap.put("msg","");
    		resultMap.put("data",json);
            resultMap.put("state","S");
    		
            return resultMap;
            
        } catch (Exception e) {
            e.printStackTrace();
            resultMap.put("msg"		,e.getMessage());
            resultMap.put("stopIdx"	,(idx - 3));
            resultMap.put("state","E");

            return resultMap;
        }
	}
	
	private String checkExcelDataValid(List<Map<String, Object>> excelDataMapList, String [] prmKeyAttr) {
		HashMap<String, String> keyList = new HashMap<String, String>();
		String rdata = null;
		int idx = 5;
        for (Map<String, Object> map : excelDataMapList) {
        	
        	String pk = "";
    		for (String key : prmKeyAttr) {
    			String addKey = (String)map.get(key);
    			pk += addKey;
			}
    		String dupleNum = keyList.get(pk);
    		if(dupleNum != null) {
    			rdata = dupleNum + "/" + idx;
    			break;
    		}
    		keyList.put(pk, idx + "");
    		idx++;
        }
		return rdata;
	}
	
	
	
	
    public Workbook download(Map<String, Object> requestBodyMap, HttpSession session) throws Exception {
    	
        Workbook workbook = new XSSFWorkbook();
        String checkRowStr = (String)requestBodyMap.get("checkedRow");
        Map downInfo = (Map)requestBodyMap.get("downInfo");       
        String title 	= (String) downInfo.get("title");
        String menu 	= (String) downInfo.get("menu");
        Sheet sheet = workbook.createSheet(title);
        sheet.setDefaultColumnWidth(28);

        // Header font style
        Font headerFont = workbook.createFont();
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerFont.setBold(true);

        // Header cell style
        CellStyle headerCellStyle = workbook.createCellStyle();
        headerCellStyle.setBorderLeft(BorderStyle.THIN);
        headerCellStyle.setBorderRight(BorderStyle.THIN);
        headerCellStyle.setBorderTop(BorderStyle.THIN);
        headerCellStyle.setBorderBottom(BorderStyle.THIN);
        headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerCellStyle.setFont(headerFont);

        // Body cell style
        CellStyle bodyCellStyle = workbook.createCellStyle();
        bodyCellStyle.setBorderLeft(BorderStyle.THIN);
        bodyCellStyle.setBorderRight(BorderStyle.THIN);
        bodyCellStyle.setBorderTop(BorderStyle.THIN);
        bodyCellStyle.setBorderBottom(BorderStyle.THIN);

        // Retrieve data from service
        Map resultMap = commonService.requestQuery(requestBodyMap, session);
        
        List<Map<String, Object>> dataList = (List<Map<String, Object>>) resultMap.get("data");

        if(checkRowStr !=null  && !checkRowStr.isEmpty()) {
        	
        	List<Map<String, Object>> dataListTemp = new ArrayList<>(); 
        	String[] checkRows = checkRowStr.split(",");
        	
        	for(String rowIdx : checkRows) {
        		
                int index = Integer.parseInt(rowIdx);
                if (index >= 0 && index < dataList.size()) {
                    Map<String, Object> tempRow = dataList.get(index);
                    dataListTemp.add(tempRow); 
                }
        	}
        	
        	dataList = dataListTemp;
        }
        
        String[] columnOrders = ((String) requestBodyMap.get("columnOrders")).split(",");

        // Add document security
        Row securityRow = sheet.createRow(0);
        Cell securityCell = securityRow.createCell(0);
        securityCell.setCellValue("Document Security");
        Font securityFont = workbook.createFont();
        securityFont.setColor(IndexedColors.RED.getIndex());
        CellStyle securityCellStyle = workbook.createCellStyle();
        securityCellStyle.setFont(securityFont);
        securityCell.setCellStyle(securityCellStyle);

        // Add table name
        Row tableNameRow = sheet.createRow(1);
        Cell tableNameCell = tableNameRow.createCell(0);
        tableNameCell.setCellValue(menu);
        Font tableNameFont = workbook.createFont();
        tableNameFont.setBold(true);
        CellStyle tableNameCellStyle = workbook.createCellStyle();
        tableNameCellStyle.setFont(tableNameFont);
        tableNameCell.setCellStyle(tableNameCellStyle);

        // Add Date
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDateTime = now.format(formatter);
        //Row dateRow = sheet.createRow(1);
        Cell dateCell = tableNameRow.createCell(1);
        dateCell.setCellValue("Date : " + formattedDateTime);

        String[] columnNames = ((String) requestBodyMap.get("columnNames")).split(",");
        // Create header row
        Row headerRow = sheet.createRow(2);
        for (int i = 0; i < columnNames.length; i++) {
            Cell headerCell = headerRow.createCell(i);
            headerCell.setCellValue(columnNames[i]);
            headerCell.setCellStyle(headerCellStyle);
        }

        // Fill data rows
        int rowCount = 3;
        int rowidx = 1;
        for (Map<String, Object> rowData : dataList) {
            Row dataRow = sheet.createRow(rowCount++);
            for (int i = 0; i < columnNames.length; i++) {
                Cell cell = dataRow.createCell(i);
                Object value = rowData.get(columnOrders[i]);
                String colName = columnNames[i];

                if("ROWNUM".equals(columnOrders[i])) {
                	cell.setCellValue( rowidx++ );
                } else if (value != null) {
                    cell.setCellValue(this.getCellValue(colName,value));
                }

                cell.setCellStyle(bodyCellStyle);
            }
        }

        return workbook;
    }
    
	private String getCellValue(String colName, Object value) {

        if (value instanceof BigDecimal) {
            value = String.valueOf(((BigDecimal) value).intValue());
        } else if (value instanceof Double) {
            value = String.valueOf(((Double) value).intValue());
        }
        return (String)value;
        
	}
  }