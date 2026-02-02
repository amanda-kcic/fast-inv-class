console.log("JS Loaded");

function initAddressForm() {
  const form = document.getElementById('addressForm');
  if (!form) {
    console.warn('addressForm not found; submit listener not attached.');
    return;
  }

  console.log('addressForm found — attaching submit listener');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('addressForm submit intercepted (form-level)');

    const formData = new FormData(form);

    const data = {
      address_name: formData.get('address_name'),
      type_id: formData.get('type_id'),
      locations: formData.get('locations'),
      pincode: formData.get('pincode'),
      user_id: formData.get('user_id')
    };

    try {
      const res = await fetch('/address/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message || 'Saved');
      form.reset();
    } catch (err) {
      console.error('Failed to submit address:', err);
      alert('Failed to save address. Please try again.');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAddressForm);
} else {
  initAddressForm();
}

// Fallback: attach a document-level submit listener (capturing) to ensure we catch
// submits even if the form-level listener wasn't attached for some reason.
document.addEventListener('submit', function (e) {
  const form = e.target;
  if (!form || form.id !== 'addressForm') return;

  // If the form-level handler prevented default already, do nothing.
  if (e.defaultPrevented) {
    console.log('submit already prevented by form-level handler');
    return;
  }

  // Prevent the default navigation and handle submission here.
  e.preventDefault();
  console.log('addressForm submit intercepted (document-level fallback)');

  const formData = new FormData(form);
  const data = {
    address_name: formData.get('address_name'),
    type_id: formData.get('type_id'),
    locations: formData.get('locations'),
    pincode: formData.get('pincode'),
    user_id: formData.get('user_id')
  };

  (async () => {
    try {
      const res = await fetch('/address/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.message || 'Saved');
      form.reset();
    } catch (err) {
      console.error('Failed to submit address (fallback):', err);
      alert('Failed to save address. Please try again.');
    }
  })();

}, true);
