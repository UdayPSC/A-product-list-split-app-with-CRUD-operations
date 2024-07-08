sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet"  
  ], function (Controller, Filter, FilterOperator, Fragment, MessageToast, MessageBox, JSONModel, Spreadsheet) {
      "use strict";
  
    return Controller.extend("project.controller.Master", {
  
      formatStockStatus: function(iUnits) {
        if (iUnits >= 100) {
            return "Success"; // Green
        } else if (iUnits >= 50) {
            return "Warning"; // Amber
        } else {
            return "Error"; // Red
        }
    },
  
    formatStockStatusText: function(iUnits) {
        if (iUnits >= 100) {
            return "High Stock";
        } else if (iUnits >= 50) {
            return "Medium Stock";
        } else {
            return "Low Stock";
        }
    },
      onInit: function () {
        // var oModel = new sap.ui.model.json.JSONModel();
        // oModel.loadData("model/data.json");
        // this.getView().setModel(oModel);
        var oEventBus = sap.ui.getCore().getEventBus();
        oEventBus.subscribe("Detail", "ItemUpdated", this.onItemUpdated, this);
        var oViewModel = new JSONModel({
          deleteEnabled: false,
          nameState: "None",
          nameStateText: "",
          descriptionState: "None",
          descriptionStateText: "",
          unitsState: "None",
          unitsStateText: "",
          priceState: "None",
          priceStateText: "",
          companyNameState: "None",
          companyNameStateText: ""
        });
        this.getView().setModel(oViewModel, "viewModel");
        
        
        
    },
  
    onItemUpdated: function () {
        // Refresh the list binding
        var oList = this.byId("itemList");
        oList.getBinding("items").refresh();
    },
  
    onItemPress: function (oEvent) {
      var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
      var oContext = oItem.getBindingContext();
      var oSelectedItem = oContext.getObject();
      
      console.log("Selected item in Master view:", oSelectedItem);
      
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("detail", {
          id: oSelectedItem.id.toString()
      }, false);  // Set third parameter to false to keep the master view visible on small screens
    },
  
      // onItemPress: function (oEvent) {
      //   var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
        
          
  
      //   if (!oItem) {
      //     console.error("No list item found in the event.");
      //     return;
      //   }
  
      //   var oBindingContext = oItem.getBindingContext();
        
      //   if (!oBindingContext) {
      //     console.error("No binding context found for the list item.");
      //     return;
      //   }
  
      //   var sPath = oBindingContext.getPath();
        
      //   if (!sPath) {
      //     console.error("No path found in the binding context.");
      //     return;
      //   }
  
      //   var sItemId = sPath.split("/").pop(); // Extract item ID from path
      //   console.log("Navigating to detail with item ID:", sItemId);
  
      //   var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      //   oRouter.navTo("detail", {
      //     id: sItemId
      //   });
      // },
      
      onSearch: function(oEvent) {
        var sQuery = oEvent.getParameter("query");
        var oList = this.byId("itemList"); 
        var oBinding = oList.getBinding("items");
  
        if (sQuery && sQuery.length > 0) {
            var aFilters = [
                new Filter("name", FilterOperator.Contains, sQuery),
                new Filter("description", FilterOperator.Contains, sQuery),
                new Filter("units", FilterOperator.EQ, parseInt(sQuery)),
                new Filter("price", FilterOperator.EQ, parseFloat(sQuery)),
                new Filter("companyName", FilterOperator.Contains, sQuery)
            ];
            var oFilter = new Filter({
                filters: aFilters,
                and: false
            });
            oBinding.filter(oFilter);
        } else {
            oBinding.filter([]);
        }
      },
  
      onCreatePress: function () {
          var oView = this.getView();
      
          if (!this.pCreateDialog) {
            this.pCreateDialog = Fragment.load({
              id: oView.getId(),
              name: "project.view.CreateDialog",
              controller: this
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          this.pCreateDialog.then(function(oDialog) {
            oDialog.open();
          });
        },
    
        onInputChange: function (oEvent) {
          var sId = oEvent.getSource().getId();
          var sValue = oEvent.getParameter("value");
          this.validateInput(sId, sValue);
        },
    
    
        validateInput: function (sId, sValue) {
          var oViewModel = this.getView().getModel("viewModel");
          var bValid = true;
    
          switch (sId) {
            case this.byId("inputName").getId():
              bValid = sValue.trim().length >= 3;
              oViewModel.setProperty("/nameState", bValid ? "None" : "Error");
              oViewModel.setProperty("/nameStateText", bValid ? "" : "Name is required (min 3 characters)");
              break;
            case this.byId("inputDescription").getId():
              bValid = sValue.trim().length >= 10;
              oViewModel.setProperty("/descriptionState", bValid ? "None" : "Error");
              oViewModel.setProperty("/descriptionStateText", bValid ? "" : "Description is required (min 10 characters)");
              break;
            case this.byId("inputUnits").getId():
              bValid = parseFloat(sValue) > 0;
              oViewModel.setProperty("/unitsState", bValid ? "None" : "Error");
              oViewModel.setProperty("/unitsStateText", bValid ? "" : "Units must be a positive number");
              break;
            case this.byId("inputPrice").getId():
              bValid = parseFloat(sValue) > 0;
              oViewModel.setProperty("/priceState", bValid ? "None" : "Error");
              oViewModel.setProperty("/priceStateText", bValid ? "" : "Price must be a positive number");
              break;
            case this.byId("inputCompanyName").getId():
              bValid = sValue.trim().length > 0;
              oViewModel.setProperty("/companyNameState", bValid ? "None" : "Error");
              oViewModel.setProperty("/companyNameStateText", bValid ? "" : "Company name is required");
              break;
          }
    
          return bValid;
        },
    
        validateAllInputs: function () {
          var aInputs = [
            { id: "inputName", property: "nameState" },
            { id: "inputDescription", property: "descriptionState" },
            { id: "inputUnits", property: "unitsState" },
            { id: "inputPrice", property: "priceState" },
            { id: "inputCompanyName", property: "companyNameState" }
          ];
    
          var oViewModel = this.getView().getModel("viewModel");
          var bValid = true;
    
          aInputs.forEach(function (oInput) {
            var oInputControl = this.byId(oInput.id);
            var bInputValid = this.validateInput(oInputControl.getId(), oInputControl.getValue());
            bValid = bValid && bInputValid;
          }, this);
    
          return bValid;
        },
    
        onSavePress: function () {
          var bValid = this.validateAllInputs();
          if (!bValid) {
            MessageToast.show("Please correct the input errors before saving.");
            return;
          }
    
          var oDialog = this.byId("createDialog");
          var sName = this.byId("inputName").getValue();
          var sDescription = this.byId("inputDescription").getValue();
          var iUnits = parseInt(this.byId("inputUnits").getValue(), 10);
          var fPrice = parseFloat(this.byId("inputPrice").getValue());
          var sCompanyName = this.byId("inputCompanyName").getValue();
    
          var oModel = this.getView().getModel();
          var aItems = oModel.getProperty("/items");
      
          var iNewId = aItems.length > 0 ? Math.max(...aItems.map(item => item.id)) + 1 : 1;
      
          var oNewItem = {
            id: iNewId,
            name: sName,
            description: sDescription,
            units: iUnits,
            price: fPrice,
            companyName: sCompanyName,
            discontinued: false
          };
      
          aItems.unshift(oNewItem);
          oModel.setProperty("/items", aItems);
      
          console.log("Updated items after adding new item:", oModel.getProperty("/items"));
    
          oDialog.close();
    
          // Reset input fields
          this.byId("inputName").setValue("");
          this.byId("inputDescription").setValue("");
          this.byId("inputUnits").setValue("");
          this.byId("inputPrice").setValue("");
          this.byId("inputCompanyName").setValue("");
    
          MessageToast.show("Product created successfully");
        },
    
        onCancelPress: function () {
          // Reset input fields and close dialog
          this.byId("inputName").setValue("");
          this.byId("inputDescription").setValue("");
          this.byId("inputUnits").setValue("");
          this.byId("inputPrice").setValue("");
          this.byId("inputCompanyName").setValue("");
    
          this.byId("createDialog").close();
        },
  //     onDelete: function () {
  //       var oList = this.byId("itemList");
  //       var oSelectedItem = oList.getSelectedItem();
        
  //       if (oSelectedItem) {
  //           var sPath = oSelectedItem.getBindingContext().getPath();
  //           var oModel = this.getView().getModel();
  //           var oItemToDelete = oModel.getProperty(sPath);
            
  //           // Ask for user confirmation
  //           sap.m.MessageBox.confirm(
  //               "Are you sure you want to delete " + oItemToDelete.name + "?",
  //               {
  //                   title: "Confirm Deletion",
  //                   onClose: function(oAction) {
  //                       if (oAction === sap.m.MessageBox.Action.OK) {
  //                           // User confirmed, proceed with deletion
  //                           var aItems = oModel.getProperty("/items");
  //                           var iIndex = aItems.findIndex(function(item) {
  //                               return item.id === oItemToDelete.id;
  //                           });
                            
  //                           if (iIndex > -1) {
  //                               aItems.splice(iIndex, 1);
  //                               oModel.setProperty("/items", aItems);
  //                               oList.removeSelections(true);
  //                               sap.m.MessageToast.show("Product deleted successfully");
  //                           } else {
  //                               sap.m.MessageToast.show("Error: Product not found");
  //                           }
  //                       } else {
  //                           // User cancelled the deletion
  //                           sap.m.MessageToast.show("Deletion cancelled");
  //                       }
  //                   }
  //               }
  //           );
  //       } else {
  //           sap.m.MessageToast.show("Please select a product to delete");
  //       }
  //   }
  
  onSelectionChange: function(oEvent) {
      var oList = oEvent.getSource();
      var aSelectedItems = oList.getSelectedItems();
      var oViewModel = this.getView().getModel("viewModel");
      
      oViewModel.setProperty("/deleteEnabled", aSelectedItems.length > 0);
    },
  
    onDeleteSelected: function() {
      var oList = this.byId("itemList");
      var aSelectedItems = oList.getSelectedItems();
      
      if (aSelectedItems.length === 0) {
        MessageToast.show("Please select at least one item to delete");
        return;
      }
  
      var sConfirmText = aSelectedItems.length === 1 
        ? "Are you sure you want to delete the selected item?"
        : "Are you sure you want to delete " + aSelectedItems.length + " items?";
  
      MessageBox.confirm(sConfirmText, {
        title: "Confirm Deletion",
        onClose: function(oAction) {
          if (oAction === MessageBox.Action.OK) {
            this.deleteSelectedItems(aSelectedItems);
          } else {
            MessageToast.show("Deletion cancelled");
          }
        }.bind(this)
      });
    },
  
    deleteSelectedItems: function(aSelectedItems) {
      var oModel = this.getView().getModel();
      var aItems = oModel.getProperty("/items");
      var aItemsToDelete = aSelectedItems.map(function(oItem) {
        return oItem.getBindingContext().getObject();
      });
  
      aItemsToDelete.forEach(function(oItemToDelete) {
        var iIndex = aItems.findIndex(function(item) {
          return item.id === oItemToDelete.id;
        });
        if (iIndex > -1) {
          aItems.splice(iIndex, 1);
        }
      });
  
      oModel.setProperty("/items", aItems);
      this.byId("itemList").removeSelections(true);
      
      // Update the view model to disable the delete button
      var oViewModel = this.getView().getModel("viewModel");
      oViewModel.setProperty("/deleteEnabled", false);
      
      var sMessage = aItemsToDelete.length === 1
        ? "1 item deleted successfully"
        : aItemsToDelete.length + " items deleted successfully";
      
      MessageToast.show(sMessage);
    },
  
    onExportToExcel: function() {
      var oTable = this.byId("itemList");
      var oRowBinding = oTable.getBinding("items");
      var aCols = this.createColumnConfig();
  
      var oSettings = {
        workbook: {
          columns: aCols,
          hierarchyLevel: 'Level'
        },
        dataSource: oRowBinding,
        fileName: 'TechProducts.xlsx',
        worker: false
      };
  
      var oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function() {
        oSheet.destroy();
      });
    },
  
    createColumnConfig: function() {
      return [
        {
          label: 'Name',
          property: 'name',
          type: 'string'
        },
        {
          label: 'Description',
          property: 'description',
          type: 'string'
        },
        {
          label: 'Units',
          property: 'units',
          type: 'number'
        },
        {
          label: 'Price',
          property: 'price',
          type: 'number',
          scale: 2,
          delimiter: true
        },
        {
          label: 'Company Name',
          property: 'companyName',
          type: 'string'
        }
      ];
    }
    });
  });
  