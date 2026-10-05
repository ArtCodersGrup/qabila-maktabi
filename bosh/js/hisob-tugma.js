// Bosh sahifa: o'ng yuqorida "Kirish" yoki "👤 Ism" tugmasi (kirish/ sahifasiga). Fayldan ochilganda ko'rinmaydi.
(function (root) {
  "use strict";

  const H = root.QK && root.QK.hisob;
  const top = root.document.querySelector(".bosh-top");
  if (!H || !top || !H.mumkin(root.location)) return;
  const a = root.document.createElement("a");
  a.className = "bosh-hisob";
  a.href = "kirish/";
  const yoz = (d) => { a.textContent = d && d.ism ? "👤 " + d.ism : d ? "👤 Akkaunt" : "Kirish"; };
  yoz(H.saqlangan());
  top.prepend(a);
  H.men().then((r) => {
    if (r.ok) {
      yoz(r.user);
      // Boshqa qurilmadagi yulduzlar shu yerga ham kelsin. Mehmon progressi bo'lsa — kirish sahifasida so'raladi.
      const u = r.user;
      if (!u.parol_almashtirsin && (H.egasi() === u.id || !H.mehmonBor())) {
        H.sinxron(u.id).then((s) => { if (s.ok && root.QK.bosh) root.QK.bosh.render(); });
      }
    }
    else if (r.holat === 401) yoz(null);
  });
})(window);
