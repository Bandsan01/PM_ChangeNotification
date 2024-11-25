sap.ui.define(function() {
	"use strict";

	var Formatter = {

        notifStatus : function(status){
            switch (status) {
                case "OSNO":
                    return "Outstanding Notification";
                    break;
                case "NOPR ORAS":
                    return "Notification in Process, Order Assigned ";
                    break;
                case "NOCO":
                    return "Notification completed" ;
                    break;
                case "NOPR":
                    return "Notification in process"
                    break;
                case "ORAS":
                    return "Order Assigned";
                    break;
                    case "NOPR ORAS":
                        return "Order Assigned";
                        break;
            }
        }
		
	};

	return Formatter;

});
