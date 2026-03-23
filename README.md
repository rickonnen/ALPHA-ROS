# ALPHA-ROS

# 1. Clonan el repositorio
git clone https://github.com/rickonnen/ALPHA-ROS.git

# 2. Se mueven a la carpeta donde esta clonado
cd ALPHA-ROS
# 3. Crean el .env
cp .env.example .env
# 4. Colocan las credenciales que sus lideres les daran en el .env
    EJEMPLO
    
    # SUPABASE - Colocar las credenciales de su bd 
    DATABASE_URL=postgresql://user:password@db.celyguvyrlfvqvwqrsxg.supabase.co:5432/postgres 
    DIRECT_URL=postgresql://user:password@db.celyguvyrlfvqvwqrsxg.supabase.co:5432/postgres 

    Algo asi debe quedar
# 5. Por ultimo hacer correr en la terminal
docker-compose up --build