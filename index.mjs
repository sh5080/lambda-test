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
      // ****** 기간 내 미선택 / 수락 요청 메세지 ******
      const nonSelectQuery = queries.getNonSelectQuery();
      const [nonSelectData] = await connection.execute(nonSelectQuery);
      console.log(
        "@@@@@@   nonSelectData   @@@@@@@ \n",
        nonSelectData,
        "\n@@@@@@   nonSelectData   @@@@@@@"
      );
      if (nonSelectData) {
        await messages.sendNonSelect(nonSelectData);
      }

      // ****** 기간 내 남성 미선택 / 여성 수락 메세지 ******
      const maleAcceptQuery = queries.getMaleAcceptenceQuery();
      const [maleAcceptData] = await connection.execute(maleAcceptQuery);
      console.log(
        "@@@@@@   maleAcceptData   @@@@@@@ \n",
        maleAcceptData,
        "\n@@@@@@   maleAcceptData   @@@@@@@"
      );
      if (maleAcceptData) {
        await messages.sendAcceptence(maleAcceptData);
      }

      // ****** 기간 내 여성 미선택 / 남성 수락 메세지 ******
      const femaleAcceptQuery = queries.getFemaleAcceptenceQuery();
      const [femaleAcceptData] = await connection.execute(femaleAcceptQuery);
      console.log(
        "@@@@@@   femaleAcceptData   @@@@@@@ \n",
        femaleAcceptData,
        "\n@@@@@@   femaleAcceptData   @@@@@@@"
      );
      if (femaleAcceptData) {
        await messages.sendAcceptence(femaleAcceptData);
      }

      // ****** 기간 내 미선택 / 수락 가능 기간 지난 후 메세지 ******
      const dormantQuery = queries.getDormantQuery();
      const [dormantData] = await connection.execute(dormantQuery);
      console.log(
        "@@@@@@   dormantData   @@@@@@@ \n",
        dormantData,
        "\n@@@@@@   dormantData   @@@@@@@"
      );
      if (dormantData) {
        await messages.sendDormant(dormantData);
      }

      // TODO 정상작동 완료 후 디스코드 웹훅 *******
      await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: `전체 문자 발송 완료되었습니다.`,
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
