# -*- coding: utf-8 -*-
import os
import glob

history_path = r"C:\Users\릴리맥 오야님\AppData\Roaming\Code\User\History"

def search_history():
    print(f"Scanning directory: {history_path}")
    if not os.path.exists(history_path):
        print("History directory does not exist or access denied.")
        return
        
    found_files = []
    
    # Traverse all subdirectories
    for root, dirs, files in os.walk(history_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if "Message Suggestion Modal" in content and "DraggableImage" in content and "handlePhotoUpload" in content:
                        found_files.append((file_path, os.path.getmtime(file_path)))
            except Exception:
                pass
                
    if not found_files:
        print("No matching backups found.")
        return
        
    # Sort by modification time (newest first)
    found_files.sort(key=lambda x: x[1], reverse=True)
    
    print(f"Found {len(found_files)} potential backups!")
    for idx, (path, mtime) in enumerate(found_files[:5]): # Show top 5 newest
        print(f"[{idx+1}] {path} (mtime: {mtime})")
        
    # Copy the newest one to scratch for safety
    best_file = found_files[0][0]
    import shutil
    shutil.copy2(best_file, r"e:\cardtou\scratch\recovered_page.tsx")
    print("Newest backup copied to: e:\\cardtou\\scratch\\recovered_page.tsx")

search_history()
