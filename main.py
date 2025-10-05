from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
from buscar_recetas import buscar_recetas, limpiar_stopwords
from fastapi import FastAPI
from opensearchpy import OpenSearch
import os

app = FastAPI(title="Buscador de Recetas")

host = os.getenv('OPENSEARCH_HOST', 'localhost')
port = int(os.getenv('OPENSEARCH_PORT', 443))
user = os.getenv('OPENSEARCH_USERNAME', 'admin')
password = os.getenv('OPENSEARCH_PASSWORD', 'admin')

client = OpenSearch(
    hosts=[{"host": host, "port": port}],
    http_auth=(user, password),
    use_ssl=True,
    verify_certs=True,
)

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