require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
await prisma.restaurant.createMany({
data: [
{ name: "Belas Artes", category: "PÃ£o", rating: 4.5 },
{ name: "Pizzaria la pizza", category: "Pizza", rating: 4.2 },
{ name: "DogÃ£o do ZÃ©", category: "Hot Dog", rating: 4.8 }

]
});
console.log("Dados inseridos com sucesso!");
}
main()
.catch((e) => {
console.error(e);
process.exit(1);
})
.finally(() => prisma.$disconnect());