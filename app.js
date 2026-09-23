const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = 5000;

const DATA_FILE = path.join(__dirname, "records.json");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
}

function getRecords() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
        return [];
    }
}

function saveRecords(records) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

function createHash(name, email, data) {
    const raw =
        `${name.trim().toLowerCase()}|` +
        `${email.trim().toLowerCase()}|` +
        `${data.trim().toLowerCase()}`;

    return crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex");
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

app.get("/", (req, res) => {

    const records = getRecords();
    const message = req.query.message || "";

    const rows = records.map(record => `
        <tr>
            <td>${record.id}</td>
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(record.email)}</td>
            <td>${escapeHtml(record.data)}</td>
            <td>
                <form method="POST" action="/delete/${record.id}">
                    <button class="delete">Delete</button>
                </form>
            </td>
        </tr>
    `).join("");

    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Data Redundancy Removal</title>
    <link rel="stylesheet" href="/style.css">
</head>

<body>

<div class="container">

    <h1>Data Redundancy Removal System</h1>

    ${message ? `<div class="message">${escapeHtml(message)}</div>` : ""}

    <form method="POST" action="/add" class="card">

        <input
            type="text"
            name="name"
            placeholder="Name"
            required
        >

        <input
            type="email"
            name="email"
            placeholder="Email"
            required
        >

        <textarea
            name="data"
            placeholder="Data / Information"
            required
        ></textarea>

        <button type="submit">
            Add Verified Data
        </button>

    </form>

    <h2>Unique Records</h2>

    <table>

        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Data</th>
            <th>Action</th>
        </tr>

        ${
            rows ||
            `<tr>
                <td colspan="5">
                    No records yet.
                </td>
            </tr>`
        }

    </table>

</div>

</body>
</html>
`);
});

app.post("/add", (req, res) => {

    const { name, email, data } = req.body;

    if (!name || !email || !data) {
        return res.redirect(
            "/?message=All fields are required"
        );
    }

    const records = getRecords();

    const hash = createHash(
        name,
        email,
        data
    );

    const duplicate = records.some(
        record => record.data_hash === hash
    );

    if (duplicate) {
        return res.redirect(
            "/?message=Duplicate data detected - record not added"
        );
    }

    const newRecord = {
        id: records.length > 0
            ? Math.max(...records.map(r => r.id)) + 1
            : 1,

        name: name.trim(),

        email: email.trim().toLowerCase(),

        data: data.trim(),

        data_hash: hash
    };

    records.push(newRecord);

    saveRecords(records);

    res.redirect(
        "/?message=Unique and verified data added successfully"
    );
});

app.post("/delete/:id", (req, res) => {

    let records = getRecords();

    const id = Number(req.params.id);

    records = records.filter(
        record => record.id !== id
    );

    saveRecords(records);

    res.redirect(
        "/?message=Record removed"
    );
});

app.listen(PORT, () => {

    console.log(
        `Task 1 running at http://localhost:${PORT}`
    );

});