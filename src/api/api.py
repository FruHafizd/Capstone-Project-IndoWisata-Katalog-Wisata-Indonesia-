from fastapi import FastAPI, HTTPException, Query
import requests
import joblib
import pandas as pd
import numpy as np

app = FastAPI()

# === Load Models ===
model_bcf_path = "src/ml/modelbcf.pkl"
model_cf_path = "src/ml/modelcf.pkl"

knn_bcf, df_bcf = joblib.load(model_bcf_path)
model_cf_bundle = joblib.load(model_cf_path)

knn_cf = model_cf_bundle["knn"]
encoder_cf = model_cf_bundle["encoder"]
user_ids_cf = model_cf_bundle["user_ids"]
visit_data_cf = model_cf_bundle["visit_data"]

# === Load Wisata Data ===
wisata_df = pd.read_csv("src/ml/datasets/wisata_indonesia.csv")

# === Helper to Format Response ===
def format_recommendation_response(place_names, n, user_name, user_id):
    matched_places = wisata_df[wisata_df["name"].isin(place_names)]
    places_output = []
    for name in place_names:
        row = matched_places[matched_places["name"] == name]
        if not row.empty:
            place_data = row.iloc[0]
            places_output.append({
                "id": place_data["id"],
                "name": place_data["name"],
                "category_id": place_data["category_id"],
                "address": place_data["address"],
                "rating": str(place_data["rating"]),
                "location": eval(place_data["location"]),
                "image_url": place_data["image_url"]
            })
    return {
        "status": "success",
        "message": f"Rekomendasi untuk {user_name} ({user_id})",
        "data": {
            "places": places_output
        }
    }

@app.get("/recommendations/")
def get_recommendations(user_id: str = Query(...), n_neighbors: int = 3, n_recommendations: int = 15):
    # Ambil data eksternal
    users_api = "http://localhost:3000/api/users"
    visits_api = "http://localhost:3000/api/userVisits"

    try:
        users_response = requests.get(users_api).json()["data"]["users"]
        visits_response = requests.get(visits_api).json()["data"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data eksternal: {str(e)}")

    user_data = next((u for u in users_response if u["id"] == user_id), None)
    if not user_data:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")

    user_name = user_data["name"]

    if user_id in visits_response and visits_response[user_id].get("visits"):
        # === Gunakan model BCF ===
        new_user_visits = visits_response[user_id]["visits"]
        new_user_df = pd.DataFrame([new_user_visits])
        new_user_df = new_user_df.reindex(columns=df_bcf.columns, fill_value=0)

        distances, indices = knn_bcf.kneighbors(new_user_df, n_neighbors=n_neighbors)
        visited_places = set(new_user_visits.keys())
        recommendation_scores = {}

        for user_sim in [df_bcf.index[i] for i in indices[0]]:
            for place, count in df_bcf.loc[user_sim].items():
                if place not in visited_places and count > 0:
                    recommendation_scores[place] = recommendation_scores.get(place, 0) + count

        sorted_recommendations = sorted(recommendation_scores.items(), key=lambda x: x[1], reverse=True)
        top_places = [place for place, _ in sorted_recommendations[:n_recommendations]]
        return format_recommendation_response(top_places, n_recommendations, user_name, user_id)

    else:
        # === Gunakan model CF ===
        profile = {
            "age": user_data["age"],
            "occupation": user_data["occupation"],
            "marital_status": user_data["marital_status"],
            "hobby": user_data["hobby"]
        }

        user_df = pd.DataFrame([profile])
        encoded = encoder_cf.transform(user_df[["occupation", "marital_status", "hobby"]]).toarray()
        features = np.hstack([user_df["age"].values.reshape(-1, 1), encoded])

        distances, indices = knn_cf.kneighbors(features, n_neighbors=n_neighbors)
        recommended_places = {}

        for idx in indices[0]:
            similar_user_id = user_ids_cf[idx]
            visits = visit_data_cf.get(similar_user_id, {}).get("visits", {})
            for place, count in visits.items():
                recommended_places[place] = recommended_places.get(place, 0) + count

        sorted_places = sorted(recommended_places.items(), key=lambda x: x[1], reverse=True)
        top_places = [place for place, _ in sorted_places[:n_recommendations]]
        return format_recommendation_response(top_places, n_recommendations, user_name, user_id)
