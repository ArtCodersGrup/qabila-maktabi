# 5–8 matn ohangi — qo'llanma (2026-10-10)

Muallif «Tangalar bozori» (18) namunasini ma'qulladi va qolgan 5–8 o'yinlariga tarqatishni tanladi.
Auditoriya: 11–14 yosh (5–8-sinf), "bolacha, o'ta oson" deb shikoyat qilishgan. Ko'rinish — Daftar (qahramonlar yo'q,
`ui.say/bubble("elder")` oddiy ko'rsatma paneli, `"apprentice"` gapi "Shogird" yozuvi bilan chiqadi).

## Qoidalar

1. **Hikoya o'rniga maqsad.** Kirish birinchi gapi — nima o'rganiladi: «Maqsad: …». Qabila/bozor/sayohat ertagi olib tashlanadi;
   o'yin metaforasi (tanga, quti, chiroq) qoladi, lekin bir jumlada va atama bilan bog'lanadi: «har xonaning oʻz vazni bor — xuddi tangalardek».
2. **Aniq atamalar.** Tushuncha o'z nomi bilan: asos, xona vazni, bit, bayt, algoritm, o'zgaruvchi, shart, sikl, paket, IP… Formula bo'lsa — yozib ko'rsat.
3. **Shogird (apprentice) gaplari olib tashlanadi** yoki ko'rsatmaga aylantiriladi. Savol-javob dialogi («— Bu nima? — Bu…») bo'lmaydi.
   Istisno: shogird gapi mashqning mexanikasi bo'lsa (masalan, shogird xato qiladi va bola topadi) — qoladi, lekin kattalarcha.
4. **Maqtov qisqa.** "Barakalla!", "Zo'r!", "Ofarin!", undov belgilari ko'pligi — yo'q. Bosqich oxiri: «N-bosqich tugadi. Keyingisi — …».
   Final: nimani qila olishi bir gapda: «Tayyor: … qila olasan».
5. **Natija aniq yoziladi:** «8 + 2 + 1 = 11, yaʼni 1011₂ = 11₁₀» (undov emas, "ya'ni").
6. **Mashq ko'rsatmasi:** «Mashq: N ta …. (qisqa shart)». `QK.practice.need()` qoladi.
7. **Maslahat (↻) — mazmunli:** nimaga qarash kerakligini aytadi, yechimni emas.
8. **"Qayerda uchraydi"** — hikoya sahnasi (final/stage3 dagi `lines`) bo'lsa, real qo'llanish bilan almashtiriladi (bir-ikki gap).
9. **Murojaat "sen"** (saytning qolgan qismi bilan bir xil), lekin bolalarcha erkalash yo'q.
10. **Uzunlik:** pufakda ≤ 2 qisqa gap (QOIDALAR §5). Matn kattalar uchun deb uzaytirilmaydi — aniqroq, lekin qisqa.
11. **Hech qanday mantiq o'zgarmaydi:** generatorlar, javoblar, tekshiruvlar, qadamlar soni, `practice` chaqiriqlari, UI tuzilishi — tegilmaydi.
    Faqat ekranga chiqadigan matn satrlari (ui.say/bubble/stageCard/finalCard, formula satrlari, `lines`, tugma yozuvlari emas).
    Testlar matnga bog'langan bo'lsa (masalan, aniq jumlani qidiradi) — testni yangi matnga moslab yangila.
12. **Imlo:** `oʻ gʻ` (U+02BB), tutuq `ʼ` (U+02BC); oddiy `'` matnda yo'q. O'yin nomiga havola — «…» ichida, raqamsiz.

## Namuna: 18-o'yin, oldin (−) va keyin (+)

