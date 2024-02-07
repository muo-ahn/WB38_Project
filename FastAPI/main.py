#main.py
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import tensorflow as tf
import cv2

app = FastAPI()

image_save_directory = os.path.join(os.getcwd(), "NodeJS", "uploadFiles")

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
        arr_image_paths = []
        video_path = data.get('video')

        if not video_path:
            return JSONResponse({'error': 'Video path not provided'})

        video = cv2.VideoCapture(video_path)
        fps = int(video.get(cv2.CAP_PROP_FPS))
        frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        if not os.path.exists(image_save_directory):
            os.makedirs(image_save_directory, exist_ok=True)

        for i in range(frame_count):
            ret, frame = video.read()
            if ret and i % int(fps * 1) == 0:
                image_filename = f'extracted_image{i}.jpg'
                image_filepath = os.path.join(image_save_directory, image_filename)

                # Check if frame contains valid image data
                if frame.any():
                    cv2.imwrite(image_filepath, frame)
                    arr_image_paths.append(image_filepath)
                    print(f'Saved image: {image_filepath}')
                else:
                    print(f'Invalid frame at index {i}')
            else:
                print(f'Read frame failed at index {i}')

        return JSONResponse({'extractedImages': arr_image_paths})
    except Exception as e:
        print(f'Error: {str(e)}')
        return JSONResponse({'error': str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port = 9000)
    