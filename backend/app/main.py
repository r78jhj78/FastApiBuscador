# from fastapi import FastAPI, HTTPException, Query
# from typing import List, Optional
# from .opensearch_client import client, index_name
# from .schemas import Recipe, SearchResponse
# from opensearchpy.exceptions import NotFoundError
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# origins = [
#     "*",  # Adding dev server URL here
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/search", response_model=SearchResponse)
# def search_recipes(
#     query: Optional[str] = Query(None, description="Search query keywords"),
#     category: Optional[str] = Query(None, description="Filter by category"),
#     ingredients: Optional[List[str]] = Query(None, description="Filter by ingredients"),
#     min_rating: Optional[float] = Query(None, description="Minimum rating"),
#     max_rating: Optional[float] = Query(None, description="Maximum rating"),
#     min_protein: Optional[int] = Query(None, description="Minimum protein"),
#     max_protein: Optional[int] = Query(None, description="Maximum protein"),
#     page: int = Query(1, ge=1, description="Page number"),
#     size: int = Query(15, ge=1, le=100, description="Number of results per page"),
# ):
#     body = {
#         "from": (page - 1) * size,
#         "size": size,
#         "query": {
#             "bool": {
#                 "must": [],
#                 "filter": []
#             }
#         }
#     }

#     # Construct query
#     if query:
#         body["query"]["bool"]["must"].append({
#             "multi_match": {
#                 "query": query,
#                 "fields": ["title^3", "ingredients", "instructions"]
#             }
#         })
#     else:
#         body["query"]["bool"]["must"].append({"match_all": {}})
        
#     # Handle category filter
#     if category:
#         body["query"]["bool"]["filter"].append({
#             "match": {"categories": category}  
#         })

#     # Handle ingredient filter
#     if ingredients:
#         for ingredient in ingredients:
#             body["query"]["bool"]["filter"].append({
#                 "term": {"ingredients.keyword": ingredient}
#             })

#     # Handle rating filter
#     if min_rating or max_rating:
#         body["query"]["bool"]["filter"].append({
#             "range": {
#                 "rating": {
#                     "gte": min_rating or 0,
#                     "lte": max_rating or 5
#                 }
#             }
#         })
        
#     # Handle protein filter
#     if min_protein or max_protein:
#         body["query"]["bool"]["filter"].append({
#             "range": {
#                 "protein": {
#                     "gte": min_protein or 0,
#                     "lte": max_protein or 100
#                 }
#             }
#         })

#     try:
#         response = client.search(
#             body=body,
#             index=index_name
#         )
#     except NotFoundError:
#         raise HTTPException(status_code=404, detail="Index not found")

#     hits = response['hits']['hits']
#     total = response['hits']['total']['value']

    
#     recipes = [
#         {
#             "id": hit['_source'].get('id'),
#             "title": hit['_source'].get('title', 'No Title'),
#             "ingredients": hit['_source'].get('ingredients', []),
#             "categories": hit['_source'].get('categories', []),
#             "calories": hit['_source'].get('calories', 0),
#             "protein": hit['_source'].get('protein', 0),
#             "fat": hit['_source'].get('fat', 0),
#             "sodium": hit['_source'].get('sodium', 0),
#             "rating": hit['_source'].get('rating', 0.0),
#             "date": hit['_source'].get('date'),
#             "desc": hit['_source'].get('desc'),
#             "directions": hit['_source'].get('directions', [])
#         }
#         for hit in hits
#     ]

#     return SearchResponse(total=total, recipes=recipes)



# @app.get("/filter/categories", response_model=List[str])
# def get_categories():
#     body = {
#         "size": 0,  
#         "aggs": {
#             "unique_categories": {
#                 "terms": {
#                     "field": "categories",  
#                     "size": 100  
#                 }
#             }
#         }
#     }

#     try:
#         response = client.search(body=body, index="epirecipes")
#         buckets = response['aggregations']['unique_categories']['buckets']
#         categories = [bucket['key'] for bucket in buckets]
#         return categories
#     except Exception as e:
#         print(f"Error fetching categories: {e}")
#         raise HTTPException(status_code=500, detail="Error fetching categories")



# @app.get("/filter/ingredients", response_model=List[str])
# def get_ingredients():
#     body = {
#         "size": 0, 
#         "aggs": {
#             "unique_ingredients": {
#                 "terms": {
#                     "field": "ingredients.text",  
#                     "size": 100
#                 }
#             }
#         }
#     }

#     try:
#         # Perform the search request to OpenSearch
#         response = client.search(body=body, index="epirecipes")
#         print(response)

#         # Extract the aggregation buckets from the response
#         buckets = response['aggregations']['unique_ingredients']['buckets']
        
#         # Extract the ingredient names from the buckets
#         ingredients = [bucket['key'] for bucket in buckets]

#         return ingredients
#     except Exception as e:
#         print(f"Error fetching ingredients: {e}")
#         raise HTTPException(status_code=500, detail="Error fetching ingredients")
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .buscar_recetas import buscar_recetas, limpiar_stopwords

app = FastAPI(title="Buscador de Recetas")

@app.get("/")
def read_root():
    return {"message": "Hola FastAPI"}

# Si vas a conectar desde frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # cámbialo si tienes un frontend específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/buscar")
def buscar(query: str = Query(..., description="Palabras clave para buscar recetas")):
    texto_filtrado = limpiar_stopwords(query)
    resultados = buscar_recetas(texto_filtrado, return_hits=True)  # usamos versión modificada
    return {"resultados": resultados}
