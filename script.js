// Fee Payment Form Submission
document.getElementById('feePaymentForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
  
    const studentId = document.getElementById('studentId').value;
    const amount = document.getElementById('amount').value;
  
    alert(`Payment of ₹${amount} for Student ID ${studentId} successful!`);
    window.location.href = 'index.html';
  });