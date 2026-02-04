sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("ecomstore.controller.AdminOrderDetails", {

    onInit: function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("AdminOrderDetails")
        .attachPatternMatched(this._onMatched, this);
    },

    _onMatched: function (oEvent) {
      const sOrderId = oEvent.getParameter("arguments").orderId;
      this.getView().bindElement({
        path: `/Orders(${sOrderId})`,
        model: "admin",
        parameters: {
          $expand: "items($expand=product)"
        }
      });
    },

    onNavBack: function () {
      const sPrevHash = History.getInstance().getPreviousHash();
      if (sPrevHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent()
          .getRouter()
          .navTo("AdminOrders", {}, true);
      }
    }
  });
});
