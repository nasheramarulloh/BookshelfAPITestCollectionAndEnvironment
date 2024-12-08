const express = require('express'); // Import Express
const { nanoid } = require('nanoid'); // Import nanoid untuk ID unik
const Joi = require('joi'); // Import Joi untuk validasi

const app = express(); // Membuat instance Express
const port = 9000; // Port server

app.use(express.json()); // Middleware untuk membaca JSON

// Skema validasi untuk buku
const bookSchema = Joi.object({
    name: Joi.string().required().messages({ 'any.required': 'Mohon isi nama buku' }),
    year: Joi.number().required(),
    author: Joi.string().required(),
    summary: Joi.string().required(),
    publisher: Joi.string().required(),
    pageCount: Joi.number().required(),
    readPage: Joi.number().required().max(Joi.ref('pageCount')).messages({
        'number.max': 'readPage tidak boleh lebih besar dari pageCount',
    }),
    reading: Joi.boolean().required(),
});

// Array untuk menyimpan buku
let books = [];

// **1. Tambah Buku**
app.post('/books', (req, res) => {
    const { error } = bookSchema.validate(req.body); // Validasi data
    if (error) {
        return res.status(400).json({
            status: 'fail',
            message: error.details[0].message,
        });
    }

    const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.body;

    // Menggunakan nanoid untuk ID panjang dan ID pendek
    const bookId = nanoid(); // ID panjang
    const shortBookId = nanoid(10); // ID pendek (10 karakter)

    console.log('Generated long ID:', bookId);  // ID panjang
    console.log('Generated short ID:', shortBookId);  // ID pendek

    const book = {
        id: bookId,
        shortId: shortBookId,  // Menyimpan ID pendek di book
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished: readPage === pageCount,
        reading,
        insertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    books.push(book);

    return res.status(201).json({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: { bookId: book.id },
    });
});

// **2. Tampilkan Semua Buku**
app.get('/books', (req, res) => {
    const simplifiedBooks = books.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
    }));

    return res.status(200).json({
        status: 'success',
        data: { books: simplifiedBooks },
    });
});

// **3. Tampilkan Detail Buku**
app.get('/books/:bookId', (req, res) => {
    const { bookId } = req.params;
    const book = books.find((b) => b.id === bookId);

    if (!book) {
        return res.status(404).json({
            status: 'fail',
            message: 'Buku tidak ditemukan',
        });
    }

    return res.status(200).json({
        status: 'success',
        data: { book },
    });
});

// **4. Update Buku**
app.put('/books/:bookId', (req, res) => {
    const { bookId } = req.params;
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.body;

    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1) {
        return res.status(404).json({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });
    }

    if (!name) {
        return res.status(400).json({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
    }

    if (readPage > pageCount) {
        return res.status(400).json({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
    }

    books[bookIndex] = {
        ...books[bookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished: readPage === pageCount,
        updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
        status: 'success',
        message: 'Buku berhasil diperbarui',
    });
});

// **5. Hapus Buku**
app.delete('/books/:bookId', (req, res) => {
    const { bookId } = req.params;

    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1) {
        return res.status(404).json({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        });
    }

    books.splice(bookIndex, 1);

    return res.status(200).json({
        status: 'success',
        message: 'Buku berhasil dihapus',
    });
});

// **Endpoint untuk menghapus semua buku**
app.delete('/books', (req, res) => {
    books = []; // Kosongkan array books

    return res.status(200).json({
        status: 'success',
        message: 'Semua buku berhasil dihapus',
    });
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan pada http://localhost:${port}`);
});
