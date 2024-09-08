/**
 * @author Darleine Abellard
 * CS 132 SP 2024 
 * Final Project: Full Fit Fashions
 * 
 * The JS file for the Full Fit Fashions website which includes:
 *  - outfit maker and "buying" functionality
 *  - dynamically populates the clothing, accessory, and shoe tabs with
 *      products
 * 
 */

(function () {
    "use strict";

    // GLOBAL VARIABLES
    const NEG_ONE = -1;
    const POS_ONE = 1;

    const BASE_URL = "/";
    const STOCK_URL = BASE_URL + "stock/";
    const BUY_URL = BASE_URL + "placeOrder";

    const CLOTHING_SIZE_LIB = {"smallS" : "S", "mediumS" : "M", "largeS" : "L", "x_largeS" : "XL"};
    let CURR_OUTFIT_PRICE = 0;

    /**
     * Initializes the site's UI functions
     */
    async function init() {
        let shoppingCart = new Cart();
        shoppingCart.openShoppingCart();
        cartUI(shoppingCart);
        navBarUI();
        controlsUI();
    }

    /**
     * Add navigation bar UI
     */
    function navBarUI() {
        let navBar = qsa("nav li");
        for (let i of navBar) {
            i.addEventListener("click", toggleView);
            i.addEventListener("click", displaySpecificCate);
        }
    }

   /**
     * Adds the UI for the outfit maker controls by calling the individual slideshow functions
     */
    function controlsUI() {
        slideshowFunc("tops-backwards", "tops-forwards", 
                        "vis-top", "clothing/tops");
        slideshowFunc("bottoms-backwards", "bottoms-forwards", 
                        "vis-bottom", "clothing/bottoms");
        slideshowFunc("shoes-backwards", "shoes-forwards", 
                        "vis-shoes", "shoes/");
        slideshowFunc("hair-accessories-backwards", "hair-accessories-forwards", 
                        "vis-head-accessories", "accessories/hair");
        slideshowFunc("earrings-backwards", "earrings-forwards", 
                        "vis-earrings", "accessories/earrings");
        slideshowFunc("necklaces-backwards", "necklaces-forwards", 
                        "vis-necklaces", "accessories/necklaces");
        slideshowFunc("outerwear-backwards", "outerwear-forwards", 
                        "vis-outerwear", "clothing/outerwear");
        slideshowFunc("bag-backwards", "bag-forwards", 
                        "vis-bags", "accessories/bags");
    }

    /**
     * Adds the UI for the cart/buying functionality by 
     * calling individual functions for add to cart button and 
     * place order button
     * 
     * @param {Cart} cartObj - cart object initialized in the init function
     */
    function cartUI(cartObj) {
        let placeOrderBtn = id("buy-btn");
        let addToCartBtn = id("add-to-cart");
        addToCartBtn.addEventListener("click", () => {
            // check if there is anything to add to the cart
            if (id("outfit-pieces").children.length >= 3) {
                cartObj.addToCart();
                CURR_OUTFIT_PRICE = 0; 
            }
        });
        placeOrderBtn.addEventListener("click", () => {placeAnOrder(cartObj)});
    }

    /**
     * Uses cart data and posts or "buys" the products
     * 
     * @param {Cart} cartObj - cart object initialized in the init function
     */
    async function placeAnOrder(cartObj) {
        let cartForm = cartObj.cartAsForm();
        for (let i = 0; i < cartForm.length; i++) {
            let params = new FormData(cartForm[i]);
            try {
                let resp = await fetch(BUY_URL, { method : "POST", body : params });
                resp = checkStatus(resp);
                let data = await resp.text();
                continueShopping(cartObj, data);
            } catch (err) {
                handleError(err);
            }
        }
    }


/****************************************************************************
 ***************************** HELPER FUNCTIONS *****************************
 ****************************************************************************/

/************************ OUTFIT MAKER FUNCTIONALITY ************************/
    /**
     * General (individual) slideshow functionality
     * 
     * @param {string} idBackwards - CSS id for the backwards button
     * @param {string} idForwards - CSS id for the forwards button
     * @param {string} idName - CSS id for img container
     * @param {string} endpoint - fetch endpoint
     */
    function slideshowFunc(idBackwards, idForwards, idName, endpoint) {
        let backBtn = id(idBackwards);
        let forBtn = id(idForwards);
        backBtn.addEventListener("click", function() {
            outfitMakerControls(endpoint, idName, NEG_ONE);
        });
        forBtn.addEventListener("click", function() {
            outfitMakerControls(endpoint, idName, POS_ONE);
        });
    }

    /**
     * Gets the given category specific products in JSON and
     * adds them to outfit maker slideshow
     * 
     * @param {string} endpoint - the given stock endpoint 
     * @param {string} idName - CSS id for img container 
     * @param {number} num - increment or decrement value (either 1 or -1)
     */
    async function outfitMakerControls(endpoint, idName, num) {
        try {
            let resp = await fetch(STOCK_URL + endpoint);
            resp = checkStatus(resp);
            const data = await resp.json();
            changeImgDisplay(data, idName, num);
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * Adds or accesses the array of imgs based on a given id name and change which
     * image is displayed 
     * Also updates the outfit pieces
     * 
     * @param {Object Array} jsonData - list of product JSON data
     * @param {string} idName - CSS id for img container 
     * @param {number} num - increment or decrement value (either 1 or -1) 
     */
    function changeImgDisplay(jsonData, idName, num) {
        let slideDiv = id(idName).children; // imgs array
        if (slideDiv.length === 0) { // add to HTML if empty
            const emptyImg = gen("img");
            emptyImg.src = "stock-imgs/empty-space.png";
            emptyImg.alt = "empty-space";
            id(idName).appendChild(emptyImg);
            jsonData.forEach((obj) => {
                if (checkStockQuantity(obj)) {
                    const img = gen("img");
                    img.src = "stock-imgs/" + obj.img;
                    img.alt = obj.name;
                    img.classList.add("hidden");
                    id(idName).appendChild(img);
                }
            });
        }
        // find img being displayed and add hidden class attribute
        let beforeSDIdx = 0;
        for (let i = 0; i < slideDiv.length; i++) {
            let imgClasslist = slideDiv[i].classList;
            if (!imgClasslist.contains("hidden")) {
                beforeSDIdx = i;
                slideDiv[beforeSDIdx].classList.add("hidden");
                break;
            }
        }
        if (beforeSDIdx !== 0) {
            let beforePrice = findProductByName(jsonData, slideDiv[beforeSDIdx].alt).price;
            CURR_OUTFIT_PRICE -= beforePrice;
        }
        // find next index and update class attribute accordingly
        let afterSDIdx = add(beforeSDIdx, num, slideDiv.length);
        slideDiv[afterSDIdx].classList.remove("hidden");
        if (afterSDIdx !== 0) {
            let afterPrice = findProductByName(jsonData, slideDiv[afterSDIdx].alt).price;
            CURR_OUTFIT_PRICE += afterPrice;
        }
        changeOutfitPieces(jsonData, slideDiv[afterSDIdx].alt, slideDiv[beforeSDIdx].alt); 
        id("est-tot-cost").textContent = CURR_OUTFIT_PRICE;
    }

    /**
     * Updates the outfit pieces in the #outfit-pieces section
     * 
     * @param {Object Array} jsonData - list of product JSON data
     * @param {string} afterIdName - CSS id for next product
     * @param {string} beforeIdName - CSS id for previous product
     */
    function changeOutfitPieces(jsonData, afterIdName, beforeIdName) {
        if (afterIdName === "empty-space") {
            id("outfit-pieces").removeChild(id(beforeIdName));
        } else if (beforeIdName === "empty-space") {
            let newJSONObj = findProductByName(jsonData, afterIdName);
            id("outfit-pieces").appendChild(genProductPieceCards(newJSONObj));
        } else {
            let newJSONObj = findProductByName(jsonData, afterIdName);
            id("outfit-pieces").replaceChild(genProductPieceCards(newJSONObj), id(beforeIdName));
        }
    }

    /**
     * Calculates addition and wraps around an array
     * 
     * @param {number} curr - the current index
     * @param {number} num - increment or decrement value (either 1 or -1)
     * @param {number} len - the length of the array (for modulus)
     * @return {number} the next index
     */
    function add(curr, num, len) {
        let newIndex = (curr + num) % len;
        if (newIndex < 0) {
            newIndex += len;
        }
        return newIndex;
    }

    /**
     * Find a product by its name in a given JSON object array
     * 
     * @param {Object Array} data - list of product JSON objs
     * @param {string} name - product name
     * @returns {Object} a product JSON object
     */
    function findProductByName(data, name) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].name === name) {
                return data[i];
            }
        }
    }

