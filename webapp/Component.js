sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "project/model/models"
 ], function (UIComponent, Device, models) {
    "use strict";
    return UIComponent.extend("project.Component", {
       metadata: {
          manifest: "json"
       },
       init: function () {
          // call the base component's init function
          UIComponent.prototype.init.apply(this, arguments);
 
          // set the device model
          this.setModel(models.createDeviceModel(), "device");
 
          // create the views based on the url/hash
          this.getRouter().initialize();
       },
       createContent: function () {
          // create root view
          var oView = new sap.ui.view({
             id: "app",
             viewName: "project.view.App",
             type: "XML",
             viewData: {
                component: this
             }
          });
 
          // set i18n model on view
          var i18nModel = new sap.ui.model.resource.ResourceModel({
             bundleName: "project.i18n.i18n"
          });
          oView.setModel(i18nModel, "i18n");
 
          return oView;
       }
    });
 });