## ONLYou 문자발송 lambda process

### 주의사항

- lambda에 환경변수 적용되어 있으므로 process.env.~~ 그대로 사용할 수 있습니다.
- 필요한 최소한의 라이브러리만 설치되어 있어 로컬 테스트할 경우 직접 환경변수 내용을 넣어서 테스트하거나 dotenv 설치하여 테스트 후 람다에 올릴 땐 추가된 라이브러리는 package.json 에서 지우고 npm install하거나 전부 uninstall 후 업로드 해주세요.

### 진행 프로세스

- npm install하여 필요한 패키지를 설치합니다.

- 해당 앱을 압축합니다. (맥의 경우 finder에서 압축을 하면 MACOSX가 자동으로 같이 압축되어 람다가 정상적으로 작동하지 않습니다. 별도 압축프로그램을 사용하거나 터미널에서 `zip -d 압축파일명.zip "__MACOSX*"` 을 해주시면 압축파일 내부의 MACOSX가 삭제됩니다.)

- AWS Lambda에 접속하여 해당 .zip파일을 업로드합니다.

- AWS EventBridge - 트리거 - cron을 설정하여 시간 예약설정이 가능합니다.
