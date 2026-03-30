This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# ALPHA-ROS

# 1. Clonan el repositorio
git clone https://github.com/rickonnen/ALPHA-ROS.git

# 2. Se mueven a la carpeta donde esta clonado
cd ALPHA-ROS
# 3. Crean el .env
# 4. Colocan las credenciales que sus lideres les daran en el .env
    EJEMPLO
    
    # SUPABASE - Colocar las credenciales de su bd 
    DATABASE_URL=postgresql://user:password@db.celyguvyrlfvqvwqrsxg.supabase.co:5432/postgres 
    DIRECT_URL=postgresql://user:password@db.celyguvyrlfvqvwqrsxg.supabase.co:5432/postgres 

    Algo asi debe quedar
# 5. Por ultimo hacer correr en la terminal
    npm install.
    npx prisma generate
# 6. Equipos Listos Colocar Listo_nombre_epic
    1. Binary Brain -
    2. OiDevs - Listo - Home Page
    3. StackOverflow - Listo - Mi Perfil
    4. SysInfo Squad -
    5. Bug Hunters -
    6. Digital Core - Listo - Pagina de Publicacion
    7. ADA - Listo - Cobros dentro la plataforma



# Cambios en la bd
    1. Actualizar el supabase con los Querys mencionados
    2. npx prisma db pull --force (cuidao)
    3. npx prisma generate




## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Formato de actualizaciones
/*  Dev: Nombre apellido - rama de push
    Fecha: dd/mm/aaaa
    Funcionalidad: lo que se hace en dicha actualizacion
      - @param {lo que tiene que llegar} - descripcion
      - @return {lo que tiene que devolver} - descripcion
*/