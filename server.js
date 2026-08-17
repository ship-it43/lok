import express from "express";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const FRONTEND = path.join(__dirname, "..", "frontend");

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(FRONTEND));

const productSeed = [
  {
    sku: "MBL-PRETO",
    name: "Camiseta Oversized Marble Line Básica",
    color: "Preto Mármore",
    category: "masculina",
    price: 89.75,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2025/11/DSC_5036.jpg",
    description: "Confeccionada em malha fio 20.1 penteado, 100% algodão, com 220g de gramatura. Possui acabamento marmorizado, toque estonado premium, pré-lavagem e modelagem oversized para um visual urbano e confortável.",
    sizes: ["P","M","G","GG","XG"],
    measurements: []
  },
  {
    sku: "MBL-FIRE",
    name: "Camiseta Oversized Marble Line Básica",
    color: "Fire",
    category: "masculina",
    price: 89.75,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/05/DSC5409.jpg",
    description: "Confeccionada em malha fio 20.1 penteado, 100% algodão, com 220g de gramatura. Possui acabamento marmorizado, toque estonado premium, pré-lavagem e modelagem oversized para um visual urbano e confortável.",
    sizes: ["P","M","G","GG","XG"],
    measurements: []
  },
  {
    sku: "MBL-FROST",
    name: "Camiseta Oversized Marble Line Básica",
    color: "Frost",
    category: "masculina",
    price: 89.75,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/05/DSC5280.jpg",
    description: "Confeccionada em malha fio 20.1 penteado, 100% algodão, com 220g de gramatura. Possui acabamento marmorizado, toque estonado premium, pré-lavagem e modelagem oversized para um visual urbano e confortável.",
    sizes: ["P","M","G","GG","XG"],
    measurements: []
  },
  {
    sku: "MBL-AURA",
    name: "Camiseta Oversized Marble Line Básica",
    color: "Aura",
    category: "masculina",
    price: 89.75,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/05/DSC5444.jpg",
    description: "Confeccionada em malha fio 20.1 penteado, 100% algodão, com 220g de gramatura. Possui acabamento marmorizado, toque estonado premium, pré-lavagem e modelagem oversized para um visual urbano e confortável.",
    sizes: ["P","M","G","GG","XG"],
    measurements: []
  },
  {
    sku: "REG-PRETA",
    name: "Regata Over Heavy Básica",
    color: "Preta",
    category: "regatas",
    price: 65.40,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/06/Regata-Over-Hevy-Preta.png",
    product_url: "https://www.onebasiq.com.br/produto/regata-over-heavy-basica-preta/",
    description: "A Regata Over Heavy Básica é a expressão máxima de originalidade, construída com foco absoluto na experiência de quem veste. Confeccionada em malha fio 20.1 penteado, 100% algodão, com 220g de gramatura, passa por um rigoroso processo de lavanderia industrial que garante efeito marmorizado único, toque estonado premium, pré-lavagem que elimina o encolhimento e aromatização exclusiva para uma experiência sensorial completa. Sua modelagem Over proporciona um caimento amplo e imponente, ideal para quem busca estilo com conforto, sem abrir mão da qualidade em cada detalhe.",
    sizes: ["PP","P","M","G","GG","XG"],
    measurements: [["PP","66 cm","51 cm"],["P","68 cm","54 cm"],["M","73 cm","56 cm"],["G","74 cm","59 cm"],["GG","74 cm","62 cm"],["XG","75 cm","63 cm"]],
    stock: 40
  },
  {
    sku: "REG-MARMORE",
    name: "Regata Over Heavy Básica",
    color: "Preta Mármore",
    category: "regatas",
    price: 62.40,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/06/Regata-Over-Heavy-Preto-Marmore.png",
    description: "Regata Over com malha 20.1 penteada, 100% algodão e acabamento marmorizado.",
    sizes: ["PP","P","M","G","GG","XG"],
    measurements: [["PP","66 cm","51 cm"],["P","68 cm","54 cm"],["M","73 cm","56 cm"],["G","74 cm","59 cm"],["GG","74 cm","62 cm"],["XG","75 cm","63 cm"]],
    stock: 40
  },
  {
    sku: "REG-OFF",
    name: "Regata Over Heavy Básica",
    color: "Off White",
    category: "regatas",
    price: 65.40,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/06/Regata-Over-Heavy-Off-White.png",
    description: "Regata Over com modelagem ampla, algodão penteado e acabamento premium.",
    sizes: ["PP","P","M","G","GG","XG"],
    measurements: [["PP","66 cm","51 cm"],["P","68 cm","54 cm"],["M","73 cm","56 cm"],["G","74 cm","59 cm"],["GG","74 cm","62 cm"],["XG","75 cm","63 cm"]],
    stock: 40
  },
  {
    sku: "REG-CHUMBO",
    name: "Regata Over Heavy Básica",
    color: "Chumbo",
    category: "regatas",
    price: 65.40,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2026/06/Regata-Over-Heavy-Chumbo.png",
    description: "Regata Over com modelagem ampla, algodão penteado e acabamento premium.",
    sizes: ["PP","P","M","G","GG","XG"],
    measurements: [["PP","66 cm","51 cm"],["P","68 cm","54 cm"],["M","73 cm","56 cm"],["G","74 cm","59 cm"],["GG","74 cm","62 cm"],["XG","75 cm","63 cm"]],
    stock: 40
  },
  {
    sku: "MLS-ROSA",
    name: "Moletom Liso 3 Cabos Básico",
    color: "Rosa Claro",
    category: "moletom",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2025/09/DSC_4759.jpg",
    description: "O Moletom Liso 3 Cabos Básico oferece conforto, resistência e qualidade premium em uma peça essencial e atemporal. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, garantindo toque macio e excelente proteção térmica sem perder a leveza. Conta com reforço ombro a ombro para maior durabilidade e melhor estrutura, além de punhos e barra reforçados que asseguram um acabamento de alto padrão e mantêm o caimento impecável mesmo após diversas lavagens. Com modelagem unissex e design versátil, é ideal para o dia a dia ou momentos de descontração, combinando facilmente com diferentes estilos. Disponível em diversas cores, é uma peça indispensável para quem busca conforto, qualidade e visual clean.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MLS-CAQUI",
    name: "Moletom Liso 3 Cabos Básico",
    color: "Caqui",
    category: "moletom",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2025/09/DSC_2629.jpg",
    description: "O Moletom Liso 3 Cabos Básico oferece conforto, resistência e qualidade premium em uma peça essencial e atemporal. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, garantindo toque macio e excelente proteção térmica sem perder a leveza. Conta com reforço ombro a ombro para maior durabilidade e melhor estrutura, além de punhos e barra reforçados que asseguram um acabamento de alto padrão e mantêm o caimento impecável mesmo após diversas lavagens. Com modelagem unissex e design versátil, é ideal para o dia a dia ou momentos de descontração, combinando facilmente com diferentes estilos. Disponível em diversas cores, é uma peça indispensável para quem busca conforto, qualidade e visual clean.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MLS-VERDE",
    name: "Moletom Liso 3 Cabos Básico",
    color: "Verde Claro",
    category: "moletom",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2025/09/DSC_2716.jpg",
    description: "O Moletom Liso 3 Cabos Básico oferece conforto, resistência e qualidade premium em uma peça essencial e atemporal. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, garantindo toque macio e excelente proteção térmica sem perder a leveza. Conta com reforço ombro a ombro para maior durabilidade e melhor estrutura, além de punhos e barra reforçados que asseguram um acabamento de alto padrão e mantêm o caimento impecável mesmo após diversas lavagens. Com modelagem unissex e design versátil, é ideal para o dia a dia ou momentos de descontração, combinando facilmente com diferentes estilos. Disponível em diversas cores, é uma peça indispensável para quem busca conforto, qualidade e visual clean.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MLS-MILITAR",
    name: "Moletom Liso 3 Cabos Básico",
    color: "Verde Militar",
    category: "moletom",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2025/09/DSC_2668.jpg",
    description: "O Moletom Liso 3 Cabos Básico oferece conforto, resistência e qualidade premium em uma peça essencial e atemporal. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, garantindo toque macio e excelente proteção térmica sem perder a leveza. Conta com reforço ombro a ombro para maior durabilidade e melhor estrutura, além de punhos e barra reforçados que asseguram um acabamento de alto padrão e mantêm o caimento impecável mesmo após diversas lavagens. Com modelagem unissex e design versátil, é ideal para o dia a dia ou momentos de descontração, combinando facilmente com diferentes estilos. Disponível em diversas cores, é uma peça indispensável para quem busca conforto, qualidade e visual clean.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MLS-MARINHO",
    name: "Moletom Liso 3 Cabos Básico",
    color: "Azul Marinho",
    category: "moletom",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2025/09/DSC_2635.jpg",
    description: "O Moletom Liso 3 Cabos Básico oferece conforto, resistência e qualidade premium em uma peça essencial e atemporal. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, garantindo toque macio e excelente proteção térmica sem perder a leveza. Conta com reforço ombro a ombro para maior durabilidade e melhor estrutura, além de punhos e barra reforçados que asseguram um acabamento de alto padrão e mantêm o caimento impecável mesmo após diversas lavagens. Com modelagem unissex e design versátil, é ideal para o dia a dia ou momentos de descontração, combinando facilmente com diferentes estilos. Disponível em diversas cores, é uma peça indispensável para quem busca conforto, qualidade e visual clean.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MCS-OFF",
    name: "Moletom Canguru Streetwear 3 Cabos Básico",
    color: "Off White",
    category: "moletom-canguru",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2024/12/DSC6264-683x1024.jpg",
    description: "O Moletom Canguru Streetwear 3 Cabos Básico entrega conforto, resistência e estilo em uma peça essencial para o dia a dia. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, proporcionando toque macio e excelente proteção térmica sem perder o conforto. Conta com capuz e bolso canguru funcional, além de reforço ombro a ombro que garante maior durabilidade e melhor estrutura da peça. Os punhos e a barra reforçados elevam o acabamento e mantêm o caimento impecável mesmo após várias lavagens. Com modelagem streetwear e design unissex, é versátil e fácil de combinar, ideal tanto para momentos casuais quanto para produções urbanas mais marcantes. Disponível em diversas cores, é uma peça indispensável para quem busca qualidade, conforto e identidade no visual.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MCS-PRETO",
    name: "Moletom Canguru Streetwear 3 Cabos Básico",
    color: "Preto",
    category: "moletom-canguru",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2024/12/DSC6347-683x1024.jpg",
    description: "O Moletom Canguru Streetwear 3 Cabos Básico entrega conforto, resistência e estilo em uma peça essencial para o dia a dia. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, proporcionando toque macio e excelente proteção térmica sem perder o conforto. Conta com capuz e bolso canguru funcional, além de reforço ombro a ombro que garante maior durabilidade e melhor estrutura da peça. Os punhos e a barra reforçados elevam o acabamento e mantêm o caimento impecável mesmo após várias lavagens. Com modelagem streetwear e design unissex, é versátil e fácil de combinar, ideal tanto para momentos casuais quanto para produções urbanas mais marcantes. Disponível em diversas cores, é uma peça indispensável para quem busca qualidade, conforto e identidade no visual.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  },
  {
    sku: "MCS-MARROM",
    name: "Moletom Canguru Streetwear 3 Cabos Básico",
    color: "Marrom",
    category: "moletom-canguru",
    price: 121.67,
    stock: 40,
    image_url: "https://www.onebasiq.com.br/wp-content/uploads/2024/12/DSC5851.jpg",
    description: "O Moletom Canguru Streetwear 3 Cabos Básico entrega conforto, resistência e estilo em uma peça essencial para o dia a dia. Confeccionado em moletom 3 cabos com gramatura de 320g, possui tecido encorpado e aveludado, proporcionando toque macio e excelente proteção térmica sem perder o conforto. Conta com capuz e bolso canguru funcional, além de reforço ombro a ombro que garante maior durabilidade e melhor estrutura da peça. Os punhos e a barra reforçados elevam o acabamento e mantêm o caimento impecável mesmo após várias lavagens. Com modelagem streetwear e design unissex, é versátil e fácil de combinar, ideal tanto para momentos casuais quanto para produções urbanas mais marcantes. Disponível em diversas cores, é uma peça indispensável para quem busca qualidade, conforto e identidade no visual.",
    sizes: ["P","M","G","GG","XG","G2"],
    measurements: [["P","68 cm","58 cm","58 cm"],["M","73 cm","60 cm","59 cm"],["G","75 cm","62 cm","60 cm"],["GG","77 cm","64 cm","61 cm"],["XG","79 cm","66 cm","62 cm"],["G2","77 cm","69 cm","69 cm"]]
  }
];

const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Não autenticado" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: "Acesso negado" });
    next();
  } catch {
    res.status(401).json({ error: "Sessão inválida" });
  }
};

