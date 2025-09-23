import { Sqlite } from "nativescript-sqlite";

const categoriesDB = await Sqlite("categories.db");
const expensesDB = await Sqlite("expenses.db");

function createTables() {
    categoriesDB.execSQL(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            icon TEXT,
            color TEXT
        )
    `);

    expensesDB.execSQL(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense BOOLEAN NOT NULL,
            amount REAL NOT NULL CHECK(amount > 0),
            category_id INTEGER,
            date DATE DEFAULT (date('now')),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(category_id) REFERENCES categories(id)
        )
    `);
}

function getCategories() {
    return categoriesDB.all("SELECT name FROM categories");
}

export { createTables, getCategories };
