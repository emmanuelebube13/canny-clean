// Price Calculator Logic
document.getElementById('pricing-type').addEventListener('change', function () {
    const detailsInput = document.getElementById('details-input');
    const selectedType = this.value;
  
    let inputHTML = '';
  
    if (selectedType === 'perCan') {
      inputHTML = `
        <label for="num-cans">Number of Cans:</label>
        <input type="number" id="num-cans" min="1" required>
        <label for="service-type">Service Type:</label>
        <select id="service-type" required>
          <option value="basic">Basic - $15 per can</option>
          <option value="premium">Premium - $20 per can</option>
        </select>
      `;
    } else if (selectedType === 'perHousehold') {
      inputHTML = `
        <label for="household-plan">Household Plan:</label>
        <select id="household-plan" required>
          <option value="oneTimeStandard">One-Time Standard - $30</option>
          <option value="monthlyStandard">Monthly Standard - $25</option>
          <option value="oneTimePremium">One-Time Premium - $40</option>
          <option value="monthlyPremium">Monthly Premium - $35</option>
        </select>
      `;
    } else if (selectedType === 'subscription') {
      inputHTML = `
        <label for="subscription-plan">Subscription Plan:</label>
        <select id="subscription-plan" required>
          <option value="standard">Standard - $30/month</option>
          <option value="premium">Premium - $40/month</option>
        </select>
      `;
    }
  
    detailsInput.innerHTML = inputHTML;
  });
  
  document.getElementById('calculate-btn').addEventListener('click', function () {
    const selectedType = document.getElementById('pricing-type').value;
    let priceResult = '';
  
    if (selectedType === 'perCan') {
      const numCans = parseInt(document.getElementById('num-cans').value, 10);
      const serviceType = document.getElementById('service-type').value;
      const pricePerCan = serviceType === 'basic' ? 15 : 20;
      priceResult = `Total Price: $${numCans * pricePerCan}`;
    } else if (selectedType === 'perHousehold') {
      const householdPlan = document.getElementById('household-plan').value;
      const prices = {
        oneTimeStandard: 30,
        monthlyStandard: 25,
        oneTimePremium: 40,
        monthlyPremium: 35,
      };
      priceResult = `Total Price: $${prices[householdPlan]}`;
    } else if (selectedType === 'subscription') {
      const subscriptionPlan = document.getElementById('subscription-plan').value;
      const price = subscriptionPlan === 'standard' ? 30 : 40;
      priceResult = `Monthly Price: $${price}`;
    }
  
    document.getElementById('price-result').textContent = priceResult;
  });
  
  // Contact Form Validation and Response
  document.getElementById('send-message-btn').addEventListener('click', function () {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const formResponse = document.getElementById('form-response');
  
    if (!name || !email || !message) {
      formResponse.textContent = 'Please fill in all fields.';
      formResponse.style.color = 'red';
      return;
    }
  
    formResponse.textContent = `Thank you, ${name}! We have received your message and will get back to you shortly.`;
    formResponse.style.color = '#0077cc';
  
    // Reset form fields
    document.getElementById('contact-form').reset();
  });
  