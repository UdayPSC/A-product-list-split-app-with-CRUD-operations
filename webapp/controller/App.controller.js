sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("project.controller.App", {
      onInit: function () {
          this.oRouter = this.getOwnerComponent().getRouter();
          this.oRouter.attachRouteMatched(this.onRouteMatched, this);
      },

      onRouteMatched: function (oEvent) {
          var sRouteName = oEvent.getParameter("name");
          var oArguments = oEvent.getParameter("arguments");

          var oSplitApp = this.byId("idAppControl");
          
          if (sRouteName === "master") {
              oSplitApp.toMaster(this.createId("masterPage"));
          } else if (sRouteName === "detail") {
              oSplitApp.toDetail(this.createId("detailPage"));
          }
      },
  });
});