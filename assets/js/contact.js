/* ============================================================
   Acadia International — Contact Form Handler
   Uses: Web3Forms API + SweetAlert2 v11
   ============================================================ */

const form        = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');

/* ── Brand colour used on all confirm buttons ── */
const BRAND_COLOR = '#0a6ebd';   /* Change to match your CSS theme colour */

/* ============================================================
   HELPER: Show a full-screen loading popup while the
   form data is being sent to Web3Forms
   ============================================================ */
function showLoading(name) {
  Swal.fire({
    title: `Submitting, ${name}…`,
    html: 'Please wait while we send your request.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

/* ============================================================
   HELPER: Success popup
   — animated checkmark, personalised message,
     timer progress bar, auto-close after 6 s
   ============================================================ */
function showSuccess(name) {
  Swal.fire({
    icon: 'success',
    title: `Thank You, ${name}! 🎉`,
    html: `
      <p style="font-size:15px; color:#444; margin:0;">
        Your consultation request has been received.<br><br>
        Our team will review your profile and contact you
        <strong>within 24 hours</strong> to discuss your
        Australian PR eligibility.
      </p>
      <hr style="margin:16px 0; border-color:#eee;">
      <p style="font-size:13px; color:#888; margin:0;">
        📧 Check your inbox for a confirmation email.<br>
        📞 Office Hours: Mon – Sat &nbsp;|&nbsp; 10 AM – 6 PM
      </p>
    `,
    confirmButtonText: 'Got it!',
    confirmButtonColor: BRAND_COLOR,
    timer: 6000,
    timerProgressBar: true,
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  });
}

/* ============================================================
   HELPER: Error popup
   — shown when Web3Forms returns a non-200 status
   ============================================================ */
function showError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Submission Failed',
    html: `
      <p style="font-size:15px; color:#444; margin:0;">
        ${message || 'Something went wrong. Please try again.'}
      </p>
      <hr style="margin:16px 0; border-color:#eee;">
      <p style="font-size:13px; color:#888; margin:0;">
        You can also reach us directly:<br>
        📧 <a href="mailto:info@acadiainternational.com"
               style="color:${BRAND_COLOR}">
               info@acadiainternational.com
            </a>
      </p>
    `,
    confirmButtonText: 'Try Again',
    confirmButtonColor: BRAND_COLOR
  });
}

/* ============================================================
   HELPER: Network / connection error popup
   ============================================================ */
function showNetworkError() {
  Swal.fire({
    icon: 'warning',
    title: 'Connection Problem',
    html: `
      <p style="font-size:15px; color:#444; margin:0;">
        We couldn't reach our server. Please check your
        internet connection and try again.
      </p>
      <hr style="margin:16px 0; border-color:#eee;">
      <p style="font-size:13px; color:#888; margin:0;">
        Alternatively, call us directly during office hours.<br>
        📞 Mon – Sat &nbsp;|&nbsp; 10 AM – 6 PM
      </p>
    `,
    confirmButtonText: 'OK',
    confirmButtonColor: BRAND_COLOR
  });
}

/* ============================================================
   HELPER: Validation toast — quick non-intrusive nudge
   shown only when honeypot (bot) is triggered
   ============================================================ */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

/* ============================================================
   MAIN: Form submit handler
   ============================================================ */
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const name     = (formData.get('name') || 'there').trim();

  /* ── Bot / spam check ── */
  if (formData.get('botcheck')) {
    Toast.fire({ icon: 'warning', title: 'Suspicious activity detected.' });
    return;
  }

  /* ── Disable button & show loading popup ── */
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Sending…</span>';
  showLoading(name);

  const payload = JSON.stringify(Object.fromEntries(formData));

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept'       : 'application/json'
      },
      body: payload
    });

    const result = await response.json();

    if (response.ok) {
      /* ── SUCCESS ── */
      form.reset();
      showSuccess(name);

      /* Optional toast confirmation on top of success popup */
      setTimeout(() => {
        Toast.fire({
          icon : 'success',
          title: 'Request sent successfully!'
        });
      }, 500);

    } else {
      /* ── API-level error ── */
      showError(result.message);
    }

  } catch (err) {
    /* ── Network / fetch error ── */
    showNetworkError();

  } finally {
    /* ── Always re-enable the button ── */
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Book Free Consultation</span>';
  }
});
