package exdev.com.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.common.service.ExdevBaseService;

/**
 * This MovieServiceImpl class is an Implementation class to provide movie crud
 * functionality.
 * 
 * @author 위성열
 */
@Service("ExdevSampleService")
public class ExdevSampleService extends ExdevBaseService{
	
	@Autowired
	private ExdevCommonDao commonDao;
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Object getSample(Map map) throws Exception {
		List<Map> list = commonDao.getList("Sample.getSample", map);
		
		map.put("list", list);
		System.out.println("ExdevSampleService.getSample 11");
		return map;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Object setFile(Map map) throws Exception {
		int result = commonDao.insert("Sample.setFile", map);
		map.put("insert", "SUCCESS");
		System.out.println("ExdevSampleService.setFile");
		return map;
	}
}
