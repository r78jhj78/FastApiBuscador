from opensearchpy import OpenSearch
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv('OPENSEARCH_HOST')
port = int(os.getenv('OPENSEARCH_PORT',443))
auth = (os.getenv('OPENSEARCH_USERNAME'), os.getenv('OPENSEARCH_PASSWORD'))

print(f"OPENSEARCH_HOST: {host}")
print(f"OPENSEARCH_PORT: {port}")
print(f"OPENSEARCH_USERNAME: {auth[0]}")
print(f"OPENSEARCH_PASSWORD: {auth[1]}")

client = OpenSearch(
    hosts=[{'host': host, 'port': port}],
    http_compress=True,
    http_auth=auth,
    use_ssl=True,           # Aquí cambias a True, porque Bonsai usa HTTPS
    verify_certs=True,      # Habilita verificación de certificados
    ssl_assert_hostname=True,
    ssl_show_warn=True,
)

index_name = 'epirecipes'





