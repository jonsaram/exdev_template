package exdev;

import javax.sql.DataSource;

import org.apache.ibatis.session.LocalCacheScope;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

@SpringBootApplication
public class ExdevApplication extends SpringBootServletInitializer {
	
	public static void main(String[] args) {
		//SpringApplication.run(ExdevApplication.class, args);
		SpringApplication application = new SpringApplication(ExdevApplication.class);
		
		//SpringApplication.run(ExdevApplication.class, args);
//		SpringApplication application = new SpringApplicationBuilder(ExdevApplication.class)
//											.listeners(new ApplicationPidFileWriter("./application.pid"))
//											.build();
		
		
		
		application.run(args);
	}
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(ExdevApplication.class);
	}

	@Bean
	public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
		SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
		sessionFactory.setDataSource(dataSource);
		
		Resource[] res = new PathMatchingResourcePatternResolver().getResources("classpath:mappers/sql-*.xml");
		sessionFactory.setMapperLocations(res);

		
        // Mybatis 설정 추가
        org.apache.ibatis.session.Configuration mybatisConfig = new org.apache.ibatis.session.Configuration();
        mybatisConfig.setLocalCacheScope(LocalCacheScope.STATEMENT);
		
        sessionFactory.setConfiguration(mybatisConfig);
        
		return sessionFactory.getObject();
	}
	
	@Bean(name="sqlSession")
	public SqlSessionTemplate sqlSession(SqlSessionFactory sqlSessionFactory) throws Exception {
		return new SqlSessionTemplate(sqlSessionFactory);
	}	
	
}
