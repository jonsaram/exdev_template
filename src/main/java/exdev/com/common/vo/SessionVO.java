/**
 *
 */
package exdev.com.common.vo;

import java.util.HashMap;

/**
 * @author ks5011.kim
 *
 */
public class SessionVO {

	private static final long serialVersionUID = 1L;

	private String userId; 
	private String userNm;
	private String grade;
	private String email;
	private String spCstmId;
	private String loginType;
	private String systemRoleId;
	private String systemRoleNm;
	
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getUserNm() {
		return userNm;
	}
	public void setUserNm(String userNm) {
		this.userNm = userNm;
	}
	public String getGrade() {
		return grade;
	}
	public void setGrade(String grade) {
		this.grade = grade;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getSpCstmId() {
		return spCstmId;
	}
	public void setSpCstmId(String spCstmId) {
		this.spCstmId = spCstmId;
	}
	public String getLoginType() {
		return loginType;
	}
	public void setLoginType(String loginType) {
		this.loginType = loginType;
	}
	public String getSystemRoleId() {
		return systemRoleId;
	}
	public void setSystemRoleId(String systemRoleId) {
		this.systemRoleId = systemRoleId;
	}
	public String getSystemRoleNm() {
		return systemRoleNm;
	}
	public void setSystemRoleNm(String systemRoleNm) {
		this.systemRoleNm = systemRoleNm;
	}
}
