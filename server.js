//Backend Server

const express=require('express');
const mysql=require('mysql2');
const cors=require('cors');
const path=require('path');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

//Database connection
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Sangari@123',
    database:'item_purchase_db'
});

db.connect(function(err){
    if(err){
        console.log("Database doesn't connected:",err);
    }else{
        console.log('Database connected sucessfully!');
    }
});

//dispaly the item types
app.get('/api/item-types',function(req,res){
    db.query('SELECT * FROM item_types', function(err,result){
        if(err){
            res.send(err);
        }else {
            res.send(result);
        }
    });
});


//get the all items
app.get('/api/items', function(req,res){
    let sql="SELECT items.*,item_types.type_name FROM items JOIN item_types ON items.item_type_id = item_types.id";
    db.query(sql, function(err, result){
        if(err){
            res.send(err);
        }else {
            res.send(result);
        }
    });
});

//Add new item
app.post('/api/items', function(req,res){
    console.log(req.body);
    let name=req.body.name;
    let date=req.body.purchase_date;
    let stock=req.body.stock_available;
    let typeId=req.body.item_type_id;

    if(!name || !name.trim()){return res.status(400).send({error:'Item name is required'});}
    if(!date){return res.status(400).send({error:'Purchase date is required'});}
    if(stock===undefined|| stock===''||stock<0){return res.status(400).send({error:'Stock cannot be negative'});}
    if(!typeId){return res.status(400).send({error:'Item type is required'});}

    let sql="INSERT INTO items (name, purchase_date, stock_available, item_type_id) VALUES(?, ?, ?, ?)";
    db.query(sql, [name, date, stock, typeId], function(err, result){
        if(err){
            res.send(err);
        }else{
            res.send({message:'Item Added'});
        }
    });
});

//Update Stock
app.post('/api/purchases', function(req, res){
    let orderId = req.body.order_id;
    let date=req.body.purchase_date;
    let itemsList=req.body.items;

    if(!orderId){ return res.status(400).send({error:'Order ID is required'});}
    if(!date){ return res.status(400).send({error:'Purchase date is required'});}
    if(!itemsList || itemsList.length===0){return res.status(400).send({error:'Purchase must contain atleast 1 item'});}
    for(let i=0; i<itemsList.length;i++){
        if(!itemsList[i].quantity || itemsList[i].quantity <=0){
            return res.status(400).send({error:'Quantity must be greater than zero'});
        }
    }

    db.beginTransaction(function(err){
        if(err){ return res.status(500).send({error:'Transaction failed'});}


    db.query( "INSERT INTO purchases (order_id, purchase_date) VALUES(?, ?)",[orderId, date],function(err, result){
        if(err){ return db.rollback(function(){ res.status(400).send({error:err.message});});}
        let purchaseId=result.insertId;
        let index=0;

        function processNext(){
            if(index>=itemsList.length){
                return db.commit(function(err){
                    if(err){ return db.rollback(function(){res.status(500).send({error:'Commit Failed'});});}
                    res.send({message:'Purchase Saved'});
                });
            }
            let itemId = itemsList[index].item_id;
            let qty=Number(itemsList[index].quantity);

            db.query('SELECT stock_available, active FROM items WHERE id=? FOR UPDATE',[itemId],function(err, rows){
                if(err){return db.rollback(function(){res.status(500).send({error:'Database error'});});}
                if(rows.length===0 || Number(rows[0].active) !== 1){
                    return db.rollback(function(){
                        res.status(404).send({error:'Inactive items cannot be purchased'});});}
                if(rows[0].stock_available<qty){
                    return db.rollback(function(){res.status(400).send({error:'Insufficient stock. Available:'+rows[0].stock_available});});
                }
                db.query("INSERT INTO purchase_items (purchase_id, item_id, quantity) VALUES (?,?,?)",[purchaseId, itemId, qty], function(err){
                    if(err){ return db.rollback(function(){res.status(500).send({error:err.message});});}
                    db.query("UPDATE items SET stock_available = stock_available -? WHERE id = ?",[qty, itemId], function(err){
                        if(err){return db.rollback(function(){res.status(500).send({error:err.message});});}
                        index++;
                        processNext();

                    });

                });


            });


    }
    processNext();
});
    });

});
    
        


//Update item
app.put('/api/items/:id', function(req, res){
    console.log('Updated:', req.body);
    let id = req.params.id;
    let name = req.body.name;
    let date = req.body.purchase_date;
    let stock = req.body.stock_available;
    let typeId = req.body.item_type_id;

    if(!name || !name.trim()){return res.status(400).send({error:'Item name is required'});}
    if(!date){return res.status(400).send({error:'Purchase date is required'});}
    if(stock==undefined||stock===''||stock<0){
        return res.status(400).send({error:'Stock cannot be negative'});
    }
    if(!typeId){
    return res.status(400).send({error:'Item type is required'});
}

    let sql="UPDATE items SET name =?, purchase_date =?, stock_available =?, item_type_id=? WHERE id =?";
    db.query(sql,[name, date,stock,typeId, id], function(err, result){
        if(err){
            res.send(err);
        }else{
            res.send({message:'Item Updated'});
        }
    });

});









  //Delete Item
  app.delete('/api/items/:id', function(req, res){
    let id = req.params.id;

    //Check item exists
    db.query('SELECT * FROM items WHERE id = ?', [id], function(err, result){
        if(err){
            res.send(err);
        }else if(result.length === 0){
            res.status(404).send({error:'Item not found'});
        }else{

            //Check item already purchased or not
            db.query('SELECT * FROM purchase_items WHERE item_id = ?', [id], function(err, result){
                if(err){
                    res.send(err);
                }else if(result.length > 0){

                    //If purchase history exists, make item inactive
                    db.query('UPDATE items SET active = 0 WHERE id = ?', [id], function(err, result){
                        if(err){
                            res.send(err);
                        }else{
                            res.send({message:'Item marked as Inactive'});
                        }
                    });

                }else{

                    //If no purchase history, delete item
                    db.query('DELETE FROM items WHERE id = ?', [id], function(err, result){
                        if(err){
                            res.send(err);
                        }else{
                            res.send({message:'Item Deleted Successfully'});
                        }
                    });

                }
            });
        }
    });
});


//Get all purchases with items
app.get('/api/purchases', function(req, res){
    let sql="SELECT purchases.id, purchases.order_id, purchases.purchase_date, items.name, item_types.type_name, purchase_items.quantity FROM purchases JOIN purchase_items ON purchases.id = purchase_items.purchase_id JOIN items ON purchase_items.item_id = items.id JOIN item_types ON items.item_type_id = item_types.id ORDER BY purchases.id DESC";
    db.query(sql, function(err,result){
        if(err){res.send(err); return;}
        res.send(result);
    });
});

//start the server
app.listen(5000, function(){
    console.log('Server running on port 5000');
});


