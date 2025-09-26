const Sqlite = require("nativescript-sqlite");

async function createTables() {
    const db = await Sqlite("household.db");
    
    await db.execSQL(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            icon TEXT,
            color TEXT
        )
    `);

    await db.execSQL(`
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
    const db = await Sqlite("household.db");
    return await db.all("SELECT * FROM categories ORDER BY name");
}

async function addCategory(name, icon = null, color = "#65BBE9") {
    const db = await Sqlite("household.db");
    try {
        await db.execSQL(
            "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
            [name, icon, color]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteCategory(id) {
    const db = await Sqlite("household.db");
    try {
        const count = await db.get(
            "SELECT COUNT(*) as count FROM expenses WHERE category_id = ?",
            [id]
        );

        if (count.count > 0) {
            return { success: false, error: "このカテゴリは使用中のため削除できません" };
        }
        await db.execSQL("DELETE FROM categories WHERE id = ?", [id]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateCategory(id, name, icon = null, color = "#65BBE9") {
    const db = await Sqlite("household.db");
    try {
        await db.execSQL(
            "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
            [name, icon, color, id]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function addExpense(isExpense, amount, categoryId, description = null) {
    const db = await Sqlite("household.db");
    try {
        await db.execSQL(
            "INSERT INTO expenses (expense, amount, category_id, description) VALUES (?, ?, ?, ?)",
            [isExpense, amount, categoryId, description]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getExpenses(limit = 50) {
    const db = await Sqlite("household.db");
    try {
        const expenses = await db.all(`
            SELECT e.*, c.name as category_name, c.icon as category_icon 
            FROM expenses e 
            LEFT JOIN categories c ON e.category_id = c.id 
            ORDER BY e.date DESC, e.created_at DESC 
            LIMIT ?
        `, [limit]);
        return expenses;
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
}

async function deleteExpense(id) {
    const db = await Sqlite("household.db");
    try {
        await db.execSQL("DELETE FROM expenses WHERE id = ?", [id]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export { createTables, getCategories, addCategory, deleteCategory, updateCategory, addExpense, getExpenses, deleteExpense };
