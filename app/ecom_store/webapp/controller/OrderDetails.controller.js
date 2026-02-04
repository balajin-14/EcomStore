sap.ui.define([
  "ecomstore/controller/BaseController",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox"
], function (BaseController, History, MessageBox) {
  "use strict";

  return BaseController.extend("ecomstore.controller.OrderDetails", {

    onInit: function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("OrderDetails")
        .attachPatternMatched(this._onMatched, this);
    },

    _onMatched: function (oEvent) {
      const sOrderId = oEvent.getParameter("arguments").orderId;

      // Bind VIEW to Order (customer scope)
      this.getView().bindElement({
        path: `/Orders(${sOrderId})`,
        model: "customer",
        parameters: {
          $expand: "items($expand=product)"
        },
        events: {
          dataRequested: () => this.getView().setBusy(true),
          dataReceived: (oEvent) => {
            this.getView().setBusy(false);

            if (!oEvent.getParameter("data")) {
              MessageBox.error("Order not found");
            }
          }
        }
      });
    },

    onNavBack: function () {
      const sPreviousHash = History.getInstance().getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent()
          .getRouter()
          .navTo("MyOrders", {}, true);
      }
    }

  });
});
