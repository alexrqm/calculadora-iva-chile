const STORAGE_KEY = 'calculadora-iva-chile-v1';
const IVA = 0.19;

const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const refs = {
  body: document.getElementById('prices-body'),
  addRowBtn: document.getElementById('add-row'),
  clearAllBtn: document.getElementById('clear-all'),
  deleteSavedBtn: document.getElementById('delete-saved'),
  totalNeto: document.getElementById('total-neto'),
  totalIva: document.getElementById('total-iva'),
  totalConIva: document.getElementById('total-coniva'),
  summaryLines: document.getElementById('summary-lines'),
  summaryUnits: document.getElementById('summary-units'),
  summaryNeto: document.getElementById('summary-neto'),
  summaryIva: document.getElementById('summary-iva'),
  summaryTotal: document.getElementById('summary-total'),
  copyBtn: document.getElementById('copy-total'),
  copyMsg: document.getElementById('copy-msg')
};

let rows = [];

function formatMoney(v){
  try { return formatter.format(v || 0); } catch(e){ return '$0'; }
}

function parseCurrency(str){
  if (str === null || str === undefined) return 0;
  const digits = String(str).replace(/[^0-9\-]/g, '');
  const n = parseInt(digits, 10);
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }catch(e){ console.warn('No se pudo guardar:', e); }
}

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

function uid(){ return Math.random().toString(36).slice(2,9); }

function defaultRow(){
  return { id: uid(), product: '', qty: 1, valueEntered: 0, type: 'neto' };
}

function createRowElement(item){
  const tr = document.createElement('tr');

  // Product
  const tdProduct = document.createElement('td');
  const inputProd = document.createElement('input');
  inputProd.type = 'text';
  inputProd.value = item.product || '';
  inputProd.placeholder = 'Descripción';
  inputProd.setAttribute('aria-label','Producto o concepto');
  inputProd.addEventListener('input', e => {
    item.product = e.target.value;
    save();
  });
  tdProduct.appendChild(inputProd);

  // Quantity
  const tdQty = document.createElement('td');
  const inputQty = document.createElement('input');
  inputQty.type = 'number';
  inputQty.min = 1;
  inputQty.step = 1;
  inputQty.value = item.qty || 1;
  inputQty.setAttribute('aria-label','Cantidad');
  inputQty.addEventListener('input', e => {
    const v = parseInt(e.target.value,10);
    item.qty = Number.isFinite(v) && v > 0 ? v : 1;
    e.target.value = item.qty;
    render(); save();
  });
  tdQty.appendChild(inputQty);

  // Value entered
  const tdValue = document.createElement('td');
  const inputVal = document.createElement('input');
  inputVal.type = 'text';
  inputVal.value = item.valueEntered ? formatMoney(item.valueEntered) : '';
  inputVal.setAttribute('aria-label','Valor ingresado en pesos chilenos');
  inputVal.addEventListener('focus', e => {
    e.target.value = item.valueEntered ? String(item.valueEntered) : '';
  });
  inputVal.addEventListener('input', e => {
    const cleaned = e.target.value.replace(/[^0-9\-]/g,'');
    e.target.value = cleaned;
    item.valueEntered = parseCurrency(cleaned);
    render(); save();
  });
  inputVal.addEventListener('blur', e => {
    e.target.value = item.valueEntered ? formatMoney(item.valueEntered) : '';
    save();
  });
  tdValue.appendChild(inputVal);

  // Type selector
  const tdType = document.createElement('td');
  const selectType = document.createElement('select');
  const optN = document.createElement('option'); optN.value='neto'; optN.text='Sin IVA / Neto';
  const optC = document.createElement('option'); optC.value='con'; optC.text='Con IVA';
  selectType.appendChild(optN); selectType.appendChild(optC);
  selectType.value = item.type || 'neto';
  selectType.setAttribute('aria-label','Tipo de valor');
  selectType.addEventListener('change', e => { item.type = e.target.value; render(); save(); });
  tdType.appendChild(selectType);

  // Neto, IVA, Total (outputs)
  const tdNeto = document.createElement('td');
  const tdIva = document.createElement('td');
  const tdTotal = document.createElement('td');

  // Delete
  const tdDel = document.createElement('td');
  const btnDel = document.createElement('button');
  btnDel.className = 'btn';
  btnDel.textContent = 'Eliminar';
  btnDel.addEventListener('click', () => {
    rows = rows.filter(r => r.id !== item.id);
    render(); save();
  });
  tdDel.appendChild(btnDel);

  // Append cells
  tr.appendChild(tdProduct);
  tr.appendChild(tdQty);
  tr.appendChild(tdValue);
  tr.appendChild(tdType);
  tr.appendChild(tdNeto);
  tr.appendChild(tdIva);
  tr.appendChild(tdTotal);
  tr.appendChild(tdDel);

  // Attach data labels for mobile
  tdProduct.setAttribute('data-label','Producto / concepto');
  tdQty.setAttribute('data-label','Cantidad');
  tdValue.setAttribute('data-label','Valor ingresado');
  tdType.setAttribute('data-label','Tipo de valor');
  tdNeto.setAttribute('data-label','Neto');
  tdIva.setAttribute('data-label','IVA');
  tdTotal.setAttribute('data-label','Total');
  tdDel.setAttribute('data-label','Eliminar');

  // Calculation helper
  function updateOutputs(){
    const val = Number.isFinite(item.valueEntered) ? item.valueEntered : 0;
    const qty = Number.isFinite(item.qty) ? item.qty : 1;
    let netoUnit = 0;
    if (item.type === 'con'){
      netoUnit = val / (1 + IVA);
    } else {
      netoUnit = val;
    }
    const subtotalNeto = netoUnit * qty;
    const iva = subtotalNeto * IVA;
    const total = subtotalNeto + iva;

    const netoRounded = Math.round(subtotalNeto);
    const ivaRounded = Math.round(iva);
    const totalRounded = Math.round(total);

    tdNeto.textContent = formatMoney(netoRounded);
    tdIva.textContent = formatMoney(ivaRounded);
    tdTotal.textContent = formatMoney(totalRounded);
  }

  // initial
  updateOutputs();

  // expose update
  tr.updateOutputs = updateOutputs;

  return tr;
}

