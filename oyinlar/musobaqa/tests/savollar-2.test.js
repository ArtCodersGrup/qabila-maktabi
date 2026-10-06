// Musobaqa savollari — 2-qism (yangi mavzular): javoblar mustaqil hisobga mos, bilim ro'yxatlari to'g'ri.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
for (const f of [
  "../../umumiy/js/sanoq.js", "../../05-rim-toshi/js/roman.js", "../../03-sezar-maktubi/js/caesar.js",
  "../../02-qabila-morzesi/js/morse.js", "../../11-kop-qatlamli-tarmoq/js/neural.js", "../../12-ai-xaritasi/js/atlas.js",
  "../../13-bayt-sandigi/js/bytes.js", "../../16-xotira-ombori/js/units.js", "../../23-on-barmoq/js/typing.js",
  "../../24-mantiq-kalitlari/js/logic.js", "../../25-zinapoya-chirogi/js/gates.js", "../js/savollar.js", "../js/savollar-2.js",
]) loadScript(path.join(__dirname, f), win);
const { savollar: S, savollar2: S2 } = win.QK;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function* savollar(kind, count = 300) {
  for (const level of S.KINDS[kind].levels) {
    const r = rng(kind.length * 31 + level);
    for (let k = 0; k < count; k++) {
      const q = S.make(kind, level, r);
      if (q) yield q;
    }
  }
}

// Kichik Python: shu bankdagi kod shakllarini JS ga o'girib bajaradi (// → butun bo'lish, range, if/else)
function pythonBajar(kod) {
  const chiqish = [];
  const env = {};
  const qiymat = (ifoda) => {
    const js = ifoda.replace(/len\("([^"]*)"\)/g, (_, s) => String([...s].length))
      .replace(/(\w+)\s*\/\/\s*(\w+)/g, "Math.floor($1 / $2)").replace(/==/g, "===");
    return Function(...Object.keys(env), `return (${js});`)(...Object.values(env));
  };
  const satrlar = kod.split("\n");
  for (let i = 0; i < satrlar.length; i++) {
    const s = satrlar[i];
    let m;
    if ((m = s.match(/^print\("(.*)"\)$/))) chiqish.push(m[1]);
    else if ((m = s.match(/^print\((.*)\)$/))) chiqish.push(String(qiymat(m[1])));
    else if ((m = s.match(/^(\w+) = (.*)$/))) env[m[1]] = qiymat(m[2]);
    else if ((m = s.match(/^for i in range\((\d+), (\d+)\):$/))) {
      const tana = satrlar[++i].trim();
      const [bosh, oxir] = [+m[1], +m[2]];
      for (let x = bosh; x < oxir; x++) {
        env.i = x;
        const pr = tana.match(/^print\("(.*)"\)$/);
        if (pr) chiqish.push(pr[1]);
        else { const t = tana.match(/^(\w+) = (.*)$/); env[t[1]] = qiymat(t[2]); }
      }
    } else if ((m = s.match(/^if (.*):$/))) {
      const ha = satrlar[i + 1].trim().match(/^print\("(.*)"\)$/)[1];
      const yoq = satrlar[i + 3].trim().match(/^print\("(.*)"\)$/)[1];
      chiqish.push(qiymat(m[1]) ? ha : yoq);
      i += 3;
    } else throw new Error("tanish emas: " + s);
  }
  return chiqish;
}

const OQ = { "→": [1, 0], "←": [-1, 0], "↑": [0, 1], "↓": [0, -1] };

