export const SAMPLES = [
  {
    name: 'Pumpkin Delivery App',
    text: `# Pumpkin Delivery App

## Ordering
As a customer, I want to order pumpkins quickly, so that they arrive before Halloween night.
- The pumpkin catalogue should load fast and be user-friendly.
- Customers pick some pumpkins, carving kits, candles etc.
- An order confirmation email is sent after checkout.
- THE SYSTEM SHALL charge the card and email the receipt.

## Delivery
As a farm owner, I want to track every delivery, so that no pumpkin goes missing.
- Delivery status must be real-time and accurate.
- Drivers may skip a stop if the porch light is off.
- The app never loses an order and always works on all devices.
- Refund rules: TBD`,
  },
  {
    name: 'Haunted House Booking',
    text: `# Haunted House Tour Booking

As a visitor, I want to book a midnight tour, so that I can scare my friends.
- The booking form should be intuitive.
- Tickets are released instantly when a slot frees up.
- Visitors choose a tour and/or a ghost-hunt add-on.
- THE SYSTEM SHALL reserve the slot and SHALL send a reminder 1 hour before.
- Tours could be rescheduled as needed.
- Guests under 13 are not admitted without an adult.
- The waitlist must handle many guests reliably.`,
  },
  {
    name: 'Login & Accounts',
    text: `# Crypt Keeper Accounts

As a member, I want to sign in securely, so that my spell book stays private.
- Login must be fast and secure.
- Password reset should be simple.
- Sessions expire after inactivity.
- Failed attempts are locked after several tries.
- THE SYSTEM SHALL log every sign-in and alert the owner.
- The account page is 100% available with zero downtime.
- Error messages must be appropriate, helpful etc.`,
  },
];

export function renderSamples(selectElement, onSelect) {
  selectElement.innerHTML = '<option value="">Choose a cursed scroll...</option>';
  
  SAMPLES.forEach((sample, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = sample.name;
    selectElement.appendChild(option);
  });
  
  selectElement.addEventListener('change', (e) => {
    const index = parseInt(e.target.value, 10);
    if (!isNaN(index) && SAMPLES[index]) {
      onSelect(SAMPLES[index].text);
      e.target.value = '';
    }
  });
}

export function getSample(index) {
  return SAMPLES[index] || null;
}
