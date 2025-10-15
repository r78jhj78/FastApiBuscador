from fastapi import APIRouter, Body, HTTPException
import firebase_admin
from firebase_admin import firestore, credentials, auth
import os
import json
from pydantic import BaseModel
from typing import List
from pydantic import BaseModel
from opensearch_client import client

router = APIRouter()


# 🔹 Modelo de salida de receta
class RecetaOut(BaseModel):
    titulo: str
    ingredientes: List[str]
    descripcion: str
    pasos: str
    likes: int
    popup_clicks: int

# 🔹 Función para convertir string de ingredientes a lista
def string_a_lista(ingredientes_str: str) -> List[str]:
    # Puedes usar split por espacio o por coma según cómo tengas los datos
    return ingredientes_str.split()  # ejemplo: separar por espacios

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
usuarios_ref = db.collection("usuarios")
recetas_ref = db.collection("recetas")

# -------------------------------------------------------------
# 🔹 ENDPOINT: incrementar visualización
# -------------------------------------------------------------
class ViewRequest(BaseModel):
    uid: str

# @router.post("/receta/{receta_id}/view")
# def incrementar_view(receta_id: str, request: ViewRequest):
#     uid = request.uid
#     receta_ref = db.collection("recetas").document(receta_id)
#     user_ref = db.collection("usuarios").document(uid)

#     receta_ref.update({"views": firestore.Increment(1), "popup_clicks": firestore.Increment(1)})
#     user_ref.set({"vistas": firestore.ArrayUnion([receta_id])}, merge=True)

#     return {"message": f"✅ Se incrementó la vista de la receta {receta_id}"}
@router.post("/receta/{receta_id}/view")
def incrementar_view(receta_id: str, request: ViewRequest):
    uid = request.uid
    receta_ref = recetas_ref.document(receta_id)
    user_ref = usuarios_ref.document(uid)

    # Incrementar popup_clicks en la receta (sigue igual)
    receta_ref.update({"popup_clicks": firestore.Increment(1)})

    user_vista_ref = user_ref.collection("vistas").document(receta_id)

    def transaction_fn(transaction):
        # obtener contador actual de la subcolección
        doc = transaction.get(user_vista_ref)
        contador = doc.get("contador") if doc.exists else 0
        nuevo_contador = contador + 1
        transaction.set(user_vista_ref, {"contador": nuevo_contador})

        # actualizar solo la clave concreta en el documento principal (safe)
        transaction.update(user_ref, {f"vistas.{receta_id}": nuevo_contador})

    db.run_transaction(transaction_fn)

    return {"message": f"✅ Vista registrada para la receta {receta_id}"}

class LikeRequest(BaseModel):
    uid: str

@router.post("/receta/{receta_id}/like")
def dar_like(receta_id: str, request: LikeRequest):
    uid = request.uid
    receta_ref = db.collection("recetas").document(receta_id)
    user_ref = db.collection("usuarios").document(uid)

    receta_doc = receta_ref.get()
    if not receta_doc.exists:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    user_doc = user_ref.get().to_dict() or {}
    likes_actuales = user_doc.get("likes", [])

    if receta_id in likes_actuales:
        return {"message": "❌ Ya diste like a esta receta"}

    receta_ref.update({
        "likes": firestore.Increment(1),
        f"liked_by.{uid}": True
    })
    user_ref.set({"likes": firestore.ArrayUnion([receta_id])}, merge=True)

    # 🔹 Sincronizar con OpenSearch usando ID real de Firestore
    try:
        receta_data = receta_ref.get().to_dict()
        nuevo_like_count = receta_data.get("likes", 0)
        client.update(
            index="recetas",
            id=receta_id,
            body={"doc": {"likes": nuevo_like_count}}
        )
    except Exception as e:
        print(f"⚠️ Error actualizando likes en OpenSearch: {e}")

    return {"message": f"❤️ Like agregado a la receta {receta_id}"}

@router.post("/receta/{receta_id}/unlike")
def quitar_like(receta_id: str, request: LikeRequest):
    uid = request.uid
    receta_ref = db.collection("recetas").document(receta_id)
    user_ref = db.collection("usuarios").document(uid)

    receta_doc = receta_ref.get()
    if not receta_doc.exists:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    user_doc = user_ref.get().to_dict() or {}
    likes_actuales = user_doc.get("likes", [])

    if receta_id not in likes_actuales:
        return {"message": "⚠️ No habías dado like a esta receta"}

    receta_ref.update({
        "likes": firestore.Increment(-1),
        f"liked_by.{uid}": firestore.DELETE_FIELD
    })
    user_ref.update({"likes": firestore.ArrayRemove([receta_id])})

    try:
        receta_data = receta_ref.get().to_dict()
        nuevo_like_count = receta_data.get("likes", 0)
        client.update(
            index="recetas",
            id=receta_id,
            body={"doc": {"likes": nuevo_like_count}}
        )
    except Exception as e:
        print(f"⚠️ Error actualizando likes en OpenSearch: {e}")

    return {"message": f"💔 Like quitado de la receta {receta_id}"}


@router.get("/recetas/{receta_id}")
def get_receta_por_id(receta_id: str):
    doc = db.collection("recetas").document(receta_id).get()
    if doc.exists:
        return doc.to_dict()
    return {"error": "Receta no encontrada"}

from fastapi import Query
from buscar_recetas import buscar_recetas  # Importá tu función de búsqueda
from buscar_recetas import limpiar_stopwords, buscar_recetas

@router.get("/buscar_ids")
def buscar_ids(query: str = Query(..., min_length=1)):
    query_limpia = limpiar_stopwords(query)
    recetas = buscar_recetas(query_limpia, return_hits=True)
    ids = [receta["id"] for receta in recetas]
    return {"ids": ids}

@router.get("/usuario/{uid}/interacciones")
def obtener_interacciones(uid: str):
    doc = usuarios_ref.document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = doc.to_dict()
    likes = data.get("likes", [])
    vistas = data.get("vistas", [])

    # ✅ Verificamos que sean listas
    if not isinstance(likes, list):
        likes = []
    if not isinstance(vistas, list):
        vistas = []

    recetas_likeadas = []
    recetas_vistas = []

    # Evitar crash si una receta ya no existe
    for id in likes:
        receta_doc = recetas_ref.document(id).get()
        if receta_doc.exists:
            recetas_likeadas.append(receta_doc.to_dict())

    for id in vistas:
        receta_doc = recetas_ref.document(id).get()
        if receta_doc.exists:
            recetas_vistas.append(receta_doc.to_dict())

    return {
        "likes": recetas_likeadas,
        "vistas": recetas_vistas
    }



