from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect("sales.db")
    conn.row_factory = sqlite3.Row
    return conn


def create_table():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()


@app.route("/")
def index():
    conn = get_db_connection()
    sales = conn.execute(
        "SELECT * FROM sales ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return render_template("index.html", sales=sales)


@app.route("/add", methods=["POST"])
def add_sale():
    product = request.form["product"]
    quantity = int(request.form["quantity"])
    price = float(request.form["price"])

    total = quantity * price

    conn = get_db_connection()
    conn.execute("""
        INSERT INTO sales (product, quantity, price, total)
        VALUES (?, ?, ?, ?)
    """, (product, quantity, price, total))
    conn.commit()
    conn.close()

    return redirect("/")


create_table()


if __name__ == "__main__":
    app.run(debug=True)
