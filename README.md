# word-cloud

## Drawing Method
The word cloud draws by using a spiralling method to determine the possible points to try and place the div element with a word in it.

Each word, starting from the centre of the container, is positioned by the spiral method and then checked to see if its position is outside the container and whether or not it intersects with a word that has already been placed.

Due to the positioning of the words being reliant on the central position of the container, when the window is resized the word cloud is redrawn so that new positions can be calculated.

## Run Locally
1. Clone repository to your local machine.
2. Run ```npm install``` in the terminal to ensure the correct node modules are available.
3. Run ```npm start``` in the terminal to start the development build, the app should open automatically in your default browser.