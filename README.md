# 돈 버튼 · Pixel Art Edition

플레이: https://jilzu001.github.io/money-buttons-web/

네 가지 원형 버튼, 1.5초 추첨 연출과 AI 제작 픽셀 결과 아트를 사용하는 모바일 웹입니다. 1억 금색·4억 파랑·30억 코랄·1조 금색 잭팟·꽝 보라색의 다섯 프레임을 하나의 PNG 이미지로 제공합니다. 설명과 확인 버튼은 실제 HTML UI입니다. 이미지는 약 2.27MB이며 초기 결과 화면에서 다운로드됩니다. reduced-motion 설정은 연출을 줄입니다.

## 하루 한 번

네 버튼 중 하나를 하루 한 번 선택합니다. 한국시간(Asia/Seoul) 날짜 기준으로 자정 이후 기회가 새로 생깁니다. 기록은 이 브라우저 localStorage에 저장되어 새로고침에도 유지됩니다. 오늘 결과 확인은 추가 추첨 없이 저장된 결과를 다시 보여줍니다. 지원 브라우저에서는 Web Locks API로 여러 탭 동시 선택도 하나의 기록으로 처리합니다.

서버나 로그인 기반 제한은 아닙니다. 브라우저 저장 데이터를 지우거나 다른 브라우저·기기를 쓰면 다시 선택할 수 있습니다. 기기 시간이 바뀌어도 영향을 받습니다. 저장이 불가능하면 안내를 표시하고 선택을 중단합니다.

## 실행과 배포

`python -m http.server 8765`로 로컬 확인, `python tools/build_site.py`로 배포용 `_site`를 생성합니다. CSS·JavaScript는 HTML 안에 묶고 이미지 파일은 함께 복사합니다. main에 푸시하면 GitHub Pages에 배포됩니다.

이미지 생성: built-in image_gen. 제작 프롬프트와 출처는 assets/README.md에 기록했습니다.
