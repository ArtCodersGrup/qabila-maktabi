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
    if (r.ok) yoz(r.user);
    else if (r.holat === 401) yoz(null);
  });
})(window);
