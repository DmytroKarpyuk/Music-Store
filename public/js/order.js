const stripe = Stripe('pk_test_51H5FVeKtxSFU6gBct5dCEeP1vK2X0s5lqnT7joVa09C85a7sadZN47hP9pQd2jKwhjuuwNrH8j3RDok3m22SAV1f00bIdgvgUE'); // Your Publishable Key
const elements = stripe.elements();

// Create our card inputs
var style = {
    base: {
        color: "#000000"
    }
};

const card = elements.create('card', { style });
card.mount('#card-element');

const form = document.querySelector('form');
const errorEl = document.querySelector('#card-errors');

// Give our token to our form
const stripeTokenHandler = token => {
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);
    form.submit();
}

// Create token from card data
form.addEventListener('submit', e => {
    e.preventDefault();

    stripe.createToken(card).then(res => {
        if (res.error) errorEl.textContent = res.error.message;
        else stripeTokenHandler(res.token);
    })
})