// Kichik C++ dvigateli uchun sinov dasturlari.
// Shu ro'yxat ikki joyda ishlatiladi:
//   cpp-engine.test.js        — bizning dvigatel kutilgan javobni beradimi
//   cpp-engine-parity.test.js — HAQIQIY g++ ham shu javobni beradimi
// Shuning uchun har dastur haqiqiy, to'liq C++ dasturi bo'lishi shart.
const bosh = "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n";
const oxir = "\n    return 0;\n}\n";
const d = (tana) => bosh + tana.split("\n").map((s) => (s ? "    " + s : "")).join("\n") + oxir;
// sort/swap/max/min ishlatadigan dasturlar uchun: <algorithm> ham ulanadi
const da = (tana) => d(tana).replace("#include <string>", "#include <string>\n#include <algorithm>");

const CORPUS = [
  // ---------- Chiqish ----------
  { id: "salom", kod: d('cout << "Salom, qabila!" << "\\n";'), kutilgan: ["Salom, qabila!"] },
  { id: "ketma-ket", kod: d('cout << "a";\ncout << "b";\ncout << "\\n";'), kutilgan: ["ab"] },
  { id: "endl", kod: d('cout << 1 << endl << 2 << endl;'), kutilgan: ["1", "2"] },
  { id: "aralash", kod: d('int a = 7;\ncout << "a = " << a << ", a*2 = " << a * 2 << "\\n";'), kutilgan: ["a = 7, a*2 = 14"] },
  { id: "bool-chiqish", kod: d('bool b = true;\ncout << b << " " << (3 > 5) << "\\n";'), kutilgan: ["1 0"] },
  { id: "char-chiqish", kod: d("char c = 'A';\ncout << c << \" \" << c + 1 << \"\\n\";"), kutilgan: ["A 66"] },

  // ---------- Butun sonlar: C++ ning tuzoqlari ----------
  { id: "butun-bolish", kod: d('cout << 7 / 2 << " " << 1 / 2 << " " << -7 / 2 << "\\n";'), kutilgan: ["3 0 -3"] },
  { id: "qoldiq", kod: d('cout << 7 % 3 << " " << -7 % 3 << " " << 7 % -3 << "\\n";'), kutilgan: ["1 -1 1"] },
  { id: "int-toshdi", kod: d('int a = 2000000000;\ncout << a + a << "\\n";'), kutilgan: ["-294967296"] },
  { id: "int-kopaytma-toshdi", kod: d('int a = 100000;\ncout << a * a << "\\n";'), kutilgan: ["1410065408"] },
  { id: "long-long", kod: d('long long a = 100000;\ncout << a * a << "\\n";'), kutilgan: ["10000000000"] },
  { id: "ll-chegara", kod: d('long long a = 9223372036854775807;\ncout << a << "\\n";'), kutilgan: ["9223372036854775807"] },
  { id: "int-ll-aralash", kod: d('int a = 2000000;\nlong long b = 3;\ncout << a * b << "\\n";'), kutilgan: ["6000000"] },

  // ---------- Kasr sonlar ----------
  { id: "double-oddiy", kod: d('double x = 2.5;\ncout << x << "\\n";'), kutilgan: ["2.5"] },
  { id: "double-butun", kod: d('double x = 5.0;\ncout << x << "\\n";'), kutilgan: ["5"] },
  { id: "double-uchdan", kod: d('cout << 1.0 / 3 << "\\n";'), kutilgan: ["0.333333"] },
  { id: "double-uzun", kod: d('cout << 100.0 / 3 << "\\n";'), kutilgan: ["33.3333"] },
  { id: "double-katta", kod: d('cout << 1234567.0 << "\\n";'), kutilgan: ["1.23457e+06"] },
  { id: "double-kichik", kod: d('cout << 0.0000123 << "\\n";'), kutilgan: ["1.23e-05"] },
  { id: "int-double", kod: d('int a = 7;\ncout << a / 2 << " " << a / 2.0 << "\\n";'), kutilgan: ["3 3.5"] },

  // ---------- O'zgaruvchi va amallar ----------
  { id: "qoshma-tayinlash", kod: d('int a = 5;\na += 3;\na *= 2;\na -= 1;\na /= 3;\ncout << a << "\\n";'), kutilgan: ["5"] },
  { id: "inkrement", kod: d('int a = 5;\ncout << a++ << " " << a << " " << ++a << "\\n";'), kutilgan: ["5 6 7"] },
  { id: "mantiq", kod: d('int a = 5;\ncout << (a > 3 && a < 10) << " " << (a == 5 || a == 6) << " " << !(a == 5) << "\\n";'), kutilgan: ["1 1 0"] },

  // ---------- Shart ----------
  { id: "if-else", kod: d('int n = 7;\nif (n % 2 == 0) {\n    cout << "juft\\n";\n} else {\n    cout << "toq\\n";\n}'), kutilgan: ["toq"] },
  { id: "else-if", kod: d('int n = 0;\nif (n > 0) cout << "musbat\\n";\nelse if (n < 0) cout << "manfiy\\n";\nelse cout << "nol\\n";'), kutilgan: ["nol"] },

  // ---------- Sikl ----------
  { id: "for-oddiy", kod: d('for (int i = 1; i <= 5; i++) cout << i << " ";\ncout << "\\n";'), kutilgan: ["1 2 3 4 5 "] },
  { id: "for-yigindi", kod: d('int s = 0;\nfor (int i = 1; i <= 100; i++) s += i;\ncout << s << "\\n";'), kutilgan: ["5050"] },
  { id: "while-teskari", kod: d('int n = 1234;\nint t = 0;\nwhile (n > 0) {\n    t = t * 10 + n % 10;\n    n /= 10;\n}\ncout << t << "\\n";'), kutilgan: ["4321"] },
  { id: "break-continue", kod: d('for (int i = 1; i <= 10; i++) {\n    if (i % 2 == 0) continue;\n    if (i > 7) break;\n    cout << i << " ";\n}\ncout << "\\n";'), kutilgan: ["1 3 5 7 "] },
  { id: "ichma-ich", kod: d('for (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 3; j++) cout << i * j << " ";\n    cout << "\\n";\n}'), kutilgan: ["1 2 3 ", "2 4 6 ", "3 6 9 "] },

  // ---------- Massiv ----------
  { id: "massiv-yigindi", kod: d('int a[5];\nfor (int i = 0; i < 5; i++) a[i] = (i + 1) * (i + 1);\nint s = 0;\nfor (int i = 0; i < 5; i++) s += a[i];\ncout << s << "\\n";'), kutilgan: ["55"] },
  { id: "massiv-eng-katta", kod: d('int a[6];\na[0] = 3; a[1] = 9; a[2] = 2; a[3] = 7; a[4] = 9; a[5] = 1;\nint m = a[0];\nfor (int i = 1; i < 6; i++) if (a[i] > m) m = a[i];\ncout << m << "\\n";'), kutilgan: ["9"] },

  // ---------- Massivni ro'yxat bilan e'lon qilish ----------
  { id: "royxat-toliq", kod: d('int a[3] = {5, 7, 9};\nint s = 0;\nfor (int i = 0; i < 3; i++) s += a[i];\ncout << s << "\\n";'), kutilgan: ["21"] },
  { id: "royxat-qisqa", kod: d('int a[5] = {3, 1, 4};\nfor (int i = 0; i < 5; i++) cout << a[i] << " ";\ncout << "\\n";'), kutilgan: ["3 1 4 0 0 "] },
  { id: "royxat-boyisiz", kod: d('int b[] = {7, 8};\ncout << b[0] + b[1] << "\\n";'), kutilgan: ["15"] },

  // ---------- Tayyor funksiyalar (sort, max, min, abs, swap) ----------
  { id: "sort-massiv", kod: da('int a[5] = {7, 2, 9, 1, 5};\nsort(a, a + 5);\nfor (int i = 0; i < 5; i++) cout << a[i] << " ";\ncout << "\\n";'), kutilgan: ["1 2 5 7 9 "] },
  { id: "sort-qism", kod: da('int a[5] = {7, 2, 9, 1, 5};\nsort(a, a + 3);\nfor (int i = 0; i < 5; i++) cout << a[i] << " ";\ncout << "\\n";'), kutilgan: ["2 7 9 1 5 "] },
  { id: "sort-ikkinchi-katta", kod: da('int n = 6;\nint a[6] = {3, 9, 2, 9, 7, 1};\nsort(a, a + n);\ncout << a[n - 2] << "\\n";'), kutilgan: ["9"] },
  { id: "max-min-abs", kod: da('cout << max(3, 8) << " " << min(3, 8) << " " << abs(-7) << " " << abs(7) << "\\n";'), kutilgan: ["8 3 7 7"] },
  { id: "swap", kod: da('int x = 1, y = 2;\nswap(x, y);\nint a[2] = {5, 6};\nswap(a[0], a[1]);\ncout << x << y << a[0] << a[1] << "\\n";'), kutilgan: ["2165"] },
  { id: "max-double", kod: da('cout << max(2.5, 2.0) << " " << min(2.5, 2.0) << "\\n";'), kutilgan: ["2.5 2"] },

  // ---------- Matn ----------
  { id: "string-qosh", kod: d('string a = "Qabila";\nstring b = " maktabi";\ncout << a + b << "\\n";'), kutilgan: ["Qabila maktabi"] },
  { id: "string-uzunlik", kod: d('string s = "salom";\ncout << s.size() << " " << s[0] << s[4] << "\\n";'), kutilgan: ["5 sm"] },
  { id: "string-sikl", kod: d('string s = "abcba";\nint n = 0;\nfor (int i = 0; i < s.size(); i++) if (s[i] == \'a\') n++;\ncout << n << "\\n";'), kutilgan: ["2"] },

  // s[i] — satrning HOZIRGI belgisi: o'zgartirilgandan keyin ham to'g'ri o'qiladi
  { id: "string-indeks-oshir", kod: d('string s = "a";\ncout << ++s[0] << s << "\\n";'), kutilgan: ["bb"] },
  { id: "string-indeks-tayin", kod: d('string s = "abc";\ncout << (s[0] = \'x\') << " " << s << "\\n";'), kutilgan: ["x xbc"] },
  { id: "string-indeks-keyin", kod: d('string s = "abc";\ncout << s[1]++ << s[1] << " " << s << "\\n";\ns[2] += 1;\ncout << s << "\\n";'), kutilgan: ["bc acc", "acd"] },
  { id: "string-massiv", kod: d('string s[3];\ncout << "[" << s[1] << "]" << s[0].size() << "\\n";\ns[2] = "uch";\ncout << s[2] + "!" << "\\n";'), kutilgan: ["[]0", "uch!"] },

  { id: "string-ulash", kod: d('string s = "Salom";\ncout << s + " dunyo" << "!" + s << s + \'!\' << \'(\' + s << "\\n";'), kutilgan: ["Salom dunyo!SalomSalom!(Salom"] },
  { id: "string-solishtir", kod: d('string s = "ha";\ncout << (s == "ha") << ("ha" == s) << (s < "hb") << (s != s) << "\\n";'), kutilgan: ["1110"] },
  { id: "string-belgi-tayin", kod: d('string s;\ns = \'a\';\ns += \'b\';\ns += "cd";\ncout << s << s.size() << "\\n";'), kutilgan: ["abcd4"] },
  { id: "string-son-tayin", kod: d('string s;\ns = 65;\ns += 66;\ncout << s << "\\n";'), kutilgan: ["AB"] },
  { id: "string-max-min", kod: da('string a = "olma", b = "anor";\ncout << max(a, b) << min(a, b) << "\\n";'), kutilgan: ["olmaanor"] },
  { id: "tur-aralash", kod: d("int a = 'A';\nchar c = 66;\ndouble d = 3;\nbool b = 5;\nlong long k = 2.9;\ncout << a << c << d << b << k << \"\\n\";"), kutilgan: ["65B312"] },
  { id: "qoshma-aralash", kod: d('int x = 7;\nx += 2.5;\nx %= 4;\ndouble y = x;\ny /= 2;\ncout << x << " " << y << "\\n";'), kutilgan: ["1 0.5"] },
  { id: "qavssiz-doira", kod: d('if (1 > 2) int x = 1;\nint x = 2;\ncout << x << "\\n";'), kutilgan: ["2"] },

  // ---------- char — 8 bitli ishorali son ----------
  { id: "char-qirqiladi", kod: d('char c = 300;\ncout << (int)c << c << "\\n";'), kutilgan: ["44,"] },
  { id: "char-ishorali", kod: d('char c = 200;\nint n = c;\ncout << n << " " << (c < 0) << "\\n";'), kutilgan: ["-56 1"] },
  { id: "char-toshadi", kod: d('char c = 127;\nc++;\ncout << (int)c << "\\n";\nc = -129;\ncout << (int)c << "\\n";'), kutilgan: ["-128", "127"] },
  { id: "char-arifmetika", kod: d("char c = 'a';\nc += 2;\nchar k = c - 32;\nchar z = 65.7;\ncout << c << k << z << c - 'a' << \"\\n\";"), kutilgan: ["cCA2"] },

  // ---------- const ----------
  { id: "const", kod: d('const int N = 3;\nint const M = 4;\nconst string s = "ab";\nconst double pi = 3.14;\nint a[N];\nfor (int i = 0; i < N; i++) a[i] = i * M;\ncout << a[2] << s << pi << N + M << "\\n";'), kutilgan: ["8ab3.147"] },
  { id: "const-ll", kod: d('const long long MOD = 1000000007;\nlong long x = 123456789;\ncout << x * x % MOD << "\\n";'), kutilgan: ["643499475"] },

  // ---------- Sarlavhalar: using namespace std; o'rniga to'liq nom ----------
  { id: "std-toliq-nom", kod: "#include <iostream>\n#include <string>\n#include <algorithm>\n\nint main() {\n    std::string s;\n    int a[3] = {3, 1, 2};\n    std::cin >> s;\n    std::sort(a, a + 3);\n    std::cout << s << a[0] << std::max(a[1], a[2]) << std::endl;\n    return 0;\n}\n", kirish: ["salom"], kutilgan: ["salom13"] },
  { id: "bits-stdc", kod: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a[3] = {3, 1, 2};\n    sort(a, a + 3);\n    string s = \"ok\";\n    cout << s << a[0] << a[2] << \"\\n\";\n    return 0;\n}\n", kutilgan: ["ok13"], gppsiz: true },

  // ---------- Son yozuvlari: eksponent va LL ----------
  { id: "eksponent", kod: d('cout << 1e-5 << " " << 1e5 << " " << 2.5e3 << " " << 1E2 + 1 << " " << 2. << "\\n";'), kutilgan: ["1e-05 100000 2500 101 2"] },
  { id: "ll-qoshimcha", kod: d('cout << 100000LL * 100000 << " " << 3000000000 << " " << 5L + 1 << "\\n";'), kutilgan: ["10000000000 3000000000 6"] },
  { id: "eksponent-int", kod: d('int n = 1e9;\nlong long k = 1e18;\ncout << n + 7 << " " << k << "\\n";'), kutilgan: ["1000000007 1000000000000000000"] },

  // cin son o'qiganda sonning BOSHINI oladi, qolgani navbatda qoladi
  { id: "cin-butun-kasrdan", kod: d('int a;\ndouble b;\ncin >> a >> b;\ncout << a << " " << b << "\\n";'), kirish: ["3.7"], kutilgan: ["3 0.7"] },
  { id: "cin-son-keyin-soz", kod: d('int a;\nstring s;\ncin >> a >> s;\ncout << a << " " << s << "\\n";'), kirish: ["12abc"], kutilgan: ["12 abc"] },
  { id: "cin-ishorali", kod: d('int a, b;\ndouble c;\ncin >> a >> b >> c;\ncout << a + b << " " << c << "\\n";'), kirish: ["+5 -8", "-2.5e1"], kutilgan: ["-3 -25"] },
  { id: "cin-oxirigacha-kasr", kod: d('int x;\nint n = 0;\nwhile (cin >> x) n += x;\ncout << n << "\\n";'), kirish: ["4 5.5 6"], kutilgan: ["9"] },

  { id: "bir-amal-char", kod: d("char c = 'a';\nbool b = true;\ncout << -c << +c << !c << +b << -b << \"\\n\";"), kutilgan: ["-979701-1"] },

  // ---------- cin ----------
  { id: "cin-ikki", kod: d('int a, b;\ncin >> a >> b;\ncout << a + b << "\\n";'), kirish: ["12 30"], kutilgan: ["42"] },
  { id: "cin-n-ta", kod: d('int n;\ncin >> n;\nint s = 0;\nfor (int i = 0; i < n; i++) {\n    int x;\n    cin >> x;\n    s += x;\n}\ncout << s << "\\n";'), kirish: ["4", "10 20 30 40"], kutilgan: ["100"] },
  { id: "cin-string", kod: d('string ism;\ncin >> ism;\ncout << "Salom, " << ism << "!\\n";'), kirish: ["Anvar"], kutilgan: ["Salom, Anvar!"] },
  { id: "cin-double", kod: d('double x;\ncin >> x;\ncout << x * 2 << "\\n";'), kirish: ["1.25"], kutilgan: ["2.5"] },
  { id: "cin-massiv", kod: d('int n;\ncin >> n;\nint a[100];\nfor (int i = 0; i < n; i++) cin >> a[i];\nint m = a[0];\nfor (int i = 1; i < n; i++) if (a[i] < m) m = a[i];\ncout << m << "\\n";'), kirish: ["5", "7 3 9 1 8"], kutilgan: ["1"] },

  // ---------- Tur keltirish ----------
  { id: "keltirish", kod: d('int a = 100000, b = 100000;\ncout << a * b << " " << (long long)a * b << "\\n";'), kutilgan: ["1410065408 10000000000"] },
  { id: "keltirish-double", kod: d('int a = 7, b = 2;\ncout << a / b << " " << (double)a / b << "\\n";'), kutilgan: ["3 3.5"] },

  // ---------- Kirish tugaguncha o'qish ----------
  { id: "cin-oxirigacha", kod: d('int x;\nint s = 0, n = 0;\nwhile (cin >> x) {\n    s += x;\n    n++;\n}\ncout << n << " " << s << "\\n";'), kirish: ["1 2 3 4 5"], kutilgan: ["5 15"] },
  { id: "cin-bosh", kod: d('int x;\nint n = 0;\nwhile (cin >> x) n++;\ncout << n << "\\n";'), kutilgan: ["0"] },
  { id: "cin-soz", kod: d('string s;\nint n = 0;\nwhile (cin >> s) n++;\ncout << n << "\\n";'), kirish: ["olma anor uzum"], kutilgan: ["3"] },

  // ---------- Olimpiada naqshlari ----------
  { id: "raqamlar-yigindisi", kod: d('int n;\ncin >> n;\nint s = 0;\nwhile (n > 0) {\n    s += n % 10;\n    n /= 10;\n}\ncout << s << "\\n";'), kirish: ["3791"], kutilgan: ["20"] },
  { id: "tub-son", kod: d('int n;\ncin >> n;\nbool tub = n > 1;\nfor (int i = 2; i * i <= n; i++) if (n % i == 0) tub = false;\ncout << tub << "\\n";'), kirish: ["97"], kutilgan: ["1"] },
  { id: "fibonachchi", kod: d('long long a = 0, b = 1;\nfor (int i = 0; i < 50; i++) {\n    long long c = a + b;\n    a = b;\n    b = c;\n}\ncout << a << "\\n";'), kutilgan: ["12586269025"] },
];

module.exports = { CORPUS, d, da };