const JAVOB = {
  faylTuri: (q) => ({ jpg: "Rasm", png: "Rasm", txt: "Matn", docx: "Matn", mp3: "Musiqa", mp4: "Video" })[q.data.fayl.split(".").pop()],
  yol: (q) => (q.level === 2 ? q.data.papkalar[q.data.papkalar.length - 1] : String(q.data.papkalar.length)),
  nusxa: (q) => {
    const { a, b, k, amal, qaysi } = q.data;
    return String(qaysi === "B" ? b + k : amal === "kesish" ? a - k : a);
  },
  robotJoy: (q) => {
    let x = 0, y = 0;
    for (const b of q.data.b) { x += OQ[b][0]; y += OQ[b][1]; }
    if (q.level === 1) return String(x);
    const qism = [];
    if (x) qism.push(`${Math.abs(x)} ta ${x > 0 ? "oʻngda" : "chapda"}`);
    if (y) qism.push(`${Math.abs(y)} ta ${y > 0 ? "yuqorida" : "pastda"}`);
    return qism.join(", ");
  },
  takror: (q) => String(q.data.oldin + q.data.n * q.data.ichi.length + q.data.keyin),
  paket: (q) => (q.level === 3 ? String(q.data.jami - q.data.keldi.length) : String(Math.ceil(q.data.n / q.data.k))),
  ip: (q) => {
    const yaroqli = q.input.options.filter((o) => {
      const p = o.split(".");
      return p.length === 4 && p.every((x) => /^\d+$/.test(x) && +x <= 255);
    });
    assert.equal(yaroqli.length, 1, q.key + ": aynan bitta to'g'ri IP");
    return yaroqli[0];
  },
  kuchli: (q) => q.input.options.slice().sort((a, b) => b.length - a.length)[0],
  variant: (q) => String(q.data.a ** q.data.n),
  domen: (q) => q.data.manzil.split(".").slice(-2).join("."),
  pyNatija: (q) => {
    const chiqish = pythonBajar(q.blocks.find((b) => b.type === "code").text);
    return /necha marta/.test(q.text) ? String(chiqish.length) : chiqish.join("");
  },
};

test("har yangi tur uchun mustaqil tekshiruv yoki bilim ro'yxati bor", () => {
  const bilimlar = Object.keys(S2.KINDS).filter((k) => !JAVOB[k]);
  assert.deepEqual(bilimlar.sort(), ["dasturBilim", "internetBilim", "pythonBilim", "tanishuvBilim", "xavfBilim"]);
});

test("generatorlar: javob mustaqil hisobga teng, savol hech qachon bo'sh emas", () => {
  for (const kind of Object.keys(JAVOB)) {
    let n = 0;
    for (const q of savollar(kind)) {
      n++;
      assert.equal(q.answer, JAVOB[kind](q), `${q.key}: ${q.text}`);
    }
    assert.ok(n >= 300, kind + ": savol yasalmay qoldi");
  }
});

test("kuchli parol — eng uzuni va yagona", () => {
  for (const q of savollar("kuchli", 200)) {
    const uzun = Math.max(...q.input.options.map((o) => o.length));
    assert.equal(q.input.options.filter((o) => o.length === uzun).length, 1, q.key);
  }
});

test("bilim ro'yxatlari: har darajada kamida 4 savol, 4 variant, javob variantlarda takrorlanmaydi", () => {
  for (const [nom, royxat] of Object.entries({ TANISHUV_BILIM: S2.TANISHUV_BILIM, DASTUR_BILIM: S2.DASTUR_BILIM, INTERNET_BILIM: S2.INTERNET_BILIM, XAVF_BILIM: S2.XAVF_BILIM, PYTHON_BILIM: S2.PYTHON_BILIM })) {
    for (const d of [1, 2, 3]) assert.ok(royxat.filter((f) => f[0] === d).length >= 4, `${nom}/${d}`);
    for (const [, savol, javob, xato] of royxat) {
      assert.equal(xato.length, 3, savol);
      assert.ok(!xato.includes(javob), savol);
      assert.equal(new Set(xato).size, 3, savol);
    }
    assert.equal(new Set(royxat.map((f) => f[1])).size, royxat.length, nom + ": takror savol");
  }
});

test("yangi mavzular bankda va har darajada savol bor", () => {
  for (const t of S2.TOPICS) {
    assert.ok(S.TOPICS.some((x) => x.id === t.id), t.id);
    for (const l of [1, 2, 3]) assert.ok(S.kindsOf(t.id, l).length > 0, `${t.id}/${l}`);
  }
});
