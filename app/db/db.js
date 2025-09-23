import { Sqlite } from "nativescript-sqlite";

let categoriesDB = null;
let expensesDB = null;

async function createTables() {
    categoriesDB = await Sqlite("categories.db");
    expensesDB = await Sqlite("expenses.db");
    await categoriesDB.execSQL(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            icon TEXT,
            color TEXT
        )
    `);

    await expensesDB.execSQL(`
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

async function getCategories() {
    return await categoriesDB.all("SELECT name FROM categories");
}

async function addCategory(name, icon = null, color = "#65BBE9") {
    try {
        await categoriesDB.execSQL(
            "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
            [name, icon, color]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteCategory(id) {
    try {
        const count = await categoriesDB.get(
            "SELECT COUNT(*) FROM expenses WHERE category_id = ?",
            [id]
        );

        if (count.count > 0) {
            return { success: false, error: "Cannot delete category with associated expenses." };
        }
        await categoriesDB.execSQL("DELETE FROM categories WHERE id = ?", [id]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateCategory(id, name, icon = null, color = "#65BBE9") {
    try {
        await categoriesDB.execSQL(
            "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
            [name, icon, color, id]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export { createTables, getCategories, addCategory, deleteCategory, updateCategory };
