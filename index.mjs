import axios from "axios";
import mysql from "mysql2/promise";
import * as crypto from "crypto";

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
      const accessQuery = `
      SELECT mp.female_id, mp.male_id, 
      male.mobile_number AS male_number, female.mobile_number AS female_number
      FROM matching_public mp
      JOIN global_status gs ON mp.phase = gs.phase
      LEFT JOIN users female ON mp.female_id = female.id
      LEFT JOIN users male ON mp.male_id = male.id
      WHERE gs.id = (SELECT MAX(id) FROM global_status)
        AND mp.deadline > NOW()
        AND mp.f_choice = 1
        AND mp.m_choice = 1;
    `;

      const [accessData] = await connection.execute(accessQuery);
      console.log(
        "@@@@@@   accessData   @@@@@@@ \n",
        accessData,
        "\n@@@@@@   accessData   @@@@@@@"
      );
      const rejectQuery = `
      SELECT mp.female_id, mp.male_id, 
      male.mobile_number AS male_number, female.mobile_number AS female_number
      FROM matching_public mp
      JOIN global_status gs ON mp.phase = gs.phase
      LEFT JOIN users female ON mp.female_id = female.id
      LEFT JOIN users male ON mp.male_id = male.id
      WHERE gs.id = (SELECT MAX(id) FROM global_status)
        AND mp.deadline > NOW()
        AND mp.f_choice = -1
        AND mp.m_choice = -1;
      `;
      const [rejectData] = await connection.execute(rejectQuery);
      console.log(
        "@@@@@@   rejectData   @@@@@@@ \n",
        rejectData,
        "\n@@@@@@   rejectData   @@@@@@@"
      );

      const msg = `'''축하드립니다! 매칭이 성사되셨습니다.
      아래 링크에서 인연의 연락처를 확인해보세요:)

      https://only-you.co.kr

      매너 있는 ONLYou만의 문화를 위해 몇 가지 주의사항을 안내드릴게요!!

      - 매너 있는 채팅 및 대화 부탁드려요
      - 술, 자취 관련 이야기는 자제해주세요
      - 답장이 느리다고 지속적으로 연락을 하거나, 동의 없이 전화를 거는 행위는 자제해주세요
      - 이유 없는 지각과 잠수를 주의해주세요 서로에게 좋은 인상으로 남도록 함께 노력해요.

      ONLYou의 시작과 함께해주셔서 정말 감사합니다.'''`;

      const url = process.env.NCP_SENS_URL_LOGIN;
      const serviceId = process.env.NCP_SENS_SERVICE_ID_LOGIN;
      const accessKey = process.env.NCP_API_ACCESS_KEY;
      const secretKey = process.env.NCP_API_SECRET_KEY;

      const method = "POST";
      const uri = `/sms/v2/services/${serviceId}/messages`;
      const timestamp = Date.now().toString();

      function makeSignature(accessKey, secretKey, method, uri, timestamp) {
        const space = " ";
        const newLine = "\n";
        const hmac = crypto.createHmac(
          "sha256",
          Buffer.from(secretKey, "utf-8")
        );

        hmac.update(method);
        hmac.update(space);
        hmac.update(uri);
        hmac.update(newLine);
        hmac.update(timestamp);
        hmac.update(newLine);
        hmac.update(accessKey);
        const signature = hmac.digest("base64");

        return signature;
      }

      const key = makeSignature(accessKey, secretKey, method, uri, timestamp);

      const headers = {
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-iam-access-key": accessKey,
        "x-ncp-apigw-signature-v2": key,
      };
      function decryptData(cipherText) {
        const { decryptKey, decryptIv } = getParams();
        const [authTag, encryptedText] = cipherText.split(":");
        const decipher = crypto.createDecipheriv(
          process.env.DECIPHER_KEY,
          decryptKey,
          decryptIv
        );
        decipher.setAuthTag(Buffer.from(authTag, "hex"));
        const decrypted = decipher.update(encryptedText, "hex", "utf-8");
        return decrypted + decipher.final("utf-8");
      }
      function getParams() {
        const decryptKey = Buffer.from(process.env.ENCRYPT_KEY);
        const decryptIv = Buffer.from(process.env.ENCRYPT_IV);
        return {
          decryptKey,
          decryptIv: Buffer.from(`${decryptIv}`, "hex"),
        };
      }

      let count = 0;
      for (const result of accessData) {
        const decryptedMaleNumber = decryptData(result.male_number);
        console.log("Decrypted Male Number:", decryptedMaleNumber);
        const decryptedFemaleNumber = decryptData(result.female_number);
        console.log("Decrypted Female Number:", decryptedFemaleNumber);

        const body = {
          type: "LMS",
          contentType: "COMM",
          countryCode: "82",
          from: process.env.NCP_SENS_MOBILE_NUMBER,
          subject: "성사 안내",
          content: "성사 안내 컨텐츠",
          messages: [
            {
              to: decryptedMaleNumber,
              subject: "[온리유]",
              content: msg,
            },
            {
              to: decryptedFemaleNumber,
              subject: "[온리유]",
              content: msg,
            },
          ],
        };

        // TODO 문자발송 ******
        // console.log("@@@@ test @@@");
        const response = await axios.post(url, body, { headers });
        console.log("@@@@ response @@@", response.data);

        // 결과 카운트
        count++;
        // TODO 디스코드 ******
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {
          content: `female: ${decryptedFemaleNumber} male: ${decryptedMaleNumber} ${count}쌍 문자발송완료`,
        });
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
