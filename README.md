# FLECS-WebApp


## Set up Visual Studio Code environment
This is a short description on how to set up Visual Studio Code for the FLECS WebApp.

### First steps

1. Checkout the repository to your local pc and open it with Visual Studio Code.
2. Follow this instruction: https://code.visualstudio.com/docs/nodejs/reactjs-tutorial but instead of create-react-app at the beginning, simply install npm into the repository (call: npm install)
3. After successful installation and start of npm, hitting F5 should open a new Chrome Windows loading the WebApp

### Static analysis with ESLint
We use ESLint for static analysis of our code. This tutorial shows how to setup ESLint in Visual Studio Code: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
During the configuration of ESLint several prompts are to answer. Please use the following answers:

#### Which framework does your project use?

✔ React

Vue.js

None of these

#### Where does your code run?

✔ Browser

Node

#### How would you like to define a style for your project?

✔ Use a popular style guide

Answer questions about your style

Inspect your JavaScript file(s)

-> Choose the Google Standard

### Testing with Jest

Since you have already npm installed, simply start the test jest test suite by calling npm test. The same tests are running in our gitlab pipeline.
