sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("ecomstore.controller.BaseController", {

    
    onLogout: function () {
      localStorage.clear();
      sessionStorage.clear();
      const sBaseUrl = window.location.origin + window.location.pathname;
      window.location.replace(sBaseUrl);
    }
  });
});
