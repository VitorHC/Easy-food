require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Exemplos fictícios para demonstrar o catálogo e os filtros.
const examples = [
  {
    "name": "Belas Artes",
    "category": "Pão",
    "rating": 4.5
  },
  {
    "name": "Pizzaria la pizza",
    "category": "Pizza",
    "rating": 4.2
  },
  {
    "name": "Dogão do Zé",
    "category": "Hot Dog",
    "rating": 4.8
  },
  {
    "name": "Brasa & Ponto",
    "category": "Churrasco",
    "rating": 4.7
  },
  {
    "name": "Cantina da Praça",
    "category": "Italiana",
    "rating": 4.6
  },
  {
    "name": "Sakura Cozinha Japonesa",
    "category": "Japonesa",
    "rating": 4.8
  },
  {
    "name": "Quintal Brasileiro",
    "category": "Brasileira",
    "rating": 4.7
  },
  {
    "name": "Verde no Prato",
    "category": "Saudável",
    "rating": 4.5
  },
  {
    "name": "Burger da Vila",
    "category": "Burger",
    "rating": 4.6
  },
  {
    "name": "La Mesa Mexicana",
    "category": "Mexicana",
    "rating": 4.4
  },
  {
    "name": "Maré Boa",
    "category": "Frutos do Mar",
    "rating": 4.8
  },
  {
    "name": "Doce Encontro",
    "category": "Doces",
    "rating": 4.7
  },
  {
    "name": "Café do Largo",
    "category": "Cafeteria",
    "rating": 4.6
  },
  {
    "name": "Sabor do Oriente",
    "category": "Árabe",
    "rating": 4.5
  },
  {
    "name": "Forno da Esquina",
    "category": "Pizza",
    "rating": 4.7
  }
];

async function main() {
  let inserted = 0;
  await prisma.$transaction(async (db) => {
    for (const restaurant of examples) {
      const existing = await db.restaurant.findFirst({
        where: { name: restaurant.name, category: restaurant.category }
      });
      if (!existing) {
        await db.restaurant.create({ data: restaurant });
        inserted++;
      }
    }
  });
  console.log(inserted + " restaurantes adicionados. Registros existentes preservados.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
