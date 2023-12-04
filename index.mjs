import axios from "axios";
import mysql from "mysql2/promise";
import * as queries from "./utils/dbQueries.mjs";
import * as messages from "./utils/messages.mjs";

// TODO 개발시 dotenv 설치 후 주석해제 ******
// import { configDotenv } from "dotenv";
// configDotenv();

export const handler = async (event) => {
  try {
    const pool = mysql.createPool({
      port: process.env.TEST_PORT,
      host: process.env.TEST_HOST,
      user: process.env.TEST_USER,
      password: process.env.TEST_PASSWORD,
      database: process.env.TEST_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    const connection = await pool.getConnection();
    try {
      const accessQuery = queries.getAccessDataQuery();
      const [accessData] = await connection.execute(accessQuery);
      console.log(
        "@@@@@@   accessData   @@@@@@@ \n",
        accessData,
        "\n@@@@@@   accessData   @@@@@@@"
      );
      if (accessData) {
        await messages.sendAccessSMS(accessData);
      }
      const rejectQuery = queries.getRejectDataQuery();
      const [rejectData] = await connection.execute(rejectQuery);
      console.log(
        "@@@@@@   rejectData   @@@@@@@ \n",
        rejectData,
        "\n@@@@@@   rejectData   @@@@@@@"
      );
      if (rejectData) {
        // TODO sendRejectSMS 메세지내용, 함수 아직 미완성
        await messages.sendAccessSMS(rejectData);
      }

      // TODO 정상작동 완료 후 디스코드 웹훅 *******
      await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: `총 ${count} 쌍의 문자 발송 완료되었습니다.`,
      });
      console.info("디스코드 웹훅 성공");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("디스코드 웹훅 실패", error);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };

  return response;
};

// TODO 로컬 테스트할 경우 주석해제 ******
// handler();