/*********************** CLEARING AND CHANGING VIEWS ************************/
    /**
     * Gets category specific products in JSON form and 
     * populates display area
     */
    async function displaySpecificCate() {
        try {
            let selectedCate = this.id;
            let resp = await fetch(STOCK_URL + selectedCate);
            resp = checkStatus(resp);
            const data = await resp.json();
            populateStockArea(data);
        } catch (err) {
            handleError(err);
        }
    }

    /**
     * Switches to single product view and populates product info
     * using a given product object
     * 
     * @param {Object} prodObj - a single JSON obj
     */
    function showProductView(prodObj) {
        let prodContainer = id("product-view");
        id("display-view").classList.add("hidden");
        prodContainer.classList.remove("hidden");
        clearDisplayArea();
        let arr = genSingleItemCards(prodObj);
        prodContainer.appendChild(arr[0]);
        prodContainer.appendChild(arr[1]);
    }

    /**
     * Switches the screen between the outfit maker and display sections
     */
    function toggleView() {
        let navBar = qsa("nav li");
        for (let i of navBar) {
            if (i === this) {
                this.classList.add("curr-view");
            } else {
                i.classList.remove("curr-view");
            }
        }
        if (this === navBar[0]) {
            id("outfit-maker-view").classList.remove("hidden");
            id("display-view").classList.add("hidden");
        } else {
            id("display-view").classList.remove("hidden");
            id("outfit-maker-view").classList.add("hidden");
        }
    }

    /**
     * Displays the success message after placing an order 
     * and then resets the cart front-end and back-end
     * 
     * @param {Cart} cart - cart object initialized in the init function
     * @param {String} data - successful text (from POST endpoint)
     */
    function continueShopping(cart, data) {
        // display the thank you message and remove other cart sections
        let cartTop = id("dialog-top");
        cartTop.classList.add("hidden");
        let openCart = id("open-cart-view");
        openCart.classList.add("hidden");
        let successCon = id("thank-you-message");
        successCon.classList.remove("hidden");
        successCon.children[0].textContent = data;
        // remove ability to add more items to cart
        let addToCartBtn = id("add-to-cart");
        addToCartBtn.classList.add("hidden");
        // display shopping spree message
        let errorMsg = id("new-cart-error-msg");
        errorMsg.classList.remove("hidden");
        let resetBtn = id("shopping-spree");
        resetBtn.addEventListener("click", () => {
            cart.reset();
            cart.resetCartView();
            errorMsg.classList.add("hidden");
            addToCartBtn.classList.remove("hidden");
            qs("dialog").close();
        });
    }
    
    /**
     * Clears the display area
     */
    function clearDisplayArea() {
        let displayCon = id("display-view");
        while(displayCon.firstChild) { 
            displayCon.removeChild(displayCon.firstChild); 
        }
        let prodCon = id("product-view");
        while(prodCon.firstChild) {
            prodCon.removeChild(prodCon.firstChild);
        }
    }
