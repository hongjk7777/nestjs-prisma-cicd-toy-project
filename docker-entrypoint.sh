dockerize -wait tcp://mysql:3306 -timeout 20s  # mysql 컨테이너가 실행 완료 될 때까지 최대 20초 대기

echo "Start server"
npx prisma migrate dev --name init
pm2 start dist/main.js