// Masalalar bankining C++ yechimlari — SINOV uchun.
//
// Nega kerak: bankda kutilgan javob Python yechimidan hisoblanadi, shuning uchun bolaning C++
// kodi uchun alohida javob yozilmaydi. Lekin "masalani C++ da ham yechsa bo'ladimi?" degan
// savolga javob kerak: shu yerdagi yechimlar har bir testda ishga tushiriladi
// (tests/cpp-yechim.test.js) va 100% to'g'ri bo'lishi shart.
//
// Yechimlar yadro imkoniyatlari ichida yozilgan: massiv, sort, while (cin >> x), string[i].
const bosh = "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n";
const oxir = "\n    return 0;\n}\n";
const d = (tana) => bosh + tana.split("\n").map((s) => (s ? "    " + s : "")).join("\n") + oxir;

const YECHIMLAR = [
  { id: "yigindi", kod: d('int a, b;\ncin >> a >> b;\ncout << a + b << "\\n";') },
  { id: "kvadrat", kod: d('long long n;\ncin >> n;\ncout << n * n << "\\n";') },
  { id: "juft-toq", kod: d('int n;\ncin >> n;\nif (n % 2 == 0) cout << "juft\\n";\nelse cout << "toq\\n";') },
  { id: "eng-katta-3", kod: d('int a, b, c;\ncin >> a >> b >> c;\nint eng = a;\nif (b > eng) eng = b;\nif (c > eng) eng = c;\ncout << eng << "\\n";') },
  { id: "yigindi-n", kod: d('long long n;\ncin >> n;\nlong long s = 0;\nfor (long long i = 1; i <= n; i++) s += i;\ncout << s << "\\n";') },
  { id: "musbat-manfiy", kod: d('int n;\ncin >> n;\nif (n > 0) cout << "musbat\\n";\nelse if (n < 0) cout << "manfiy\\n";\nelse cout << "nol\\n";') },
  { id: "raqamlar-yigindisi", kod: d('long long n;\ncin >> n;\nint s = 0;\nwhile (n > 0) {\n    s += n % 10;\n    n /= 10;\n}\ncout << s << "\\n";') },
  { id: "teskari-son", kod: d('long long n;\ncin >> n;\nlong long t = 0;\nwhile (n > 0) {\n    t = t * 10 + n % 10;\n    n /= 10;\n}\ncout << t << "\\n";') },
  { id: "unlilar", kod: d("string s;\ncin >> s;\nint k = 0;\nfor (int i = 0; i < s.size(); i++) {\n    if (s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u') k++;\n}\ncout << k << \"\\n\";") },
  { id: "palindrom", kod: d('string s;\ncin >> s;\nbool bir = true;\nfor (int i = 0; i < s.size(); i++) {\n    if (s[i] != s[s.size() - 1 - i]) bir = false;\n}\nif (bir) cout << "ha\\n";\nelse cout << "yoʻq\\n";') },
  { id: "tubmi", kod: d('int n;\ncin >> n;\nbool tub = n > 1;\nfor (int d = 2; d * d <= n; d++) {\n    if (n % d == 0) tub = false;\n}\nif (tub) cout << "ha\\n";\nelse cout << "yoʻq\\n";') },
  { id: "boluvchilar-soni", kod: d('int n;\ncin >> n;\nint k = 0;\nfor (int d = 1; d <= n; d++) {\n    if (n % d == 0) k++;\n}\ncout << k << "\\n";') },
  { id: "fibonachchi", kod: d('int n;\ncin >> n;\nlong long a = 0, b = 1;\nfor (int i = 1; i < n; i++) {\n    long long c = a + b;\n    a = b;\n    b = c;\n}\ncout << a << "\\n";') },
  { id: "juftlar-soni", kod: d('int x;\nint k = 0;\nwhile (cin >> x) {\n    if (x % 2 == 0) k++;\n}\ncout << k << "\\n";') },
  { id: "ikkinchi-katta", kod: d('int a[1000];\nint n = 0;\nwhile (cin >> a[n]) n++;\nsort(a, a + n);\ncout << a[n - 2] << "\\n";') },
  { id: "har-xil", kod: d('int a[1000];\nint n = 0;\nwhile (cin >> a[n]) n++;\nsort(a, a + n);\nint k = 0;\nfor (int i = 0; i < n; i++) {\n    if (i == 0 || a[i] != a[i - 1]) k++;\n}\ncout << k << "\\n";') },
  { id: "k-kichik", kod: d('int n;\ncin >> n;\nint a[1000];\nfor (int i = 0; i < n; i++) cin >> a[i];\nint k;\ncin >> k;\nsort(a, a + n);\ncout << a[k - 1] << "\\n";') },
  { id: "ikkilik", kod: d('long long n;\ncin >> n;\nint bit[64];\nint k = 0;\nwhile (n > 0) {\n    bit[k] = n % 2;\n    k++;\n    n /= 2;\n}\nfor (int i = k - 1; i >= 0; i--) cout << bit[i];\ncout << "\\n";') },
  { id: "ekub", kod: d('long long a, b;\ncin >> a >> b;\nwhile (b > 0) {\n    long long c = a % b;\n    a = b;\n    b = c;\n}\ncout << a << "\\n";') },
  { id: "faktorial", kod: d('int n;\ncin >> n;\nlong long f = 1;\nfor (int i = 2; i <= n; i++) f *= i;\ncout << f << "\\n";') },
  { id: "cf-fil", kod: d('long long x;\ncin >> x;\ncout << (x + 4) / 5 << "\\n";') },
  { id: "cf-har-xil-harf", kod: d('string s;\ncin >> s;\nchar c[200];\nint n = s.size();\nfor (int i = 0; i < n; i++) c[i] = s[i];\nsort(c, c + n);\nint k = 0;\nfor (int i = 0; i < n; i++) {\n    if (i == 0 || c[i] != c[i - 1]) k++;\n}\nif (k % 2 == 0) cout << "juft\\n";\nelse cout << "toq\\n";') },
  { id: "harf-sanash", kod: d('string s;\ncin >> s;\nstring h;\ncin >> h;\nint k = 0;\nfor (int i = 0; i < s.size(); i++) {\n    if (s[i] == h[0]) k++;\n}\ncout << k << "\\n";') },
  { id: "ortachadan-katta", kod: d('int n;\ncin >> n;\nint a[1000];\nlong long s = 0;\nfor (int i = 0; i < n; i++) {\n    cin >> a[i];\n    s += a[i];\n}\nint k = 0;\nfor (int i = 0; i < n; i++) {\n    if ((long long)a[i] * n > s) k++;\n}\ncout << k << "\\n";') },
];

module.exports = { YECHIMLAR, d };
