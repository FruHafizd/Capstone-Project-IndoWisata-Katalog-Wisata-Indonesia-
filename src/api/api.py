from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os
import numpy as np
import pandas as pd
import time
from threading import Thread
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Global paths ===
model_path = os.path.join(os.path.dirname(__file__), '../ml/model.pkl')
csv_path = 'src/ml/datasets/wisata_indonesia.csv'

# === Global variables ===
model = None
visit_df = None
user_similarity = None
user_ids = None
places = None
attribute_df = None
attribute_similarity = None
wisata_df = None
last_loaded_time = None
last_modified_time = None

# === Load model safely ===
def load_model(retry=5, delay=1.0):
    global model, visit_df, user_similarity, user_ids, places, attribute_df, attribute_similarity, wisata_df, last_loaded_time, last_modified_time

    for attempt in range(retry):
        try:
            file_size = os.path.getsize(model_path)
            if file_size == 0:
                raise ValueError("File model.pkl masih kosong, menunggu...")

            with open(model_path, 'rb') as model_file:
                model = pickle.load(model_file)

            visit_df = model["visit_df"]
            user_similarity = model["user_similarity"]
            user_ids = model["user_ids"]
            places = model["places"]
            attribute_df = model["attribute_df"]
            attribute_similarity = model["attribute_similarity"]

            wisata_df = pd.read_csv(csv_path)

            last_loaded_time = time.time()
            last_modified_time = os.path.getmtime(model_path)

            print("✅ Model dan CSV berhasil dimuat.")
            return
        except Exception as e:
            print(f"⚠️ Gagal memuat model (percobaan ke-{attempt + 1}): {e}")
            if attempt < retry - 1:
                time.sleep(delay)
            else:
                raise e

# === Initial load ===
load_model()

# === Watchdog: auto-reload if model changes ===
class ModelFileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if os.path.abspath(event.src_path) == os.path.abspath(model_path):
            print("🔁 Deteksi perubahan model.pkl, reload model di memori...")
            try:
                load_model()
            except Exception as e:
                print(f"❌ Gagal reload model: {e}")

def start_watchdog():
    event_handler = ModelFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(model_path), recursive=False)
    observer.start()

    print(f"📂 Monitoring {model_path} untuk perubahan...")
    Thread(target=observer.join).start()

start_watchdog()

@app.get("/")
def read_root():
    return JSONResponse(content={"message": "🎉 IndoWisata API is running!"})

@app.get("/status")
def get_status():
    return {
        "status": "ok",
        "last_loaded": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(last_loaded_time)) if last_loaded_time else None,
        "last_modified": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(last_modified_time)) if last_modified_time else None,
        "model_path": os.path.abspath(model_path)
    }

# === Endpoint rekomendasi ===
@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str, top_n: int = 15):
    recommended_places = {}

    if user_id in user_ids:
        user_index = user_ids.index(user_id)
        similarities = user_similarity[user_index]
        similar_users_indices = np.argsort(similarities)[::-1][1:]

        user_visited_places = set(visit_df.columns[visit_df.loc[user_id] > 0])

        for idx in similar_users_indices:
            other_user_id = user_ids[idx]
            other_user_places = visit_df.loc[other_user_id]

            for place_id, count in other_user_places.items():
                if place_id not in user_visited_places and count > 0:
                    if place_id not in recommended_places:
                        recommended_places[place_id] = 0
                    recommended_places[place_id] += count * similarities[idx]
    else:
        if user_id not in attribute_df.index:
            raise HTTPException(status_code=404, detail="User ID tidak ditemukan di data atribut.")

        user_index = attribute_df.index.get_loc(user_id)
        similarities = attribute_similarity[user_index]
        similar_users_indices = np.argsort(similarities)[::-1]

        for idx in similar_users_indices:
            other_user_id = attribute_df.index[idx]
            if other_user_id in visit_df.index:
                other_user_places = visit_df.loc[other_user_id]
                for place_id, count in other_user_places.items():
                    if count > 0:
                        if place_id not in recommended_places:
                            recommended_places[place_id] = 0
                        recommended_places[place_id] += count * similarities[idx]

    sorted_recommendations = sorted(recommended_places.items(), key=lambda x: x[1], reverse=True)
    top_recommendations = [place for place, score in sorted_recommendations[:top_n]]

    recommended_places_detail = []
    for place_id in top_recommendations:
        place_info = wisata_df[wisata_df["name"] == place_id]

        if not place_info.empty:
            tempat = {
                "id": place_info["id"].values[0],
                "name": place_info["name"].values[0],
                "category_id": place_info["category_id"].values[0],
                "address": place_info["address"].values[0],
                "rating": place_info["rating"].values[0],
                "location": place_info["location"].values[0],
                "image_url": place_info["image_url"].values[0],
            }
            recommended_places_detail.append(tempat)
        else:
            print(f"⚠️ Tempat '{place_id}' tidak ditemukan dalam CSV.")

    return {
        "status": "success",
        "message": f"Top rekomendasi untuk {user_id}",
        "data": {
            "places": recommended_places_detail
        }
    }
