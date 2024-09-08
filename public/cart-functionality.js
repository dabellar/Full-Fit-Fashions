"use strict";
/**
 * @author Darleine Abellard
 * CS 132 SP 2024 
 * Final Project: Full Fit Fashions
 * 
 * The JS file for the cart functionality which includes:
 *  - a cart class
 *  - a product class
 *  - methods of cart functionality
 */

/**
 * class for individual products, containing all important information
 */
class Prod {
    /**
     * product class constructor (uses img and figcap DOMElements)
     * 
     * @param {DOMElement} imgDOME - img HTML DOM Element 
     * @param {DOMElement} figCapDOME - figure caption HTML DOM Element
     */
    constructor(imgDOME, figCapDOME) {
        let outfitFigCap = figCapDOME.children;
        let sizeTuple = getSize(outfitFigCap[3]);
        this.imgSrc = imgDOME.src;
        this.imgAlt = imgDOME.alt;
        this.title = outfitFigCap[0].textContent;
        this.price = formatPrice(outfitFigCap[1].textContent)
        this.size = sizeTuple[1];
        this.sizeForm = sizeTuple[0];
    }

    /**
     * Checks if a prod is equal to the current prod class
     * 
     * @param {Prod} prodIns - instance of prod class
     * @returns {Boolean} - true is same prod info, false if not
     */
    prodEquals(prodIns) {
        return (prodIns.imgSrc === this.imgSrc) && (prodIns.imgAlt === this.imgAlt) && 
            (prodIns.title === this.title) && (prodIns.price === this.price) && 
            (prodIns.size === this.size);
    }
} 

/**
 * class for user's cart, containing products total running price 
 * and number of outfits made
 */
class Cart {
    /**
     * cart class constructor (initializes all values to zero or empty) 
     */
    constructor() {
        this.totalPrice = 0;
        this.listOfItems = [];
        this.numberOfOutfitsMade = 0;
    }
    
    /**
     * Resets cart object
     */
    reset() {
        this.totalPrice = 0;
        this.listOfItems = [];
        this.numberOfOutfitsMade = 0;
    }

    /**
     * Resets the cart view (DOMElements)
     */
    resetCartView() {
        let cartTop = id("dialog-top");
        let cartMiddle = id("open-cart-view");
        let cartBottom = id("thank-you-message");
        let cartItemViews = cartMiddle.children[0];
        cartBottom.children[0].textContent = "";
        cartTop.classList.remove("hidden");
        cartMiddle.classList.remove("hidden");
        cartBottom.classList.add("hidden");
        id("number-of-outfits").textContent = 0;
        while (cartItemViews.firstChild) {
            cartItemViews.removeChild(cartItemViews.firstChild);
        }
        cartMiddle.classList.add("hidden");
        id("final-price-amount").textContent = 0;
    }
    
