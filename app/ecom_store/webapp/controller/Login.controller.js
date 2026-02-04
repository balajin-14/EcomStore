sap.ui.define([
  "ecomstore/controller/BaseController",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (BaseController, MessageToast, MessageBox) {
  "use strict";

  return BaseController.extend("ecomstore.controller.Login", {

    onLogin: function () {
      const oView = this.getView();

      const sEmail = oView.byId("loginEmailInput").getValue().trim().toLowerCase();
      const sPassword = oView.byId("loginPasswordInput").getValue();

      if (!sEmail || !sPassword) {
        sap.m.MessageToast.show("Please enter email and password");
        return;
      }

      const oAuthModel = this.getOwnerComponent().getModel("auth");

      const oAction = oAuthModel.bindContext("/login(...)");
      oAction.setParameter("email", sEmail);
      oAction.setParameter("password", sPassword);

      oAction.execute()
        .then(() => {
          const oUser = oAction.getBoundContext().getObject();

          localStorage.setItem("userId", oUser.id);
          localStorage.setItem("role", oUser.role);

          if (oUser.role === "Admin") {
            this.getOwnerComponent()
              .getRouter()
              .navTo("AdminDashboard", {}, true);
          } else {
            this.getOwnerComponent()
              .getRouter()
              .navTo("ProductList", {}, true);
          }
        })
        .catch((err) => {
          sap.m.MessageBox.error(err.message || "Login failed");
        });
    },

    onGoToSignup: function () {
      this.getOwnerComponent().getRouter().navTo("Signup");
    }

  });
});
