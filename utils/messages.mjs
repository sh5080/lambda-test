import axios from "axios";
import * as crypto from "./crypto.mjs";

const url = process.env.NCP_SENS_URL_LOGIN;
const serviceId = process.env.NCP_SENS_SERVICE_ID_LOGIN;
const accessKey = process.env.NCP_API_ACCESS_KEY;
const secretKey = process.env.NCP_API_SECRET_KEY;

const method = "POST";
const uri = `/sms/v2/services/${serviceId}/messages`;
const timestamp = Date.now().toString();

const key = crypto.makeSignature(accessKey, secretKey, method, uri, timestamp);

const headers = {
  "x-ncp-apigw-timestamp": timestamp,
  "x-ncp-iam-access-key": accessKey,
  "x-ncp-apigw-signature-v2": key,
};

export async function sendAccessSMS(accessData) {
  const accessMessage = `'''축하드립니다! 매칭이 성사되셨습니다.
아래 링크에서 인연의 연락처를 확인해보세요:)

https://only-you.co.kr

매너 있는 ONLYou만의 문화를 위해 몇 가지 주의사항을 안내드릴게요!!

- 매너 있는 채팅 및 대화 부탁드려요
- 술, 자취 관련 이야기는 자제해주세요
- 답장이 느리다고 지속적으로 연락을 하거나, 동의 없이 전화를 거는 행위는 자제해주세요
- 이유 없는 지각과 잠수를 주의해주세요 서로에게 좋은 인상으로 남도록 함께 노력해요.

ONLYou의 시작과 함께해주셔서 정말 감사합니다.'''`;

  let accessCount = 0;

  for (const result of accessData) {
    const decryptedMaleNumber = crypto.decryptData(result.male_number);
    console.log("Decrypted Male Number:", decryptedMaleNumber);
    const decryptedFemaleNumber = crypto.decryptData(result.female_number);
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
          content: accessMessage,
        },
        {
          to: decryptedFemaleNumber,
          subject: "[온리유]",
          content: accessMessage,
        },
      ],
    };

    // TODO 문자발송 ******
    const response = await axios.post(url, body, { headers });
    console.log("@@@@ response @@@", response.data);

    // 결과 카운트
    accessCount++;

    // TODO 디스코드 ******
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      content: `female: ${decryptedFemaleNumber} male: ${decryptedMaleNumber} ${count}쌍 문자발송완료`,
    });
  }
}
