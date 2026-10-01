// 37-o'yin: blok-sxemani ekranda chizish va bosish bilan yig'ish.
// Matn SVG ichida bo'lmasligi kerak (QOIDALAR §6), shuning uchun bloklar — HTML, shakllari CSS bilan.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;
  const S = QK.sxema;
  const h = ui.h;

  const SHAKL = { boshla: "oval", kirit: "yon", amal: "tort", chiqar: "yon", shart: "romb", sikl: "qavs", tugat: "oval" };

  const blokEl = (b, onClick) => h(onClick ? "button" : "div", {
    class: "sx-blok sx-" + (SHAKL[b.tur] || "tort"),
    type: onClick ? "button" : null,
    onClick: onClick || null,
  }, h("span", { class: "sx-matn", text: b.nom || b.kod || "" }));

  const oq = () => h("div", { class: "sx-oq", "aria-hidden": "true" });

  // Bloklar ro'yxatini chizish. opts.oloash — blokni bosganda chaqiriladi (yig'uvchida — o'chirish).
  function royxat(bloklar, opts) {
    const o = opts || {};
    const el = h("div", { class: "sx-royxat" });
    (bloklar || []).forEach((b, k) => {
      if (k) el.append(oq());
      if (b.tur === "shart") {
        el.append(h("div", { class: "sx-shart" },
          blokEl(b, o.olib ? () => o.olib(bloklar, k) : null),
          h("div", { class: "sx-shoxlar" },
            shox("ha", b.ha || [], o, b),
            shox("yoʻq", b.yoq || [], o, b))));
        return;
      }
      if (b.tur === "sikl") {
        el.append(h("div", { class: "sx-sikl" },
          blokEl(b, o.olib ? () => o.olib(bloklar, k) : null),
          h("div", { class: "sx-tana" }, shox("takror", b.tana || [], o, b, "tana"))));
        return;
      }
      el.append(blokEl(b, o.olib ? () => o.olib(bloklar, k) : null));
    });
    return el;
  }

  // Shart yoki sikl ichidagi zona
  function shox(nom, ichi, o, ota, kalit) {
    const zona = kalit || (nom === "ha" ? "ha" : "yoq");
    const faol = o.faol && o.faol.ota === ota && o.faol.zona === zona;
    const el = h("div", { class: "sx-shox" + (faol ? " faol" : "") });
    el.append(o.tanla
      ? h("button", { class: "sx-yorliq", type: "button", text: nom, onClick: () => o.tanla(ota, zona) })
      : h("div", { class: "sx-yorliq", text: nom }));
    if (ichi.length) el.append(royxat(ichi, o));
    else if (o.tanla) el.append(h("div", { class: "sx-bosh", text: "bu yerga blok qoʻy" }));
    return el;
  }

  // O'qish uchun: boshlash va tugash bilan to'liq sxema
  function chiz(bloklar, opts) {
    const o = opts || {};
    const el = h("div", { class: "sx" });
    el.append(blokEl({ tur: "boshla", nom: "Boshlash" }), oq());
    el.append(royxat(bloklar, o));
    if (o.tugat !== false) el.append(oq(), blokEl({ tur: "tugat", nom: "Tugash" }));
    return el;
  }

  // Yig'uvchi: palitradan blok bosiladi — faol zonaga qo'shiladi. Qo'yilgan blok bosilsa — o'chadi.
  function quruvchi(host, opts) {
    const o = opts || {};
    const bloklar = [];
    let faol = { ota: null, zona: "asosiy" };

    const maydon = h("div", { class: "sx-maydon" });
    const palitra = h("div", { class: "sx-palitra" });
    host.append(h("div", { class: "sx-quruvchi" }, palitra, maydon));

    const nusxa = (b) => JSON.parse(JSON.stringify(b));

    const joy = () => {
      if (!faol.ota) return bloklar;
      if (faol.zona === "ha") return (faol.ota.ha = faol.ota.ha || []);
      if (faol.zona === "yoq") return (faol.ota.yoq = faol.ota.yoq || []);
      return (faol.ota.tana = faol.ota.tana || []);
    };

    function qosh(b) {
      const yangi = nusxa(b);
      if (yangi.tur === "shart") { yangi.ha = []; yangi.yoq = []; }
      if (yangi.tur === "sikl") yangi.tana = [];
      // Shart va sikl faqat asosiy ro'yxatga (bitta darajali ichma-ichlik)
      if ((yangi.tur === "shart" || yangi.tur === "sikl") && faol.ota) {
        ui.toast("Shart va takror faqat asosiy yoʻlga qoʻyiladi.");
        return;
      }
      joy().push(yangi);
      if (yangi.tur === "shart") faol = { ota: yangi, zona: "ha" };
      if (yangi.tur === "sikl") faol = { ota: yangi, zona: "tana" };
      chizish();
    }

    function olib(ichida, k) {
      const b = ichida[k];
      if (faol.ota === b) faol = { ota: null, zona: "asosiy" };
      ichida.splice(k, 1);
      chizish();
    }

    const tanla = (ota, zona) => { faol = { ota, zona }; chizish(); };

    function chizish() {
      maydon.innerHTML = "";
      const asosiyFaol = !faol.ota;
      maydon.append(h("button", {
        class: "sx-yorliq asosiy" + (asosiyFaol ? " faol" : ""), type: "button", text: "asosiy yoʻl",
        onClick: () => tanla(null, "asosiy"),
      }));
      maydon.append(chiz(bloklar, { olib, tanla, faol }));
      palitra.innerHTML = "";
      palitra.append(h("div", { class: "sx-palitra-bosh", text: "Bloklar" }));
      (o.palitra || []).forEach((b) => palitra.append(h("button", {
        class: "sx-blok sx-" + (SHAKL[b.tur] || "tort") + " sx-tanlov", type: "button", onClick: () => qosh(b),
      }, h("span", { class: "sx-matn", text: b.nom || b.kod }))));
      if (o.onChange) o.onChange(bloklar);
    }

    chizish();
    return { bloklar, el: maydon, chizish, tozala: () => { bloklar.length = 0; faol = { ota: null, zona: "asosiy" }; chizish(); } };
  }

  QK.sxemaUi = { chiz, royxat, quruvchi, SHAKL };
})(window);