```
-    await ui.say("elder", goingOn
-      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
-      : `${s}-bosqich tugadi! Barakalla!`);
+    await ui.say("elder", goingOn ? `${s}-bosqich tugadi. Keyingisi — kattaroq asoslar.` : `${s}-bosqich tugadi.`);
-    ui.bubble("elder", "Tabriklayman! Endi sen istalgan sonni oʻnlikka aylantira olasan!");
+    ui.bubble("elder", "Tayyor: istalgan pozitsion tizimdan oʻnlikka oʻtkaza olasan.");
-        ui.h("div", { text: "Raqam × xona qiymati" }),
-        ui.h("div", { text: "Hammasini qoʻshamiz" }),
-        ui.h("div", { text: "A = 10 … F = 15" }))));
+        ui.h("div", { text: "(aₖ … a₁a₀)ᵦ = aₖ·bᵏ + … + a₀" }),
+        ui.h("div", { text: "b-lik tizimda raqam < b" }),
+        ui.h("div", { text: "16-lik: A = 10 … F = 15; FF = 255 = 1 bayt" }))));
-    await ui.say("elder", "Bugun qabilalar bozoriga boramiz!");
-    await ui.say("apprentice", "Har qabilaning tangasi boshqa-ku?");
-    await ui.say("elder", "Ha. Tangalar — xona qiymatlari. Qani, hisoblab koʻramiz.");
+    await ui.say("elder", "Maqsad: istalgan sanoq tizimidagi sonni oʻnlikka oʻtkazish.");
+    await ui.say("elder", "Kalit gʻoya: har xonaning oʻz vazni bor — xuddi tangalardek. Son = raqamlar × vaznlar yigʻindisi.");
-    ui.bubble("elder", "Ikkilik qabila tangalari: 8, 4, 2, 1. Raqam 1 boʻlgan xonalardagi tangalarni ol!");
+    ui.bubble("elder", "Ikkilikda xona vaznlari: 8, 4, 2, 1. Raqami 1 boʻlgan xonalar tangasini yigʻ.");
-    await ui.say("elder", `8 + 2 + 1 = ${total}. Demak, ${S.fmt(number, 2)} = ${total}!`);
+    await ui.say("elder", `8 + 2 + 1 = ${total}, yaʼni ${S.fmt(number, 2)} = ${total}₁₀.`);
-    common.formula(el, [`1011₂ = ${bozor.expandText("1011", 2)} = 11`, "1 turgan xonalar qiymatini qoʻshamiz"]);
-    await ui.say("elder", "Har raqamni oʻz xonasi qiymatiga koʻpaytirib, hammasini qoʻshamiz.");
-    await ui.say("elder", "Ikkilikda oson: faqat 1 turgan xonalarni qoʻshamiz.");
+    common.formula(el, [`1011₂ = ${bozor.expandText("1011", 2)} = 11`, "k-xona vazni = asosᵏ: 2³, 2², 2¹, 2⁰"]);
+    await ui.say("elder", "Pozitsion tizimda raqamning qiymati turgan joyiga bogʻliq: oʻngdan k-xonaning vazni — asosᵏ.");
+    await ui.say("elder", "Ikkilikda raqam faqat 0 yoki 1, shuning uchun 1 turgan xonalar vaznini qoʻshish kifoya.");
-    ui.bubble("elder", "Bu son oʻnlikda nechaga teng?");
+    ui.bubble("elder", "Oʻnlikda nechaga teng?");
-        ui.bubble("elder", "↻ Har raqam ustida — uning tangasi. 1 turganlarini qoʻsh.");
+        ui.bubble("elder", "↻ Vaznlarni yozib qoʻydim. 1 turganlarini qoʻsh.");
-    await ui.say("elder", `Endi oʻzing: ikkilik sonni oʻnlikka aylantir. ${QK.practice.need()} ta toʻgʻri javob!`);
+    await ui.say("elder", `Mashq: ${QK.practice.need()} ta ikkilik son. Yodda hisobla; kerak boʻlsa qogʻoz ol.`);
-    ui.bubble("elder", "Sakkizlik qabila tangalari: 64, 8, 1. Har xonadan raqamcha tanga ol!");
+    ui.bubble("elder", "Sakkizlikda vaznlar: 8² = 64, 8¹ = 8, 8⁰ = 1. Har xonadan raqami nechta boʻlsa, shuncha tanga ol.");
-    await ui.say("elder", `${bozor.expandText(number, 8)} = ${total}. Demak, ${S.fmt(number, 8)} = ${total}!`);
+    await ui.say("elder", `${bozor.expandText(number, 8)} = ${total}, yaʼni ${S.fmt(number, 8)} = ${total}₁₀.`);
-    common.formula(el, ["raqam × xona qiymati — hammasini qoʻshamiz", `324₅ = ${bozor.expandText("324", 5)} = 89`]);
-    await ui.say("elder", "Har qanday tizimda shunday: raqamni xona qiymatiga koʻpaytirib qoʻshamiz.");
-    await ui.say("elder", "5-likda xonalar: 25, 5, 1. 3·25 + 2·5 + 4 = 89.");
+    common.formula(el, ["(aₖ … a₁a₀)ᵦ = aₖ·bᵏ + … + a₁·b + a₀", `324₅ = ${bozor.expandText("324", 5)} = 89`]);
+    await ui.say("elder", "Asos b boʻlsa, vaznlar: …, b², b, 1. Har raqam oʻz vazniga koʻpaytiriladi va hammasi qoʻshiladi.");
+    await ui.say("elder", "Tekshiruv: b-lik tizimda raqam b dan kichik boʻladi. 5-likda 5 yoki 7 raqami boʻlmaydi.");
-    ui.bubble("elder", "Bu son oʻnlikda nechaga teng?");
+    ui.bubble("elder", "Oʻnlikda nechaga teng?");
-        ui.bubble("elder", "↻ Har raqamni ustidagi xona qiymatiga koʻpaytir va qoʻsh.");
+        ui.bubble("elder", "↻ Vaznlar ustida yozilgan: raqam × vazn, keyin yigʻindi.");
-    await ui.say("elder", `Endi oʻzing: turli tizimlardan oʻnlikka. ${QK.practice.need()} ta toʻgʻri javob!`);
+    await ui.say("elder", `Mashq: ${QK.practice.need()} ta son, asosi 3 dan 8 gacha.`);
-    { art: "paint", lines: ["Rang kodi #FF8800: qizil FF = 255, yashil 88 = 136, koʻk 00 = 0.", "Shuning uchun u toʻq sariq!"] },
-    { art: "arrows", lines: ["Keyingi oʻyinda — teskari yoʻl.", "Oʻnlikdagi sonni istalgan tizimga oʻtkazamiz!"] },
+    { art: "paint", lines: ["Qayerda uchraydi: rang kodi #FF8800 — R = FF = 255, G = 88 = 136, B = 00 = 0.", "Bitta bayt (8 bit) aynan 2 ta 16-lik raqamga sigʻadi — shuning uchun dasturchilar 16-likni yaxshi koʻradi."] },
+    { art: "arrows", lines: ["Teskari yoʻl — oʻnlikdan istalgan tizimga — «Qoplarga joylash» oʻyinida."] },
-    ui.bubble("elder", "16-likda harflar bor. C harfini bos — u qaysi songa aylanadi?");
+    ui.bubble("elder", "16-likda 16 ta raqam kerak: 0–9 va A–F. C ni bos — u nechaga teng?");
-    await ui.say("elder", "C = 12. Xonalar: 16 va 1.");
+    await ui.say("elder", "C = 12. Vaznlar: 16¹ = 16 va 16⁰ = 1.");
-    await ui.say("elder", "12·16 + 8 = 200. Demak, C8₁₆ = 200!");
+    await ui.say("elder", "12·16 + 8 = 200, yaʼni C8₁₆ = 200₁₀.");
-    await ui.say("elder", "Eng katta ikki xonali 16-lik son — FF = 255. Esingdami, rang chirogʻi 0–255!");
```
