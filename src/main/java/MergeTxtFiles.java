import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

public class MergeTxtFiles {

	public static void main(String[] args) {
		
	       // 디렉토리 경로 설정
        String directoryPath = "D:\\tmp\\test"; // 여기에 실제 디렉토리 경로를 입력하세요.

        // 결과 파일 생성
        File mergedFile = new File(directoryPath, "merged_scripts.sql");

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(mergedFile), StandardCharsets.US_ASCII))) {
            File directory = new File(directoryPath);
            File[] scriptFiles = directory.listFiles((dir, name) -> name.endsWith(".sql"));

            if (scriptFiles != null) {
                for (File scriptFile : scriptFiles) {
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(scriptFile), StandardCharsets.UTF_8))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            writer.write(line);
                            writer.newLine();
                        }
                    }
                }
            } else {
                System.out.println("디렉토리 내에 SQL 스크립트 파일이 없습니다.");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("SQL 스크립트 파일이 성공적으로 병합되었습니다.");
    }
}
