from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os
import numpy as np
import pandas as pd

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Load model ===
model_path = os.path.join(os.path.dirname(__file__), '../ml/model.pkl')
csv_path = 'src/ml/datasets/wisata_indonesia.csv'

try:
    with open(model_path, 'rb') as model_file:
        model = pickle.load(model_file)

    visit_df = model["visit_df"]
    user_similarity = model["user_similarity"]
    user_ids = model["user_ids"]
    places = model["places"]
    attribute_df = model["attribute_df"]
    attribute_similarity = model["attribute_similarity"]

    wisata_df = pd.read_csv(csv_path)

    print("✅ Model dan CSV berhasil dimuat.")
except Exception as e:
    print(f"❌ Gagal memuat model atau CSV: {e}")
    raise e

@app.get("/")
def read_root():
    return JSONResponse(content={"message": "🎉 IndoWisata API is running!"})

# === Endpoint rekomendasi ===
@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str, top_n: int = 15):
    if user_id not in user_ids:
        raise HTTPException(status_code=404, detail="User ID tidak ditemukan dalam model.")

    user_index = user_ids.index(user_id)
    similarities = user_similarity[user_index]
    similar_users_indices = np.argsort(similarities)[::-1][1:]  

    recommended_places = {}
    user_visited_places = set(visit_df.columns[visit_df.loc[user_id] > 0])

    for idx in similar_users_indices:
        other_user_id = user_ids[idx]
        other_user_places = visit_df.loc[other_user_id]

        for place_id, count in other_user_places.items():
            if place_id not in user_visited_places and count > 0:
                if place_id not in recommended_places:
                    recommended_places[place_id] = 0
                recommended_places[place_id] += count * similarities[idx]

    sorted_recommendations = sorted(recommended_places.items(), key=lambda x: x[1], reverse=True)
    top_recommendations = [place for place, score in sorted_recommendations[:top_n]]

    # Ambil detail tempat dari CSV
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
                "image_url": place_info["Image_url"].values[0],
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
