const Sqlite = require("nativescript-sqlite");

// Data structure definitions (like structs)
class CategoryData {
    constructor({
        id,
        name, 
        icon,
        color
    }) {
        this.id = id || 0;
        this.name = name || '';
        this.icon = icon || '📝';
        this.color = color || '#65BBE9';
    }
}

class ExpenseData {
    constructor({
        id,
        title,
        expense,
        amount,
        categoryId,
        categoryName,
        categoryIcon,
        date,
        description,
        createdAt,
        updatedAt
    }) {
        this.id = id || 0;
        this.title = title || '';
        this.expense = Boolean(expense);
        this.amount = parseFloat(amount) || 0;
        this.categoryId = categoryId || null;
        this.categoryName = categoryName || 'カテゴリなし';
        this.categoryIcon = categoryIcon || '📝';
        this.date = date || new Date().toISOString().split('T')[0];
        this.description = description || '';
        this.createdAt = createdAt || '';
        this.updatedAt = updatedAt || '';
    }
}

export async function createTables() {
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
            title CHAR(20) NOT NULL,
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

export async function getCategories() {
    const db = await Sqlite("household.db");
    try {
        const rows = await db.all("SELECT * FROM categories ORDER BY name");
        return rows.map(row => new CategoryData({
            id: row[0],
            name: row[1],
            icon: row[2],
            color: row[3]
        }));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function getCategory(id) {
    const db = await Sqlite("household.db");
    try {
        const row = await db.get("SELECT * FROM categories WHERE id = ?", [id]);
        return row ? new CategoryData({
            id: row[0],
            name: row[1],
            icon: row[2],
            color: row[3]
        }) : null;
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
}

export async function addCategory(name, icon = null, color = "#65BBE9") {
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

export async function deleteCategory(id) {
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

export async function updateCategory(id, name, icon = null, color = "#65BBE9") {
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

export async function addExpense(isExpense, title, amount, categoryId, description = null) {
    const db = await Sqlite("household.db");
    try {
        await db.execSQL(
            `INSERT INTO expenses (expense, title, amount, category_id, description)
                VALUES (?, ?, ?, ?, ?)`,
            [isExpense, title, amount, categoryId, description]
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getExpenses(limit = 50) {
    const db = await Sqlite("household.db");
    try {
        const rows = await db.all(`
            SELECT e.*, c.name as category_name, c.icon as category_icon 
            FROM expenses e 
            LEFT JOIN categories c ON e.category_id = c.id 
            ORDER BY e.date DESC, e.created_at DESC 
            LIMIT ?
        `, [limit]);

        return rows.map(row => new ExpenseData({
            id: row[0],
            title: row[1],
            expense: row[2],
            amount: row[3],
            categoryId: row[4],
            categoryName: row[5],
            categoryIcon: row[6],
            date: row[7],
            description: row[8],
            createdAt: row[9],
            updatedAt: row[10]
        }));
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
}

export async function getExpense(id) {
    const db = await Sqlite("household.db");
    try {
        const row = await db.get(`
            SELECT e.*, c.name as category_name, c.icon as category_icon 
            FROM expenses e 
            LEFT JOIN categories c ON e.category_id = c.id 
            WHERE e.id = ?
        `, [id]);
        
        return row ? new ExpenseData({
            id: row[0],
            title: row[1],
            expense: row[2],
            amount: row[3],
            categoryId: row[4],
            categoryName: row[5],
            categoryIcon: row[6],
            date: row[7],
            description: row[8],
            createdAt: row[9],
            updatedAt: row[10]
        }) : null;
    } catch (error) {
        console.error("Error fetching expense:", error);
        return null;
    }
}

export async function deleteExpense(id) {
    const db = await Sqlite("household.db");
    try {
        await db.execSQL("DELETE FROM expenses WHERE id = ?", [id]);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
