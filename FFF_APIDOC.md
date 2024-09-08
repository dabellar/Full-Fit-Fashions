#Full Fit Fashions API Documentation
**Author:** Darleine Abellard
**Last Updated:** 09/07/24

*Note: Documentation format adapted from Caltech CS132 case study example*

The Full FIt Fashions (FFF) API provides functionality to retrieve and post data for a clothing store where full outfits are purchased.

Clients can retrieve information about the items available, such as images, prices, quantity. Functionality is also provided to send "contact us" messages and "buy" outfits.

Summary of endpoints:
 *  GET /FAQ
 *  GET /stock
 *  GET /stock/:category
 *  GET /stock/:category/:type
 *  GET /clothing/:type/:classification
 *  POST /contact
 *  POST /placeOrder
...

In the current version of this API, all error responses are returned as plain text. Any 500 errors represent a server-side issue and include a generic error message. Any 400-level errors represent an invalid request by a client, and are documented appropriately for any parameterized endpoint.


## *GET /FAQ*
**Returned Data Format:** JSON

**Description:**
Returns an array of JSON objects of all the FAQs

**Example Request:** `/FAQ`

**Example Response:**
```json
[
    {
        question: 'How do I place an order?',
        answer: "You can place an order by making an outfit through the outfit visualizer. After you make the outfit you're envisioning, you can buy the full outfit. You cannot buy individual pieces, as our purpose is for users to look at the full picture instead of the individual pieces."
    },
    {
        question: 'How do I create an outfit?',
        answer: 'The "Outfit Maker" tab includes our outfit visualizer, where you can click through different pieces, and create the perfect outfit!'
    }
]    
```

## *GET /stock*
**Returned Data Format:** JSON

**Description:**
Returns an array of JSON objects of the full stock sorted by category and type

**Example Request:** `/stock`

**Example Response:**
```json
[
    {
        name: 'black-leather-tote-bag',
        img: 'black-leather-tote-bag.png',
        price: 45,
        size: { one_sizeS: true }
    },
    {
        name: 'floral-pearl-earrings',
        img: 'floral-pearl-earrings.png',
        price: 6,
        size: { one_sizeS: true }
    },
    {
        name: 'gold-heart-pendant-necklace',
        img: 'gold-heart-pendant-necklace.png',
        price: 14,
        size: { one_sizeS: true }
    },
    {
        name: 'gingham-midi-skirt',
        img: 'gingham-midi-skirt.png',
        price: 18,
        size: { smallS: true, mediumS: true, largeS: true, x_largeS: true }
    },
    {
        name: 'black-neck-twist-top',
        img: 'black-neck-twist-top.png',
        price: 12,
        size: { smallS: true, mediumS: true, largeS: true, x_largeS: true }
    },
    {
        name: 'pink-ballet-heels',
        img: 'pink-ballet-heels.png',
        price: 33,
        size: {
            '6': true,
            '7': true,
            '8': true,
            '9': true,
            '10': true,
            '11': true
        }
    },
]
```

## *GET /stock/:category*
**Returned Data Format:** JSON

**Description:**
Returns an array of JSON objects of the stock of a given category

**Supported Parameters**
* /:category (required)
    * Category name for items

**Example Request:** `/stock/shoes` or `/stock/Shoes`

**Example Response:**
```json
[
    {
        name: 'black-chunky-ankle-boots',
        img: 'black-chunky-ankle-boots.png',
        price: 55,
        size: {
            '6': true,
            '7': true,
            '8': true,
            '9': true,
            '10': true,
            '11': true
        }
    },
    {
        name: 'red-leather-knee-high-boots',
        img: 'red-leather-knee-high-boots.png',
        price: 59,
        size: {
            '6': true,
            '7': true,
            '8': true,
            '9': true,
            '10': true,
            '11': true
        }
    }
]    
```

## *GET /stock/:category/:type*
**Returned Data Format:** JSON

**Description:**
Returns an array of JSON objects of the stock of a given category and type

**Supported Parameters**
* /:category (required)
    * Category name for items (clothing, accessories, or shoes)
* /:type (required)
    * Type name for each category of items (for accessories -> hair, bags, etc.)

**Example Request:** `/stock/accessories/hair`

**Example Response:**
```json
[
    {
        name: 'black-velvet-headband',
        img: 'black-velvet-headband.png',
        price: 4,
        size: { one_sizeS: true }
    },
    {
        name: 'blue-tropical-flower-hair-claw',
        img: 'blue-tropical-flower-hair-claw.png',
        price: 4,
        size: { one_sizeS: true }
    },
    {
        name: 'butterfly-hair-claw',
        img: 'butterfly-hair-claw.png',
        price: 8,
        size: { one_sizeS: true }
    }
]
```


## *GET /clothing/:type/:classification*
**Returned Data Format:** JSON

**Description:**
Returns a list of JSON objects of the stock of a given clothing category, type, and classification

**Supported Parameters**
* /:type (required)
    * Type name for each category of items (for clothing -> bottoms, tops, etc.)
* /:classification (required)
    * Classification name for each clothing type (for bottoms -> skirts, shorts, jeans, etc.)

**Example Request:** `/clothing/bottoms/skirts`

**Example Response:**
```json
[
    {
        name: 'bow-ruffle-maxi-skirt',
        img: 'bow-ruffle-maxi-skirt.png',
        price: 24,
        size: { smallS: true, mediumS: true, largeS: true, x_largeS: true }
    },
    {
        name: 'brown-mermaid-maxi-skirt',
        img: 'brown-mermaid-maxi-skirt.png',
        price: 18,
        size: { smallS: true, mediumS: true, largeS: true, x_largeS: true }
    },
    {
        name: 'check-colorblock-maxi-skirt',
        img: 'check-colorblock-maxi-skirt.png',
        price: 32,
        size: { smallS: true, mediumS: true, largeS: true, x_largeS: true }
    }
]
```

## *POST /contact*
**Returned Data Format:** Plain Text

**Description:** 
Sends information to the Full Fit Fashions web service for a "Contact Us" endpoint, including the name of the user, their email, and a text message. Returns a response about whether the information was successfully sent

**Supported Parameters**
* POST body parameters:
    * `name` (required) - name of customer
    * `email` (required) - email of customer
    * `message` (required) - customer's message

**Example Request:** `/contact`
* POST body parameters:
    * `name="Pooh"`
    * `email="pooh@bear.com"`
    * `message="oh bother"`

**Example Response:**
```Sent! Thank you for your feedback!```

## *POST /placeOrder*
**Returned Data Format:** Plain Text

**Description:** 
Sends information to the Full Fit Fashions web service for a "buying" endpoint, including item name and size chosen. Returns a response about whether the information was successfully sent.

**Supported Parameters**
* POST body parameters:
    * `item name` (required) - name of item
    * `item size` (required) - size of above item

**Example Request:** `/placeOrders`
* POST body parameters:
    * `name="brown-mermaid-maxi-skirt"`
    * `size="x_largeS"`

**Example Response:**
```Thanks for pretend shopping with us!```
