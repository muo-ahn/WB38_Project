# WB38_Project

WB38_Team2_Project

Project Leader : 안동혁

Project Members : 권순호, 이현수, 김경익, 문성현, 황수영

==================================================

12th Dec 오전, 안동혁 : server에 file upload 동작 확인

12th Dec 오후, 안동혁 : node based server 내, python 모듈 동작 확인

12th Dec 저녁, 안동혁 : 미들웨어 작업 시작 - 미들웨어를 더욱 촘촘히

13th Dec 오전, 안동혁 : passport로 전환 시작

13th Dec 오후, 안동혁 : passport, localStrategy 완료

13th Dec 저녁, 안동혁 : passport, KakaoStrategy 학습

14th Dec 오전, 안동혁 : Node.js process.env 환경 변수 설정, password hashing 오류 해결

14th Dec 오후, 안동혁 : 예외처리 작업

14th Dec 저녁, 안동혁 : 예외처리 작업

15th Dec 오전, 안동혁 : file 모듈 클래스화 및 db 관계 설정

15th Dec 오후, 안동혁 : file 모듈 사용, db에 저장

18th Dec 오전, 안동혁 : file 모듈 버그 해결

18th Dec 오후, 안동혁 : 개인 이미지 게시판 구현

18th Dec 저녁, 안동혁 : kakao passport 준비

19th Dec 오전, 안동혁 : Kakao passport 적용

19th Dec 오후, 안동혁 : Naver passport 적용

19th Dec 저녁, 안동혁 : Chatbot Framework 적용 시도, DialogFlow 사용 결정

20th Dec 오전, 안동혁 : X

20th Dec 오후, 안동혁 : Tensorflow.js 적용 시도, 실패...

20th Dec 저녁, 안동혁 : ai 모델만 서빙하는 fast api 환경 구축 예정

==================================================
참고 서적 및 사이트

Node.js basic :

- Nomadcoder : nomadcoders.co

- 생활코딩 : gakari.tistory.com

Node.js Middleware :

- https://inpa.tistory.com/

==================================================
현재 문제

Node.js 기반 서버이기 때문에, AI 응답 시간에 따라 다른 이용자의 요청이 대기될 수 있다.

복부 데이터셋 문제 발생 - 학습을 추가로 시킬 수 없음.

근골격 모델 구성 환경이 우분투...

==================================================

Goal

1.  안구, 피부, 복부, 흉부, 근골격 데이터 학습

    - 현재 안구와 피부 진행 중.

2.  Chatbot can work as a real vet {

    To make it.

        - Get some basic information from clients for our AI module. : 완료

        - Get Image data(disease of client's dog or cat) from client. : 완료

        - Get disease data from prediction of the AI Module.

        - Get Data from disease DB table of the certain disease. : 완료

        - Make a chat with those data.

}
