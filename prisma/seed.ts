import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Check if todos already exist
	const existingTodos = await prisma.todo.count();
	if (existingTodos > 0) {
		console.log('📋 Database already contains todos, skipping seed.');
		return;
	}

	// Create initial todos
	await prisma.todo.createMany({
		data: [
			{
				text: 'Learn SvelteKit',
				completed: false
			},
			{
				text: 'Build a todo app',
				completed: true
			},
			{
				text: 'Deploy to production',
				completed: false
			}
		]
	});

	console.log('✅ Database seeded successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Error seeding database:', e);
		await prisma.$disconnect();
		if (typeof process !== 'undefined') {
			process.exit(1);
		}
	});
