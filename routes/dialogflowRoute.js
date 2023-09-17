const express = require('express');
const router = express.Router();

// Handle handleInvoiceNumber
const handleInvoiceNumber = async (req) => {

    let invoiceNumber = req.body.queryResult.parameters.invoice_number;

    let session = req.body.session;

    let response = await getInvoiceDetails(invoiceNumber);

    if (response.status == 5) {
        return {
            fulfillmentText: 'Something went wrong, please try after sometimes.'
        };
    }

    if (response.status == 0) {
        return {
            fulfillmentText: `We are sorry, the invoice number ${invoiceNumber} does not exist.`
        }
    }

    if (response.status == 1) {
        let contextName = `${session}/contexts/session`;
        let awaitSS = `${session}/contexts/await-snapshot`;
        let item = response.items[0];
        return {
            fulfillmentText: `Invoice Number: ${invoiceNumber}\nBusinessUnit: ${item.BusinessUnit}, ValidationStatus: ${item.ValidationStatus}, PaidStatus: ${item.PaidStatus}.\nDo you want me to show snap of invoice?`,
            outputContexts: [
                {
                    name: contextName,
                    lifespanCount: 50,
                    parameters: {
                        snapitem: response.items
                    }
                },
                {
                    name: awaitSS,
                    lifespanCount: 1
                }
            ]
        };
    }

    if (response.status == 2) {
        let contextName = `${session}/contexts/session`;
        let awaitBU = `${session}/contexts/await-business-unit`;
        let items = response.items;

        let outString = `This invoice number ${invoiceNumber} exists in more than one business units, Please select the business unit.\n`;

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (index == items.length - 1) {
                outString += `${index + 1}. ${item.BusinessUnit}`;
            } else {
                outString += `${index + 1}. ${item.BusinessUnit}\n`;
            }
        }

        return {
            fulfillmentText: outString,
            outputContexts: [
                {
                    name: contextName,
                    lifespanCount: 50,
                    parameters: {
                        items: items
                    }
                },
                {
                    name: awaitBU,
                    lifespanCount: 1
                }
            ]
        };
    }
};

// Handle handleOption
const handleOption = (req) => {

    let option = req.body.queryResult.parameters.option;

    let session = req.body.session;

    let outputContexts = req.body.queryResult.outputContexts;

    let items, invoiceNumber;

    outputContexts.forEach(outputContext => {
        let session = outputContext.name;
        if (session.includes('/contexts/session')) {
            if (outputContext.hasOwnProperty('parameters')) {
                items = outputContext.parameters.items;
                invoiceNumber = outputContext.parameters.invoice_number;
            }
        }
    });

    let item = items[option - 1];

    let contextName = `${session}/contexts/session`;
    let awaitSS = `${session}/contexts/await-snapshot`;
    return {
        fulfillmentText: `Invoice Number: ${invoiceNumber}\nBusinessUnit: ${item.BusinessUnit}, ValidationStatus: ${item.ValidationStatus}, PaidStatus: ${item.PaidStatus}.\nDo you want me to show snap of invoice?`,
        outputContexts: [
            {
                name: contextName,
                lifespanCount: 50,
                parameters: {
                    snapitem: [item]
                }
            },
            {
                name: awaitSS,
                lifespanCount: 1
            }
        ]
    };
};

// Handle handleSnapshot
const handleSnapshot = (req) => {

    let outputContexts = req.body.queryResult.outputContexts;

    let snapItem, invoiceNumber;

    outputContexts.forEach(outputContext => {
        let session = outputContext.name;
        if (session.includes('/contexts/session')) {
            if (outputContext.hasOwnProperty('parameters')) {
                snapItem = outputContext.parameters.snapitem;
                invoiceNumber = outputContext.parameters.invoice_number;
            }
        }
    });

    snapItem = snapItem[0];

    return {
        fulfillmentText: `Invoice Number: ${invoiceNumber}\nBusiness Unit: ${snapItem.BusinessUnit}\nSupplier: ${snapItem.Supplier}\nSupplier Site: ${snapItem.SupplierSite}\nInvoice Amount: ${snapItem.InvoiceAmount} ${snapItem.InvoiceCurrency}\nValidation Status: ${snapItem.ValidationStatus}\nPaid Status: ${snapItem.PaidStatus}\nAmount Paid: ${snapItem.AmountPaid}`
    }
};

// Webhook
router.post('/webhook', async (req, res) => {

    let action = req.body.queryResult.action;

    console.log('Webhook called.');
    console.log(`Action name --> ${action}`);
    console.log(`Session id --> ${req.body.session}`);

    let responseData = {};

    if (action === 'handleInvoiceNumber') {
        responseData = await handleInvoiceNumber(req);
    } else if (action === 'handleOption') {
        responseData = handleOption(req);
    } else if (action === 'handleSnapshot') {
        responseData = handleSnapshot(req);
    } else {
        responseData['fulfillmentText'] = `No action is set for the action ${action}`;
    }
    res.send(responseData);
});

module.exports = {
    router
};