const hash = password => bcrypt.hash(password, 12);
const tokenFor = user => jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

async function query(text, params = []) {
  return pool.query(text, params);
}

async function bootstrap() {
  const schema = await import("node:fs/promises").then(fs => fs.readFile(path.join(__dirname, "schema.sql"), "utf8"));
  await query(schema);
  const adminEmail = process.env.ADMIN_EMAIL || "admin@onebasiq.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const admin = await query("SELECT id FROM users WHERE email=$1", [adminEmail]);
  if (!admin.rowCount) {
    await query("INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin')", ["Administrador ONE BASIQ", adminEmail, await hash(adminPassword)]);
  }
  for (const p of productSeed) {
    await query(
      `INSERT INTO products(sku,name,color,category,description,price,stock,image_url,product_url,sizes,measurements)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT(sku) DO UPDATE SET name=EXCLUDED.name,color=EXCLUDED.color,category=EXCLUDED.category,description=EXCLUDED.description,price=EXCLUDED.price,image_url=EXCLUDED.image_url,product_url=EXCLUDED.product_url,sizes=EXCLUDED.sizes,measurements=EXCLUDED.measurements`,
      [p.sku,p.name,p.color,p.category,p.description,p.price,p.stock,p.image_url,p.product_url || null,JSON.stringify(p.sizes),JSON.stringify(p.measurements)]
    );
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, cpf, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    if (password.length < 8) return res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres" });
    const exists = await query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ error: "E-mail já cadastrado" });
    const result = await query(
      "INSERT INTO users(name,email,password_hash,cpf,phone) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,role",
      [name,email.toLowerCase(),await hash(password),cpf || null,phone || null]
    );
    const user = result.rows[0];
    res.status(201).json({ token: tokenFor(user), user });
  } catch {
    res.status(500).json({ error: "Não foi possível criar a conta" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query("SELECT * FROM users WHERE email=$1 AND active=TRUE", [String(email || "").toLowerCase()]);
    if (!result.rowCount || !(await bcrypt.compare(password || "", result.rows[0].password_hash))) return res.status(401).json({ error: "E-mail ou senha inválidos" });
    const user = result.rows[0];
    res.json({ token: tokenFor(user), user: { id:user.id,name:user.name,email:user.email,role:user.role } });
  } catch {
    res.status(500).json({ error: "Falha no login" });
  }
});

