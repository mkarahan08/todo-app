import * as SQLite from 'expo-sqlite';
let db = null;

export const getDatabase = async () => {
    if (db) return db;
    db = await SQLite.openDatabaseAsync('todoapp.db');
    return db;
};

export const initDatabase = async () => {
    const db = await getDatabase();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT NOT NULL
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            category_id INTEGER,
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            due_time TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        `);

    const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM categories');
    if (result.count === 0) {
        await db.execAsync(`
            INSERT INTO categories (name, color) VALUES ('Genel', '#4CAF50'), ('İş', '#3498DB'), ('Kişisel', '#9B59B6'), ('Alışveriş', '#F39C12');
        `);
    }
};

export const addTask = async (text, categoryId, priority, dueDate, dueTime) => {
    const db = await getDatabase();
    const result = await db.runAsync('INSERT INTO tasks (text, category_id, priority, due_date, due_time) VALUES (?, ?, ?, ?, ?)', [text, categoryId, priority, dueDate, dueTime]);
    return result.lastInsertRowId;
};
export const getTasks = async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT tasks.*, categories.name as category_name, categories.color as category_color FROM tasks LEFT JOIN categories ON tasks.category_id = categories.id ORDER BY tasks.completed ASC, tasks.created_at DESC');
};
export const toggleTask = async (id, currentStatus) => {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      [currentStatus ? 0 : 1, id]
    );
};
export const updateTask = async (id, text, categoryId, priority, dueDate, dueTime) => {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE tasks SET text = ?, category_id = ?, priority = ?, due_date = ?, due_time = ? WHERE id = ?',
      [text, categoryId, priority, dueDate, dueTime, id]
    );
};
export const deleteTask = async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};
export const getCategories = async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM categories ORDER BY id ASC');
  };
  
  export const addCategory = async (name, color) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO categories (name, color) VALUES (?, ?)',
      [name, color]
    );
    return result.lastInsertRowId;
  };
  
  export const deleteCategory = async (id) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE tasks SET category_id = NULL WHERE category_id = ?', [id]);
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  };