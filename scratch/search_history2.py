import os
import glob
import shutil

def search_history():
    appdata = os.environ.get('APPDATA')
    if not appdata:
        print("APPDATA environment variable not found.")
        return
        
    history_path = os.path.join(appdata, 'Code', 'User', 'History')
    print(f"Scanning directory: {history_path}")
    
    if not os.path.exists(history_path):
        print("History directory does not exist or access denied.")
        return
        
    found_files = []
    
    for root, dirs, files in os.walk(history_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if "export default function Home()" in content and "Message Suggestion Modal" in content and "DraggableImage" in content and "handlePhotoUpload" in content:
                        found_files.append((file_path, os.path.getmtime(file_path)))
            except Exception:
                pass
                
    if not found_files:
        print("No matching backups found.")
        return
        
    found_files.sort(key=lambda x: x[1], reverse=True)
    
    print(f"Found {len(found_files)} potential backups!")
    for idx, (path, mtime) in enumerate(found_files[:5]):
        print(f"[{idx+1}] {path} (mtime: {mtime})")
        
    best_file = found_files[0][0]
    shutil.copy2(best_file, r"e:\cardtou\scratch\recovered_page.tsx")
    print(f"Newest backup from {best_file} copied to: e:\\cardtou\\scratch\\recovered_page.tsx")

search_history()
