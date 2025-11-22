// -------------------- النظام الغذائي --------------------
function updateDiet() {
  let txt = document.getElementById('inputText').value
               .replace(/^["“”]|["“"]$/g, '').trim();
  const lines = txt.split('\n').map(l => l.trim()).filter(l => l);
  const mealsOrder = [
<<<<<<< HEAD
    'وجبة الإفطار', 'وجبة الافطار', 'الإفطار', 'الفطار',
=======
    'وجبة الإفطار', 'وجبة الافطار' , 'الإفطار', 'الفطار',
>>>>>>> cb6dc8dbacbaedd703dd964e7d5ef610ba9bd292
    'وجبة خفيفة', 'وجبة خفيفه', 'سناك',
    'الغداء',
    'وجبة قبل التمرين', 'قبل التمرين',
    'وجبة بعد التمرين', 'بعد التمرين',
    'العشاء'
  ];
  let meals = [], stats = {}, currentMeal = null, mealTitle = '';
  lines.forEach((l, idx) => {
    if (mealsOrder.some(m => l.startsWith(m))) {
      if (currentMeal) meals.push(currentMeal);
      mealTitle = mealsOrder.find(m => l.startsWith(m)) || l;
      currentMeal = { title: mealTitle, items: '', isDinner: mealTitle.includes('عشاء') };
      const rest = l.replace(mealTitle, '').trim();
      if (rest) currentMeal.items += rest + '<br>';
    } else if (/^(سعرات|بروتين|كارب|كربوهيدرات|دهون)$/.test(l)) {
      let k = '';
      if (l.includes('سعرات')) k = 'calories';
      if (l.includes('بروتين')) k = 'protein';
      if (l.includes('كارب') || l.includes('كربوهيدرات')) k = 'carbs';
      if (l.includes('دهون')) k = 'fats';
      if (k) {
        const nextLine = lines[idx + 1] || '';
        stats[k] = nextLine.replace(/[^\d]/g, '') || '0';
      }
    } else {
      if (currentMeal) {
        if (/^\d+(\s*\w*)?$/.test(l)) return;
        if (!currentMeal.isDinner) currentMeal.items += l + '<br>';
        else if (!/^(سعرات|بروتين|كارب|كربوهيدرات|دهون)$/.test(l)) currentMeal.items += l + '<br>';
      }
    }
  });
  if (currentMeal) meals.push(currentMeal);
  let html = '';
  meals.forEach(meal => {
    html += `<div class="meal-block${meal.isDinner ? ' dinner' : ''}"><h3>${meal.title}</h3><div class="items">${meal.items}</div></div>`;
  });
  document.getElementById('mealsList').innerHTML = html;
  document.getElementById('calories').textContent = stats.calories || '0';
  document.getElementById('protein').textContent = stats.protein || '0';
  document.getElementById('carbs').textContent = stats.carbs || '0';
  document.getElementById('fats').textContent = stats.fats || '0';
}
function downloadPDF() {
  const element = document.getElementById('page');
  const opt = {
    margin: 0, filename: 'نظامك_الغذائي.pdf', image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 3, backgroundColor: '#0f1b3a' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}
function downloadImage() {
  const element = document.getElementById('page');
  html2canvas(element, { scale: 3, backgroundColor: '#0f1b3a' }).then(canvas => {
    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'نظامك_الغذائي.png';
      link.click();
    });
  });
}
// -------------------- دمج PDF --------------------
async function mergePDFs() {
  document.getElementById('msg').innerText = "يتم الدمج...";
  const mainFile = document.getElementById('mainPDF').files[0];
  const insertFile = document.getElementById('insertPDF').files[0];
  const pageNum = parseInt(document.getElementById('pageNumber').value) - 1;
  const insertMode = document.getElementById('insertMode').value;
  if (!mainFile || !insertFile) { document.getElementById('msg').innerText = "يجب اختيار الملفات"; return; }
  const mainBytes = await mainFile.arrayBuffer();
  const mainDoc = await PDFLib.PDFDocument.load(mainBytes);
  let insertDoc;
  if (insertFile.type.startsWith('image/')) {
    const imageBytes = await insertFile.arrayBuffer();
    const tempPdf = await PDFLib.PDFDocument.create();
    let pageWidth = 595, pageHeight = 842;
    if (mainDoc.getPageCount() > 0) { const firstPage = mainDoc.getPages()[0]; const { width, height } = firstPage.getSize(); pageWidth = width; pageHeight = height; }
    let imageEmbed;
    if (insertFile.type === 'image/jpeg' || insertFile.type === 'image/jpg') imageEmbed = await tempPdf.embedJpg(imageBytes);
    else imageEmbed = await tempPdf.embedPng(imageBytes);
    const page = tempPdf.addPage([pageWidth, pageHeight]);
    page.drawImage(imageEmbed, { x: 0, y: 0, width: pageWidth, height: pageHeight });
    insertDoc = await PDFLib.PDFDocument.load(await tempPdf.save());
  } else {
    const insertBytes = await insertFile.arrayBuffer();
    insertDoc = await PDFLib.PDFDocument.load(insertBytes);
  }
  const pagesToInsert = await mainDoc.copyPages(insertDoc, insertDoc.getPageIndices());
  if (insertMode === "after") {
    let idx = pageNum + 1; for (let i = 0; i < pagesToInsert.length; i++) mainDoc.insertPage(idx + i, pagesToInsert[i]);
  } else if (insertMode === "replace") {
    mainDoc.removePage(pageNum); for (let i = 0; i < pagesToInsert.length; i++) mainDoc.insertPage(pageNum + i, pagesToInsert[i]);
  }
  const mergedBytes = await mainDoc.save();
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.getElementById('downloadLink');
  link.href = url; link.download = 'result.pdf';
  document.getElementById('downloadBtn').style.display = 'inline-block';
  document.getElementById('msg').innerText = "تم الدمج! اضغط تحميل.";
}
function triggerDownload() { document.getElementById('downloadLink').click(); }
// -------------------- ألوان --------------------
function applyColors() {
  const root = document.documentElement;
  root.style.setProperty('--bg-color', document.getElementById('colorBg').value);
  root.style.setProperty('--accent-color', document.getElementById('colorAccent').value);
  root.style.setProperty('--text-color', document.getElementById('colorText').value);
  root.style.setProperty('--input-bg-color', document.getElementById('colorInputBg').value);
  document.body.style.backgroundColor = getComputedStyle(root).getPropertyValue('--bg-color');
  document.body.style.color = getComputedStyle(root).getPropertyValue('--text-color');
  document.querySelectorAll('section').forEach(el => el.style.borderColor = getComputedStyle(root).getPropertyValue('--accent-color'));
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.style.backgroundColor = getComputedStyle(root).getPropertyValue('--input-bg-color');
    el.style.color = getComputedStyle(root).getPropertyValue('--text-color');
    el.style.borderColor = getComputedStyle(root).getPropertyValue('--accent-color');
  });
}
function resetColors() {
  document.getElementById('colorBg').value = '#000814';
  document.getElementById('colorAccent').value = '#00ffff';
  document.getElementById('colorText').value = '#ffffff';
  document.getElementById('colorInputBg').value = '#001e50';
  applyColors();
}
// -------------------- مثال افتراضي + حماية --------------------
window.onload = () => {
  document.getElementById('inputText').value = `وجبة الإفطار
2 بيضة + خيار + بطاطس + موز + بطيخ
وجبة خفيفة
خضار + عنب + شوفان
الغداء
فاصوليا + عين جمل + تورتيلا
العشاء
سردين + جوافة + كمثرى
سعرات
1393
بروتين
64
كربوهيدرات
135
دهون
73`;
  updateDiet();
};
// حماية بسيطة
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) e.preventDefault();
});
// أزرار جديدة
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('inputText').value = text;
  } catch {
    alert('فشل اللصق من الحافظة');
  }
}
function clearAll() {
  document.getElementById('inputText').value = '';
}
