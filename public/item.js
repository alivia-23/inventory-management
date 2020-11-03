(function renderPage(){

  const addButtonEl = document.querySelector('.outgoing button');
  const itemsEl = document.querySelector('.items');
  const newItemNameEl = document.querySelector('.add-item-name ');
  const newItemQuantityEl = document.querySelector('.add-item-quantity');
  const loginEl = document.querySelector('.login');
  const loginButtonEl = document.querySelector('.login-button');
  const logoutButtonEl = document.querySelector('.logout-button');
  const userNameEl = document.querySelector('.user-name');
  const statusEl = document.querySelector('.status');


  const errMsgs = {
    'network-error': 'There was a problem connecting to the network, try again',
    'bad-login': "Login cannot be empty or contain whitespace or contain 'dog'",
    'missing-uid': 'You are not allowed. Please login to continue.',
    'missing-item-id': 'Item is missing or has been already deleted. Please reload.',
    'invalid-quanity': 'Quanity can only be a positive integer'
  };

  loginButtonEl.addEventListener('click', () => {
    const username = userNameEl.value;
    fetch(`/session/${username}`, {
      method: 'POST',
    })
    .catch( () => Promise.reject( { error: "network-error"} ))
    .then( convertResponse )
    .then( items => {
      loginButtonEl.disabled = true;
      userNameEl.value = '';
      renderItems(items);
      updateStatus('Welcome '+username);
    })
    .catch( err => {
      updateStatus(errMsgs[err.error] || err.error);
    });
  });

  logoutButtonEl.addEventListener('click', () => {
      fetch(`/session/`, {
        method: 'DELETE',
      })
      .catch( () => Promise.reject( { error: "network-error"} ))
      .then( convertResponse )
      .then( items => {
        renderItems( items );
        updateStatus('');
      })
      .catch( err => {
        updateStatus(errMsgs[err.error] || err.error);
      });
  });

  const items = {};

  const counter = () => {
    let count = 0;
    return () => {
      count += 1;
      return count;
    };
  };

  const nextId = counter();

  function updateStatus( message ) {
    statusEl.innerText = message;
  }

   function renderItems( items ) {
     itemsEl.innerHTML = '';
     items.map( item => {
       renderItem( item );
     });
   }

  function renderItem( item ) {
    const listItem = createItemEl( item );
    itemsEl.appendChild( listItem );
  }

  function createItemEl( item ) {
    const listItem = document.createElement("li");
    const listItemId = "item-row-" + item.id;
    listItem.setAttribute("id", listItemId);
    const html =  `<span><button data-id="${item.id}" class="delete">X</button></span>
              <span data-id="${item.id}" class="item-name">${item.name}</span>
              <span data-id="${item.id}" class="item-quantity"> <input id="item-quantity-${item.id}" type="text" value="${item.quantity}" /> </span>
              <span><button data-id="${item.id}" data-name="${item.name}" class="update">Update</button></span>`;
    listItem.innerHTML = html;
    return listItem;
  }

  itemsEl.addEventListener('click', function( event ) {
    const id = event.target.dataset.id;
    if(event.target.classList.contains('update')) {
      const quantityElemId = '#item-quantity-' + id;
      const quantity = document.querySelector(quantityElemId).value || 0;
      const name = event.target.dataset.name;
      fetch(`/items/${id}`, {
        method: 'PUT',
        headers:{
          'content-type' : 'application/json'
        },
        body: JSON.stringify(
          {
            id: id,
            name: name,
            quantity: quantity
          }
        )
      })
      .catch( () => Promise.reject( { error: 'network-error' }) )
      .then( convertResponse )
      .then( item => {
        const itemRowId = '#item-row-' + id;
        const itemRowEl = document.querySelector(itemRowId);
        itemRowEl.innerHTML = createItemEl(item).innerHTML;
        updateStatus('');
      })
      .catch( err => {
        updateStatus(errMsgs[err.error] || err.error);
      });
    }

    if(event.target.classList.contains('delete')) {
      fetch(`/items/${id}`, {
        method: 'DELETE',
      })
      .catch( () => Promise.reject( { error: 'network-error' }) )
      .then( convertResponse )
      .then( items => {
        renderItems( items );
        updateStatus('');
      })
      .catch( err => {
        updateStatus(errMsgs[err.error] || err.error);
      });
    }
  });

  addButtonEl.addEventListener('click', () => {
    const name = newItemNameEl.value.trim();
    const quantity = newItemQuantityEl.value.trim() ? newItemQuantityEl.value.trim() : 0;
    fetch(`/items/`, {
      method: 'POST',
      headers:{
        'content-type' : 'application/json'
      },
      body: JSON.stringify(
        {
          name: name,
          quantity: quantity
        }
      )
    })
    .catch( () => Promise.reject( { error: "network-error"} ))
    .then( convertResponse )
    .then( item => {
      newItemNameEl.value = '';
      newItemQuantityEl.value = '';
      renderItem(item);
      updateStatus('');
    })
    .catch( err => {
      updateStatus(errMsgs[err.error] || err.error);
    });
  });

  newItemNameEl.addEventListener('keyup', function ( event ) {
    const text = event.target.value;
    addButtonEl.disabled = !text || text.trim() === "";
  });

  userNameEl.addEventListener('keyup', function ( event ) {
    const text = event.target.value;
    loginButtonEl.disabled = !text || text.trim() === "";
  });

  function convertResponse( response ) {
    if ( response.ok ) {
      return response.json();
    }
    return response.json()
    .then( err => Promise.reject( err ) );
  }

  // on load
  itemsEl.innerHTML = "Loading ..."
  fetch('/items/', {
    method: 'GET',
  })
    .catch( () => Promise.reject( { error: 'network-error' }) )
    .then( convertResponse )
    .then( items => {
      renderItems( items );
  });


  addButtonEl.disabled = true;
  loginButtonEl.disabled = true;

})();
