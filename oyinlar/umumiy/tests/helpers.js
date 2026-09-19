// Brauzer skriptini (window.QK ga yozadigan) Node'da yuklash uchun yordamchi.
// new Function ishlatiladi — obyektlar shu realm'da yaratiladi, deepEqual to'g'ri ishlaydi.
const fs = require("node:fs");

// filePath — to'liq yo'l: chaqiruvchi uni path.join(__dirname, ...) bilan beradi
function loadScript(filePath, window) {
  new Function("window", fs.readFileSync(filePath, "utf8"))(window);
  return window;
}

module.exports = { loadScript };
