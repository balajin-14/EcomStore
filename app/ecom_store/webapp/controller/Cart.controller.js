sap.ui.define([
  "ecomstore/controller/BaseController",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (BaseController, MessageToast, MessageBox) {
  "use strict";

  return BaseController.extend("ecomstore.controller.Cart", {

    onInit: function () {
      this._bindCart();
    },

    _bindCart: function () {
      this.getView().bindElement({
        path: "/Carts",
        model: "customer",
        parameters: {
          $expand: "items"
        }
      });
    },

    onIncreaseQty: function (oEvent) {
      const oCtx = oEvent
        .getSource()
        .getBindingContext("customer");

      const iQty = oCtx.getProperty("quantity");

      oCtx.setProperty("quantity", iQty + 1);
      oCtx.getModel().submitBatch("customer");

      this._calculateTotal();
    },

    onDecreaseQty: function (oEvent) {
      const oCtx = oEvent
        .getSource()
        .getBindingContext("customer");

      const iQty = oCtx.getProperty("quantity");

      if (iQty > 1) {
        oCtx.setProperty("quantity", iQty - 1);
        oCtx.getModel().submitBatch("customer");
        this._calculateTotal();
      }
    },

    onRemoveItem: function (oEvent) {
      const oCtx = oEvent
        .getSource()
        .getBindingContext("customer");

      MessageBox.confirm("Remove this item from cart?", {
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            oCtx.delete().then(() => {
              MessageToast.show("Item removed");
              this._calculateTotal();
            });
          }
        }
      });
    },

    _calculateTotal: function () {
      const oView = this.getView();
      const oCtx = oView.getBindingContext("customer");

      if (!oCtx) {
        return;
      }

      const aItems = oCtx.getProperty("items") || [];
      let fTotal = 0;

      aItems.forEach(item => {
        fTotal += item.quantity * item.product.price;
      });

      oView.byId("totalText")
        .setText(`Total: ₹ ${fTotal.toFixed(2)}`);
    },

    onPlaceOrder: function () {
      const oModel = this.getOwnerComponent().getModel("customer");

      oModel.bindContext("/placeOrder(...)")
        .execute()
        .then(() => {
          MessageToast.show("Order placed successfully");

          this.getOwnerComponent()
            .getRouter()
            .navTo("MyOrders", {}, true);
        })
        .catch(() => {
          MessageBox.error("Failed to place order");
        });
    }

  });
});
