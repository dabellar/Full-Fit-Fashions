# Full Fit Fashions

### About

In the spring term of 2023-2024, I took CS 132, Caltech's web development course. For the final project, we needed to use all the techniques we learned to create our own e-commerce store. 

One of the main questions we needed to answer with our final project was "What exactly does your e-commerce store hope to accomplish? (Many e-commerce stores already exist, why is yours different)". In my project proposal, I wrote, "I plan on making a "build and buy" clothing store, where instead of buying clothing pieces one by one, the main page will allow users to make an outfit and add it to their cart. Sometimes I'll find something I like and then have a hard time visualizing a full outfit in my head.". 

#### Inspiration/Planning Phase
In a previous assignment, I recreated Cher's outfit picker in *Clueless*. I really liked the overall idea but was disappointed by the fact that (at the time) I was limited with what I could do. This project is, in a way, a continuation of the *Clueless* project. 

In the "planning-phase" folder, I added all the wireframes and flowcharts I made for this website and the *Clueless* outfit picker.

#### Things I Would Change 
The biggest thing I would change is maybe make the backend a little more object-oriented. Right now, only the cart is an important object, but I think making outfits a full object on its own would make more sense in both the code and user experience. If I were to expand this project where users have their own accounts, having an outfit object would make it easier for there to be an "Outfit History" portion of the account.

#### Source/Credits:
All the images and prices of the items used are from [Cider](https://www.shopcider.com/). This project is not an advertisement, but the uniformity in images, cohesive style of the products, and amount of variety were very helpful to me.

### How to Run the Project

#### Requirements
For development, you will only need [node](https://nodejs.org/en/download/package-manager/current) installed in your environment.

#### Install
    $ git clone https://github.com/dabellar/Full-Fit-Fashions.git
    $ cd Full-Fit-Fashions
    $ npm install

#### Running the Project
After cloning the repository, use `nodemon app.js` to run the app on localhost:8080/index.html 