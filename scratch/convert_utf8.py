# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def convert_to_utf8():
    try:
        # Try reading as utf-16
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
            print("Successfully read as UTF-16!")
        except Exception:
            # Maybe utf-8 with BOM or just messy
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            print("Read as UTF-8 with fallback.")
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully converted to UTF-8 without BOM!")
    except Exception as e:
        print(f"Error: {e}")

convert_to_utf8()
