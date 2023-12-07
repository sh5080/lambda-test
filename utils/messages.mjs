import axios from "axios";
import * as crypto from "./crypto.mjs";
import * as script from "./messageScript.mjs";

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

const targetSelectMessage =
  script.NonSelectScript.getNonSelectTargetSelectMessage();
const nonSelectMessage = script.NonSelectScript.getNonSelectMessage();
const dormantMessage = script.NonSelectScript.getDormantMessage();

// ****** 미선택 / 수락 요청 메세지 ******
export async function sendNonSelect(mobileNumber) {
  let sendCount = 0;
  const decryptedNumber = crypto.decryptData(mobileNumber);

  const body = {
    type: "LMS",
    contentType: "COMM",
    countryCode: "82",
    from: process.env.NCP_SENS_MOBILE_NUMBER,
    subject: "성사 안내",
    content: "성사 안내 컨텐츠",
    messages: [
      {
        to: decryptedNumber,
        subject: "[온리유]",
        content: nonSelectMessage,
      },
    ],
  };

  // TODO 문자발송 ******
  const response = await axios.post(url, body, { headers });
  console.log("@@@@ response @@@", response.data);

  // 결과 카운트
  sendCount++;

  // TODO 디스코드 ******
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `수락 요청 메세지 (상대방 미선택)/ 번호: ${decryptedNumber} ${sendCount}명 발송완료`,
  });
}

// ****** 미선택 / 상대방 수락 메세지 ******
export async function sendAcceptence(mobileNumber) {
  let sendCount = 0;
  const decryptedNumber = crypto.decryptData(mobileNumber);

  const body = {
    type: "LMS",
    contentType: "COMM",
    countryCode: "82",
    from: process.env.NCP_SENS_MOBILE_NUMBER,
    subject: "성사 안내",
    content: "성사 안내 컨텐츠",
    messages: [
      {
        to: decryptedNumber,
        subject: "[온리유]",
        content: targetSelectMessage,
      },
    ],
  };

  // TODO 문자발송 ******
  const response = await axios.post(url, body, { headers });
  console.log("@@@@ response @@@", response.data);

  // 결과 카운트
  sendCount++;

  // TODO 디스코드 ******
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `수락 요청 메세지 (상대방 선택)/ 번호: ${decryptedNumber} ${sendCount}명 발송완료`,
  });
}

// ****** 미선택 / 수락 가능 기간 지난 후 메세지 ******
export async function sendDormant(mobileNumber) {
  let sendCount = 0;
  const decryptedNumber = crypto.decryptData(mobileNumber);

  const body = {
    type: "LMS",
    contentType: "COMM",
    countryCode: "82",
    from: process.env.NCP_SENS_MOBILE_NUMBER,
    subject: "성사 안내",
    content: "성사 안내 컨텐츠",
    messages: [
      {
        to: decryptedNumber,
        subject: "[온리유]",
        content: dormantMessage,
      },
    ],
  };

  // TODO 문자발송 ******
  const response = await axios.post(url, body, { headers });
  console.log("@@@@ response @@@", response.data);

  // 결과 카운트
  sendCount++;

  // TODO 디스코드 ******
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `휴면 예정 / 번호: ${decryptedNumber} ${sendCount}명 발송완료`,
  });
}
