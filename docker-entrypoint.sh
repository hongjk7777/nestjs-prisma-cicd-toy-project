dockerize -wait tcp://mysql:3306 -timeout 20s  # mysql 컨테이너가 실행 완료 될 때까지 최대 20초 대기

echo "Start server"
npm run migrate:prod
npm run build
npm run start:prod