app.get("/api/me", auth(), async (req, res) => {
  const result = await query("SELECT id,name,email,cpf,phone,role,active,created_at FROM users WHERE id=$1", [req.user.id]);
  res.json(result.rows[0]);
});

app.get("/api/products", async (req, res) => {
  const category = req.query.category;
  const result = category
    ? await query("SELECT * FROM products WHERE active=TRUE AND category=$1 ORDER BY created_at ASC", [category])
    : await query("SELECT * FROM products WHERE active=TRUE ORDER BY created_at ASC");
  res.json(result.rows);
});

app.get("/api/admin/products", auth(["admin"]), async (req, res) => {
  const result = await query("SELECT * FROM products ORDER BY created_at DESC");
  res.json(result.rows);
});

app.post("/api/admin/products", auth(["admin"]), async (req, res) => {
  const p = req.body;
  if (!p.sku || !p.name || !p.color) return res.status(400).json({ error: "SKU, nome e cor são obrigatórios" });
  const result = await query(
    `INSERT INTO products(sku,name,color,category,description,price,stock,image_url,product_url,active,sizes,measurements)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [p.sku,p.name,p.color,p.category || "geral",p.description || "",Number(p.price || 0),Number(p.stock || 0),p.image_url || "",p.product_url || null,p.active !== false,JSON.stringify(p.sizes || []),JSON.stringify(p.measurements || [])]
  );
  res.status(201).json(result.rows[0]);
});

app.put("/api/admin/products/:id", auth(["admin"]), async (req, res) => {
  const p = req.body;
  const result = await query(
    `UPDATE products SET sku=$1,name=$2,color=$3,category=$4,description=$5,price=$6,stock=$7,image_url=$8,product_url=$9,active=$10,sizes=$11,measurements=$12,updated_at=NOW() WHERE id=$13 RETURNING *`,
    [p.sku,p.name,p.color,p.category,p.description || "",Number(p.price || 0),Number(p.stock || 0),p.image_url || "",p.product_url || null,p.active !== false,JSON.stringify(p.sizes || []),JSON.stringify(p.measurements || []),req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: "Produto não encontrado" });
  res.json(result.rows[0]);
});

app.delete("/api/admin/products/:id", auth(["admin"]), async (req, res) => {
  await query("UPDATE products SET active=FALSE,updated_at=NOW() WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/admin/customers", auth(["admin"]), async (req, res) => {
  const result = await query("SELECT id,name,email,cpf,phone,active,created_at FROM users WHERE role='customer' ORDER BY created_at DESC");
  res.json(result.rows);
});

app.patch("/api/admin/customers/:id", auth(["admin"]), async (req, res) => {
  const { active } = req.body;
  const result = await query("UPDATE users SET active=$1,updated_at=NOW() WHERE id=$2 AND role='customer' RETURNING id,name,email,active", [Boolean(active),req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: "Cliente não encontrado" });
  res.json(result.rows[0]);
});

app.get("/api/admin/orders", auth(["admin"]), async (req, res) => {
  const result = await query(
    `SELECT o.*, COALESCE(json_agg(json_build_object('id',oi.id,'name',oi.name,'color',oi.color,'size',oi.size,'quantity',oi.quantity,'unit_price',oi.unit_price,'image_url',oi.image_url)) FILTER (WHERE oi.id IS NOT NULL),'[]') items
     FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id GROUP BY o.id ORDER BY o.created_at DESC`
  );
  res.json(result.rows);
});

app.patch("/api/admin/orders/:id", auth(["admin"]), async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending","confirmed","processing","shipped","delivered","cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Status inválido" });
  const result = await query("UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *", [status,req.params.id]);
  if (!result.rowCount) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(result.rows[0]);
});

app.get("/api/admin/dashboard", auth(["admin"]), async (req, res) => {
  const [sales, orders, customers, products] = await Promise.all([
    query("SELECT COALESCE(SUM(total),0) value FROM orders WHERE payment_status='approved'"),
    query("SELECT COUNT(*) value FROM orders"),
    query("SELECT COUNT(*) value FROM users WHERE role='customer'"),
    query("SELECT COUNT(*) value FROM products WHERE active=TRUE")
  ]);
  res.json({
    sales: Number(sales.rows[0].value),
    orders: Number(orders.rows[0].value),
    customers: Number(customers.rows[0].value),
    products: Number(products.rows[0].value)
  });
});

app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer, items, shippingAddress, paymentMethod } = req.body;
    if (!customer?.name || !customer?.email || !items?.length) return res.status(400).json({ error: "Dados do pedido incompletos" });
    await client.query("BEGIN");
    const ids = items.map(item => item.productId);
    const productResult = await client.query("SELECT * FROM products WHERE id=ANY($1::uuid[]) AND active=TRUE FOR UPDATE", [ids]);
    const map = new Map(productResult.rows.map(row => [row.id,row]));
    let subtotal = 0;
    const normalized = [];
    for (const item of items) {
      const p = map.get(item.productId);
      const quantity = Math.max(1,Math.min(20,Number(item.quantity || 1)));
      if (!p || p.stock < quantity) throw new Error(`Estoque insuficiente para ${item.name || "produto"}`);
      subtotal += Number(p.price) * quantity;
      normalized.push({ p, quantity, size: item.size || "M" });
    }
    const shipping = subtotal >= 499 ? 0 : 29.9;
    const total = subtotal + shipping;
    const userId = req.user?.id || null;
    const orderResult = await client.query(
      `INSERT INTO orders(user_id,status,payment_status,payment_method,subtotal,shipping,total,customer_name,customer_email,customer_cpf,customer_phone,shipping_address)
       VALUES($1,'pending','pending',$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [userId,paymentMethod || "mercado_pago",subtotal,shipping,total,customer.name,customer.email,customer.cpf || null,customer.phone || null,JSON.stringify(shippingAddress || {})]
    );
    const order = orderResult.rows[0];
    for (const item of normalized) {
      await client.query(
        `INSERT INTO order_items(order_id,product_id,sku,name,color,size,unit_price,quantity,image_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [order.id,item.p.id,item.p.sku,item.p.name,item.p.color,item.size,Number(item.p.price),item.quantity,item.p.image_url]
      );
      await client.query("UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2", [item.quantity,item.p.id]);
    }
    await client.query("INSERT INTO payments(order_id,method,status) VALUES($1,$2,'pending')", [order.id,paymentMethod || "mercado_pago"]);
    await client.query("COMMIT");
    res.status(201).json({ orderId: order.id, total });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: error.message || "Não foi possível criar o pedido" });
  } finally {
    client.release();
  }
});

app.post("/api/payments/mercado-pago/preference", async (req, res) => {
  try {
    if (!process.env.MP_ACCESS_TOKEN) return res.status(503).json({ error: "Mercado Pago não configurado. Defina MP_ACCESS_TOKEN no ambiente." });
    const { orderId } = req.body;
    const orderResult = await query(
      `SELECT o.*, COALESCE(json_agg(json_build_object('title',oi.name || ' - ' || oi.color,'quantity',oi.quantity,'unit_price',oi.unit_price,'currency_id','BRL')) FILTER (WHERE oi.id IS NOT NULL),'[]') items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE o.id=$1 GROUP BY o.id`,
      [orderId]
    );
    if (!orderResult.rowCount) return res.status(404).json({ error: "Pedido não encontrado" });
    const order = orderResult.rows[0];
    const publicUrl = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: order.items,
        payer: { name: order.customer_name, email: order.customer_email },
        external_reference: order.id,
        back_urls: {
          success: `${publicUrl}/?payment=success&order=${order.id}`,
          failure: `${publicUrl}/?payment=failure&order=${order.id}`,
          pending: `${publicUrl}/?payment=pending&order=${order.id}`
        },
        auto_return: "approved",
        notification_url: `${publicUrl}/api/payments/mercado-pago/webhook`,
        statement_descriptor: "ONE BASIQ"
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "Mercado Pago recusou a preferência" });
    await query("UPDATE orders SET mp_preference_id=$1,updated_at=NOW() WHERE id=$2", [data.id,order.id]);
    res.json({ id:data.id, init_point:data.init_point, sandbox_init_point:data.sandbox_init_point });
  } catch {
    res.status(500).json({ error: "Falha ao criar o pagamento" });
  }
});

function validateWebhook(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"] || "";
  const dataId = req.query["data.id"] || req.body?.data?.id || "";
  if (!signature || !dataId) return false;
  const parts = Object.fromEntries(String(signature).split(",").map(part => part.split("=",2)));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256",secret).update(manifest).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(parts.v1));
}

app.post("/api/payments/mercado-pago/webhook", async (req, res) => {
  try {
    if (!validateWebhook(req)) return res.status(401).json({ error: "Assinatura inválida" });
    const paymentId = req.body?.data?.id || req.query["data.id"];
    if (!paymentId || !process.env.MP_ACCESS_TOKEN) return res.sendStatus(200);
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const payment = await mpResponse.json();
    if (!mpResponse.ok) return res.sendStatus(200);
    const orderId = payment.external_reference;
    if (!orderId) return res.sendStatus(200);
    const paymentStatus = payment.status === "approved" ? "approved" : payment.status === "rejected" ? "rejected" : "pending";
    const orderStatus = paymentStatus === "approved" ? "confirmed" : "pending";
    await query("UPDATE payments SET status=$1,external_id=$2,external_reference=$3,raw_response=$4,updated_at=NOW() WHERE order_id=$5", [paymentStatus,String(payment.id),orderId,JSON.stringify(payment),orderId]);
    await query("UPDATE orders SET payment_status=$1,status=$2,updated_at=NOW() WHERE id=$3", [paymentStatus,orderStatus,orderId]);
    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
});

app.get("/api/orders/:id", async (req, res) => {
  const result = await query(
    `SELECT o.*, COALESCE(json_agg(json_build_object('name',oi.name,'color',oi.color,'size',oi.size,'quantity',oi.quantity,'unit_price',oi.unit_price,'image_url',oi.image_url)) FILTER (WHERE oi.id IS NOT NULL),'[]') items
     FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE o.id=$1 GROUP BY o.id`,
    [req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(result.rows[0]);
});

app.get("/api/customer/orders", auth(), async (req, res) => {
  const result = await query("SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC", [req.user.id]);
  res.json(result.rows);
});

app.get("/admin", (req,res) => res.sendFile(path.join(FRONTEND,"admin.html")));
app.use((req,res,next) => res.sendFile(path.join(FRONTEND,"index.html")));

bootstrap().then(() => {
  app.listen(PORT, () => console.log(`ONE BASIQ em http://localhost:${PORT}`));
}).catch(error => {
  console.error(error);
  process.exit(1);
});
