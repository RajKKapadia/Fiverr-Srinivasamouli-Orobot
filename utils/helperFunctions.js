const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const getInvoiceDetails = async (invoiceNumber) => {

    let config = {
        method: 'get',
        url: `${BASE_URL}/invoices?q=InvoiceNumber=${invoiceNumber}`,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: USERNAME,
            password: PASSWORD
        }
    };

    try {
        let response = await axios(config);
        if (response.status == 200) {
            let data = response.data;
            if (data.count == 0) {
                return {
                    status: 0,
                    items: [],
                    count: 0
                };
            }
            if (data.count == 1) {
                return {
                    status: 1,
                    items: data.items,
                    count: 1
                };
            }
            if (data.count > 1) {
                return {
                    status: 2,
                    items: data.items,
                    count: data.count
                };
            }
        } else {
            return {
                status: 5
            };
        }
    } catch (error) {
        console.log(`Error at getInvoiceDetails --> ${error}`);
        return {
            status: 5
        };
    }
};

module.exports = {
    getInvoiceDetails
};
