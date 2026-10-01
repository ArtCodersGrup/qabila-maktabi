// Kombinatorika hisobi: formulalar va ro'yxatlar bir-birini tasdiqlashi kerak.
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/sanash.js");

test("fakt: kichik qiymatlar va katta son (BigInt)", () => {
  assert.equal(S.fakt(0), 1n);
  assert.equal(S.fakt(1), 1n);
  assert.equal(S.fakt(5), 120n);
  assert.equal(S.fakt(10), 3628800n);
  // 20! JS number'ga sig'maydi — BigInt shuning uchun kerak
  assert.equal(S.fakt(20), 2432902008176640000n);
  assert.throws(() => S.fakt(-1), RangeError);
});

test("A va C: chegaraviy holatlar", () => {
  assert.equal(S.A(5, 0), 1n);
  assert.equal(S.A(5, 1), 5n);
  assert.equal(S.A(5, 5), 120n);
  assert.equal(S.A(5, 6), 0n);
  assert.equal(S.C(5, 0), 1n);
  assert.equal(S.C(5, 5), 1n);
  assert.equal(S.C(5, 6), 0n);
  assert.equal(S.C(10, 3), 120n);
  assert.equal(S.C(52, 5), 2598960n);
});

test("C(n,k) = C(n,n−k) va A(n,k) = C(n,k)·k!", () => {
  for (let n = 0; n <= 12; n++) {
    for (let k = 0; k <= n; k++) {
      assert.equal(S.C(n, k), S.C(n, n - k), `C(${n},${k})`);
      assert.equal(S.A(n, k), S.C(n, k) * S.fakt(k), `A(${n},${k})`);
    }
  }
});

// Blokning asosiy da'vosi: formula ro'yxatni sanaydi
test("ro'yxatlar formulaga aynan mos tushadi", () => {
  const harf = ["a", "b", "c", "d", "e", "f"];
  for (let n = 0; n <= 6; n++) {
    const list = harf.slice(0, n);
    assert.equal(BigInt(S.tartiblar(list).length), S.fakt(n), `tartiblar(${n})`);
    for (let k = 0; k <= n; k++) {
      assert.equal(BigInt(S.orinlar(list, k).length), S.A(n, k), `orinlar(${n},${k})`);
      assert.equal(BigInt(S.tanlovlar(list, k).length), S.C(n, k), `tanlovlar(${n},${k})`);
    }
  }
});

test("ro'yxatlarda takror yo'q va har elementi bir martadan", () => {
  const list = [1, 2, 3, 4];
  const kalit = (x) => x.join(",");
  for (const [nom, hosil] of [["tartiblar", S.tartiblar(list)], ["orinlar", S.orinlar(list, 3)], ["tanlovlar", S.tanlovlar(list, 2)]]) {
    const kalitlar = hosil.map(kalit);
    assert.equal(new Set(kalitlar).size, kalitlar.length, nom + ": takror bor");
    for (const x of hosil) assert.equal(new Set(x).size, x.length, nom + ": ichida takror bor");
  }
  // tanlovlar tartibni saqlaydi: [1,2] bor, [2,1] yo'q
  const t = S.tanlovlar(list, 2).map(kalit);
  assert.ok(t.includes("1,2") && !t.includes("2,1"));
});

test("ko'paytirish qoidasi variantlar ro'yxati bilan bir xil", () => {
  const qadamlar = [["qizil", "koʻk"], ["bosh", "shim", "koʻylak"], ["A", "B"]];
  const hamma = S.variantlar(qadamlar);
  assert.equal(BigInt(hamma.length), S.kopaytir([2, 3, 2]));
  assert.equal(hamma.length, 12);
  assert.deepEqual(hamma[0], ["qizil", "bosh", "A"]);
  assert.equal(new Set(hamma.map((x) => x.join("|"))).size, 12);
  assert.deepEqual(S.variantlar([]), [[]]);
  assert.deepEqual(S.variantlar([["a"], []]), []);
});

test("qo'shish qoidasi: istisno holatlar qo'shiladi", () => {
  assert.equal(S.qosh([3, 4]), 7n);
  assert.equal(S.qosh([]), 0n);
  assert.equal(S.kopaytir([]), 1n);
  assert.equal(S.takrorli(2, 10), 1024n);
  assert.equal(S.takrorli(26, 3), 17576n);
});

test("Paskal uchburchagi: chekkalari 1, ichi yig'indi, qator yig'indisi 2^n", () => {
  const p = S.paskal(12);
  for (let n = 0; n < p.length; n++) {
    assert.equal(p[n].length, n + 1);
    assert.equal(p[n][0], 1n);
    assert.equal(p[n][n], 1n);
    for (let k = 0; k <= n; k++) assert.equal(p[n][k], S.C(n, k), `paskal(${n},${k})`);
    assert.equal(p[n].reduce((a, b) => a + b, 0n), 2n ** BigInt(n), `qator ${n} yigʻindisi`);
  }
});

test("Dirixle: n ta narsa k ta qutida", () => {
  assert.equal(S.dirixle(5, 4), 2);
  assert.equal(S.dirixle(4, 4), 1);
  assert.equal(S.dirixle(13, 12), 2);
  assert.equal(S.dirixle(25, 12), 3);
  assert.equal(S.dirixle(5, 0), 0);
});

test("chiroyli: katta son bo'shliq bilan", () => {
  assert.equal(S.chiroyli(S.fakt(10)), "3 628 800");
  assert.equal(S.chiroyli(120n), "120");
  assert.equal(S.chiroyli(1000), "1 000");
});