function render(){
  refs.body.innerHTML = '';
  if (!rows || rows.length === 0) rows = [defaultRow()];
  rows.forEach(item => {
    const el = createRowElement(item);
    refs.body.appendChild(el);
  });

  // update outputs for each row
  const trs = Array.from(refs.body.querySelectorAll('tr'));
  trs.forEach((tr, i) => {
    const item = rows[i];
    if (tr.updateOutputs) tr.updateOutputs();
  });

  recalcTotals();
}

function recalcTotals(){
  let sumNeto = 0, sumIva = 0, sumTotal = 0, totalUnits = 0;
  rows.forEach(item => {
    const val = Number.isFinite(item.valueEntered) ? item.valueEntered : 0;
    const qty = Number.isFinite(item.qty) ? item.qty : 1;
    totalUnits += qty;
    let netoUnit = item.type === 'con' ? val / (1 + IVA) : val;
    const subtotalNeto = netoUnit * qty;
    const iva = subtotalNeto * IVA;
    const total = subtotalNeto + iva;
    sumNeto += subtotalNeto;
    sumIva += iva;
    sumTotal += total;
  });
  const netoR = Math.round(sumNeto);
  const ivaR = Math.round(sumIva);
  const totalR = Math.round(sumTotal);

  refs.totalNeto.textContent = formatMoney(netoR);
  refs.totalIva.textContent = formatMoney(ivaR);
  refs.totalConIva.textContent = formatMoney(totalR);

  refs.summaryLines.textContent = rows.length;
  refs.summaryUnits.textContent = totalUnits;
  refs.summaryNeto.textContent = formatMoney(netoR);
  refs.summaryIva.textContent = formatMoney(ivaR);
  refs.summaryTotal.textContent = formatMoney(totalR);
}

// Events
refs.addRowBtn.addEventListener('click', () => { rows.push(defaultRow()); render(); save(); refs.addRowBtn.focus(); });
refs.clearAllBtn.addEventListener('click', () => { rows = [defaultRow()]; render(); save(); });
refs.deleteSavedBtn.addEventListener('click', () => {
  if (confirm('¿Borrar los datos guardados? Esta acción no se puede deshacer.')){
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
    rows = [defaultRow()]; render();
  }
});

refs.copyBtn.addEventListener('click', async () => {
  const texto = `Neto: ${refs.totalNeto.textContent}\nIVA: ${refs.totalIva.textContent}\nTotal: ${refs.totalConIva.textContent}`;
  try{
    if (navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(texto);
    } else {
      const ta = document.createElement('textarea'); ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    showCopyMsg('Total copiado');
  }catch(e){ showCopyMsg('No se pudo copiar'); }
});

function showCopyMsg(msg){
  refs.copyMsg.hidden = false;
  refs.copyMsg.textContent = msg;
  setTimeout(()=>{ refs.copyMsg.hidden = true; }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', ()=>{
  const saved = load();
  if (saved && Array.isArray(saved) && saved.length>0){
    rows = saved.map(r => ({ id: r.id || uid(), product: r.product||'', qty: Math.max(1, r.qty||1), valueEntered: parseCurrency(r.valueEntered), type: r.type==='con' ? 'con' : 'neto' }));
  } else rows = [defaultRow()];
  render();
});
