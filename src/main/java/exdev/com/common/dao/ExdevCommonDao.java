package exdev.com.common.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

@Repository("ExdevCommonDao")
public class ExdevCommonDao {
	
	@Autowired(required=false)
	@Qualifier("sqlSession")
	private SqlSessionTemplate sqlMainSession;
	
	
	@SuppressWarnings("rawtypes")
	public List<Map> getList(String queryId, Object obj) throws Exception {
		System.out.println("=================================================");
		System.out.println("Request Query Id: " + queryId);
		System.out.println("=================================================");
		return sqlMainSession.selectList(queryId, obj);
	}
	public Object getObject(String queryId, Object obj) throws Exception {
		System.out.println("=================================================");
		System.out.println("Request Query Id: " + queryId);
		System.out.println("=================================================");
		return sqlMainSession.selectOne(queryId, obj);
	}
	public int update(String queryId, Object obj) throws Exception {
		System.out.println("=================================================");
		System.out.println("Request Query Id : " + queryId);
		System.out.println("=================================================");
		return sqlMainSession.update(queryId, obj);
	}
	public int insert(String queryId, Object obj) throws Exception {
		System.out.println("=================================================");
		System.out.println("Request Query Id : " + queryId);
		System.out.println("=================================================");
		return sqlMainSession.insert(queryId, obj);
	}
    public int delete(String queryId, Object obj) throws Exception {
		System.out.println("=================================================");
		System.out.println("Request Query Id : " + queryId);
		System.out.println("=================================================");
        return sqlMainSession.delete(queryId, obj);
    }
}