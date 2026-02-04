sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("ecomstore.controller.AdminOrders", {

    onOrderPress: function (oEvent) {
      const oItem = oEvent.getSource();  
      const oCtx  = oItem.getBindingContext("admin");

      const sOrderId = oCtx.getProperty("ID");

      this.getOwnerComponent()
        .getRouter()
        .navTo("AdminOrderDetails", {
          orderId: sOrderId
        });
    }

  });
});
