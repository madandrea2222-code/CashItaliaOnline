// js/main.js - CashItalia
const currencyList = [
  {code:'USD', name:'دولار أمريكي'},
  {code:'EUR', name:'يورو'},
  {code:'EGP', name:'جنيه مصري'},
  {code:'GBP', name:'جنيه إسترليني'},
  {code:'AED', name:'درهم إماراتي'},
  {code:'SAR', name:'ريال سعودي'},
  {code:'KWD', name:'دينار كويتي'},
  {code:'LYD', name:'دينار ليبي'},
  {code:'CAD', name:'دولار كندي'},
  {code:'AUD', name:'دولار أسترالي'},
  {code:'CHF', name:'فرنك سويسري'},
  {code:'JPY', name:'ين ياباني'},
  {code:'CNY', name:'يوان صيني'},
  {code:'TRY', name:'ليرة تركية'},
  {code:'INR', name:'روبية هندية'},
  {code:'BRL', name:'ريال برازيلي'},
  {code:'ZAR', name:'راند جنوب أفريقي'},
  {code:'SEK', name:'كرونة سويدية'},
  {code:'NOK', name:'كرونة نرويجية'},
  {code:'DKK', name:'كرونة دنماركية'},
  {code:'PLN', name:'زلوتي بولندي'},
  {code:'SGD', name:'دولار سنغافوري'},
  {code:'MXN', name:'بيزو مكسيكي'}
];

const sampleRates = {
  USD:{USD:1, EUR:0.93, EGP:30.8, GBP:0.78, AED:3.67},
  EUR:{USD:1.07, EUR:1, EGP:33.0, GBP:0.84, AED:3.95},
  EGP:{USD:0.032, EUR:0.030, EGP:1, GBP:0.025, AED:0.12}
};

function $(id){ return document.getElementById(id); }

function populateCurrency(selectId){
  const s = $(selectId);
  if(!s) return;
  s.innerHTML = '';
  currencyList.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = `${c.name} (${c.code})`;
    s.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  populateCurrency('currencyFrom');
  populateCurrency('currencyTo');
  setTimeout(()=>{ const sp = document.querySelector('.splash'); if(sp) sp.style.display='none'; }, 1400);
});

function validateAccount(method, value){
  value = (value||'').trim();
  if(!value) return {ok:false, msg:'الرجاء إدخال رقم الحساب/المحفظة'};
  if(method==='paypal'){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value)?{ok:true}:{ok:false,msg:'ادخل بريد بايبال صالح'};
  }
  if(method==='perfectmoney'){
    const re = /^[A-Za-z0-9]{5,20}$/;
    return re.test(value)?{ok:true}:{ok:false,msg:'رقم Perfect Money 5-20 حرف/رقم'};
  }
  if(method==='instapay'){
    const re = /^\d{6,20}$/;
    return re.test(value)?{ok:true}:{ok:false,msg:'رقم InstaPay 6-20 رقم'};
  }
  if(method==='etisalat' || method==='vodafone'){
    const re = /^\+?\d{9,15}$/;
    return re.test(value)?{ok:true}:{ok:false,msg:'ادخل رقم هاتف صالح (9-15 رقم)'};
  }
  return {ok:true};
}

function convertAmount(from,to,amount){
  const rFrom = sampleRates[from] || {};
  let rate = rFrom[to];
  if(!rate) rate = 1;
  return amount * rate;
}

if($('btnPreview')){
  $('btnPreview').addEventListener('click', ()=>{
    const from = $('currencyFrom').value;
    const to = $('currencyTo').value;
    const amount = parseFloat($('amount').value);
    const method = $('payMethod').value;
    const account = $('account').value.trim();
    const commissionRate = parseFloat($('commissionRate').value) || 0;

    if(!from || !to){ alert('اختر العملات'); return; }
    if(isNaN(amount) || amount<=0){ alert('أدخل مبلغ صحيح'); return; }
    if(!method){ alert('اختر وسيلة الدفع'); return; }
    const v = validateAccount(method, account);
    if(!v.ok){ $('accountError').textContent = v.msg; return; } else { $('accountError').textContent = ''; }

    const converted = convertAmount(from,to,amount);
    const commission = (commissionRate/100)*amount;
    const totalAfter = (amount - commission);

    const payload = {from,to,amount:amount.toFixed(2),converted:converted.toFixed(2),method,account,commission:commission.toFixed(2),totalAfter:totalAfter.toFixed(2)};
    sessionStorage.setItem('cashitalia_order', JSON.stringify(payload));
    window.location.href = 'confirm.html';
  });
}

if(window.location.pathname.endsWith('confirm.html')){
  document.addEventListener('DOMContentLoaded', ()=>{
    const raw = sessionStorage.getItem('cashitalia_order');
    if(!raw) { $('summary').innerHTML = '<p>لا توجد بيانات. عد للرئيسية.</p>'; return; }
    const d = JSON.parse(raw);
    const summary = $('summary');
    summary.innerHTML = `
      <div class="card">
        <p><strong>من → إلى:</strong> ${d.from} → ${d.to}</p>
        <p><strong>المبلغ:</strong> ${d.amount} ${d.from}</p>
        <p><strong>بعد العمولة:</strong> ${d.totalAfter} ${d.from}</p>
        <p><strong>السعر التقريبي:</strong> ${d.converted} ${d.to}</p>
        <p><strong>وسيلة الدفع:</strong> ${d.method}</p>
        <p><strong>رقم الحساب:</strong> ${d.account}</p>
      </div>
    `;
    $('btnEdit').addEventListener('click', ()=> window.location.href='index.html');
    $('btnSend').addEventListener('click', ()=>{
      const whatsappNum = ''; // ضع رقم واتساب افتراضي هنا إن أردت مثل: '201012345678'
      const message = `طلب تحويل:%0Aمن ${d.from} إلى ${d.to}%0Aالمبلغ: ${d.amount} ${d.from}%0Aبعد العمولة: ${d.totalAfter} ${d.from}%0Aالسعر: ${d.converted} ${d.to}%0Aوسيلة: ${d.method}%0Aرقم الحساب: ${d.account}`;
      const url = whatsappNum ? `https://wa.me/${whatsappNum}?text=${message}` : `https://wa.me/?text=${message}`;
      window.open(url,'_blank');
    });
  });
}
