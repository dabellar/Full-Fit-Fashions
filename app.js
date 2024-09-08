"use strict";
/**
 * @author: Darleine Abellard 
 * CS132 SP24 
 * Final Project 
 * 
 * The Node project for Full Fit Fashions
 * 
 * This API supports the following endpoints:
 *  GET /FAQ
 *  GET /stock
 *  GET /stock/:category
 *  GET /stock/:category/:type
 *  GET /clothing/:type/:classification
 *  
 *  POST /contact
 *  POST /placeOrder
 */

const express = require("express");
const fs = require("fs/promises");
const multer = require("multer");
const globby = require("globby");
const path = require("path");

const CLIENT_ERR_CODE = 400;
const SERVER_ERR_CODE = 500;
const SERVER_ERROR = "Server error... Please try again later."
const DEBUG = true;
const BASE_FEEDBACK = "fff-data/feedback";
const BASE_STOCK = "fff-data/stock"

const app = express();
app.use(express.urlencoded({extended:true})); 
app.use(express.json());
app.use(multer().none());
app.use(express.static("public"));


/******************************* GET ENDPOINTS ********************************/

/**
 * Returns an array of JSON objects of all the FAQs
 * Shows a 500 error if an error occurs on the server
 */
app.get("/FAQ", async(req, res, next) => {
    try {
        let faqs = await getFAQData();
        res.json(faqs);
    } catch (err) {
        res.status(SERVER_ERR_CODE);
        err.message = SERVER_ERROR;
        next(err);
    }
});

/**
 * Returns a list of JSON objects of the full stock 
 * sorted by category and type
 * Shows a 500 error if an error occurs on the server
 */
app.get("/stock", async(req, res, next) => {
    try {
        let fullStock = await getStock();
        res.json(fullStock);
    } catch (err) {
        res.status(SERVER_ERR_CODE);
        err.message = SERVER_ERROR;
        next(err);
    }
});

/**
 * Returns a list of JSON objects of the stock of a given
 * category
 * Shows a 400 error if the client inputs the wrong category
 * Shows a 500 if an error occurs on the server
 */
app.get("/stock/:category", async(req, res, next) => {
    let categoryDir = req.params.category.toLowerCase();
    let accepted = await fs.readdir(BASE_STOCK + "/");
    if (accepted.includes(categoryDir)) {
        try {
            let categoryStock = await getCategoryStock(categoryDir);
            res.json(categoryStock);
        } catch (err) {
            res.status(SERVER_ERR_CODE);
            err.message = SERVER_ERROR;
            next(err);
        }
    } else {
        res.status(CLIENT_ERR_CODE);
        next(Error("Invalid category for /stock/:category"));
    }
});

/**
 * Returns a list of JSON objects of the stock of a given
 * category and type
 * Shows a 400 error if the client inputs the wrong category and type
 * Shows a 500 if an error occurs on the server
 */
app.get("/stock/:category/:type", async(req, res, next) => {
    let categoryDir = req.params.category.toLowerCase();
    let typeDir = req.params.type.toLowerCase();
    let acceptedCate = await fs.readdir(BASE_STOCK + "/");
    if (acceptedCate.includes(categoryDir)) {
        let acceptedType = await fs.readdir(BASE_STOCK + "/" + categoryDir + "/");
        if (acceptedType.includes(typeDir)) {
            try {
                let typeStock = await getTypeStock(categoryDir, typeDir);
                res.json(typeStock);
            } catch (err) {
                res.status(SERVER_ERR_CODE);
                err.message = SERVER_ERROR;
                next(err);
            }
        } else {
            res.status(CLIENT_ERR_CODE);
            next(Error("Invalid type for /stock/:category/:type"));
        }
    } else {
        res.status(CLIENT_ERR_CODE);
        next(Error("Invalid category for /stock/:category/:type"))
    }
});

/**
 * Returns a list of JSON objects of the stock of a given
 * clothing category, type, and classification
 * Shows a 400 error if the client inputs the wrong category, type, 
 * or classification
 * Shows a 500 if an error occurs on the server
 */
app.get("/clothing/:type/:classification", async (req, res, next) => {
    let typeDir = req.params.type.toLowerCase();
    let classDir = req.params.classification.toLowerCase();
    let acceptedType = await fs.readdir(BASE_STOCK + "/clothing");
    if (acceptedType.includes(typeDir)) {
        let acceptedClass = await fs.readdir(BASE_STOCK + "/clothing/" + typeDir + "/");
        if (acceptedClass.includes(classDir)) {
            try {
                let classStock = await getClassStock(typeDir, classDir);
                res.json(classStock);
            } catch (err) {
                res.status(SERVER_ERR_CODE);
                err.message = SERVER_ERROR;
                next(err);
            }
        } else {
            res.status(CLIENT_ERR_CODE);
            next(Error("Invalid classification for /stock/:type/:classification"));
        }
    } else {
        res.status(CLIENT_ERR_CODE);
        next(Error("Invalid type for /stock/:type/:classification"))
    }
});

/****************************** POST ENDPOINTS ********************************/
/**
 * Posts user feedback from a contact form
 * Sends a 500 error if an error occurs on the server and a
 * sends a 400 error if the wrong parameters are passed through
 */
