package exdev.com.common;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import exdev.com.ExdevCommonAPI;

public class ExdevCommonInterceptor extends HandlerInterceptorAdapter {
	
	// 사전처리
	@Override
	public boolean preHandle(HttpServletRequest request	,HttpServletResponse response, Object handler) throws Exception {
		//System.out.println("---PreHandle---");
		return true;
	}
	// jsp 호출하기 직전 처리
	@Override
	public void postHandle( HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView ) throws Exception {
		//System.out.println("---PostHandle---");
	}	
}
