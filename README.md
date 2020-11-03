# REST & SPA

## Goals and Requirements

This is similar to the `js-dom` project, except the storage will be managed server-side and the page (a SPA) will communicate via fetch() calls to REST services.  There is also a login requirement.

Despite the login requirement, there is a single inventory and all users will view/modify the same inventory.

If the user does not have a uid cookie, the page will request their username and provide an input field and submit button
- If the username field is blank, the button will be disabled
- When a username is entered and the button pressed
  - The username will be sent to a RESTful `/session` endpoint 
    - if the username contains the string 'dog' or is empty or contains whitespace
      - the service will be return an error
      - the page will show a "bad login" message
    - any username that isn't empty, doesn't contain whitespace, and doesn't contain the string 'dog' will be considered valid
      - the service will return a cookie containing a uid
      - the page contents will update without a full-page refresh

If the user has a uid cookie and the uid cookie contains a value NOT known to the server as a currently logged in user
  - The page will show the login page and the 'bad login' message

If the user has a uid cookie and the uid cookie contains a value that IS known to the server as a currently logged in user
- The page will display a list of inventory
- There is a "Logout" button on the page
- Each item will have a name and a quantity (shown as a text input)
- Each item will have an "Update" button to the right of the quantity
  - Pressing "Update" will send the new value to the service
- Each item name will have an "X" button next to it.
  - Pressing X will delete the item from the list
- There is a text field for name, a text field for quantity, and an "Add" button
  - If the text field is empty, the "Add" button is disabled
  - If the text field is populated, the "Add" button is enabled
  - Clicking the add button will add an item to the list with the text as the name and quantity (quantity defaults to 0)
    - The text field will be set to empty when an item is added

All updates to the inventory will make RESTful service calls
- any reference to `:itemid` below means the value of a given item id.  Example: `/items/:itemid` would be `/items/1` when talking about the item id of `1`
- If the uid in the cookie is ever missing or empty, the services will return an appropriate error and the page will display the login screen
- If the uid in the cookie is ever unknown, the services will return an appropriate error and the page will display the login screen with an error message
- Getting the initial list of items will be a call to `/items` - it should return a JSON object of objects
  - While the page list is loading the page should display "Loading..." 
    - Hint: Before making the service call set the HTML content to "<li>Loading...</li>", and it will get replaced when you render the list of returned items
- Adding an item will be a call to `/items` passing the name and quantity as a JSON body and getting a JSON object back that includes the name, quantity, and an id for the item
  - Trying to add an item with a duplicate name will return an error from the service and show an error to the user
  - Trying to add an item with an empty name will return an error from the service
    - The page shouldn't allow this to be tried, but the service can still be called that way
- Pressing "Update" will call `/items/:itemid` to update the quantity - the new item object should be returned like when the item is added
  - Can still re-render the whole list afterward
  - Used a `data-item-id` HTML attribute to associate the item id with the individual row
  - Did NOT have an event listener on every row/button.  Used event bubbling/propagation.
  - This work does not resolve collisions between many users.  
    - Example: The page shows there are 3 cats.  Another user changes that to 2 cats on the page they see, but this page still shows 3.  If you then update with a value of "4", Cats would update to "4", not to "3".
  - Trying to modify an item that was deleted by another page should remove the item from this page and show an error message
- Pressing "X" on an item will call `/items/:itemid`
  - The page should remove that item 
  - Trying to delete and item that doesn't exist on the server should show an error message, but still remove the item from the page
- The logout button will call `/session`
  - This call removes the `uid` cookie (Hint: `res.clearCookie('uid');` should remove the cookie
  - The page will return to the login page
  - No error message is shown
    - Even if the uid was unknown to the server
All error messages are removed from display when another action is taken

## Structure
- This page will be served by a express server you write (a single static HTML page, static CSS, static client-side JS, and REST endpoints)
- There will be no HTML on the server or generated by server-side JS except for the single static HTML page.  
- All other HTML will be built via the client-side JS.
- All service endpoints will use RESTful URLs
- All service endpoints will use RESTful HTTP methods
- All service endpoints will use HTTP Status codes in a RESTful manner
- All service endpoints that take more than a single piece of input will accept data as JSON in the body of the request
- All services will return data in JSON (if they return data outside of status code)
- All services that return JSON data should have the `content-type` header of `application/json` (hint: res.json() does this for you)
- All model logic should be in a separate file from your server file
- Manually reloading the page will refresh the page but show the current data
- This code can be used by running `npm install`, `node server.js`, and going to `http://localhost:3000/`

## Logic
-  NOT used the DOM to store state (use an object to hold the inventory and render the view from that state object whenever it updates)
  - Used "data-(whatever)" values to store indexes, ids, or other ways to connect the elements to their data sources
  - NOT used "data-(whatever)" values to hold more than identifiers.  
- Used an IIFE on the client-side JS and do not pollute the global scope
- Achieved any visual differences from adding/removing classes
  - NOT added "style" attributes
  - disabling/enabling a button is not a visual difference, so that is not done via a class change
- The page should only reload if the user themselves does it, not because of the code

## Additional Requirements
- Followed the best practices described in class, in the code-review doc, and in the best-practices in the readings
- Used Semantic HTML as much as you can
- Follow any suggestions previously given to you in code reviews
- Did NOT use localStorage, sessionStorage, IndexedDB, cookies, or other forms of client-side storage, except a cookie to hold a `uid` value
- Did NOT interact with the browser url, including hash fragment
- Did NOT include files in your PR that are outside the assignment (no IDE configs, `node_modules/`, etc)
* Did not use external JS other than express itself
* Did not use external CSS libraries