app.post("/contact", async(req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let comment = req.body.content;
    let userFeedback = formatContact(name, email, comment);
    if (!userFeedback) {
        res.status(CLIENT_ERR_CODE);
        next(Error("All fields (name, email, and content) are required for /contact"));
    }
    try {
        await storeUserMessage(email, userFeedback);
        res.type("text");
        res.send("Sent! Thank you for your feedback!");
    } catch (err) {
        res.status(SERVER_ERR_CODE);
        err.message = SERVER_ERROR;
        next(err);
    }
});

// /**
//  * admin page
//  * Updates the quantity of an item from an update form
//  */
// app.post("/updateItem", async(req, res, next) => {
//     let categoryName = req.body.item_category;
//     let typeName = req.body.item_type;
//     let itemName = req.body.item_name;
//     let itemSize = req.body.item_size
//     let quantityNum = req.body.item_quantity;
//     if (!validateUpdate(categoryName, typeName, itemName, itemSize, quantityNum)) {
//         res.status(CLIENT_ERR_CODE);
//         next(Error("All fields (category, type, item, size, and quantity) are required for /updateItem"));
//     }
//     let itemPath = `${BASE_STOCK}/${categoryName}/${typeName}/${itemName}`;
//     try {
//         await updateStock(itemSize, quantityNum, itemPath);
//         res.type("text");
//         res.send("Item updated!");
//     } catch (err) {
//         res.status(SERVER_ERR_CODE);
//         err.message = SERVER_ERROR;
//         next(err);
//     }
// });

/**
 * Posts or "buys" an item from the given form
 * Sends a 500 error if an error occurs on the server 
 */
app.post("/placeOrder", async(req, res, next) => {
    let itemName = req.body.prodName;
    let itemSize = req.body.prodSize;
    try {
        changeProductStock(itemName, itemSize);
        res.type("text");
        res.send("Thanks for pretend shopping with us!");
    } catch (err) {
        res.status(SERVER_ERR_CODE);
        err.message = SERVER_ERROR;
        next(err);
    }
});

/****************************** HELPER FUNCTIONS ******************************/

/**
 * Reads through the file directory of Full Fit Fashions and 
 * returns a list of JSON objects
 * 
 * @return {Array} an array of item JSON objects
 */
async function getStock() {
    let result = [];
    let stock = await fs.readdir(BASE_STOCK);
    for (let i = 0; i < stock.length; i++) {
        let categoryName = stock[i];
        let typeDirs = await globby(BASE_STOCK + "/" + categoryName + "/", {onlyFiles : true});
        for (let j = 0; j < typeDirs.length; j++) {
            let itemJSON = await formatItemData(typeDirs[j]);
            if (itemJSON) {
                result.push(itemJSON);
            }
        }
    }
    return result;
}

/**
 * Reads through the file directory and returns a list of 
 * JSON objects within the given category
 * 
 * @param {String} cateName - category name 
 * @return {Array} a list of items within a category formatted as a JSON object
 */
async function getCategoryStock(cateName) {
    let result = [];
    let cateDir = BASE_STOCK + "/" + cateName;
    let cateStock = await fs.readdir(cateDir);
    for (let i = 0; i < cateStock.length; i++) {
        let typeName = cateStock[i];
        let typeDirs = await globby(cateDir + "/" + typeName, { onlyFiles : true });
        for (let j = 0; j < typeDirs.length; j++) {
            let itemJSON = await formatItemData(typeDirs[j]);
            if (itemJSON) {
                result.push(itemJSON);
            }
        }
    }
    return result;
}

/**
 * Reads through the file directory and returns a list of 
 * JSON objects within the given category and type
 * 
 * @param {String} category - category name
 * @param {String} type - type name
 * @return {Array} a list of items within a category and type formatted
 * as a JSON object
 */
async function getTypeStock(cateName, typeName) {
    let result = [];
    let typeDir = BASE_STOCK + "/" + cateName + "/" + typeName;
    let typeStock = await fs.readdir(typeDir);
    for (let i = 0; i < typeStock.length; i++) {
        let typeName = typeStock[i];
        let itemDirs = await globby(typeDir + "/" + typeName, { onlyFiles : true });
        for (let j = 0; j < itemDirs.length; j++) {
            let itemJSON = await formatItemData(itemDirs[j]);
            if (itemJSON) {
                result.push(itemJSON);
            }
        }
    }
    return result;
}

/**
 * Reads through the file directory and returns a list of 
 * JSON objects within the given type and classification
 * 
 * @param {String} type - category name
 * @param {String} classification - type name
 * @return {Array} a list of items within a classification and type formatted
 * as a JSON object
 */
async function getClassStock(typeName, classificationName) {
    let result = [];
    let classDir = BASE_STOCK + "/clothing/" + typeName + "/" + classificationName;
    let classStock = await fs.readdir(classDir);
    for (let i = 0; i < classStock.length; i++) {
        if (classStock[i] != ".DS_Store") { // i can't see this on my end but its in the way
            let itemDir = classDir + "/" + classStock[i] + "/info.json";
            let itemJSON = await formatItemData(itemDir);
            if (itemJSON) {
                result.push(itemJSON);
            }
        }
    }
    console.log(result);
    return result;
}

