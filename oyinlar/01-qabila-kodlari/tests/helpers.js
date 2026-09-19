// Brauzer skriptini (window.QK ga yozadigan) Node'da yuklash uchun yordamchi.
// new Function ishlatiladi — obyektlar shu realm'da yaratiladi, deepEqual to'g'ri ishlaydi.
const fs = require("node:fs");
const path = require("node:path");

function loadScript(relPath, window) {
  const code = fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
  new Function("window", code)(window);
  return window;
}

module.exports = { loadScript };
