#https://subbak2.com/21 -> 참조한 사이트

import tensorflow as tf #TensorFlow 선언
mnist = tf.keras.datasets.mnist #TensorFlow의 keras의 DataSet을 가져옴 -> mnist를 가져옴
#mnist -> 사람이 손으로(수기) 작성한 숫자 이미지

(x_train, y_train),(x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

tf.compat.v1.enable_eager_execution()

#모델을 생성
model = tf.keras.models.Sequential([ #Sequential -> 순차적 방식 모델
  tf.keras.layers.Flatten(input_shape=(28, 28)), #28 x 28인 데이터를 1차원 구조로 평탄화
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10, activation='softmax') #Sofemax 회귀
])

#위에서 생성한 모델을 바로 실행
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy', # 다중 분류 손실 함수
              metrics=['accuracy']) #정확도를 측정

model.fit(x_train, y_train, epochs=5) #epochs=5 -> 5번 학습
model.evaluate(x_test, y_test)
