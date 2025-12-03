document.getElementById('exchangeForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const fromCurrency = document.getElementById('fromCurrency').value;
  const toCurrency = document.getElementById('toCurrency').value;
  const account = document.getElementById('accountNumber').value;
  const bank = document.getElementById('bank').value;

  if(account.length < 6){
    alert('رقم الحساب غير صحيح!');
    return;
  }

  localStorage.setItem('exchangeData', JSON.stringify({amount, fromCurrency, toCurrency, account, bank}));
  window.location.href='confirm.html';
});
