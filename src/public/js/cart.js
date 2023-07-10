const addNumberBtns = document.querySelectorAll('.change-quantity-product-add');
for (const addNumberBtn of addNumberBtns) {
    addNumberBtn.addEventListener('click', () => {
        var productQuantity = addNumberBtn.parentElement.getElementsByClassName('quantity-product')[0];
        productQuantity.value = Number(productQuantity.value) + 1;
        updatePrice(productQuantity.value, addNumberBtn);
        changePrice();
    });
}

const subNumberBtns = document.querySelectorAll('.change-quantity-product-subtrac');
for (const subNumberBtn of subNumberBtns) {
    subNumberBtn.addEventListener('click', () => {
        var productQuantity = subNumberBtn.parentElement.getElementsByClassName('quantity-product')[0];
        productQuantity.value = Number(productQuantity.value) - 1;
        updatePrice(productQuantity.value, subNumberBtn);
        changePrice();
    });
}

function updatePrice(productQuantity, addNumberBtn) {
    var unit_price = addNumberBtn.parentElement.parentElement
        .getElementsByClassName('unit-price')[0]
        .innerText.substring(0, 3 - 1);
    addNumberBtn.parentElement.parentElement.getElementsByClassName('product-total')[0].innerText =
        unit_price * productQuantity + '$';
}

const checkInputProducts = document.querySelectorAll('.check-input-product');
var lengthList = checkInputProducts.length;
const totalOrder = document.querySelector('.price-total-order');

function changePrice() {
    var temp = 0;
    for (var i = 0; i < lengthList; i++) {
        if (checkInputProducts[i].checked) {
            var value =
                checkInputProducts[i].parentElement.parentElement.parentElement.getElementsByClassName(
                    'product-total',
                )[0].innerText;
            temp = temp + Number(value.substring(0, value.length - 1));
        }
    }
    totalOrder.innerText = temp + '$';
    temp = 0;
}

// function changePrice(element) {
//     if (element.checked == true) {
//         var valuePrice =
//             element.parentElement.parentElement.parentElement.getElementsByClassName('product-total')[0].innerText;
//         var length = valuePrice.length;
//         totalOrder.innerText = valuePrice.substring(0, length - 1) + '$';
//     } else {
//         totalOrder.innerText = '0$';
//     }

//     // console.log()
// }
