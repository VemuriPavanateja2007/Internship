from flask import Flask, render_template, request
import sqlite3
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "sales.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    """Create the sales table and sample data if the database is empty."""
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL
        )
    """)

    count = conn.execute("SELECT COUNT(*) FROM sales").fetchone()[0]

    if count == 0:
        sample_data = [
            ("Laptop", "Electronics", 5, 55000),
            ("Mouse", "Electronics", 25, 800),
            ("Keyboard", "Electronics", 18, 1500),
            ("Headphones", "Electronics", 12, 2500),
            ("Office Chair", "Furniture", 8, 7500),
            ("Desk", "Furniture", 6, 12000),
            ("Notebook", "Stationery", 40, 120),
            ("Pen", "Stationery", 60, 30),
            ("Backpack", "Accessories", 15, 1800),
            ("Water Bottle", "Accessories", 22, 600),
        ]

        conn.executemany("""
            INSERT INTO sales (product, category, quantity, price, total)
            VALUES (?, ?, ?, ?, ?)
        """, [(p, c, q, price, q * price) for p, c, q, price in sample_data])

    conn.commit()
    conn.close()


@app.route("/")
def dashboard():
    selected_category = request.args.get("category", "").strip()

    conn = get_db_connection()

    categories = conn.execute("""
        SELECT DISTINCT category
        FROM sales
        ORDER BY category
    """).fetchall()

    where_clause = ""
    params = ()

    if selected_category:
        where_clause = "WHERE category = ?"
        params = (selected_category,)

    stats = conn.execute(f"""
        SELECT
            COALESCE(SUM(total), 0) AS total_sales,
            COALESCE(SUM(quantity), 0) AS total_quantity,
            COUNT(*) AS total_transactions
        FROM sales
        {where_clause}
    """, params).fetchone()

    best_selling = conn.execute(f"""
        SELECT product, SUM(quantity) AS quantity_sold
        FROM sales
        {where_clause}
        GROUP BY product
        ORDER BY quantity_sold DESC
        LIMIT 1
    """, params).fetchone()

    product_summary = conn.execute(f"""
        SELECT
            product,
            SUM(quantity) AS quantity_sold,
            SUM(total) AS sales_amount
        FROM sales
        {where_clause}
        GROUP BY product
        ORDER BY sales_amount DESC
    """, params).fetchall()

    category_summary = conn.execute(f"""
        SELECT
            category,
            SUM(quantity) AS quantity_sold,
            SUM(total) AS sales_amount
        FROM sales
        {where_clause}
        GROUP BY category
        ORDER BY sales_amount DESC
    """, params).fetchall()

    sales_rows = conn.execute(f"""
        SELECT id, product, category, quantity, price, total
        FROM sales
        {where_clause}
        ORDER BY id DESC
    """, params).fetchall()

    conn.close()

    chart_labels = [row["product"] for row in product_summary]
    chart_values = [float(row["sales_amount"]) for row in product_summary]

    return render_template(
        "dashboard.html",
        stats=stats,
        best_selling=best_selling,
        product_summary=product_summary,
        category_summary=category_summary,
        sales_rows=sales_rows,
        categories=categories,
        selected_category=selected_category,
        chart_labels=chart_labels,
        chart_values=chart_values,
    )


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
