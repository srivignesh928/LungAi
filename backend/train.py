import os
import tensorflow as tf
from tensorflow.keras import layers, Model
import numpy as np

# ==========================================
# 1. SETUP DATASET PATHS
# ==========================================
# YOU MUST UPDATE THESE PATHS to point to where your images are saved.
DATASET_DIR = "path/to/your/dataset/folder"

# Example: If your classes are Normal, Pneumonia, Covid,
# your folders should be structured like:
# dataset/Normal/
# dataset/Pneumonia/
# dataset/Covid/
CLASS_NAMES = ["Normal", "Pneumonia", "Covid"]
NUM_CLASSES = len(CLASS_NAMES)
IMAGE_SIZE = (128, 128)
BATCH_SIZE = 32

print("🚀 Starting Multimodal Training Script...")

# ==========================================
# 2. DEFINING THE MULTIMODAL ARCHITECTURE
# ==========================================
def build_multimodal_model():
    # --- Input 1: X-ray Image ---
    xray_input = layers.Input(shape=(128, 128, 3), name="xray_input")
    x = layers.Conv2D(32, (3, 3), activation='relu')(xray_input)
    x = layers.MaxPooling2D(2, 2)(x)
    x = layers.Conv2D(64, (3, 3), activation='relu')(x)
    x = layers.MaxPooling2D(2, 2)(x)
    x = layers.Flatten()(x)
    xray_features = layers.Dense(64, activation='relu')(x)

    # --- Input 2: CT Scan Image ---
    ct_input = layers.Input(shape=(128, 128, 3), name="ct_input")
    y = layers.Conv2D(32, (3, 3), activation='relu')(ct_input)
    y = layers.MaxPooling2D(2, 2)(y)
    y = layers.Conv2D(64, (3, 3), activation='relu')(y)
    y = layers.MaxPooling2D(2, 2)(y)
    y = layers.Flatten()(y)
    ct_features = layers.Dense(64, activation='relu')(y)

    # --- Input 3: Metadata (Age, Gender) ---
    meta_input = layers.Input(shape=(2,), name="meta_input")
    z = layers.Dense(16, activation='relu')(meta_input)
    meta_features = layers.Dense(16, activation='relu')(z)

    # --- Combine all inputs ---
    combined = layers.concatenate([xray_features, ct_features, meta_features])
    
    # --- Final Classification Layers ---
    final_dense = layers.Dense(128, activation='relu')(combined)
    final_dense = layers.Dropout(0.5)(final_dense) # Dropout helps prevent over-predicting the majority class!
    output = layers.Dense(NUM_CLASSES, activation='softmax', name="output")(final_dense)

    # Create the model
    model = Model(inputs=[xray_input, ct_input, meta_input], outputs=output)
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

# ==========================================
# 3. DATA LOADING (CUSTOM GENERATOR EXAMPLE)
# ==========================================
# Because we have 3 inputs (X-ray, CT, Meta), we can't just use standard `image_dataset_from_directory`.
# You will likely need to write a custom generator or use `tf.data.Dataset` if you have a CSV linking 
# an X-ray image to its corresponding CT scan and patient Age/Gender.

def dummy_data_generator(num_samples=100):
    """
    This is a DUMMY data generator to prove the model can train.
    You MUST replace this with your actual image finding logic by matching X-rays to CT scans using your filenames or CSV!
    """
    # Create fake arrays of correct shapes
    xray_data = np.random.rand(num_samples, 128, 128, 3).astype('float32')
    ct_data = np.random.rand(num_samples, 128, 128, 3).astype('float32')
    
    # Age (0-100), Gender (0=Male, 1=Female)
    ages = np.random.randint(20, 80, size=(num_samples, 1))
    genders = np.random.randint(0, 2, size=(num_samples, 1))
    meta_data = np.hstack((ages, genders)).astype('float32')
    
    # Random labels (0=Normal, 1=Pneumonia, 2=Covid)
    labels = np.random.randint(0, NUM_CLASSES, size=(num_samples,))
    
    return [xray_data, ct_data, meta_data], labels

# ==========================================
# 4. TRAINING THE MODEL
# ==========================================
if __name__ == "__main__":
    print("Building model architecture...")
    model = build_multimodal_model()
    model.summary()
    
    print("\nLoading data (Using DUMMY generator for template)...")
    # REPLACE `dummy_data_generator` WITH YOUR REAL DATA LOADING CODE (e.g. from Pandas CSV)
    X_train, y_train = dummy_data_generator(num_samples=500)
    
    print("\nStarting Training...")
    # NOTE: Set epochs higher (e.g. 50 or 100) when training for real!
    # Class weights parameter is extremely important if you have 90% Normal and 10% Pneumonia!
    # Example: class_weight = {0: 1.0, 1: 5.0, 2: 5.0} -> forces model to care 5x more about Pneumonia/Covid.
    model.fit(
        x=X_train, 
        y=y_train, 
        batch_size=BATCH_SIZE, 
        epochs=10, 
        validation_split=0.2,
        # class_weight={0: 1.0, 1: 3.0, 2: 3.0} # UNCOMMENT THIS TO PREVENT "NORMAL" OVERPREDICTION!
    )
    
    # ==========================================
    # 5. SAVING MODEL OVER OLD ONE
    # ==========================================
    save_path = os.path.join(os.path.dirname(__file__), "models", "final_model.keras")
    print(f"\nSaving newly trained multimodal model to {save_path} ...")
    model.save(save_path)
    print("✅ Model Retraining Complete!")
