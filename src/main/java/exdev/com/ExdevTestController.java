/*
 * Copyright 2008-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package exdev.com;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import exdev.com.service.ExdevSampleService;

/**
 * This MovieController class is a Controller class to provide movie crud and
 * genre list functionality.
 * 
 * @author sungyeol wee
 */
@Controller("ExdevTestController")
public class ExdevTestController {
	
	@Autowired
	private ExdevSampleService sampleService;

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping("test.do")
	public @ResponseBody Map test(@RequestBody HashMap map) throws Exception {
		
		map = (HashMap)sampleService.getSample(map);
		
		return map;
	}
	

}
