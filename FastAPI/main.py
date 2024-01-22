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

@app.post("/extractimage")
async def extractimage(data: dict):
    try:
        arr_image_paths  = []
        video = cv2.VideoCapture(data['video'])
        fps = int(video.get(cv2.CAP_PROP_FPS))
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        
        for i in range(frame_count):
            ret, frame = video.read()
            if ret and i % int(fps * 1) == 0:
                # Save the extracted image to Multer storage with numbering
                image_filename = f'./NodeJS/uploadFiles/extracted_image{i}.jpg'
                cv2.imwrite(image_filename, frame)
                arr_image_paths.append(image_filename)

        return JSONResponse({'extractedImages': arr_image_paths})
    except Exception as e:
        return JSONResponse({'error': str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port = 9000)
    