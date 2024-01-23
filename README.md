# WB38_Project

WB38_Team2_Project

Project Leader : 안동혁

Project Members : 권순호, 이현수, 김경익, 문성현, 황수영

==================================================

12th Dec, 안동혁 : server file upload logic works.

13th Dec, 안동혁 : passport, localStrategy 완료

14th Dec, 안동혁 : Node.js process.env 환경 변수 설정, password hashing 오류 해결

15th Dec, 안동혁 : file module finish

19th Dec, 안동혁 : Kakao, Naver passport

20th Dec, 안동혁 : try to run Triton Inference Server

06th Jan, 안동혁 : Triton, Rasa server 연결 성공

15th Jan, 안동혁 : input 전처리 및 정규화 서버 분할 - node.js tensorflow/tfjs-node 패키지 설치 오류

==================================================
참고 서적 및 사이트

Node.js basic :

- Nomadcoder : nomadcoders.co

- 생활코딩 : gakari.tistory.com

Node.js Middleware :

- https://inpa.tistory.com/

==================================================

Goal

1.  안구, 피부, 복부, 흉부, 근골격 데이터 학습

    - 현재 안구와 피부 진행 중 : 안구, 일부 흉부 모델 제외 완료

2.  Chatbot can work as a real vet {

    To make it.

        - Get some basic information from clients for our AI module. : 완료

        - Get Image data(disease of client's dog or cat) from client. : 완료

        - Get disease data from prediction of the AI Module. : 완료

        - Get Data from disease DB table of the certain disease. : 완료

        - Make a chat with those data. : Rasa 챗봇 이용해 완료

}

==================================================

How to use

1. To run Node.JS Main Server: Open the termianl. Command "cd NodeJS", "forever start Main.js"

2. To run FastAPI Server: Open the terminal, Command "cd FastAPI", "uvicorn main:app --reload --host=0.0.0.0 --port=9000"

3. Unzip the models.zip

4. Install Triton Inference Server HTTP Port : 8000 into your local

5. Run Triton Inference Sever with models

6. You can run the test
