package exdev.com.common.controller;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import exdev.com.ExdevCommonAPI;
import exdev.com.common.ExdevConstants;
import exdev.com.common.dao.ExdevCommonDao;
import exdev.com.common.vo.SessionVO;

/**
 * @author 위성열
 */
@Controller("ExdevSessionController")
public class ExdevSessionController {
	
	@Autowired
	private ExdevCommonDao commonDao;
/*
	@RequestMapping("setSession.do")
	public @ResponseBody Map setSession(@RequestBody Map map, HttpSession session) throws Exception {
		
		SessionVO sessionVO = new SessionVO();
		
		Map userInfo = (Map)commonDao.getObject("common.getUserInfo", map);
		
		if(!ExdevCommonAPI.isValid(userInfo)) {
			map.put("state", "E");
			return map;
		}
		String userNm 		= (String)userInfo.get("USER_NM"	);
		String userId 		= (String)userInfo.get("USER_ID"	);
		
		sessionVO.setUserId		(userId		);
		sessionVO.setUserNm		(userNm		);
		
		session.setAttribute(ExdevConstants.SESSION_ID, sessionVO);
		
		return userInfo;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@RequestMapping("getSession.do")
	public @ResponseBody Map getSession(@RequestBody Map map, HttpSession session) throws Exception {
		
		SessionVO sessionVO = (SessionVO)session.getAttribute(ExdevConstants.SESSION_ID);
		
		HashMap userInfo = new HashMap();

		userInfo.put("USER_NM"			,  sessionVO.getUserNm		());
		userInfo.put("USER_ID"			,  sessionVO.getUserId		());
		
		return userInfo;
	}
*/
	
	

	@RequestMapping("setSession.do")
	public @ResponseBody Map setSession(@RequestBody Map map, HttpSession session) throws Exception {
		
		SessionVO sessionVO = new SessionVO();
		
		String userId 		= "TEST";
		String userNm 		= "TEST";
		
		Map userInfo = new HashMap();
		
		userInfo.put("USER_ID", userId);
		userInfo.put("USER_NM", userNm);
		
		
		sessionVO.setUserId		(userId		);
		sessionVO.setUserNm		(userNm		);
		
		session.setAttribute(ExdevConstants.SESSION_ID, sessionVO);
		
		return userInfo;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@RequestMapping("getSession.do")
	public @ResponseBody Map getSession(@RequestBody Map map, HttpSession session) throws Exception {
		
		SessionVO sessionVO = (SessionVO)session.getAttribute(ExdevConstants.SESSION_ID);
		
		HashMap userInfo = new HashMap();

		userInfo.put("USER_ID"			,  sessionVO.getUserId		());
		userInfo.put("USER_NM"			,  sessionVO.getUserNm		());
		
		return userInfo;
	}

	
	
	
	
	@SuppressWarnings("rawtypes")
	@RequestMapping("logout.do")
	public @ResponseBody Map logout(HttpSession session) {

	    session.invalidate();
	    
	    Map<String, String> result = new HashMap<>();
	    result.put("status", "S");
	    return result;
	}	
}
