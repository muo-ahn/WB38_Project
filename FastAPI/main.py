#main.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import tensorflow as tf

app = FastAPI()

@app.post("/")
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port = 9000)
    