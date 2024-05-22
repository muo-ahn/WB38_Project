# WB38_Project

## Summary
- Front : React.js
- Backend : Node.js, FastAPI, Triton Inference Server
- AI : Tensorflow

==================================================

WB38_Team2_Project

Project Leader : 안동혁

Project Members : 권순호, 이현수, 김경익, 문성현, 황수영

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

0. Craete table

CREATE TABLE userTable (
id int(12) NOT NULL AUTO_INCREMENT,
username varchar(50) NOT NULL,
password varchar(255) NOT NULL DEFAULT 'no_password_set',
salt varchar(255) NOT NULL DEFAULT 'no_salt_set',
email varchar(255),
provider varchar(255) DEFAULT 'local',
PRIMARY KEY(id),
INDEX idx_username (username)
) charset=utf8;

CREATE TABLE userHistory (
username VARCHAR(50) NOT NULL,
image LONGBLOB NOT NULL,
petname VARCHAR(50) NOT NULL,
petbreed VARCHAR(50) NOT NULL,
usertext TEXT NOT NULL,
diseaseid VARCHAR(10) default 'nor',
historyid INT(12) NOT NULL auto_increment,
createdtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(historyid),
FOREIGN KEY (username) REFERENCES userTable(username)
) CHARSET=utf8;

ALTER TABLE userHistory
ADD COLUMN diseasepossibility FLOAT DEFAULT 0;

1. To run Node.JS Main Server: run the Main.js in NodeJS directory.

2. To run FastAPI Server: Open the terminal, Command "cd FastAPI", "uvicorn main:app --reload --host=0.0.0.0 --port=9000"

3. Unzip the models.zip

4. Install Triton Inference Server HTTP Port : 8000 into your local

5. Run Triton Inference Sever with models

6. You can run the test

7.
