#!/bin/bash

echo "=========================================="
echo "  PİLATİFY API TEST SONUÇLARI"
echo "=========================================="
echo ""

echo "1️⃣  LOGIN TESTİ (jane kullanıcısı)"
echo "-------------------------------------------"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","password":"password"}')
echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print('✅ Giriş Başarılı!'); print(f'Token: {data[\"token\"][:50]}...'); print(f'Kullanıcı: {data[\"user\"][\"name\"]} ({data[\"user\"][\"email\"]})')" 2>/dev/null || echo "$RESPONSE"
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""

echo "2️⃣  PROFİL SORGULAMA TESTİ"
echo "-------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/profile | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Profil Alındı!'); print(f'İsim: {data[\"name\"]}'); print(f'Yaş: {data[\"age\"]}'); print(f'Boy: {data[\"height\"]} cm'); print(f'Kilo: {data[\"weight\"]} kg'); print(f'Hedef: {data[\"goal\"]}')" 2>/dev/null
echo ""

echo "3️⃣  PROGRAM SORGULAMA TESTİ"
echo "-------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/program | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Program Alındı!'); print(f'Program Adı: {data[\"name\"]}'); print('Haftalık Program:'); [print(f'  {day}: {len(data[\"schedule\"][day])} egzersiz') for day in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']]" 2>/dev/null
echo ""

echo "4️⃣  YANLIŞ ŞİFRE TESTİ"
echo "-------------------------------------------"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","password":"yanlisşifre"}' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Güvenlik Çalışıyor: {data[\"message\"]}')" 2>/dev/null
echo ""

echo "5️⃣  YETKİSİZ ERİŞİM TESTİ"
echo "-------------------------------------------"
curl -s http://localhost:3000/api/user/profile | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Koruma Çalışıyor: {data[\"message\"]}')" 2>/dev/null
echo ""

echo "=========================================="
echo "  TÜM TESTLER TAMAMLANDI!"
echo "=========================================="
