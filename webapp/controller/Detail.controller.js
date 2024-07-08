sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
  ], function (Controller, JSONModel, MessageToast, History, UIComponent) {
    "use strict";
  
    return Controller.extend("project.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
  
            // Initialize view model
            var oViewModel = new JSONModel({
                isEditing: false
            });
            this.getView().setModel(oViewModel, "viewModel");
        },
  
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").id;
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            
            var oItem = aItems.find(function(item) {
                return item.id.toString() === sObjectId;
            });
  
            if (oItem) {
                // Store the original data
                this._originalData = JSON.parse(JSON.stringify(oItem));
                
                // Bind the view to this item's path
                var sPath = "/items/" + aItems.indexOf(oItem);
                this.getView().bindElement(sPath);
  
                // Reset edit mode
                this.getView().getModel("viewModel").setProperty("/isEditing", false);
            } else {
                console.error("Item not found:", sObjectId);
            }
        },
  
        onEditPress: function () {
            this.getView().getModel("viewModel").setProperty("/isEditing", true);
        },
  
        onSavePress: function () {
            var oModel = this.getView().getModel();
            var sPath = this.getView().getElementBinding().getPath();
            var oData = oModel.getProperty(sPath);
  
            // Update the original data
            this._originalData = JSON.parse(JSON.stringify(oData));
            
            this.getView().getModel("viewModel").setProperty("/isEditing", false);
            MessageToast.show("Changes saved successfully");
  
            // Refresh the master list
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("Detail", "ItemUpdated");

        //     var oHistory = History.getInstance();
        //   var sPreviousHash = oHistory.getPreviousHash();
  
        //   if (sPreviousHash !== undefined) {
        //       window.history.go(-1);
        //   } else {
        //       var oRouter = this.getOwnerComponent().getRouter();
        //       oRouter.navTo("master", {}, true);
        //   }
        },
  
        onCancelPress: function () {
            var oModel = this.getView().getModel();
            var sPath = this.getView().getElementBinding().getPath();
            
            // Revert changes
            oModel.setProperty(sPath, JSON.parse(JSON.stringify(this._originalData)));
            
            // Exit edit mode
            this.getView().getModel("viewModel").setProperty("/isEditing", false);
            
            MessageToast.show("Changes discarded");

        //     var oHistory = History.getInstance();
        //   var sPreviousHash = oHistory.getPreviousHash();
  
        //   if (sPreviousHash !== undefined) {
        //       window.history.go(-1);
        //   } else {
        //       var oRouter = this.getOwnerComponent().getRouter();
        //       oRouter.navTo("master", {}, true);
        //   }
        },
  
        onNavBack: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();
  
          if (sPreviousHash !== undefined) {
              window.history.go(-1);
          } else {
              var oRouter = this.getOwnerComponent().getRouter();
              oRouter.navTo("master", {}, true);
          }
        },

        onPressModeBtn: function (oEvent) {
            var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();
            var oSplitApp = this.getSplitApp();
            
            if (oSplitApp) {
                oSplitApp.setMode(sSplitAppMode);
                MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, { duration: 5000 });
            } else {
                MessageToast.show("Unable to find SplitApp control", { duration: 5000 });
            }
        },

        getSplitApp: function () {
            var oView = this.getView();
            while (oView.getParent() && oView.getParent().getMetadata().getName() != "sap.m.SplitApp") {
                oView = oView.getParent();
            }
            return oView.getParent();
        }
    });
  });