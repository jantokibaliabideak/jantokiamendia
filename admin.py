#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import base64
import webbrowser
from urllib.parse import urlparse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class AdminRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Disable caching for the admin panel to avoid stale data
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path in [
            '/api/add_news', '/api/add_document', '/api/add_menu',
            '/api/delete_news', '/api/delete_document', '/api/delete_menu',
            '/api/save_config', '/api/add_gallery', '/api/delete_gallery',
            '/api/reorder_news', '/api/toggle_news_visibility'
        ]:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode('utf-8'))
                response_data = {"status": "success", "message": "Operación completada con éxito"}
                
                # Load existing data
                data_file_path = os.path.join(DIRECTORY, 'data.json')
                if os.path.exists(data_file_path):
                    with open(data_file_path, 'r', encoding='utf-8') as f:
                        db = json.load(f)
                else:
                    db = {"news": [], "menus": [], "documents": [], "config": {}, "gallery": []}
                
                if 'config' not in db: db['config'] = {}
                if 'gallery' not in db: db['gallery'] = []

                if parsed_path.path == '/api/save_config':
                    # Update config fields based on the form submitted (which sends all current fields for that form)
                    for k, v in payload.items():
                        db['config'][k] = v
                    response_data["message"] = "Configuración guardada correctamente"

                elif parsed_path.path == '/api/add_gallery':
                    if payload.get('imageBase64') and payload.get('imageName'):
                        img_name = payload['imageName']
                        img_base64 = payload['imageBase64']
                        
                        img_dir = os.path.join(DIRECTORY, 'imagenes')
                        os.makedirs(img_dir, exist_ok=True)
                        
                        # Add a timestamp or prefix to avoid overriding if same name exists? 
                        # To keep it simple we'll just save it, which overwrites if same name.
                        img_path = os.path.join(img_dir, img_name)
                        img_data = base64.b64decode(img_base64)
                        with open(img_path, 'wb') as f:
                            f.write(img_data)
                        
                        image_url = f"imagenes/{img_name}"
                        new_id = max([item.get('id', 0) for item in db['gallery']] + [0]) + 1
                        
                        db['gallery'].append({
                            "id": new_id,
                            "imageUrl": image_url
                        })
                        response_data["message"] = "Imagen de galería añadida correctamente"
                    else:
                        raise Exception("Faltan datos de la imagen")

                elif parsed_path.path == '/api/delete_gallery':
                    gal_id = int(payload['id'])
                    for item in db['gallery']:
                        if item.get('id') == gal_id:
                            img_url = item.get('imageUrl')
                            if img_url and not img_url.startswith('http') and os.path.exists(os.path.join(DIRECTORY, img_url)):
                                try:
                                    os.remove(os.path.join(DIRECTORY, img_url))
                                except Exception:
                                    pass
                            db['gallery'].remove(item)
                            response_data["message"] = "Imagen de galería eliminada correctamente"
                            break

                elif parsed_path.path == '/api/add_news':
                    # Add news item with optional image
                    image_url = None
                    if payload.get('imageBase64') and payload.get('imageName'):
                        img_name = payload['imageName']
                        img_base64 = payload['imageBase64']
                        
                        img_dir = os.path.join(DIRECTORY, 'imagenes')
                        os.makedirs(img_dir, exist_ok=True)
                        
                        img_path = os.path.join(img_dir, img_name)
                        img_data = base64.b64decode(img_base64)
                        with open(img_path, 'wb') as f:
                            f.write(img_data)
                        
                        image_url = f"imagenes/{img_name}"

                    new_id = max([item.get('id', 0) for item in db['news']] + [0]) + 1
                    news_item = {
                        "id": new_id,
                        "date": payload['date'],
                        "title_eu": payload['title_eu'],
                        "title_es": payload['title_es'],
                        "text_eu": payload['text_eu'],
                        "text_es": payload['text_es'],
                        "imageUrl": image_url
                    }
                    db['news'].insert(0, news_item) # Insert at beginning
                    response_data["message"] = "Noticia añadida correctamente"

                elif parsed_path.path == '/api/add_document' or parsed_path.path == '/api/add_menu':
                    is_external = payload.get('isExternal', False)
                    size_str = "Google Drive" if is_external else ""
                    
                    if is_external:
                        relative_url = payload['externalUrl']
                    else:
                        # Handle file upload via Base64
                        file_name = payload['fileName']
                        file_base64 = payload['fileBase64']
                        
                        # Ensure documentos directory exists
                        docs_dir = os.path.join(DIRECTORY, 'documentos')
                        os.makedirs(docs_dir, exist_ok=True)
                        
                        # Save file
                        file_path = os.path.join(docs_dir, file_name)
                        file_data = base64.b64decode(file_base64)
                        with open(file_path, 'wb') as f:
                            f.write(file_data)
                        
                        # Calculate human readable size
                        size_bytes = len(file_data)
                        if size_bytes < 1024 * 1024:
                            size_str = f"{size_bytes / 1024:.1f} KB"
                        else:
                            size_str = f"{size_bytes / (1024 * 1024):.1f} MB"

                        relative_url = f"documentos/{file_name}"

                    if parsed_path.path == '/api/add_document':
                        # Add to documents list
                        doc_item = {
                            "title_eu": payload['title_eu'],
                            "title_es": payload['title_es'],
                            "desc_eu": payload['desc_eu'],
                            "desc_es": payload['desc_es'],
                            "fileUrl": relative_url,
                            "icon": payload.get('icon', 'file-down')
                        }
                        db['documents'].append(doc_item)
                        response_data["message"] = "Documento enlazado/subido correctamente"
                    
                    elif parsed_path.path == '/api/add_menu':
                        # Add to menus list
                        menu_item = {
                            "name_eu": payload['name_eu'],
                            "name_es": payload['name_es'],
                            "fileUrl": relative_url,
                            "type": "Enlace" if is_external else "PDF",
                            "size": size_str
                        }
                        db['menus'].append(menu_item)
                        response_data["message"] = "Menú enlazado/subido correctamente"

                elif parsed_path.path == '/api/delete_news':
                    news_id = int(payload['id'])
                    for item in db['news']:
                        if item.get('id') == news_id:
                            img_url = item.get('imageUrl')
                            if img_url and not img_url.startswith('http') and os.path.exists(os.path.join(DIRECTORY, img_url)):
                                try:
                                    os.remove(os.path.join(DIRECTORY, img_url))
                                except Exception:
                                    pass
                            db['news'].remove(item)
                            response_data["message"] = "Noticia eliminada correctamente"
                            break

                elif parsed_path.path == '/api/delete_document':
                    file_url = payload['fileUrl']
                    for item in db['documents']:
                        if item.get('fileUrl') == file_url:
                            if file_url and not file_url.startswith('http') and os.path.exists(os.path.join(DIRECTORY, file_url)):
                                try:
                                    os.remove(os.path.join(DIRECTORY, file_url))
                                except Exception:
                                    pass
                            db['documents'].remove(item)
                            response_data["message"] = "Documento eliminado correctamente"
                            break

                elif parsed_path.path == '/api/delete_menu':
                    file_url = payload['fileUrl']
                    for item in db['menus']:
                        if item.get('fileUrl') == file_url:
                            if file_url and not file_url.startswith('http') and os.path.exists(os.path.join(DIRECTORY, file_url)):
                                try:
                                    os.remove(os.path.join(DIRECTORY, file_url))
                                except Exception:
                                    pass
                            db['menus'].remove(item)
                            response_data["message"] = "Menú eliminado correctamente"
                            break

                elif parsed_path.path == '/api/reorder_news':
                    items = payload.get('items', [])
                    if items:
                        news_dict = {item['id']: item for item in db['news']}
                        new_news_list = []
                        for req_item in items:
                            news_id = int(req_item['id'])
                            is_hidden = req_item.get('isHidden', False)
                            if news_id in news_dict:
                                db_item = news_dict[news_id]
                                db_item['isHidden'] = is_hidden
                                new_news_list.append(db_item)
                        db['news'] = new_news_list
                        response_data["message"] = "Cambios guardados correctamente"

                elif parsed_path.path == '/api/toggle_news_visibility':
                    news_id = int(payload['id'])
                    is_hidden = payload.get('isHidden', False)
                    for item in db['news']:
                        if item.get('id') == news_id:
                            item['isHidden'] = is_hidden
                            response_data["message"] = f"Noticia {'ocultada' if is_hidden else 'visible'} correctamente"
                            break

                # Write back database
                with open(data_file_path, 'w', encoding='utf-8') as f:
                    json.dump(db, f, indent=4, ensure_ascii=False)

                # Send response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

if __name__ == '__main__':
    print(f"Iniciando el servidor de administración local...")
    print(f"Dirección: http://localhost:{PORT}/admin_panel.html")
    print("Para detener el servidor, presiona Ctrl+C")
    
    # Enable socket re-use to avoid port-in-use errors
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), AdminRequestHandler) as httpd:
        # Open browser in a separate thread/process
        webbrowser.open(f"http://localhost:{PORT}/admin_panel.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
