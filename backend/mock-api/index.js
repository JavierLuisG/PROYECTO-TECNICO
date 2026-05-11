const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Datos iniciales del ejercicio
let products = [
  {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
    date_release: '2023-02-01',
    date_revision: '2024-02-01',
  },
  {
    id: 'seg-vida',
    name: 'Seguro de Vida',
    description: 'Protección de vida para el titular y su familia',
    logo: 'https://www.segurosatlas.com.mx/content/dam/seguros-atlas/home/img-seguro-vida.jpg',
    date_release: '2023-05-15',
    date_revision: '2024-05-15',
  },
  {
    id: 'ahorro-plus',
    name: 'Cuenta de Ahorros Plus',
    description: 'Cuenta de ahorros con rendimientos competitivos del mercado',
    logo: 'https://cdn-icons-png.flaticon.com/512/2331/2331941.png',
    date_release: '2023-01-10',
    date_revision: '2024-01-10',
  },
  {
    id: 'prest-hip',
    name: 'Préstamo Hipotecario',
    description: 'Crédito para adquisición o construcción de vivienda propia',
    logo: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
    date_release: '2023-03-20',
    date_revision: '2024-03-20',
  },
  {
    id: 'fond-inver',
    name: 'Fondo de Inversión',
    description: 'Instrumento de inversión colectiva con diversificación de riesgo',
    logo: 'https://cdn-icons-png.flaticon.com/512/2168/2168252.png',
    date_release: '2023-06-01',
    date_revision: '2024-06-01',
  },
];

// GET /bp/products — listar todos
app.get('/bp/products', (req, res) => {
  res.json({ data: products });
});

// GET /bp/products/:id — obtener uno por ID
app.get('/bp/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({
      name: 'NotFoundError',
      message: 'Not product found with that identifier',
    });
  }
  res.json({ data: product });
});

// GET /bp/products/verification/:id — verificar si existe
app.get('/bp/products/verification/:id', (req, res) => {
  const exists = products.some((p) => p.id === req.params.id);
  res.json(exists);
});

// POST /bp/products — crear
app.post('/bp/products', (req, res) => {
  const { id, name, description, logo, date_release, date_revision } = req.body;

  if (!id || !name || !description || !logo || !date_release || !date_revision) {
    return res.status(400).json({
      name: 'BadRequestError',
      message: "Invalid body, check 'errors' property for more info.",
    });
  }
  if (products.some((p) => p.id === id)) {
    return res.status(400).json({
      name: 'BadRequestError',
      message: 'El ID ya existe',
    });
  }

  const newProduct = { id, name, description, logo, date_release, date_revision };
  products.push(newProduct);
  res.json({ message: 'Product added successfully', data: newProduct });
});

// PUT /bp/products/:id — actualizar
app.put('/bp/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      name: 'NotFoundError',
      message: 'Not product found with that identifier',
    });
  }

  const { name, description, logo, date_release, date_revision } = req.body;
  products[index] = { ...products[index], name, description, logo, date_release, date_revision };
  res.json({ message: 'Product updated successfully', data: products[index] });
});

// DELETE /bp/products/:id — eliminar
app.delete('/bp/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      name: 'NotFoundError',
      message: 'Not product found with that identifier',
    });
  }

  products.splice(index, 1);
  res.json({ message: 'Product removed successfully' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Mock API corriendo en puerto ${PORT}`);
});
