package exdev.com.service;

import java.util.Map;
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import exdev.com.common.ExdevConstants;
import exdev.com.common.service.ExdevBaseService;

@Service("EmailService")
public class EmailService  extends ExdevBaseService{
	
    @Autowired
    private Environment env;

    @Autowired
    private TemplateEngine templateEngine;
    
    private String emilPath = ExdevConstants.EMAIL_TEMPLATE_PATH;
    
    @SuppressWarnings("unused")
	public Map<String,Object> sendHtmlEmail (Map<String,Object> mailObj) {
    	
        final String username = env.getProperty("spring.mail.username");
        final String password = env.getProperty("spring.mail.password");

        Properties props = new Properties();
        props.put("mail.smtp.host", env.getProperty("spring.mail.host"));
        props.put("mail.smtp.port", env.getProperty("spring.mail.port"));
        props.put("mail.smtp.auth", env.getProperty("spring.mail.properties.mail.smtp.auth"));
        props.put("mail.smtp.starttls.enable", env.getProperty("spring.mail.properties.mail.smtp.starttls.enable"));
        
	    String recipient	= (String) mailObj.get("recipient");
	    String subject 		= (String) mailObj.get("subject");
	    String templateName	= (String) mailObj.get("templateName");
        
        Authenticator auth = new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        };

        Session session = Session.getInstance(props, auth);

        try {
    	    Context context		= new Context();
            for (Map.Entry<String, Object> entry : mailObj.entrySet()) {
                String key = entry.getKey();
                if (key.startsWith("cxt_")) {
                    Object value = entry.getValue();
                    context.setVariable(key,value);
                }
            }

            String htmlBody = templateEngine.process(emilPath+templateName, context);
            System.out.println(htmlBody);
        	
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));
            message.setSubject(subject);
            message.setContent(htmlBody,"text/html; charset=UTF-8");

            Transport.send(message);
            mailObj.put("htmlBody", htmlBody);
            resultInfo = makeResult(ExdevBaseService.REQUEST_SUCCESS, "", mailObj);
            System.out.println("HTML email sending Success!");
            
        } catch (MessagingException e) {
        	mailObj.put("RESULT",e.getMessage());
            resultInfo = makeResult(ExdevBaseService.REQUEST_FAIL, "", mailObj);
        }
		
		return resultInfo; 
    }   
}