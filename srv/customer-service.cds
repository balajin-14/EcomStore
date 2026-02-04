using ecommerce from '../db/schema';

service CustomerService @(requires: 'authenticated-user') {

  entity CartItems as projection on ecommerce.CartItems {
    ID,
    quantity,
    cart.customer.ID as customerId,
    product.ID       as productId,
    product.name     as productName,
    product.price    as productPrice
  };

  action addToCart(productId: UUID);
  action placeOrder();
}
