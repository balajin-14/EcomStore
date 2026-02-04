sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("ecomstore.controller.ProductList", {

    formatPrice: function (fPrice) {
      if (!fPrice) {
        return "₹ 0";
      }

      return "₹ " + String(fPrice).replace(/\.00$/, "");
    },

    onAddToCart: function (oEvent) {
      const oProduct = oEvent
        .getSource()
        .getBindingContext()
        .getObject();

      const oCustomerModel = this.getOwnerComponent().getModel("customer");

      const oAction = oCustomerModel.bindContext("/addToCart(...)");
      oAction.setParameter("productId", oProduct.ID);

      oAction.execute()
        .then(() => {
          MessageToast.show("Added to cart");
        })
        .catch((err) => {
          MessageToast.show(
            err.message || "Failed to add product to cart"
          );
        });
    },
    onGoToCart: function () {
      this.getOwnerComponent()
        .getRouter()
        .navTo("Cart");
    },

    onGoToOrders: function () {
      this.getOwnerComponent()
        .getRouter()
        .navTo("MyOrders");
    },

    /* =====================
       LOGOUT
       ===================== */
    onLogout: function () {
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("role");

      this.getOwnerComponent()
        .getRouter()
        .navTo("Login", {}, true);
    }

  });
});
