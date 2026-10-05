# Tank jangi — onlayn xona

Musobaqa (oʻyin emas: bosqichi yoʻq). «Tank jangi» va «Tank dueli» ning koʻp kishilik onlayn koʻrinishi.
Naqsh — «Togʻga chiqish» va «Yozuv poygasi» xonalari: oʻqituvchi qurilmasi — doska va hakam, bolalar kod bilan kiradi.

- **Yosh:** 12–16. Kompyuter tavsiya qilinadi (kod yoziladi), telefonda buyruq tugmalari bilan ham boʻladi.
- **Joyi:** bosh sahifa → Musobaqalar → Onlayn.
- **Muallif qarorlari (2026-10-05):** hamma birga, raund bilan; bir jangda 2–8 bola; yiqilgan bola tomoshabin boʻladi.

## Qoidalar

- **Raund:** har raundda hamma tirik bola **8 soniyada bitta satr** yozadi (49-oʻyindagi buyruqlar: `move`, `back`, `left`, `right`, `fire`, `reload`, `scan`, `radar`, `hp`, `ammo`; satrda koʻpi bilan 8 harakat). Hamma yuborsa yoki vaqt tugasa — doskada raund bajariladi.
- **Bir vaqtda bajarilish:** harakatlar **navbatma-navbat** qoʻyiladi: avval har bolaning 1-harakati, keyin 2-si… Bolalar tartibi — **kim oldin yuborgan** (tez bosgan yutadi; ikkovida bittadan jon qolib bir-biriga otsa, birinchi yuborgan otib yutadi). Yuborgach maydon keyingi raundgacha qulflanadi; birinchi yuborilgan satr hisobga olinadi (muallif qarori 2026-10-05). Satr yubormagan bola shu raundda turadi.
- **Hamma bir xil holatga qarab yozadi:** `scan()` / `radar()` raund **boshidagi** holatni koʻradi (bola yozayotganda raqiblar ham yozyapti).
- **Jon 3, oʻq 3, koʻrish masofasi teng** — tank dueli kabi adolatli. Tanklar maydon chetlarida simmetrik joylarda tugʻiladi, oʻrtada 2–3 toʻsiq.
- **Gʻolib** — oxirgi tirik qolgan. **Jang 5 daqiqa** (raundlar soni cheklanmagan, muallif qarori 2026-10-05). Vaqt tugaganda: joni koʻp, teng boʻlsa — koʻp tekkazgan; yana teng boʻlsa — durang.
- **Yiqilgan bola** — tomoshabin: maydonni kuzatadi, keyingi jangda qatnashadi.

## Tarmoq (erkin matn yoʻq)

Bolaning qurilmasi satrni raund boshidagi holatning **nusxasida** oʻzi ishga tushiradi (Python talqinchimiz + `jang.js`), chaqirilgan harakatlarni yozib oladi va faqat ularni yuboradi: `{ h: ["move", "left", "fire"], a: [50, 90, 0] }`.
Shuning uchun:

- tarmoqdan **kod matni oʻtmaydi** — kod orqali «chat» qilib boʻlmaydi (QOIDALAR §8), mavjud xabar tekshiruvidan (`validMessage`) oʻtadi;
- sintaksis xatosi bolaning oʻz ekranida darhol koʻrinadi va urinish sanalmaydi (tuzatib, vaqt tugaguncha qayta yuboradi);
- doska harakatlarni haqiqiy holatga qoʻyadi va natijani (`holat`) hammaga tarqatadi; har qurilma raundni bir xil (deterministik) qayta oʻynab animatsiya qiladi.

Xabarlar: boshlovchi → `lobbi`, `raund` (raqam, qolgan vaqt, tanklar holati), `natija` (tartib va hamma harakatlar); bola → `kirdi` (qahramon rangi), `harakat` (raund raqami + harakatlar).

## Sinf natijasi

Oʻqituvchi sinf uchun ochsa (`QK.sinfTanlov`), jang tugaganda natija «Xonalar» boʻlimiga yoziladi: oʻrin, qolgan jon, tekkazishlar. Serverda `xona_qoidalari.KINDS` va `xona_natija` ga `tank` qoʻshiladi.

## Qayta ishlatiladigan kod

- `oyinlar/umumiy/js/jang.js` — qoidalar (qoʻshimcha: koʻp bolali maydon, harakatlarni yozib olish rejimi, navbatma-navbat bajarish).
- `oyinlar/umumiy/js/jang-ui.js` — maydon va tank rasmlari, buyruq paneli.
- `oyinlar/umumiy/js/onlayn.js`, `sinf-tanlov.js`, `oyinlar/tog/` lobbi naqshi (qahramon ranglari).

## Testlar

- Jang mantigʻi (Node): tugʻilish joylari simmetrik va toʻsiqqa tushmaydi; harakatlarni yozib olish real holatni oʻzgartirmaydi; navbatma-navbat bajarish; gʻolib va durang qoidalari; vaqt tugashi.
- Brauzerda: oʻqituvchi + 3 bola, bir nechta raund, kimdir yiqiladi (tomoshabin), gʻolib aniqlanadi; sinf natijasi panelda.
