sap.ui.define([
  "ecomstore/controller/BaseController",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (BaseController, MessageToast, MessageBox) {
  "use strict";

  return BaseController.extend("ecomstore.controller.Signup", {

    onSignup: function () {
      const v = this.getView();

      const sName     = v.byId("signupNameInput").getValue().trim();
      const sEmail    = v.byId("signupEmailInput").getValue().trim().toLowerCase();
      const sPwd      = v.byId("signupPasswordInput").getValue();
      const sConfirm  = v.byId("signupConfirmPasswordInput").getValue();

      // basic validation
      if (!sName || !sEmail || !sPwd || !sConfirm) {
        MessageToast.show("All fields are required");
        return;
      }

      if (sPwd !== sConfirm) {
        MessageBox.error("Passwords do not match");
        return;
      }

      const oAdminModel = this.getOwnerComponent().getModel("admin");

      // OData V4: use list binding to create
      const oListBinding = oAdminModel.bindList("/Users");

      const oContext = oListBinding.create({
        name: sName,
        email: sEmail,
        password: sPwd,   // will be hashed in CAP backend
        role: "Customer"
      });

      oContext.created()
        .then(() => {
          MessageToast.show("Signup successful. Please login.");
          this.onGoToLogin();
        })
        .catch((oError) => {
          let sMsg = "Signup failed";
          try {
            const oResponse = JSON.parse(oError.message);
            if (oResponse.error && oResponse.error.message) {
              sMsg = oResponse.error.message;
            }
          } catch (e) { /* ignore */ }
          MessageBox.error(sMsg);
        });
    },

    onGoToLogin: function () {
      this.getOwnerComponent().getRouter().navTo("Login", {}, true);
    }

  });
});