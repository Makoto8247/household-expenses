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

function addCategory(name, icon = null, color = "#65BBE9") {
    try {
        categoriesDB.execSQL(
            "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
            [name, icon, color]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCategory(id) {
    try {
        const count = categoriesDB.get(
            "SELECT COUNT(*) FROM expenses WHERE category_id = ?",
            [id]
        );

        if (count.count > 0) {
            return { success: false, error: "Cannot delete category with associated expenses." };
        }
        categoriesDB.execSQL("DELETE FROM categories WHERE id = ?", [id]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCategory(id, name, icon = null, color = "#65BBE9") {
    try {
        categoriesDB.execSQL(
            "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
            [name, icon, color, id]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export { createTables, getCategories, addCategory, deleteCategory, updateCategory };
