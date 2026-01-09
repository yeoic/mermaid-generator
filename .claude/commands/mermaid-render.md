# Mermaid Render Skill

Mermaid 다이어그램을 브라우저에서 렌더링합니다.

## 사용법

이 스킬이 호출되면 다음을 수행하세요:

1. **인자가 .mmd 또는 .mermaid 파일인 경우**:
   - 해당 파일을 읽어서 내용을 확인
   - 서버가 실행 중인지 확인 (포트 3000)
   - 서버가 실행 중이 아니면 `npm start` 실행
   - 브라우저에서 http://localhost:3000 열기
   - 파일 내용을 에디터에 로드하도록 안내

2. **인자가 Mermaid 코드 문자열인 경우**:
   - 서버가 실행 중인지 확인
   - 서버가 실행 중이 아니면 `npm start` 실행
   - http://localhost:3000 에서 코드 렌더링

3. **인자가 없는 경우**:
   - 서버를 시작하고 브라우저에서 편집기 열기

## 실행 단계

```bash
# 1. 서버 상태 확인
lsof -i :3000

# 2. 서버가 없으면 시작 (백그라운드)
cd $PROJECT_ROOT && npm start &

# 3. 브라우저 열기
open http://localhost:3000
```

## 예시

```
/mermaid-render                    # 편집기 열기
/mermaid-render diagram.mmd        # 파일 렌더링
/mermaid-render "flowchart TD; A-->B"  # 코드 렌더링
```

## 주의사항

- 서버가 이미 실행 중이면 새로 시작하지 않습니다
- macOS에서는 `open` 명령어, Linux에서는 `xdg-open` 사용
- 파일 렌더링 시 파일이 존재하는지 먼저 확인하세요