    /**
     * Checks if the given prod instance is in the cart
     * 
     * @param {Prod} prodIns - instance of Prod class
     * @returns {Boolean} - true if Prod is in cart, false if not
     */
    inCart(prodIns) {
        for (let i = 0; i < this.listOfItems.length; i++) {
            let currProd = this.listOfItems[i];
            if (currProd.prodEquals(prodIns)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Adds the pieces in #outfit-pieces to cart
     */
    addToCart() {
        let cartCon = id("open-cart-view");
        let itemDiv = qs("#open-cart-view > div");
        let outfitCon = id("outfit-pieces");
        let outfitPieces = outfitCon.children;
        let visualizerCons = id("visualizer").children;
        let overflow = 0;
        // loop through outfit pieces and get information
        for (let i = 0; i < outfitPieces.length; i++) {
            let outfitPiecesInfo = outfitPieces[i].children;
            // index 0: img (src and alt)
            // index 1: figure caption (item description, price, label, size select)
            let piece = new Prod(outfitPiecesInfo[0], outfitPiecesInfo[1]);
            let cartPiece = genCartViewCards(piece);
            if (!this.inCart(piece)) {
                this.listOfItems.push(piece);
                itemDiv.appendChild(cartPiece);
            } else {
                overflow += piece.price;
            }
        }
        // update cart object 
        this.totalPrice += parseInt(id("est-tot-cost").textContent) - overflow;
        id("final-price-amount").textContent = this.totalPrice;
        this.numberOfOutfitsMade++;
        id("number-of-outfits").textContent = this.numberOfOutfitsMade;
        if (this.numberOfOutfitsMade === 1) {
            cartCon.classList.remove("hidden");
        }
        // clear the outfit pieces, price, and reset visualizer
        while (outfitCon.firstChild) {
            outfitCon.removeChild(outfitCon.firstChild);
        }
        id("est-tot-cost").textContent = "";
        for (let i = 0; i < visualizerCons.length; i++) {
            let outfitPieceCon = visualizerCons[i].children;
            for (let j = 0; j < outfitPieceCon.length; j++) {
                if (j === 0) {
                    outfitPieceCon[j].classList.remove("hidden");
                } else {
                    outfitPieceCon[j].classList.add("hidden");
                }
            }
        }
    }

    /**
     * Takes the current cart and creates form data based on product data
     * @returns {DOMElement Array} a list of forms for each item in the cart
     */
    cartAsForm() {
        let cartForm = [];
        this.listOfItems.forEach((item) => {
            let form = gen("form");

            let labelName = gen("label");

            let prodNameInput = gen("input");
            prodNameInput.name = "prodName";
            prodNameInput.type = "text";
            prodNameInput.id = "prodName";
            prodNameInput.value = item.imgAlt;
            labelName.appendChild(prodNameInput);

            form.appendChild(labelName);

            let labelSize = gen("label");

            let prodSizeInput = gen("input");
            prodSizeInput.name = "prodSize";
            prodSizeInput.type = "type";
            prodSizeInput.id = "prodSize";
            prodSizeInput.value = item.sizeForm;
            labelSize.appendChild(prodSizeInput);

            form.appendChild(labelSize);

            cartForm.push(form);
        });
        return cartForm;
    }

    /**
     * Animates the shopping cart icon on mouse hover
     * and opens cart when clicked
     */
    openShoppingCart() {
        let cartImg = id("cart-icon");
        let dialog = qs("dialog");
        let closeBtn = id("close-cart-btn");
        cartImg.addEventListener("mouseover", () => {
            cartImg.src = "imgs/shopping-bag-animated.gif";
            cartImg.alt = "shopping bag active";
        });
        cartImg.addEventListener("mouseout", () => {
            cartImg.src = "imgs/shopping-bag-static.png";
            cartImg.alt = "shopping bag static";
        });
        cartImg.addEventListener("click", () => {
            dialog.showModal();
        });
        closeBtn.addEventListener("click", () => {
            dialog.close();
        });
    }
}

/****************************************************************************
 ***************************** HELPER FUNCTIONS *****************************
 ****************************************************************************/
/**
 * Generates a cart view article DOM element with prod class data
 * 
 * @param {Prod} prodClassIns - singular instance of the Prod class
 * @returns {DOMElement} - article DOMElement containing a prod class
 */
 function genCartViewCards(prodClassIns) {
    const article = gen("article");

    const img = gen("img");
    img.src = prodClassIns.imgSrc;
    img.alt = prodClassIns.imgAlt;
    article.appendChild(img);

    const div = gen("div");

    const pTitle = gen("p");
    pTitle.textContent = prodClassIns.title;
    div.appendChild(pTitle);

    const pPrice = gen("p");
    pPrice.textContent = "Price : $" + prodClassIns.price;
    div.appendChild(pPrice);

    const pSize = gen("p");
    pSize.textContent = "Size: " + prodClassIns.size;
    div.appendChild(pSize);

    article.appendChild(div);

    return article;
}

/**
 * Returns the numerical value of the price of a product given a string
 * 
 * @param {string} priceStr - a string in the form of "Price: $XX"
 * @returns {number} - numerical value of price
 */
function formatPrice(priceStr) {
    let dollarSign = priceStr.indexOf("$");
    return parseInt(priceStr.substring(dollarSign + 1, priceStr.length));

}

/**
 * Returns the string value of the selected size of a product 
 * 
 * @param {DOMElement} selectDOME - select DOMElement with a selected option
 * @returns {string} - string representation of size
 */
function getSize(selectDOME) {
    let options = selectDOME.options;
    let optIndex = selectDOME.selectedIndex;
    let selectedVal = options[optIndex].value;
    let selectedText = options[optIndex].textContent;
    if (selectedText === "--one size--") {
        selectedText = "one size";
        selectedVal = "one_sizeS";
    } 
    return [selectedVal, selectedText];
}
