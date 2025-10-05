from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .buscar_recetas import buscar_recetas, limpiar_stopwords

app = FastAPI(title="Buscador de Recetas")

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
    texto_filtrado = limpiar_stopwords(query)
    resultados = buscar_recetas(texto_filtrado, return_hits=True)  # usamos versión modificada
    return {"resultados": resultados}
