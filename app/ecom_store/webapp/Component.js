sap.ui.define([
  "sap/ui/core/UIComponent"
], function (UIComponent) {
  "use strict";

  return UIComponent.extend("ecomstore.Component", {

    metadata: {
      manifest: "json"
    },
    onInit: function () {
      const oSuppliersModel = this.getOwnerComponent().getModel("admin");
      this.getView().setModel(oSuppliersModel, "suppliers");
    },
    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      this.getRouter().initialize();
    }

  });
});
