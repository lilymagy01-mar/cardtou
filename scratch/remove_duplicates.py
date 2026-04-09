# -*- coding: utf-8 -*-
import sys

file_path = r'e:\cardtou\src\app\page.tsx'

def remove_duplicate_modals():
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        # isSuggestionModalOpen && ( 블록을 찾아서 삭제할 범위를 정합니다.
        # 이 블록은 보통 70~80줄 정도입니다.
        
        new_lines = []
        skip_count = 0
        modals_found = 0
        
        for i in range(len(lines)):
            if skip_count > 0:
                skip_count -= 1
                continue
            
            if "isSuggestionModalOpen && (" in lines[i]:
                modals_found += 1
                # 첫 번째(805)와 두 번째(1678) 모달은 삭제 대상입니다.
                if modals_found < 3:
                    print(f"Removing duplicate modal at original line {i+1}")
                    # 블록이 끝나는 ')}'를 찾을 때까지 건너뜁니다 (최대 100줄)
                    for j in range(i, min(i + 100, len(lines))):
                        if "      )}" in lines[j] or "    )}" in lines[j]:
                            skip_count = j - i
                            break
                    continue
                else:
                    # 세 번째(2175) 모달은 유지하되, 깨진 글자를 고칩니다.
                    print(f"Keeping and fixing final modal at original line {i+1}")
                    new_line = lines[i]
                    # (이후 고치는 로직은 아래에서 통합 처리됨)
                    new_lines.append(new_line)
            else:
                new_lines.append(lines[i])

        # 최종 결과물 다시 정화
        final_content = "".join(new_lines)
        
        # 깨진 패턴들 다시 한번 청소
        final_content = final_content.replace("'메시지 샘플 보기 : '감성 명언 라이브러리}", "'메시지 샘플 보기' : '감성 명언 라이브러리'}")
        final_content = final_content.replace("'메세지 샘플 보기 : '감성 명언 라이브러리}", "'메시지 샘플 보기' : '감성 명언 라이브러리'}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
        print("Success: Removed duplicate modals and fixed the final one!")
        
    except Exception as e:
        print(f"Error: {e}")

remove_duplicate_modals()