/************************* DYNAMICALLY POPULATE **************************/
    /**
     * Populates the #display-view container with product figures
     * 
     * @param {Object Array} prodObjs - list of product JSON objs
     */
    function populateStockArea(prodObjs) {
        let displayCon = id("display-view");
        clearDisplayArea();
        for (let obj of prodObjs) {
            if (genDisplayViewCards(obj) !== null) {
                displayCon.appendChild(genDisplayViewCards(obj));
            }
        }
    }

    /**
     * Generates an display view figure DOM element with product data
     * 
     * @param {Object} prodObj - one product JSON obj
     * @return {DOMElement} - the figure element with product data
     */
    function genDisplayViewCards(prodObj) {
        if (checkStockQuantity(prodObj)) {
            const fig = gen("figure");
            fig.classList.add("item-card");

            const img = gen("img");
            img.src = "stock-imgs/" + prodObj.img;
            img.alt = prodObj.name;
            fig.appendChild(img);

            const figCap = gen("figcaption");
            const pDesc = gen("p");
            pDesc.classList.add("ic-desc");
            pDesc.textContent = formatTitleCase(prodObj.name);
            figCap.appendChild(pDesc);

            const pPrice = gen("p");
            pPrice.textContent = "Price:  $" + prodObj.price;
            figCap.appendChild(pPrice);
            fig.appendChild(figCap);

            pDesc.addEventListener("click", () => {showProductView(prodObj)});
            fig.addEventListener("click", () => {showProductView(prodObj)});

            return fig;
        } else {
            return null;
        }
    }

    /**
     * Generates an array with an image and article DOM element for single item view
     * with product data
     * 
     * @param {Object} prodObj - one product JSON obj
     * @returns {Array of DOMElements} - an array of img and article
     */
    function genSingleItemCards(prodObj) {
        let result = [];

        const img = gen("img");
        img.src = "stock-imgs/" + prodObj.img;
        img.alt = prodObj.name; 
        result.push(img);

        const art = gen("article");
        
        const h3 = gen("h3");
        h3.textContent = formatTitleCase(prodObj.name);
        art.appendChild(h3);

        const pPrice = gen("p");
        pPrice.textContent = "Price:  $" + prodObj.price;
        art.appendChild(pPrice);

        let sizeArrKeys = Object.keys(prodObj.size);
        let clothingSizes = sizeArrKeys[0] !== "6"; // should use clothing sizes 
        let sizeArrVals = Object.values(prodObj.size);

        if (sizeArrKeys.length !== 1) { // if not one-size product
            const pSizes = gen("p");
            pSizes.textContent = "Sizes Available:";
            art.appendChild(pSizes);

            const sizeContainer = gen("div");
            sizeContainer.classList.add("size");

            for (let i = 0; i < sizeArrKeys.length; i++) {
                let size = gen("span");
                if (!sizeArrVals[i]) {
                    size.classList.add("out-of-stock");
                    
                } 
                if (clothingSizes) {
                    size.textContent = CLOTHING_SIZE_LIB[sizeArrKeys[i]];
                } else {
                    size.textContent = sizeArrKeys[i];
                }
                sizeContainer.appendChild(size);
            }
            art.appendChild(sizeContainer);
        }
        result.push(art);
        return result;
    }

    /**
     * Generates a product piece figure DOM element with given product data
     * 
     * @param {Object} prodObj - one product JSON obj 
     * @returns {DOMElement} - the figure element with product info and size picker
     */
    function genProductPieceCards(prodObj) {
        const fig = gen("figure");
        fig.id = prodObj.name;

        const img = gen("img");
        img.src = "stock-imgs/" + prodObj.img;
        img.alt = prodObj.name;
        fig.appendChild(img);

        const figCap = gen("figcaption");

        const icDesc = gen("p");
        icDesc.textContent = formatTitleCase(prodObj.name);
        figCap.appendChild(icDesc)

        const pPrice = gen("p");
        pPrice.textContent = "Price: $" + prodObj.price;
        figCap.appendChild(pPrice);

        const label = gen("label");
        label.htmlFor = "size-select";
        label.textContent = "Sizes: ";
        figCap.appendChild(label);

        const select = gen("select");
        select.name = "outfit-sizes";
        select.classList.add("size-select");

        let sizeArrKeys = Object.keys(prodObj.size);
        let clothingSizes = sizeArrKeys[0] !== "6"; // should use clothing sizes 
        let sizeArrVals = Object.values(prodObj.size);
        if (sizeArrKeys.length !== 1) { // if not one-size product 
            for (let i = 0; i < sizeArrKeys.length; i++) {
                if (sizeArrVals[i]) { // if size is in stock
                    const option = gen("option");
                    option.value = sizeArrKeys[i];
                    if (clothingSizes) {
                        option.textContent = CLOTHING_SIZE_LIB[sizeArrKeys[i]];
                        if (option.textContent === "XL") {
                            option.selected = true;
                        }
                    } else {
                        option.textContent = sizeArrKeys[i];
                        if (option.value === "10") {
                            option.selected = true;
                        }
                    }
                    select.appendChild(option);
                }
            }
        } else {
            const option = gen("option");
            option.value = "one-size";
            option.textContent = "--one size--";
            select.appendChild(option);
        }
        figCap.appendChild(select);

        fig.appendChild(figCap);
        return fig;
    } 

    /**
     * Helper function that checks total stock quantity
     * 
     * @param {Object} prodObj - one product JSON obj
     * @return {Boolean} true if in any size is in stock, false if not
     */
    function checkStockQuantity(prodObj) {
        let sizeArrVals = Object.values(prodObj.size);
        let count = sizeArrVals.length;
        const objStr = JSON.stringify(prodObj.size);
        JSON.parse(objStr, (key, value) => {
            if (value === false) {
                count--;
            }
        });
        return count > 0;
    }

/********************************************************************************/
    /** FROM CLASS:
     * Converts a dash separated name into a Title Case name
     * 
     * @param {String} dashName - dash separated name
     * @return {String} - the title case version of the name
     */
    function formatTitleCase(dashName) {
        let words = dashName.split("-");
        let firstWord = words[0];
        let result = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        for (let i = 1; i < words.length; i++) {
        let nextWord = words[i];
        result += " " + nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
        }
        return result;
    }
    
    init();
})();