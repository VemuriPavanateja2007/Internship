SALES ANALYTICS DASHBOARD - WORKING EXPLANATION
================================================

1. PROJECT OVERVIEW
-------------------
This project is a Sales Analytics Dashboard developed using:

- Python
- Flask
- SQLite
- HTML
- Bootstrap 5
- Jinja2
- Chart.js

The application reads sales information from an SQLite database and converts
the raw records into useful sales statistics and visual summaries.

2. PROJECT STRUCTURE
--------------------
sales_analytics_dashboard/
|
|-- app.py
|-- sales.db
|-- requirements.txt
|-- README_WORKING.txt
|
|-- templates/
|   `-- dashboard.html
|
`-- static/
    `-- (reserved for future CSS/JavaScript files)

3. DATABASE
-----------
The database file is sales.db.

The sales table contains:

id        - unique sales record ID
product   - product name
category  - product category
quantity  - number of units sold
price     - price of one unit
total     - quantity multiplied by price

The application automatically creates the sales table when needed.

If sales.db is empty, app.py inserts sample sales records so that the
dashboard can be tested immediately.

IMPORTANT:
If you already have an existing sales.db, place it in the same folder as
app.py. The application will use the existing database. It will only insert
sample data when the sales table contains no records.

4. HOW app.py WORKS
-------------------
The Flask application starts from app.py.

The function get_db_connection() opens a connection to sales.db and uses
sqlite3.Row so database columns can be accessed by name.

The initialize_database() function:
1. Creates the sales table if it does not exist.
2. Checks whether sales records exist.
3. Inserts sample records only when the table is empty.

5. DASHBOARD ROUTE
------------------
The main route is:

    /

When the user opens the dashboard, Flask executes the dashboard() function.

First, the application reads the selected category from the URL:

    ?category=Electronics

If no category is selected, all sales are displayed.

6. TOTAL SALES AMOUNT
---------------------
The application calculates total sales using:

    SUM(total)

The total field represents:

    Quantity x Price

For example:

    Quantity = 5
    Price = 55000

    Total = 5 x 55000
          = 275000

The dashboard displays the sum of all transaction totals.

7. TOTAL QUANTITY
-----------------
The total quantity is calculated using:

    SUM(quantity)

This tells the user how many product units were sold.

8. TOTAL TRANSACTIONS
---------------------
The number of sales records is calculated using:

    COUNT(*)

Each row in the sales table is treated as one sales transaction.

9. BEST-SELLING PRODUCT
-----------------------
The application groups records by product:

    GROUP BY product

Then it calculates:

    SUM(quantity)

Products are sorted from highest quantity to lowest quantity, and the first
product is displayed as the best-selling product.

Therefore, "best-selling" in this project means the product with the highest
quantity sold, as required.

10. PRODUCT SUMMARY
-------------------
The product summary query groups sales by product.

For every product, it displays:

- Product name
- Total quantity sold
- Total sales amount

This helps compare the performance of individual products.

11. CATEGORY SUMMARY
--------------------
The category summary groups sales by category.

For every category, it displays:

- Category name
- Total quantity sold
- Total sales amount

This helps identify which category generates the most sales.

12. CATEGORY FILTER
-------------------
The dashboard contains a Bootstrap dropdown.

When a category is selected, the page sends the category as a GET parameter.

Example:

    /?category=Electronics

The SQL query then uses:

    WHERE category = ?

The same filter is applied to the dashboard statistics, product summary,
category summary, chart and sales table.

The Reset button removes the filter and returns to all sales.

13. BOOTSTRAP CARDS
-------------------
The dashboard uses Bootstrap 5 cards to display four important statistics:

- Total Sales Amount
- Products Sold
- Transactions
- Best-Selling Product

This provides a simple dashboard-style interface.

14. SALES TABLE
---------------
The bottom section displays all sales information in a Bootstrap responsive
table.

Columns are:

- ID
- Product
- Category
- Quantity
- Price
- Total

The table automatically changes when a category filter is applied.

15. CHART.JS
-----------
Chart.js is loaded using its CDN.

The Flask backend sends product names and sales amounts to the Jinja2
template.

Jinja2 converts the Python lists into JavaScript arrays using:

    |tojson

Chart.js then creates a bar chart showing sales amount by product.

16. JINJA2
----------
Jinja2 is Flask's template engine.

The HTML file uses Jinja2 expressions such as:

    {{ stats["total_sales"] }}

and loops such as:

    {% for row in product_summary %}

This allows Python data to be displayed dynamically in HTML.

17. HOW TO RUN THE PROJECT
--------------------------
Step 1:
Install Python.

Step 2:
Open Command Prompt or PowerShell in the project folder.

Step 3:
Create a virtual environment:

    python -m venv .venv

Step 4:
Activate it on Windows:

    .venv\Scripts\activate

Step 5:
Install Flask:

    pip install -r requirements.txt

Step 6:
Run the application:

    python app.py

Step 7:
Open the browser and visit:

    http://127.0.0.1:5000/

18. IMPORTANT DATABASE NOTE
---------------------------
If you have an existing SQLite database from a previous Sales Management
System, make sure:

- The database file is named sales.db, OR update DB_PATH in app.py.
- The table is named sales.
- The table has these columns:

    id
    product
    category
    quantity
    price
    total

If your existing database uses different column names, update the SQL
queries in app.py to match your database schema.

19. REQUIREMENTS FILE
---------------------
requirements.txt contains Flask.

Chart.js and Bootstrap 5 are loaded from CDN links in dashboard.html, so
they do not need to be installed with pip.

20. MAIN DATA FLOW
------------------
SQLite database
       |
       v
   Flask app.py
       |
       v
    SQL queries
       |
       v
  Calculated statistics
       |
       v
   Jinja2 template
       |
       +----> Bootstrap cards
       |
       +----> Bootstrap tables
       |
       `----> Chart.js chart
       |
       v
     Browser

21. EXPECTED RESULT
-------------------
When the application is started, the dashboard shows the sales statistics,
best-selling product, product summary, category summary, complete sales
table and sales performance chart.

The category dropdown can be used to display analytics for a particular
category.

22. CUSTOMIZATION
-----------------
You can replace the sample data in sales.db with your actual sales records.

You can also add more records directly to SQLite or extend the Flask
application later with features such as:

- Date-wise sales analysis
- Monthly sales charts
- Product search
- Export to CSV
- Sales forecasting
- Login/authentication
- CRUD operations for sales
