from fastapi import APIRouter, Body, HTTPException
import firebase_admin
from firebase_admin import firestore, credentials, auth
import os
import json
from pydantic import BaseModel

router = APIRouter()

# 🔥 Inicializar Firebase solo si no está inicializado
if not firebase_admin._apps:
    firebase_cred_json = os.getenv("FIREBASE_CREDENTIALS")
    if not firebase_cred_json:
        raise Exception("No se encontró la variable FIREBASE_CREDENTIALS")
    cred_dict = json.loads(firebase_cred_json)
    cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()


# -------------------------------------------------------------
# 🔹 ENDPOINT: incrementar visualización
# -------------------------------------------------------------
@router.post("/receta/{receta_id}/view")
def incrementar_view(receta_id: str, uid: str = Body(...)):
    """
    Incrementa el contador de visualizaciones globales y guarda el historial del usuario.
    """
    receta_ref = db.collection("recetas").document(receta_id)
    user_ref = db.collection("usuarios").document(uid)

    # Incrementar contador global
    receta_ref.update({
        "views": firestore.Increment(1)
    })
    receta_ref.update({
        "popup_clicks": firestore.Increment(1)
    })

    # Guardar en el historial del usuario
    user_ref.set({
        "vistas": firestore.ArrayUnion([receta_id])
    }, merge=True)

    return {"message": f"✅ Se incrementó la vista de la receta {receta_id}"}


# -------------------------------------------------------------
# 🔹 ENDPOINT: dar like
# -------------------------------------------------------------
class LikeRequest(BaseModel):
    uid: str

@router.post("/receta/{receta_id}/like")
def dar_like(receta_id: str, body: LikeRequest):
    uid = body.uid
    receta_ref = db.collection("recetas").document(receta_id)
    user_ref = db.collection("usuarios").document(uid)

    user_doc = user_ref.get().to_dict() or {}
    likes_actuales = user_doc.get("likes", [])

    if receta_id in likes_actuales:
        return {"message": "❌ Ya diste like a esta receta"}

    receta_ref.update({
        "likes": firestore.Increment(1),
        f"liked_by.{uid}": True
    })

    user_ref.set({
        "likes": firestore.ArrayUnion([receta_id])
    }, merge=True)

    return {"message": f"❤️ Like agregado a la receta {receta_id}"}


# -------------------------------------------------------------
# 🔹 ENDPOINT: quitar like
# -------------------------------------------------------------
@router.post("/receta/{receta_id}/unlike")
def quitar_like(receta_id: str, uid: str = Body(...)):
    """
    Permite quitar el like de una receta si ya lo tenía.
    """
    receta_ref = db.collection("recetas").document(receta_id)
    user_ref = db.collection("usuarios").document(uid)

    user_doc = user_ref.get().to_dict() or {}
    likes_actuales = user_doc.get("likes", [])

    if receta_id not in likes_actuales:
        return {"message": "⚠️ No habías dado like a esta receta"}

    # Reducir contador global en 1
    receta_ref.update({
        "likes": firestore.Increment(-1),
        f"liked_by.{uid}": firestore.DELETE_FIELD
    })

    # Quitar de la lista del usuario
    user_ref.update({
        "likes": firestore.ArrayRemove([receta_id])
    })

    return {"message": f"💔 Like quitado de la receta {receta_id}"}
