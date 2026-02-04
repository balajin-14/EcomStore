namespace ecommerce;

using { cuid } from '@sap/cds/common';

type UserRole : String enum {
  Customer;
}

type OrderStatus : String enum {
  Pending;
  Paid;
  Shipped;
  Delivered;
  Cancelled;
}

entity Users : cuid{
  name  : String(100);
  email : String(100) @assert.unique;
  password : String(200);
  role  : UserRole;
}

entity Suppliers : cuid,{
  name      : String(100);
  contactNo : String(20);
  email     : String(100);

  products  : Association to many Products
                on products.supplier = $self;
}

entity Products : cuid{
  name        : String(150);
  description : String(500);
  price       : Decimal(10,2);
  stock       : Integer;
  imageUrl    : LargeString;
  rating      : Decimal(2,1);
  ratingCount : Integer;
  supplier    : Association to Suppliers;
}

entity Carts : cuid{
  customer : Association to Users;
  items    : Composition of many CartItems
               on items.cart = $self;
}

entity CartItems : cuid {
  cart     : Association to Carts;
  product  : Association to Products;
  quantity : Integer;
}

entity Orders : cuid{
  customer    : Association to Users;
  status      : OrderStatus default 'Pending';
  totalAmount : Decimal(10,2);

  items       : Composition of many OrderItems
                  on items.order = $self;
}

entity OrderItems : cuid {
  order    : Association to Orders;
  product  : Association to Products;
  quantity : Integer;
  price    : Decimal(10,2);
}
