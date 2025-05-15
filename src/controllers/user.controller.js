const db = require("../config/db");
const publishMessage = require("../pubsub/publisher");
const jobQueue = require("../queue/jobQueue");

exports.createUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    const user = { id: result.insertId, name, email };

    await publishMessage("user_created", user);
    await jobQueue.add(user);

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.bulkCreateUsers = async (req, res) => {
  const users = req.body.users; // expecting array of { name, email }

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: "Users array is required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Bulk insert users
    const values = users.map((u) => [u.name, u.email]);
    const [result] = await connection.query(
      "INSERT INTO users (name, email) VALUES ?",
      [values]
    );

    // Lấy id bắt đầu (MySQL tự tăng)
    let insertId = result.insertId;

    // Tạo mảng user với id tương ứng
    const insertedUsers = users.map((user, idx) => ({
      id: insertId + idx,
      name: user.name,
      email: user.email,
    }));

    // Đẩy message và job queue cho từng user
    for (const user of insertedUsers) {
      await publishMessage("user_created", user);
      await jobQueue.add(user);
    }

    await connection.commit();

    res.status(201).json({ insertedUsers });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    connection.release();
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const [result] = await db.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = { id: parseInt(id), name, email };
    await publishMessage("user_updated", updatedUser);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await publishMessage("user_deleted", { id: parseInt(id) });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
