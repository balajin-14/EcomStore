const cds = require("@sap/cds");

module.exports = cds.service.impl("CustomerService", async function () {

  const { Carts, CartItems, Products, Orders, OrderItems } = this.entities;
  
  this.on("addToCart", async (req) => {

    if (!req.user.is("Customer") && !req.user.is("Admin")) {
      req.reject(403, "Only customers can add to cart");
    }

    const { productId } = req.data;
    const userId = req.user.id;

    const tx = cds.tx(req);

    /* ----------------------------
       1️⃣ Read Product (EXPLICIT columns)
       ---------------------------- */
    const product = await tx.read(Products)
      .columns("ID", "name", "price", "stock")
      .where({ ID: productId });

    if (!product) {
      req.reject(404, "Product not found");
    }

    if (product.stock <= 0) {
      req.reject(400, "Product out of stock");
    }

    /* ----------------------------
       2️⃣ Read / Create Cart
       ---------------------------- */
    let cart = await tx.read(Carts)
      .columns("ID")
      .where({ customer_ID: userId });

    if (!cart) {
      cart = await tx.create(Carts, {
        customer_ID: userId
      });
    }

    /* ----------------------------
       3️⃣ Read Cart Item
       ---------------------------- */
    const item = await tx.read(CartItems)
      .columns("ID", "quantity")
      .where({
        cart_ID: cart.ID,
        product_ID: productId
      });

    /* ----------------------------
       4️⃣ Update or Insert Item
       ---------------------------- */
    if (item) {
      await tx.update(CartItems)
        .set({ quantity: item.quantity + 1 })
        .where({ ID: item.ID });
    } else {
      await tx.create(CartItems, {
        cart_ID: cart.ID,
        product_ID: productId,
        quantity: 1
      });
    }

    return { success: true };
  });

  /**
   * ============================
   * PLACE ORDER
   * ============================
   */
  this.on("placeOrder", async (req) => {

    if (!req.user.is("Customer") && !req.user.is("Admin")) {
      req.reject(403, "Only customers can place orders");
    }

    const userId = req.user.id;
    const tx = cds.tx(req);

    /* ----------------------------
       1️⃣ Read Cart
       ---------------------------- */
    const cart = await tx.read(Carts)
      .columns("ID")
      .where({ customer_ID: userId });

    if (!cart) {
      req.reject(400, "Cart is empty");
    }

    /* ----------------------------
       2️⃣ Read Cart Items
       ---------------------------- */
    const items = await tx.read(CartItems)
      .columns("ID", "quantity", "product_ID")
      .where({ cart_ID: cart.ID });

    if (!items || items.length === 0) {
      req.reject(400, "Cart is empty");
    }

    /* ----------------------------
       3️⃣ Calculate Total
       ---------------------------- */
    let totalAmount = 0;

    for (const item of items) {
      const product = await tx.read(Products)
        .columns("ID", "price", "stock", "name")
        .where({ ID: item.product_ID });

      if (!product || product.stock < item.quantity) {
        req.reject(
          400,
          `Insufficient stock for product ${product?.name}`
        );
      }

      totalAmount += product.price * item.quantity;
    }

    /* ----------------------------
       4️⃣ Create Order
       ---------------------------- */
    const order = await tx.create(Orders, {
      customer_ID: userId,
      status: "Pending",
      totalAmount
    });

    /* ----------------------------
       5️⃣ Create Order Items + Reduce Stock
       ---------------------------- */
    for (const item of items) {
      const product = await tx.read(Products)
        .columns("ID", "price", "stock")
        .where({ ID: item.product_ID });

      await tx.create(OrderItems, {
        order_ID: order.ID,
        product_ID: product.ID,
        quantity: item.quantity,
        price: product.price
      });

      await tx.update(Products)
        .set({ stock: product.stock - item.quantity })
        .where({ ID: product.ID });
    }

    /* ----------------------------
       6️⃣ Clear Cart
       ---------------------------- */
    await tx.delete(CartItems).where({ cart_ID: cart.ID });
    await tx.delete(Carts).where({ ID: cart.ID });

    return {
      success: true,
      orderId: order.ID
    };
  });

});
