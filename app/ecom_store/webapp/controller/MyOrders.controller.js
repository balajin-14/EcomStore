sap.ui.define([
  "ecomstore/controller/BaseController"
], function (BaseController) {
  "use strict";

  return BaseController.extend("ecomstore.controller.MyOrders", {

    onInit: function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("MyOrders")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () {
     
    },

    /* =====================
       NAVIGATE TO ORDER DETAILS
       ===================== */
    onOrderSelect: function (oEvent) {
      const oItem = oEvent.getSource();              // ✅ press event
      const oCtx  = oItem.getBindingContext("customer");

      if (!oCtx) {
        console.error("Customer binding context missing");
        return;
      }

      const sOrderId = oCtx.getProperty("ID");

      this.getOwnerComponent()
        .getRouter()
        .navTo("OrderDetails", {
          orderId: sOrderId
        });
    },

    onNavBack: function () {
      this.getOwnerComponent()
        .getRouter()
        .navTo("ProductList", {}, true);
    }

  });
});
