# food_detector.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
from transformers import pipeline
import io
from buscar_recetas import buscar_recetas, limpiar_stopwords

router = APIRouter()

# Modelo de clasificación de alimentos (se carga una vez)
modelo_comida = pipeline("image-classification", model="nateraw/food")

@router.post("/buscar_por_imagen")
async def buscar_por_imagen(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # 1. Clasificar imagen
        preds = modelo_comida(image)
        if not preds:
            raise HTTPException(status_code=400, detail="No se pudo detectar el alimento en la imagen")

        # 2. Tomar el más probable
        etiqueta_detectada = preds[0]["label"].lower()

        # 3. Limpiar el texto como se hace en /buscar
        texto_filtrado = limpiar_stopwords(etiqueta_detectada)

        # 4. Buscar recetas como en /buscar
        resultados = buscar_recetas(texto_filtrado, return_hits=True)

        return {
            "ingrediente_detectado": etiqueta_detectada,
            "query_filtrada": texto_filtrado,
            "total_resultados": len(resultados),
            "resultados": resultados
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando la imagen: {str(e)}")
