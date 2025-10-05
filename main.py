from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
from buscar_recetas import buscar_recetas, limpiar_stopwords
from opensearch_client import client  
import os

app = FastAPI(title="Buscador de Recetas")

host = os.getenv('OPENSEARCH_HOST', 'localhost')
port = int(os.getenv('OPENSEARCH_PORT', 443))
user = os.getenv('OPENSEARCH_USERNAME', 'admin')
password = os.getenv('OPENSEARCH_PASSWORD', 'admin')


@app.get("/")
def read_root():
    return {"message": "Hola FastAPI"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/buscar")
def buscar(query: str = Query(..., description="Palabras clave para buscar recetas")):
    try:
        texto_filtrado = limpiar_stopwords(query)
        resultados = buscar_recetas(texto_filtrado, return_hits=True)  # usamos versión modificada
        return {"resultados": resultados}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/ping")
def ping_opensearch():
    try:
        if client.ping():
            return {"status": "OpenSearch OK"}
        else:
            return {"status": "OpenSearch no responde"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/admin/reindexar")
def reindexar():
    try:
        from scripts.firestore_to_opensearch import exportar_e_indexar_recetas, crear_indice_con_sinonimos
        crear_indice_con_sinonimos()
        exportar_e_indexar_recetas()
        return {"status": "Recetas reindexadas correctamente"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
