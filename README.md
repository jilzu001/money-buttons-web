# 돈 버튼

플레이: https://jilzu001.github.io/money-buttons-web/

CSS로 만든 네 개의 입체 원형 버튼과 화면 전체 배경을 사용하는 고전 2D 스타일 확률 체험입니다. 통계, 소개 문구, 이미지, 외부 폰트와 라이브러리는 없습니다.

1억원은 100%, 4억원은 52%, 30억원은 23%, 1조원은 8%로 당첨됩니다. 실패하면 0원입니다. 실제 금전 지급이나 결제는 없습니다.

로컬 확인: `python -m http.server 8765`.
배포 파일 생성: `python tools/build_site.py`.
main에 푸시하면 GitHub Actions가 CSS·JavaScript를 HTML에 포함한 단일 파일을 GitHub Pages에 배포합니다. 스타일 캐시에 의한 버전 혼합을 방지합니다.
