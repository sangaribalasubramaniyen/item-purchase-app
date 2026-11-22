
            let editingId = null;
            loadTypes();
            loadItems();

            function loadTypes(){
                fetch('http://localhost:5000/api/item-types')
                .then(function(res){return res.json();})
                .then(function(data){
                    let select = document.getElementById('itemType');
                    for(let i=0; i<data.length; i++){
                        let opt = document.createElement('option');
                        opt.value = data[i].id;
                        opt.text = data[i].type_name;
                        select.appendChild(opt);
                    }
                });
            }

            function loadItems(){
                fetch('http://localhost:5000/api/items')
                .then(function(res){ return res.json();})
                .then(function(data){
                    let div = document.getElementById('itemsList');
                    div.innerHTML = '';
                    for(let i=0; i<data.length; i++){
                        let item = data[i]
                        let statusText = Number(item.active) === 1 ? 'Active' : 'Inactive';
let statusClass = Number(item.active) === 1 ? 'active' : 'inactive';

let d = item.purchase_date ? String(item.purchase_date).split('T')[0] : '';
div.innerHTML += '<div class="item-row">' + item.name + ' - Stock: ' + item.stock_available + 
' <span><span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
'<button class="btn-small" data-id="' + item.id + '" data-name="' + item.name + '" data-date="' + d + '" data-stock="' + item.stock_available + '" data-type="' + item.item_type_id + '" data-active="'
 + item.active + '" onclick="editItemFromBtn(this)">Edit</button></span></div>';
                    }
                    loadPurchaseItems();
                });
            }



           function editItemFromBtn(btn){
              editItem(Number(btn.getAttribute('data-id')), 
              btn.getAttribute('data-name'), btn.getAttribute('data-date'), 
              btn.getAttribute('data-stock'), btn.getAttribute('data-type'), 
              btn.getAttribute('data-active'));
              }

            function editItem(id, name, date, stock, typeId, active){
                document.getElementById('addItemBtn').innerText = 'Update Item';
                document.getElementById('itemName').value=name;
                document.getElementById('itemDate').value = date ? String(date).split('T')[0] : '';
                document.getElementById('itemStock').value=stock;
                document.getElementById('itemType').value =typeId;
                document.getElementById('itemActive').value = active;
                editingId=id;
                document.getElementById('deleteBtn').style.display='inline-block';
            }

          
            function addItem(){
                let name=document.getElementById('itemName').value;
                let date= document.getElementById('itemDate').value;
                let stock=document.getElementById('itemStock').value;
                let typeId = document.getElementById('itemType').value;
                let active = document.getElementById('itemActive').value;

                //validation
                if(!name || !date || !stock){
                    alert('Please fill Item Name,Date and Stock!');
                    return;
                }
                if(stock<0){
                    alert('Stock cannot be negative!');
                    return;
                }

                  //Edit function
                if (editingId !== null){
                    console.log('PUT sending:', editingId, name, date, stock, typeId, active);
                    console.log('Editing ID:', editingId);
                    console.log('Active value:', active);
                    console.log('Sending data:', {
                    name: name,
                    purchase_date: date,
                    stock_available: stock,
                    item_type_id: typeId,
                    active: active
                    });
                    fetch('http://localhost:5000/api/items/' + editingId,{
                        method:'PUT',
                        headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({name:name, purchase_date:date, 
                            stock_available:stock,item_type_id:typeId, active:active})
                        
                    }).then(function(res){
                        return res.json().then(function(data){
                        if(!res.ok){ alert('FAILED: ' + (data.error || 'Update failed')); console.log('PUT failed:', data); return; }
                        alert('item Updated');
                        editingId=null;
                        document.getElementById('deleteBtn').style.display='none';
                        document.getElementById('itemName').value='';
                        document.getElementById('itemDate').value='';
                        document.getElementById('itemStock').value='';
                        document.getElementById('itemActive').value = '1';
                        document.getElementById('addItemBtn').innerText='Add Item';
                        document.getElementById('itemType').selectedIndex = 0;
                        loadItems();
                        loadDashboardStats();
                        });
                    });
                    return
                }
                
                //Add new item
                fetch('http://localhost:5000/api/items',{
                    method:'POST',
                    headers:{'Content-Type': 'application/json'},
                    body:JSON.stringify({name:name, purchase_date:date, stock_available:stock, item_type_id:typeId, active:active})
                }).then(function(){
                    alert('Item Added');
                    editingId = null;
                    document.getElementById('deleteBtn').style.display='none';
                    document.getElementById('itemName').value='';
                    document.getElementById('itemDate').value='';
                    document.getElementById('itemStock').value='';
                    document.getElementById('itemActive').value = '1';
                    document.getElementById('itemType').selectedIndex = 0;
                    document.getElementById('addItemBtn').innerText = 'Add Item';
                    loadItems()
                    loadDashboardStats();
                });

            }

            function generateOrderId(){
                let num = Math.floor(1000 + Math.random() * 9000);
                document.getElementById('orderId').value = 'ORD-' + num;
            }
                generateOrderId();


            let purchaseCart =[];

            function addToPurchase(){
                let select =document.getElementById('purchaseItem');
                let itemId =select.value;
                let itemName=select.options[select.selectedIndex].text;
                let qty = document.getElementById('purchaseQty').value;

                if(!qty || qty<=0){
                    alert("Please enter valid qty!");
                    return;
                }
                for(let i=0; i<purchaseCart.length; i++){
                    if(purchaseCart[i].item_id==itemId){
                        alert(itemName+'already added!');
                        return
                    }
                }
                
                purchaseCart.push({item_id: itemId, quantity:qty});
                if(purchaseCart.length===1){
                    document.getElementById('purchaseList').innerHTML='';
                }
                document.getElementById('purchaseList').innerHTML += itemName+'-Qty'+qty+'<br>';
                document.getElementById('purchaseQty').value='';

            }

            function loadPurchaseItems(){
                fetch('http://localhost:5000/api/items')
                .then(function(res){ return res.json();})
                .then(function(data){
                    let select = document.getElementById('purchaseItem');
                    select.innerHTML='';
                    for(let i=0; i<data.length; i++){
                       if(Number(data[i].active) === 1){
                        let opt = document.createElement('option');
                        opt.value = data[i].id;
                        opt.text=data[i].name;
                        select.appendChild(opt);
                    }
                }
                });
            }
            loadPurchaseItems()

            function savePurchase(){
                let orderId=document.getElementById('orderId').value;
                let date=document.getElementById('purchaseDate').value;

                //validation
                if(!orderId || !date){
                    alert('please fill the Order ID and Date!');
                    return;
                }
                if(purchaseCart.length===0){
                    alert('please add atleast 1 item to purchase!');
                    return
                }
                fetch('http://localhost:5000/api/purchases',{
                    method:'POST',
                    headers:{'Content-Type': 'application/json'},
                    body:JSON.stringify({order_id: orderId, purchase_date: date, items:purchaseCart})

                }).then(function(res){
                    return res.json().then(function(data){
                        if(!res.ok){
                            alert(data.error);
                            return;
                        }
                    
                    alert('Purchase Saved! Your Order ID is ' + orderId);
                    generateOrderId();
                    purchaseCart=[];
                    document.getElementById('purchaseList').innerHTML='No items added yet...';
                    document.getElementById('purchaseDate').value = '';
                    loadItems();
                    loadPurchaseHistory();

                });
            });

            }

            function loadPurchaseHistory(){
                fetch('http://localhost:5000/api/purchases')
                .then(function(res){return res.json();})
                .then(function(data){
                let div =document.getElementById('purchaseHistory');
                div.innerHTML='';

                if(data.length===0){
                    div.innerHTML='No purchase yet...';
                    return;
                }

                let html = '<table class="history-table"><tr><th>Order ID</th><th>Date</th><th>Item</th><th>Type</th><th>Qty</th></tr>';
                for(let i=0; i<data.length; i++){
                    html += '<tr><td><b>' + data[i].order_id + '</b></td><td>' + data[i].purchase_date.split('T')[0] + '</td><td>' + data[i].name + '</td><td>' + data[i].type_name + '</td><td>' + data[i].quantity + '</td></tr>';
                }
                html += '</table>';
            div.innerHTML = html;
    });
}


       
     //Delete Item
    function deleteItem(){
        if(editingId === null){
        return;
    }

    if(confirm('Are you sure you want to delete this item?')){
        fetch('http://localhost:5000/api/items/' + editingId, {
            method:'DELETE'
        })
        .then(function(res){
            return res.json().then(function(data){
                if(!res.ok){
                    alert(data.error);
                    return;
                }

                alert(data.message);

                editingId = null;
                document.getElementById('itemName').value='';
                document.getElementById('itemDate').value='';
                document.getElementById('itemStock').value='';
                document.getElementById('addItemBtn').innerText='Add Item';
                document.getElementById('deleteBtn').style.display='none';

                loadItems();
                loadDashboardStats();
            });
        })
        .catch(function(err){
            console.log(err);
            alert('Something went wrong');
        });
    }
}


           
        
function loadDashboardStats() {

    // Get total items and stock
    fetch('http://localhost:5000/api/items')
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {

        document.getElementById('totalItems').innerText = data.length;

        let stock = 0;

        for(let i = 0; i < data.length; i++) {
            stock += Number(data[i].stock_available);
        }

        document.getElementById('totalStock').innerText = stock;
    });

    // Get total purchases
    fetch('http://localhost:5000/api/purchases')
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {

        // Count unique orders rather than purchase line items
        let orders = [];

        for(let i = 0; i < data.length; i++) {
            if(!orders.includes(data[i].order_id)) {
                orders.push(data[i].order_id);
            }
        }

        document.getElementById('totalPurchases').innerText = orders.length;
    });
}

loadDashboardStats();



// Sidebar Navigation

let navLinks = document.querySelectorAll('.sidebar a');

navLinks.forEach(function(link) {

    link.addEventListener('click', function() {

        navLinks.forEach(function(item) {
            item.classList.remove('active');
        });

        this.classList.add('active');

    });

});


            

