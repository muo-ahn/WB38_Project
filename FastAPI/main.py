#main.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import tensorflow as tf
import cv2

app = FastAPI()

@app.post("/postprocess")
async def preprocess(data: dict):
    try:
        bytes_data = bytes(data['bytes_image']['data'])
        resize = data['resize']

        image = tf.image.decode_jpeg(bytes_data, channels=3)
        image = tf.image.resize(image, resize)
        image = tf.cast(image, tf.float32)
        image = image / float(255)
        image = tf.expand_dims(image, axis=0)

        processed_data_tensor = tf.cast(image[0], tf.float32)
        processed_data_flat = tf.reshape(processed_data_tensor, [-1]).numpy()

        return JSONResponse({'processedData': processed_data_flat.tolist()})
    except Exception as e:
        return JSONResponse({'error': str(e)})

@app.post("extractimage")
async def extractimage(video_path: dict):
    try:
        arr_image_data = []
        video = cv2.VideoCapture(video_path)
        fps = int(video.get(cv2.CAP_PROP_FPS))
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        
        for i in range(frame_count):
            ret, frame = video.read()
            if ret and i % int(fps * 1) == 0:  # 1초 단위로 프레임을 저장
            # if ret and i % int(fps / 2) == 0:  # 0.5초 단위로 프레임을 저장
            ## frame은 이미 이미지 데이터(numpy array)인 상태
                image = frame
                ###이미지 데이터 배열에 저장 
                arr_image_data.append(image)

        return JSONResponse({'extractedImage' : arr_image_data})
    except Exception as e:
        return JSONResponse({'error': str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port = 9000)
    