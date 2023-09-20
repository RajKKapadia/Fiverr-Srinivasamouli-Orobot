const axios = require('axios');
require('dotenv').config();

const getInvoiceDetails = async (base_url, username, password, bearer, invoiceNumber) => {

    let config = {
        method: 'get',
        url: `${base_url}/invoices?q=InvoiceNumber=${invoiceNumber}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`
        },
        auth: {
            username: username,
            password: password
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
