# 🚀 KitRPC

> **A modern, type-safe full-stack starter template combining SvelteKit + tRPC + Prisma + TailwindCSS**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)](https://svelte.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-398CCB?style=for-the-badge&logo=trpc&logoColor=white)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

## ✨ Features

- 🔥 **Type-Safe APIs** - End-to-end type safety with tRPC
- 🎨 **Modern UI** - Beautiful, responsive design with TailwindCSS
- 🗄️ **Database Ready** - Prisma ORM with SQLite (easily configurable)
- ⚡ **Lightning Fast** - Powered by Bun runtime
- 🔧 **Developer Experience** - Hot reload, TypeScript, and excellent tooling
- 📱 **Responsive Design** - Mobile-first approach with modern UX patterns
- 🛡️ **Production Ready** - Error handling, validation, and best practices

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|----------|
| **SvelteKit** | Full-stack framework | ^2.22.3 |
| **tRPC** | Type-safe APIs | ^10.45.2 |
| **Prisma** | Database ORM | ^6.11.1 |
| **TailwindCSS** | Styling | ^4.1.11 |
| **TypeScript** | Type safety | ^5.8.3 |
| **Bun** | Runtime & package manager | Latest |
| **Zod** | Schema validation | ^3.25.76 |

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine
- Node.js 18+ (for compatibility)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kitrpc

# Install dependencies
bun install

# Set up the database
bun run db:push

# Seed the database (optional)
bun run db:seed

# Start the development server
bun run dev
```

🎉 Open [http://localhost:5173](http://localhost:5173) to see your app!

## 📁 Project Structure

```
kitrpc/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding
├── src/
│   ├── lib/
│   │   ├── prisma.ts     # Prisma client
│   │   ├── stores/       # Svelte stores
│   │   ├── trpc/         # tRPC configuration
│   │   │   ├── client.ts # tRPC client
│   │   │   ├── context.ts# Server context
│   │   │   ├── router.ts # Main router
│   │   │   ├── todos.ts  # Todo procedures
│   │   │   └── trpc.ts   # tRPC setup
│   │   └── utils/        # Utility functions
│   ├── routes/
│   │   ├── +layout.svelte# App layout
│   │   └── +page.svelte  # Home page
│   ├── app.html          # HTML template
│   └── hooks.server.ts   # Server hooks
├── static/               # Static assets
└── package.json
```

## 🔌 API Documentation

### Available Endpoints

KitRPC comes with a complete Todo API demonstrating all CRUD operations:

#### **Queries**

```typescript
// Get greeting message
trpc.greeting.query()
// Returns: "Hello tRPC v11 @ [timestamp]"

// Get all todos
trpc.todos.getAll.query()
// Returns: Todo[]
```

#### **Mutations**

```typescript
// Add new todo
trpc.todos.add.mutate({ text: "Learn tRPC" })

// Toggle todo completion
trpc.todos.toggle.mutate({ id: "todo-id" })

// Update todo text
trpc.todos.update.mutate({ id: "todo-id", text: "Updated text" })

// Delete todo
trpc.todos.delete.mutate({ id: "todo-id" })
```

### Type Definitions

```typescript
type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: string
}
```

## 🗄️ Database

### Schema

The project uses a simple Todo model to demonstrate database operations:

```prisma
model Todo {
  id        String   @id @default(cuid())
  text      String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Database Commands

```bash
# Push schema changes to database
bun run db:push

# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# Reset database
bun run db:reset

# Seed database with sample data
bun run db:seed

# Open Prisma Studio
bun run db:studio
```

## 🎨 UI Components

The application features a modern, responsive design with:

- **Dashboard Stats** - Visual overview of todo statistics
- **Interactive Todo List** - Add, edit, toggle, and delete todos
- **Loading States** - Skeleton loaders and spinners
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - CSS transitions and hover effects
- **Accessibility** - Keyboard navigation and ARIA labels

## 🔧 Development

### Available Scripts

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Code Quality
bun run check            # Type checking
bun run check:watch      # Type checking (watch mode)
bun run format           # Format code with Prettier
bun run lint             # Lint code

# Database
bun run db:push          # Push schema to database
bun run db:studio        # Open Prisma Studio
bun run db:generate      # Generate Prisma client
bun run db:migrate       # Run migrations
bun run db:reset         # Reset database
bun run db:seed          # Seed database
```

### Adding New Features

1. **Add Database Model** - Update `prisma/schema.prisma`
2. **Create tRPC Procedures** - Add to `src/lib/trpc/`
3. **Update Frontend** - Create Svelte components and stores
4. **Type Safety** - TypeScript will ensure end-to-end type safety

### Environment Configuration

Create a `.env` file for environment variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Add other environment variables as needed
```

## 🚀 Deployment

### Build for Production

```bash
bun run build
```

### Deployment Options

- **Vercel** - Zero-config deployment
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **Docker** - Containerized deployment

> 💡 **Tip**: Update the database provider in `prisma/schema.prisma` for production (PostgreSQL, MySQL, etc.)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The amazing full-stack framework
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Prisma](https://prisma.io/) - Next-generation ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime

---

<div align="center">
  <strong>Built with ❤️ using modern web technologies</strong>
</div>
