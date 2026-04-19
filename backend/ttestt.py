import tensorflow as tf

model = tf.keras.models.load_model("models/final_model.keras", compile=False)

print(model.input)