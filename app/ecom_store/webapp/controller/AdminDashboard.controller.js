sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function (Controller, Fragment, MessageToast, MessageBox, JSONModel) {
  "use strict";

  return Controller.extend("ecomstore.controller.AdminDashboard", {

    onInit: function () {
      this.getView().setModel(
        this.getOwnerComponent().getModel("admin"),
        "admin"
      );
    }
    ,
    onSupplierSuggest: function (oEvent) {
      const sValue = oEvent.getParameter("suggestValue");
      const oInput = oEvent.getSource();
      const oBinding = oInput.getBinding("suggestionItems");

      if (!oBinding) return;

      const aFilters = [];
      if (sValue) {
        aFilters.push(
          new sap.ui.model.Filter(
            "name",
            sap.ui.model.FilterOperator.Contains,
            sValue
          )
        );
      }

      oBinding.filter(aFilters);
    }

    ,
    onSupplierSelect: function (oEvent) {
      const oItem = oEvent.getParameter("selectedItem");

      const sSupplierId = oItem.getKey();
      const sSupplierName = oItem.getText();

      const oFormModel = this._oDialog.getModel("form");

      oFormModel.setProperty("/supplier_ID", sSupplierId);
      oFormModel.setProperty("/supplierName", sSupplierName);
    },

    onAddProduct: function () {
      this._openDialog({
        name: "",
        description: "",
        price: null,
        stock: null,
        imageUrl: "",
        rating: 0,
        ratingCount: 0
      });
    },


    onEditProduct: function (oEvent) {
      const oCtx = oEvent
        .getSource()
        .getBindingContext("admin");

      const oData = oCtx.getObject();


      this._openDialog({
        ID: oData.ID,
        name: oData.name,
        description: oData.description,
        price: oData.price,
        stock: oData.stock,
        imageUrl: oData.imageUrl
      }, oCtx);
    },

    /* ================= DELETE ================= */
    onDeleteProduct: function (oEvent) {
      const oCtx = oEvent
        .getSource()
        .getBindingContext("admin");

      MessageBox.confirm("Delete this product?", {
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.OK) {
            oCtx.delete()
              .then(() => MessageToast.show("Product deleted"))
              .catch(() => MessageBox.error("Delete failed"));
          }
        }
      });
    },

    _openDialog: function (oData, oCtx) {
      this._oEditContext = oCtx || null;

      if (!this._oDialog) {
        Fragment.load({
          name: "ecomstore.view.fragments.ProductDialog",
          controller: this
        }).then((oDialog) => {
          this._oDialog = oDialog;
          this.getView().addDependent(oDialog);

          // 🔥 REQUIRED
          this._oDialog.setModel(
            this.getOwnerComponent().getModel("admin"),
            "admin"
          );

          this._setDialogModel(oData);
          oDialog.open();
        });
      } else {
        this._setDialogModel(oData);
        this._oDialog.open();
      }
    }
    ,

    _setDialogModel: function (oData) {
      const oModel = new JSONModel(JSON.parse(JSON.stringify(oData)));
      this._oDialog.setModel(oModel, "form");
    },

    onSaveProduct: function () {
      const oAdminModel = this.getOwnerComponent().getModel("admin");
      const oData = this._oDialog.getModel("form").getData();

      if (!oData.name || oData.price === null) {
        MessageToast.show("Name and price are required");
        return;
      }

      /* ===== EDIT ===== */
      if (this._oEditContext) {
        this._oEditContext.setProperty("name", oData.name);
        this._oEditContext.setProperty("description", oData.description);
        this._oEditContext.setProperty("price", oData.price);
        this._oEditContext.setProperty("stock", oData.stock);
        this._oEditContext.setProperty("imageUrl", oData.imageUrl);
        this._oEditContext.setProperty("rating", Number(oData.rating) || 0);
        this._oEditContext.setProperty("ratingCount", Number(oData.ratingCount) || 0);
        this._oEditContext.setProperty("supplier_ID", oData.supplier_ID);

        MessageToast.show("Product updated");
        this._closeDialog();
        return;
      }

      /* ===== CREATE ===== */
      oAdminModel.bindList("/Products")
        .create({
          name: oData.name,
          description: oData.description,
          price: oData.price,
          stock: oData.stock,
          imageUrl: oData.imageUrl,
          rating: Number(oData.rating) || 0,
          ratingCount: Number(oData.ratingCount) || 0,
          supplier_ID: oData.supplier_ID
        })

        .created()
        .then(() => {
          MessageToast.show("Product created");
          this._closeDialog();
        })
        .catch(() => MessageBox.error("Create failed"));
    },

    onCloseDialog: function () {
      this._closeDialog();
    },

    _closeDialog: function () {
      if (this._oDialog) {
        this._oDialog.close();
      }
      this._oEditContext = null;
    },
    onLogout: function () {
      this.getOwnerComponent().getRouter().navTo("Login", {}, true);
    },
    onAddSupplier: function () {
      const oData = {
        name: "",
        contactNo: "",
        email: ""
      };

      if (!this._oSupplierDialog) {
        sap.ui.core.Fragment.load({
          name: "ecomstore.view.fragments.SupplierDialog",
          controller: this
        }).then((oDialog) => {
          this._oSupplierDialog = oDialog;
          this.getView().addDependent(oDialog);
          this._oSupplierDialog.setModel(
            this.getOwnerComponent().getModel("admin"),
            "admin"
          );
          this._setSupplierDialogModel(oData);
          oDialog.open();

        });
      } else {
        this._setSupplierDialogModel(oData);
        this._oSupplierDialog.open();
      }
    },
    _setSupplierDialogModel: function (oData) {
      const oModel = new sap.ui.model.json.JSONModel(
        JSON.parse(JSON.stringify(oData))
      );
      this._oSupplierDialog.setModel(oModel, "supplierForm");
    },
    onSaveSupplier: function () {
      const oModel = this._oSupplierDialog.getModel("admin");
      const oData = this._oSupplierDialog
        .getModel("supplierForm")
        .getData();

      if (!oData.name) {
        MessageToast.show("Supplier name is required");
        return;
      }

      const oListBinding = oModel.bindList("/Suppliers");

      const oContext = oListBinding.create({
        name: oData.name,
        contactNo: oData.contactNo,
        email: oData.email
      });


      oContext.created().then(() => {
        MessageToast.show("Supplier created");
        this.onCloseSupplierDialog();
        oModel.refresh();
      });
    },

    onCloseSupplierDialog: function () {
      if (this._oSupplierDialog) {
        this._oSupplierDialog.getModel("supplierForm").setData({
          name: "",
          contactNo: "",
          email: ""
        });
        this._oSupplierDialog.close();
      }
    }
  });
});
