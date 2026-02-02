console.log("JS Loaded");

function initAddressForm() {
  const form = document.getElementById('addressForm');
  if (!form) {
    console.warn('addressForm not found; submit listener not attached.');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

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