/**
 * Return given item path's JSON object
 * 
 * @param {String} itemDir - path name for item directory
 * @return {Object} JSON object of item data
 */
async function formatItemData(itemDir) {
    let itemName = path.basename(itemDir);
    if (itemName === "info.json") {
        let itemInfo = await fs.readFile(itemDir, "utf8");
        itemInfo = JSON.parse(itemInfo);
        return itemInfo;
    }
    return null;
}

/**
 * Updates the stock of a given item
 * 
 * @param {String} size - the size that will be updated
 * @param {Number} quantity - the amount to be added
 * @param {String} itemPathName - the directory path name for a item
 * @returns {Number} - the new quantity of the item
 */
async function updateStock(size, quantity, itemPathName) {
    let stockJSON = await fs.readFile(`${itemPathName}/stock-quantity.json`, "utf8");
    stockJSON = JSON.parse(stockJSON);
    let newQuantity = Number(stockJSON[size]) + Number(quantity);
    stockJSON[size] =  newQuantity;
    await fs.writeFile(`${itemPathName}/stock-quantity.json`, JSON.stringify(stockJSON, null, 2), "utf8");
    return newQuantity;
}

/**
 * Gets FAQs and formats into JSON: { question: string, answer: string }
 * 
 * @return {Object} item data in JSON
 */
async function getFAQData() {
    let faqUrl = BASE_FEEDBACK + "/FAQ";
    let result = [];
    let questions = await fs.readdir(faqUrl);
    for (let i = 0; i < questions.length; i++) {
        let questionNum = questions[i];
        let questionDir = `${faqUrl}/${questionNum}`;
        let content = await fs.readFile(`${questionDir}/content.txt`, "utf8");
        let lines = content.split("\n");
        let q = lines[0];
        let a = lines[1];
        let qaJSON = {
            "question" : q, 
            "answer" : a
        };
        result.push(qaJSON);
    }
    return result;
}

/**
 * Adds the given name and message to a directory named the user's email
 * (I feel like this is a really bad security practice, but this makes the
 * most sense, storing wise. People can have the same name, but emails 
 * must be different).
 * 
 * @param {String} email - user's email
 * @param {Object} content - JSON object of name and comment
 */
async function storeUserMessage(email, content) {
    let stored = false;
    let contactUrl = `${BASE_FEEDBACK}/Contact`;
    let pathName = `${contactUrl}/${email}/comment.json`;
    let userEmails = await fs.readdir(contactUrl);
    let i = 0;
    while (!stored && i < userEmails.length) {
        if (email === userEmails[i]) {
            let comments = await fs.readFile(pathName, "utf8");
            comments = JSON.parse(comments);
            comments.push(content);
            await fs.writeFile(`${pathName}`, JSON.stringify(comments, null, 2), "utf8");
            stored = true;
        }
        i++;
    }
    if (!stored) {
        let result = [];
        result.push(content);
        fs.mkdir(`${contactUrl}/${email}`);
        await fs.writeFile(`${pathName}`, JSON.stringify(result, null, 2), "utf8");
        stored = true;
    }
}

/**
 * The buying functionality: removes one from the stock of a given item and size
 * 
 * @param {String} name - item name (corresponds to item file name)
 * @param {String} size - size of given item
 */
async function changeProductStock(name, size) {
    let productDir = await globby(`${BASE_STOCK}/**/${name}`, { onlyDirectories: true });
    let infoFile = `${productDir}/info.json`;
    let newStock = await updateStock(size, -1, productDir);
    if (newStock === 0) {
        let stockBoolJSON = await fs.readFile(infoFile, "utf8");
        stockBoolJSON = JSON.parse(stockBoolJSON);
        stockBoolJSON.size[size] = false;
        await fs.writeFile(infoFile, JSON.stringify(stockBoolJSON, null, 2), "utf8");
    }
}

/**
 * Formats a JSON object for user feedback
 * 
 * @param {String} name - user's name 
 * @param {String} email - user's email
 * @param {String} content - user's comment
 * @return {Object} JSON formatted object with complete feedback data
 */
function formatContact(name, email, content) {
    let finalMsg = null;
    if (name && email && content) {
        finalMsg = {
            "name" : name,
            "comment" : content
        };
    }
    return finalMsg;
}

// /**
//  * Validates POST request for updating item form 
//  * 
//  * @param {String} category - category name
//  * @param {String} type - type name
//  * @param {String} item - item name
//  * @param {String} size - size 
//  * @param {Number} num - quantity added
//  * @return {Boolean} whether or not post is valid
//  */
// function validateUpdate(category, type, item , size, num) {
//     return category && type && item && size && num;
// }

/** 
 * FROM CLASS:
 * Error handling middleware function
 */
function errorHandler(err, req, res, next) {
    if (DEBUG) {
        console.error(err);
    }
    res.type("text");
    res.send(err.message);
}

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Listening on port " + PORT + "...");
    console.log(`URL: localhost:${PORT}/index.html`);
});
