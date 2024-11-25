sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "../model/formatter"
],
    function (Controller, JSONModel, MessageBox, Filter, Fragment, formatter) {
        "use strict";

        return Controller.extend("com.app.zuichangenot.controller.View1", {
            onInit: function () {
                this.editInd = "";
                  var sParam = this.getOwnerComponent().getComponentData().startupParameters;
                this.getDetails(sParam.NotificationNo[0]);
                this.oModel = new JSONModel({
                    dDefaultDate: new Date(),
                    orderTyp: "",
                    saveBtnVis: false,
                    editable: false,
                    editbtnVis: true,
                    title: "Display Notification",
                    disBtn: false,
                    editBtn: true,
                    valueState: "None",
                    ftitle: "",
                    prtyDesc: "",
                    sysStatus: "",
                    Workctr: sParam.Workcenter[0],
                    ltext: ""

                });
                this.getView().setModel(this.oModel, "view");

            },

            getDetails: function (val) {
                var oModel = this.getOwnerComponent().getModel();
                var Filter1 = new Filter('Number', 'EQ', val.padStart(12, 0));
                var ofilter = [Filter1];
                var entity = "/GetNotificationDetailsSet"
                var that = this;
                oModel.read(entity, {
                    filters: ofilter,
                    urlParameters: { "$expand": "LongTextSet" },
                    "async": true,
                    "success": function (oData) {
                        var res = oData.results[0].NotifheaderExport;
                        var itm = oData.results[0].LongTextSet.results;
                        let text = "";
                        for (let i = 0; i < itm.length; i++) {

                            text += itm[i].Long_Text;
                        }
                        that.chngBtn(res.SysStatus, res.NotifType)
                        that.oModel.setProperty("/ltext", text);
                        that.prtyDesc(res.Priority);
                        that.notoModel = new JSONModel([]);
                        that.notoModel.setData(oData.results[0].NotifheaderExport)
                        that.getView().setModel(that.notoModel, "notifData");
                    },
                    "error": function (oError) {

                    }
                });
            },
            prtyDesc: function (prty) {
                switch (prty) {
                    case "1":
                        this.oModel.setProperty("/prtyDesc", "Machine Down");
                        break;
                    case "2":
                        this.oModel.setProperty("/prtyDesc", "Medium");
                        break;
                    case "3":
                        this.oModel.setProperty("/prtyDesc", "Low");
                        break;
                    case "4":
                        this.oModel.setProperty("/prtyDesc", "Safety");
                        break;
                    case "5":
                        this.oModel.setProperty("/prtyDesc", "High");
                        break;
                }
            },

            chngBtn: function (val, notTyp) {
                if (val === "NOCO ORAS" || val === "NOCO") {
                    this.oModel.setProperty("/comBtnVis", false);
                    this.oModel.setProperty("/editBtn", false);

                } else {
                    this.oModel.setProperty("/comBtnVis", true);
                    this.oModel.setProperty("/editBtn", true);

                }

                if (notTyp === "ZB") {
                    this.oModel.setProperty("/ftitle", "ZB - Breakdown Notification");
                    this.oModel.setProperty("/orderTyp", "ZBRD")
                } else if (notTyp === "ZG") {
                    this.oModel.setProperty("/ftitle", "ZG - General Notification");
                    this.oModel.setProperty("/orderTyp", "ZGEN")
                }

                switch (val) {
                    case "OSNO":
                        this.oModel.setProperty("/sysStatus", "OSNO - Outstanding Notification");
                        break;
                    case "NOPR ORAS":
                        this.oModel.setProperty("/sysStatus", "NOPR ORAS - Notification in Process & Order Assigned");
                        break;
                    case "NOCO":
                        this.oModel.setProperty("/sysStatus", "NOCO - Notification Completed");
                        break;
                    case "NOPR":
                        this.oModel.setProperty("/sysStatus", "NOPR - Notification in Process");
                        break;
                    case "ORAS":
                        this.oModel.setProperty("/sysStatus", "ORAS - Order Assigned");
                        break;
                    case "NOCO ORAS":
                        this.oModel.setProperty("/sysStatus", "NOCO ORAS - Notification Complete & Order Assigned ");
                        break;
                }
            },

            onEdit: function () {
                this.editInd = "X";
                this.oModel.setProperty("/saveBtnVis", true);
                this.oModel.setProperty("/editable", true);
                this.oModel.setProperty("/title", "Change Notification");
                this.oModel.setProperty("/disBtn", true);
                this.oModel.setProperty("/editBtn", false);
                this.oModel.setProperty("/ltext", "");
                this.oModel.setProperty("/valueState", "Information");
            },

            onDisplay: function () {
                this.oModel.setProperty("/saveBtnVis", false);
                this.oModel.setProperty("/editable", false);
                this.oModel.setProperty("/title", "Display Notification");
                this.oModel.setProperty("/disBtn", false);
                this.oModel.setProperty("/editBtn", true);
                this.oModel.setProperty("/valueState", "None");
            },
            onTypChange: function (evt) {
                var seltyp = evt.getSource().getSelectedKey();
                if (seltyp === "ZB") {
                    this.oModel.setProperty("/orderTyp", "ZBRD")
                } else if (seltyp === "ZG") {
                    this.oModel.setProperty("/orderTyp", "ZGEN")
                }

            },

            onSavePress: function () {
                var data = {
                    "Number": this.notoModel.getData().NotifNo,
                    "LongText": this.oModel.getData().ltext,
                    "Notifheader": {
                        "ShortText": this.notoModel.getData().ShortText,
                        "Planplant": this.notoModel.getData().Planplant
                    }
                }
                var croModel = this.getOwnerComponent().getModel();
                var that = this;
                croModel.create("/ChangeNotificationSet", data, {
                    method: "POST",
                    success: function (success) {
                        MessageBox.success("Text changed successfully", {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                that.onDisplay();
                            },
                            dependentOn: that.getView()
                        });
                    },
                    error: function (error) {
                        MessageBox.error("Error while changing long  text");
                    }
                });

            },

            onCreatePress: function (oEvent) {
                var oView = this.getView();
                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.app.zuichangenot.Fragment.createOrder",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));

            },
            onCloseDlg: function () {
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.close();
                }.bind(this));
            },

            onCreateWorkOrder: function () {
                if (this.editInd === "X") {
                    var data = {
                        "NotifNo": this.notoModel.getData().NotifNo,
                        "Planplant": this.notoModel.getData().Planplant,
                        "FunctLoc": this.notoModel.getData().FunctLoc,
                        "OrderType": this.oModel.getData().orderTyp,
                        "Equipment": this.notoModel.getData().Equipment,
                        "ShortText": this.notoModel.getData().ShortText,
                        "LongText": this.oModel.getData().ltext
                    }
                    this.onCreateWorkOrdersv(data);
                } else {
                    var data = {
                        "NotifNo": this.notoModel.getData().NotifNo,
                        "Planplant": this.notoModel.getData().Planplant,
                        "FunctLoc": this.notoModel.getData().FunctLoc,
                        "OrderType": this.oModel.getData().orderTyp,
                        "Equipment": this.notoModel.getData().Equipment
                    }
                    this.onCreateWorkOrdersv(data);
                }
            },

            onCreateWorkOrdersv: function (data) {
                var that = this;
                var croModel = this.getOwnerComponent().getModel();
                croModel.create("/CreateWorkOrderSet", data, {
                    method: "POST",
                    success: function (success) {
                        if (success.Type === "S") {
                            MessageBox.success(success.Message, {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    var CrossApplicationNavigation = sap.ushell.Container.getService("CrossApplicationNavigation");
                                    CrossApplicationNavigation.toExternal({
                                        target: {
                                            shellHash: "#"
                                        }
                                    });
                                },
                                dependentOn: that.getView()
                            });
                        } else if (success.Type === "E") {
                            MessageBox.error(success.Message);
                        }
                        that.onCloseDlg();
                    },
                    error: function (error) {
                        MessageBox.error("Error while creating Order");
                    }
                });
            },

            onComplete: function () {
                var data = {
                    "Number": this.notoModel.getData().NotifNo,
                    "Planplant": this.notoModel.getData().Planplant
                }
                var comModel = this.getOwnerComponent().getModel();
                var that = this;
                comModel.create("/CompleteNotificationSet", data, {
                    method: "POST",
                    success: function (success) {
                        if (success.Type === "S") {
                            MessageBox.success(success.Message, {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    that.getDetails(that.notoModel.getData().NotifNo);
                                },
                                dependentOn: that.getView()
                            });

                        } else if (success.Type === "E") {
                            MessageBox.error(success.Message);
                        }
                    },
                    error: function (error) {
                        MessageBox.error("Error while creating notification");
                    }
                });
            }

        });
    });
