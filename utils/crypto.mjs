import * as crypto from "crypto";

export function decryptData(cipherText) {
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

export function getParams() {
  const decryptKey = Buffer.from(process.env.ENCRYPT_KEY);
  const decryptIv = Buffer.from(process.env.ENCRYPT_IV);
  return {
    decryptKey,
    decryptIv: Buffer.from(`${decryptIv}`, "hex"),
  };
}

export function makeSignature(accessKey, secretKey, method, uri, timestamp) {
  const space = " ";
  const newLine = "\n";
  const hmac = crypto.createHmac("sha256", Buffer.from(secretKey, "utf-8"));

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
