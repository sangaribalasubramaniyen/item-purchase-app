CREATE DATABASE item_purchase_db;
USE item_purchase_db;

CREATE TABLE item_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  purchase_date DATE NOT NULL,
  stock_available INT NOT NULL DEFAULT 0,
  item_type_id INT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_type_id) REFERENCES item_types(id)
);


CREATE TABLE  purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);


USE item_purchase_db;
SHOW TABLES;


USE item_purchase_db;

INSERT INTO item_types (type_name) VALUES ('Raw Material');
INSERT INTO item_types (type_name) VALUES ('Finished Goods');
INSERT INTO item_types (type_name) VALUES ('Spare Parts');

SELECT * FROM item_types;

select * from items;

Select * from purchase_items;
SELECT * FROM purchases;


