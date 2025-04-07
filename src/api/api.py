from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os
import numpy as np

app = FastAPI()

# Middleware CORS untuk mengizinkan akses dari frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan domain frontend jika sudah deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Load model saat startup ===
model_path = os.path.join(os.path.dirname(__file__), '../../model.pkl')

try:
    with open(model_path, 'rb') as model_file:
        model = pickle.load(model_file)

    visit_df = model["visit_df"]
    user_similarity = model["user_similarity"]
    user_ids = model["user_ids"]
    places = model["places"]
    attribute_df = model["attribute_df"]
    attribute_similarity = model["attribute_similarity"]

    print("✅ Model berhasil dimuat.")
except Exception as e:
    print(f"❌ Gagal memuat model: {e}")
    raise e

# === Endpoint default ===
@app.get("/")
def read_root():
    return JSONResponse(content={"message": "🎉 IndoWisata API is running!"})

# === Endpoint rekomendasi (sudah diperbaiki) ===
@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str, top_n: int = 10):
    if user_id not in user_ids:
        raise HTTPException(status_code=404, detail="User ID tidak ditemukan dalam model.")

    user_index = user_ids.index(user_id)
    similarities = user_similarity[user_index]

    similar_users_indices = np.argsort(similarities)[::-1][1:]  # skip dirinya sendiri

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

    return {
        "status": "success",
        "data": {
            "user_id": user_id,
            "recommendations": top_recommendations
        }
    }
